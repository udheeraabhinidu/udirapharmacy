// ============================================================
// UDIRA PHARMACY — APP.JS v2.0
// Google-only customer auth, hidden admin, light/dark theme,
// Gmail compose prescription, NO POS system
// ============================================================

// ============ REGISTERED CUSTOMERS DATABASE & SPREADSHEET EXPORT ============
const CustomerSystem = {
  getCustomers() {
    const saved = localStorage.getItem('udira_registered_customers');
    if (saved) return JSON.parse(saved);

    // Initial seed customers
    const initialCustomers = [
      {
        id: 1,
        name: 'Udheera Abhinidu',
        email: 'udheeraabhinidu95@gmail.com',
        phone: '0772073568',
        city: 'Anuradhapura',
        role: 'admin',
        registeredDate: '2026-01-15 10:30 AM',
        method: 'Super Admin'
      },
      {
        id: 2,
        name: 'Priyantha Pathirana',
        email: 'priyantha@gmail.com',
        phone: '0714589632',
        city: 'Vijayapura, Anuradhapura',
        role: 'customer',
        registeredDate: '2026-07-10 02:15 PM',
        method: 'Registration Form'
      },
      {
        id: 3,
        name: 'Kasun Kalhara',
        email: 'kasun.k@gmail.com',
        phone: '0769823145',
        city: 'Kandy',
        role: 'customer',
        registeredDate: '2026-07-20 11:45 AM',
        method: 'Google Gmail'
      }
    ];
    localStorage.setItem('udira_registered_customers', JSON.stringify(initialCustomers));
    return initialCustomers;
  },

  addCustomer(customerData) {
    const customers = this.getCustomers();
    const existing = customers.find(c => c.email.toLowerCase() === customerData.email.toLowerCase());
    if (existing) return existing;

    const newCustomer = {
      id: Date.now(),
      name: customerData.name || 'Valued Customer',
      email: customerData.email,
      phone: customerData.phone || 'N/A',
      city: customerData.city || 'Sri Lanka',
      role: customerData.role || 'customer',
      registeredDate: new Date().toLocaleString(),
      method: customerData.method || 'Google Gmail'
    };

    customers.unshift(newCustomer);
    localStorage.setItem('udira_registered_customers', JSON.stringify(customers));
    this.renderAdminTable();
    return newCustomer;
  },

  exportToCSV() {
    const customers = this.getCustomers();
    if (!customers.length) {
      showToast('warning', 'No Data', 'No registered customers found to export.');
      return;
    }

    const headers = ['Customer ID', 'Full Name', 'Email Address', 'Phone Number', 'City / Location', 'Account Type', 'Registered Date', 'Login Method'];
    const rows = customers.map(c => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${c.role}"`,
      `"${c.registeredDate}"`,
      `"${c.method}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `udira_registered_customers_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Spreadsheet Downloaded!', 'Exported registered customers to CSV spreadsheet file successfully.');
  },

  renderAdminTable() {
    const tbody = document.getElementById('customersTableBody');
    const countBadge = document.getElementById('customerCountBadge');
    const customers = this.getCustomers();

    if (countBadge) countBadge.textContent = `${customers.length} Registered Customers`;
    if (!tbody) return;

    if (customers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;">No registered customers yet</td></tr>';
      return;
    }

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td><div style="font-weight:700;">${c.name}</div></td>
        <td><span style="color:var(--primary-light);font-weight:600;">${c.email}</span></td>
        <td>${c.phone}</td>
        <td>${c.city}</td>
        <td><span class="badge ${c.role === 'admin' ? 'badge-primary' : 'badge-success'}">${c.role.toUpperCase()}</span></td>
        <td style="font-size:0.75rem;color:var(--text-tertiary);">${c.registeredDate}</td>
        <td><span style="font-size:0.75rem;color:var(--text-secondary);">${c.method}</span></td>
      </tr>
    `).join('');
  }
};

// ============ AUTHENTICATION & ROLE MANAGEMENT ============
const Auth = {
  currentUser: JSON.parse(localStorage.getItem('udira_user')) || null,

  isLoggedIn() {
    return !!(this.currentUser && this.currentUser.isLoggedIn);
  },

  isAdmin() {
    return this.isLoggedIn() && this.currentUser.role === 'admin';
  },

  requireAdmin(redirect = true) {
    if (!this.isAdmin()) {
      showToast('error', 'Access Denied', 'Dashboard access is restricted ONLY to Administrator Udheera Abhinidu.');
      if (redirect) {
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      }
      return false;
    }
    return true;
  },

  // Admin login - only accessible from hidden admin panel
  adminLogin() {
    const email = $('#adminLoginEmail')?.value?.trim();
    const password = $('#adminLoginPassword')?.value;

    if (!email || !password) {
      showToast('error', 'Fields Required', 'Please enter admin email and password');
      return;
    }

    // Admin credential check
    if (email.toLowerCase() === 'udheeraabhinidu95@gmail.com' && password === 'admin123') {
      this.currentUser = {
        name: 'Udheera Abhinidu',
        email: email,
        role: 'admin',
        isLoggedIn: true
      };
      localStorage.setItem('udira_user', JSON.stringify(this.currentUser));
      showToast('success', 'Admin Authenticated', 'Welcome Administrator Udheera Abhinidu!');
      setTimeout(() => { window.location.href = 'admin.html'; }, 800);
      return;
    }

    showToast('error', 'Invalid Credentials', 'Admin email or password is incorrect.');
  },

  // Google login for customers (auto-registers on first login)
  googleLogin() {
    const gEmailInput = prompt('Enter your Gmail address to sign in with Google:', '');
    if (!gEmailInput) return;
    const gEmail = gEmailInput.trim();

    if (!gEmail.includes('@')) {
      showToast('error', 'Invalid Email', 'Please enter a valid Gmail address');
      return;
    }

    // Check if this is the admin email
    if (gEmail.toLowerCase() === 'udheeraabhinidu95@gmail.com') {
      showToast('info', 'Admin Access', 'Admin must use the admin login panel. Triple-click the logo to access it.');
      return;
    }

    // Customer Gmail login / auto registration
    const customers = CustomerSystem.getCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === gEmail.toLowerCase());

    if (!customer) {
      // Auto-register new customer via Google
      const nameFromEmail = gEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      customer = CustomerSystem.addCustomer({
        name: nameFromEmail,
        email: gEmail,
        phone: 'Google Auth',
        city: 'Sri Lanka',
        role: 'customer',
        method: 'Google Gmail'
      });
      showToast('info', 'Account Created!', `New customer account created for ${gEmail}`);

      EmailSystem.send({
        from: 'system@udira.lk',
        to: gEmail,
        subject: 'Welcome to UDIRA PHARMACY',
        body: `Customer Account created via Google for ${customer.name} (${gEmail}).`
      });
    }

    this.currentUser = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      role: 'customer',
      isLoggedIn: true
    };
    localStorage.setItem('udira_user', JSON.stringify(this.currentUser));
    showToast('success', 'Google Login Success', `Welcome ${customer.name}!`);
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  },

  logout() {
    localStorage.removeItem('udira_user');
    this.currentUser = null;
    showToast('info', 'Logged Out', 'You have been logged out safely.');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
  },

  updateNavState() {
    const navActions = document.querySelectorAll('.nav-actions');
    navActions.forEach(actionContainer => {
      const dashBtn = actionContainer.querySelector('a[href="admin.html"]');
      const loginBtn = actionContainer.querySelector('a[href="login.html"]');

      if (this.isAdmin()) {
        // Admin: show dashboard button prominently, change login to logout
        if (dashBtn) {
          dashBtn.style.display = 'inline-flex';
          dashBtn.innerHTML = '👑 Admin Dashboard';
          dashBtn.classList.remove('btn-secondary');
          dashBtn.classList.add('btn-primary');
        }
        if (loginBtn) {
          loginBtn.textContent = 'Logout (Admin)';
          loginBtn.href = '#';
          loginBtn.onclick = (e) => { e.preventDefault(); Auth.logout(); };
        }
      } else if (this.isLoggedIn()) {
        // Customer: hide dashboard, show name + logout
        if (dashBtn) dashBtn.style.display = 'none';
        if (loginBtn) {
          loginBtn.textContent = `${this.currentUser.name.split(' ')[0]} (Logout)`;
          loginBtn.href = '#';
          loginBtn.onclick = (e) => { e.preventDefault(); Auth.logout(); };
        }
      } else {
        // Guest: hide dashboard, show sign-in
        if (dashBtn) dashBtn.style.display = 'none';
        if (loginBtn) {
          loginBtn.textContent = 'Sign In';
          loginBtn.href = 'login.html';
          loginBtn.onclick = null;
        }
      }
    });

    // Also update mobile menu
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      const mobileDash = mobileMenu.querySelector('a[href="admin.html"]');
      const mobileLogin = mobileMenu.querySelector('a[href="login.html"]');
      if (mobileDash) mobileDash.style.display = this.isAdmin() ? 'block' : 'none';
      if (mobileLogin && this.isLoggedIn()) {
        mobileLogin.textContent = 'Logout';
        mobileLogin.href = '#';
        mobileLogin.onclick = (e) => { e.preventDefault(); Auth.logout(); };
      }
    }
  }
};


// ============ EMAIL SYSTEM ============
const EmailSystem = {
  inbox: JSON.parse(localStorage.getItem('udira_inbox')) || [
    {
      id: 1,
      from: 'udheeraabhinidu95@gmail.com',
      to: 'udheeraabhinidu95@gmail.com',
      subject: 'Inquiry from Anuradhapura Customer',
      body: 'Customer Priyantha Pathirana sent an inquiry regarding medicine availability at Vijayapura store.',
      date: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      from: 'system@udira.lk',
      to: 'udheeraabhinidu95@gmail.com',
      subject: 'Daily Sales & Expense Report Generated',
      body: 'Today Gross Sales: LKR 85,000 | Net Profit: LKR 24,000.',
      date: new Date().toLocaleTimeString()
    }
  ],

  send(emailData) {
    const newMail = {
      id: Date.now(),
      from: emailData.from || 'customer@udira.lk',
      to: emailData.to || 'udheeraabhinidu95@gmail.com',
      subject: emailData.subject || 'Pharmacy Inquiry',
      body: emailData.body || 'No content',
      date: new Date().toLocaleTimeString()
    };
    this.inbox.unshift(newMail);
    localStorage.setItem('udira_inbox', JSON.stringify(this.inbox));

    showToast('success', 'Email Sent!', `Dispatched to ${newMail.to}`);
    this.renderAdminInbox();
  },

  renderAdminInbox() {
    const tbody = $('#emailInboxBody');
    if (!tbody) return;
    tbody.innerHTML = this.inbox.map(m => `
      <tr>
        <td style="color:var(--text-tertiary);">${m.date}</td>
        <td><div style="font-weight:700;">${m.from}</div></td>
        <td><div style="font-weight:600;color:var(--primary-light);">${m.subject}</div></td>
        <td style="color:var(--text-secondary);">${m.body}</td>
      </tr>
    `).join('');
  }
};

// ============ LIGHT/DARK THEME SYSTEM ============
const ThemeSystem = {
  init() {
    // Load saved theme preference
    const saved = localStorage.getItem('udira_theme_mode');
    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    this.updateToggleButtons();
  },

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('udira_theme_mode', 'dark');
      showToast('info', 'Dark Mode', 'Switched to dark theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('udira_theme_mode', 'light');
      showToast('info', 'Light Mode', 'Switched to light theme');
    }
    this.updateToggleButtons();
  },

  updateToggleButtons() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const sun = btn.querySelector('.icon-sun');
      const moon = btn.querySelector('.icon-moon');
      if (sun && moon) {
        // CSS handles the transition via [data-theme="light"] selectors
      }
    });
  }
};

// ============ TRANSLATIONS ============
const Translations = {
  en: {
    nav_home: "Home", nav_about: "About", nav_products: "Products", nav_finder: "Medicine Finder",
    nav_prescriptions: "Prescriptions", nav_blog: "Blog", nav_contact: "Contact",
    hero_badge: "Open Now — 9 Ala Para, Vijayapura, Anuradhapura", hero_title_1: "Your Trusted ", hero_title_2: "Healthcare", hero_title_3: " Partner",
    hero_desc: "Quality medicines & healthcare guidance at UDIRA PHARMACY Anuradhapura. Managed by Saman Karunarathna & Chief Pharmacist Dinusha Madhushani.",
    btn_browse: "Browse Medicines", btn_upload: "Upload Prescription",
    stat_medicines: "Medicines Available", stat_customers: "Happy Customers", stat_experience: "Years Experience", stat_prescriptions: "Prescriptions Filled"
  },
  si: {
    nav_home: "මුල් පිටුව", nav_about: "අප ගැන", nav_products: "ඖෂධ වර්ග", nav_finder: "ඖෂධ සෙවුම",
    nav_prescriptions: "තනි වට්ටෝරු", nav_blog: "ලිපි", nav_contact: "සම්බන්ධ වන්න",
    hero_badge: "දැන් විවෘතයි — නො 9 ඇල පාර, විජයපුර, අනුරාධපුර", hero_title_1: "ඔබගේ විශ්වාසනීය ", hero_title_2: "සෞඛ්‍ය", hero_title_3: " සහකරු",
    hero_desc: "උදීර ෆාමසිය අනුරාධපුරය. සමන් කරුණාරත්න මහතා සහ ප්‍රධාන ඖෂධවේදී දිනූෂා මධුෂානි මහත්මියගේ විශිෂ්ට සේවාව.",
    btn_browse: "ඖෂධ පරීක්ෂා කරන්න", btn_upload: "වට්ටෝරුව යොමුකරන්න",
    stat_medicines: "ලබාගත හැකි ඖෂධ", stat_customers: "තෘප්තිමත් පාරිභෝගිකයින්", stat_experience: "වසර ගණනාවක අත්දැකීම්", stat_prescriptions: "සපයන ලද වට්ටෝරු"
  },
  ta: {
    nav_home: "முகப்பு", nav_about: "எங்களைப் பற்றி", nav_products: "மருந்துகள்", nav_finder: "மருந்து தேடலை",
    nav_prescriptions: "மருந்துச்சீட்டு", nav_blog: "பதிவுகள்", nav_contact: "தொடர்புகொள்ள",
    hero_badge: "திறந்துள்ளது — அநுராதபுரம் விஜயபுர", hero_title_1: "உங்கள் நம்பிக்கைக்குரிய ", hero_title_2: "சுகாதார", hero_title_3: " பங்காளன்",
    hero_desc: "உதீர மருந்தகம் அநுராதபுரம். சிறந்த மருந்துகள் மற்றும் ஆலோசனைகள்.",
    btn_browse: "மருந்துகளைப் பார்க்க", btn_upload: "மருந்துச்சீட்டை பதிவேற்ற",
    stat_medicines: "கிடைக்கும் மருந்துகள்", stat_customers: "வாடிக்கையாளர்கள்", stat_experience: "ஆண்டுகள் அனுபவம்", stat_prescriptions: "வழங்கப்பட்ட மருந்துகள்"
  }
};

// ============ PRODUCTS (NO PUBLIC PRICES, WITH SHORT DESCRIPTIONS) ============
const AppData = {
  categories: [
    { id: 1, name: 'Prescription Medicines', icon: '💊', count: 2500, color: 'rgba(14,165,233,0.1)' },
    { id: 2, name: 'Over The Counter', icon: '🏥', count: 1800, color: 'rgba(139,92,246,0.1)' },
    { id: 3, name: 'Vitamins & Supplements', icon: '💎', count: 950, color: 'rgba(16,185,129,0.1)' },
    { id: 4, name: 'Personal Care', icon: '🧴', count: 1200, color: 'rgba(245,158,11,0.1)' },
    { id: 5, name: 'Baby Care', icon: '👶', count: 680, color: 'rgba(236,72,153,0.1)' },
    { id: 6, name: 'First Aid', icon: '🩹', count: 420, color: 'rgba(239,68,68,0.1)' },
    { id: 7, name: 'Ayurvedic Products', icon: '🌿', count: 750, color: 'rgba(34,197,94,0.1)' },
    { id: 8, name: 'Medical Devices', icon: '🔬', count: 340, color: 'rgba(59,130,246,0.1)' },
  ],

  products: [
    {
      id: 1,
      name: 'Paracetamol 500mg',
      generic: 'Acetaminophen',
      category: 'Over The Counter',
      price: 85,
      badge: 'popular',
      manufacturer: 'State Pharmaceuticals',
      description: 'Effective fever reducer and pain reliever for headaches, toothaches, and body aches.'
    },
    {
      id: 2,
      name: 'Amoxicillin 500mg',
      generic: 'Amoxicillin Trihydrate',
      category: 'Prescription Medicines',
      price: 120,
      badge: 'new',
      manufacturer: 'Astron Ltd',
      description: 'Broad-spectrum antibiotic used to treat bacterial throat, respiratory, and ear infections.'
    },
    {
      id: 3,
      name: 'Vitamin C 1000mg',
      generic: 'Ascorbic Acid',
      category: 'Vitamins & Supplements',
      price: 350,
      badge: 'sale',
      manufacturer: "Nature's Way",
      description: 'High-potency immune system support supplement promoting daily health and collagen production.'
    },
    {
      id: 4,
      name: 'Omeprazole 20mg',
      generic: 'Omeprazole',
      category: 'Prescription Medicines',
      price: 95,
      manufacturer: 'Hemas Pharma',
      description: 'Reduces excess stomach acid for fast relief from heartburn, gastritis, and acid reflux.'
    },
    {
      id: 5,
      name: 'Cetirizine 10mg',
      generic: 'Cetirizine HCl',
      category: 'Over The Counter',
      price: 65,
      badge: 'popular',
      manufacturer: 'State Pharmaceuticals',
      description: 'Fast 24-hour allergy relief for sneezing, runny nose, watery eyes, and skin itching.'
    },
    {
      id: 6,
      name: 'Metformin 500mg',
      generic: 'Metformin HCl',
      category: 'Prescription Medicines',
      price: 75,
      manufacturer: 'Astron Ltd',
      description: 'First-line medication for managing blood sugar levels in type 2 diabetes patients.'
    },
    {
      id: 7,
      name: 'Multivitamin Complex',
      generic: 'Multiple Vitamins',
      category: 'Vitamins & Supplements',
      price: 1200,
      badge: 'sale',
      manufacturer: 'Centrum',
      description: 'Complete daily nutrient blend supporting energy, stamina, bone strength, and immunity.'
    },
    {
      id: 8,
      name: 'Ibuprofen 400mg',
      generic: 'Ibuprofen',
      category: 'Over The Counter',
      price: 90,
      badge: 'popular',
      manufacturer: 'Hemas Pharma',
      description: 'Non-steroidal anti-inflammatory drug (NSAID) for muscle pain, swelling, and joint relief.'
    }
  ],

  testimonials: [
    { name: 'Priyantha Pathirana', location: 'Vijayapura, Anuradhapura', date: '2 days ago', text: 'Udira Pharmacy ekata bohoma sthuthi! Dinusha Madhushani pharmacist madam mge prescription eka kiyawala hariyatama beheth tika pack karala duna. Ala Para store ekath godak gathi.', rating: 5, bg: '#0ea5e9', initials: 'PP' },
    { name: 'Dilini Jayasinghe', location: 'Anuradhapura Town', date: 'Yesterday', text: 'Saman Karunarathna uncle ge Udira Pharmacy eken mage amma ge diabetes beheth hamawelawama gannewa. Genuine SPC products thinawa.', rating: 5, bg: '#ec4899', initials: 'DJ' },
    { name: 'Kasun Wickramasinghe', location: 'Kandy', date: 'July 24', text: 'Best pharmacy experience in Sri Lanka! Pharmacist Dinusha madam gave very clear instructions. Highly recommend.', rating: 5, bg: '#8b5cf6', initials: 'KW' },
    { name: 'Nimali Rathnayake', location: 'Kurunegala', date: 'July 20', text: 'Mage baby ge baby care products & vitamins Udira Pharmacy site eken thmai order kale. Fast delivery & hotline (0772073568)!', rating: 5, bg: '#10b981', initials: 'NR' },
    { name: 'Chathura De Silva', location: 'Panadura', date: 'July 18', text: 'Chief Pharmacist Dinusha is extremely knowledgeable. Saman sir & Udheera brother built a top-class pharmacy system!', rating: 5, bg: '#f59e0b', initials: 'CS' },
    { name: 'Tharindu Wijesinghe', location: 'Vijayapura', date: 'July 15', text: 'Ape pawule okkoma beheth ganne Udira Pharmacy eken. Modern design, clean items, verified brands like Pfizer & GSK.', rating: 5, bg: '#3b82f6', initials: 'TW' }
  ],

  brands: [
    { name: 'Pfizer', color: '#0ea5e9' }, { name: 'GSK', color: '#f97316' }, { name: 'Roche', color: '#3b82f6' },
    { name: 'Novartis', color: '#ef4444' }, { name: 'Bayer', color: '#22c55e' }, { name: 'AstraZeneca', color: '#8b5cf6' }
  ]
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(type, title, message) {
  const container = $('#toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div>${icons[type] || 'ℹ️'}</div>
    <div class="toast-content"><div class="toast-title">${title}</div><div class="toast-message">${message}</div></div>
    <div class="toast-close" onclick="this.parentElement.remove()">&times;</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============ GLOBAL THEME CUSTOMIZER ENGINE (ADMIN ONLY) ============
const ThemeCustomizer = {
  apply(t) {
    if (!Auth.isAdmin()) {
      showToast('error', 'Admin Required', 'Only Administrator Udheera Abhinidu can change theme colors');
      return;
    }
    const root = document.documentElement;
    if (t.primary) {
      root.style.setProperty('--primary', t.primary);
      root.style.setProperty('--primary-light', t.primary);
      root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${t.primary}, var(--secondary, #8b5cf6))`);
    }
    if (t.secondary) root.style.setProperty('--secondary', t.secondary);
    if (t.accent) root.style.setProperty('--accent', t.accent);
    if (t.bgPrimary) root.style.setProperty('--bg-primary', t.bgPrimary);
    localStorage.setItem('udira_theme_custom', JSON.stringify(t));
    showToast('info', 'Color Applied Globally', 'Theme colors updated across all pages');
  },

  reset() {
    if (!Auth.isAdmin()) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', '#0ea5e9');
    root.style.setProperty('--secondary', '#8b5cf6');
    root.style.setProperty('--accent', '#10b981');
    root.style.setProperty('--bg-primary', '#0a0e27');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #0ea5e9, #8b5cf6)');
    localStorage.removeItem('udira_theme_custom');
    showToast('info', 'Reset', 'Default colors restored globally');
  },

  save() {
    if (!Auth.isAdmin()) return;
    showToast('success', 'Theme Published!', 'Custom theme saved and published globally');
  },

  load() {
    const saved = localStorage.getItem('udira_theme_custom');
    if (saved) {
      try {
        const t = JSON.parse(saved);
        const root = document.documentElement;
        if (t.primary) {
          root.style.setProperty('--primary', t.primary);
          root.style.setProperty('--primary-light', t.primary);
          root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${t.primary}, ${t.secondary || '#8b5cf6'})`);
        }
        if (t.secondary) root.style.setProperty('--secondary', t.secondary);
        if (t.accent) root.style.setProperty('--accent', t.accent);
        if (t.bgPrimary) root.style.setProperty('--bg-primary', t.bgPrimary);
      } catch(e) {}
    }
  }
};

function setLanguage(lang) {
  if (!Translations[lang]) return;
  const dict = Translations[lang];
  $$('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  $$('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
  showToast('info', 'Language', `Switched to ${lang.toUpperCase()}`);
}

function renderCategories() {
  const grid = $('#categoriesGrid');
  if (!grid) return;
  grid.innerHTML = AppData.categories.map(cat => `
    <a href="products.html" class="category-card">
      <div class="category-icon" style="background:${cat.color};">${cat.icon}</div>
      <div class="category-name">${cat.name}</div>
      <div class="category-count">${cat.count} items</div>
    </a>
  `).join('');
}

// ============ RENDER PRODUCTS (NO PUBLIC PRICES) ============
function renderProducts() {
  const grid = $('#productsGrid');
  if (!grid) return;
  grid.innerHTML = AppData.products.map(product => `
    <div class="product-card">
      <div class="product-image">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="rgba(14,165,233,0.4)"><rect x="6" y="3" width="12" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        ${product.badge ? `<span class="product-badge ${product.badge}">${product.badge}</span>` : ''}
        <button class="product-wishlist" onclick="toggleWishlist(this)">♥</button>
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-generic">${product.generic} — ${product.manufacturer}</div>
        <p style="font-size:0.75rem;color:var(--text-secondary);line-height:1.4;margin:6px 0 10px;">${product.description}</p>
        <div class="product-price-row">
          <span style="font-size:0.75rem;font-weight:700;color:var(--primary-light);">Verified Quality</span>
          <button class="btn btn-primary btn-sm" onclick="inquireProduct('${product.name}')">Inquire / Order</button>
        </div>
      </div>
    </div>
  `).join('');
}

function inquireProduct(name) {
  EmailSystem.send({
    from: 'inquiry@udira.lk',
    to: 'udheeraabhinidu95@gmail.com',
    subject: `Product Inquiry: ${name}`,
    body: `Customer submitted an inquiry for ${name} at Udira Pharmacy Vijayapura, Anuradhapura.`
  });
  showToast('success', 'Inquiry Dispatched', `Inquiry for ${name} sent to Chief Pharmacist Dinusha.`);
}

function renderTestimonials() {
  const grid = $('#testimonialsGrid');
  if (!grid) return;
  grid.innerHTML = AppData.testimonials.map(t => `
    <div class="testimonial-card">
      <div class="fb-header">
        <div class="fb-avatar" style="background:${t.bg};">${t.initials}</div>
        <div class="fb-user-info">
          <div class="fb-name">${t.name} <span class="fb-badge">✔</span></div>
          <div class="fb-meta"><span>${t.location}</span> • <span>${t.date}</span></div>
        </div>
      </div>
      <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
      <p class="testimonial-text">"${t.text}"</p>
    </div>
  `).join('');
}

function renderBrands() {
  const grid = $('#brandsGrid');
  if (!grid) return;
  grid.innerHTML = AppData.brands.map(b => `
    <div class="card" style="display:flex;align-items:center;justify-content:center;padding:var(--space-4);">
      <div style="text-align:center;">
        <div style="width:40px;height:40px;background:${b.color}20;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;margin:0 auto 4px;font-weight:800;color:${b.color};">${b.name.charAt(0)}</div>
        <div style="font-weight:700;font-size:var(--text-xs);">${b.name}</div>
      </div>
    </div>
  `).join('');
}

function toggleWishlist(btn) {
  btn.classList.toggle('active');
  showToast('info', 'Wishlist', 'Saved items updated');
}

function initAdminSidebar() {
  const toggle = $('#sidebarToggle');
  const sidebar = $('.sidebar');
  if (toggle && sidebar) toggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  $$('.sidebar-link').forEach(link => {
    link.addEventListener('click', function(e) {
      const target = this.dataset.section;
      if (!target) return;
      e.preventDefault();
      if (target === 'section-customization') {
        if (!Auth.requireAdmin(false)) return;
      }
      $$('.sidebar-link').forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      $$('.admin-section').forEach(s => s.style.display = 'none');
      const sec = $(`#${target}`);
      if (sec) sec.style.display = 'block';
    });
  });
}

function submitContactForm(e) {
  if (e) e.preventDefault();
  const name = $('#contactName')?.value || 'Valued Customer';
  const email = $('#contactEmail')?.value || 'udheeraabhinidu95@gmail.com';
  const message = $('#contactMessage')?.value || 'Inquiry regarding medicine availability at Anuradhapura Vijayapura store';

  EmailSystem.send({
    from: email,
    to: 'udheeraabhinidu95@gmail.com',
    subject: `Contact Inquiry from ${name} (Anuradhapura)`,
    body: message
  });
  if ($('#contactForm')) $('#contactForm').reset();
}

// ============ PRESCRIPTION - GMAIL COMPOSE ============
function submitPrescription() {
  const patientName = $('#prescPatientName')?.value?.trim() || 'Patient';
  const patientPhone = $('#prescPhone')?.value?.trim() || 'N/A';
  const patientNotes = $('#prescNotes')?.value?.trim() || 'No special instructions';
  const customerEmail = Auth.isLoggedIn() ? Auth.currentUser.email : '';

  // Build Gmail compose URL with pre-filled data
  const to = 'udheeraabhinidu95@gmail.com';
  const subject = encodeURIComponent(`Prescription Request from ${patientName} — UDIRA PHARMACY`);
  const body = encodeURIComponent(
    `Dear UDIRA PHARMACY Team,\n\n` +
    `I would like to submit my prescription for review.\n\n` +
    `Patient Name: ${patientName}\n` +
    `Phone: ${patientPhone}\n` +
    `Special Instructions: ${patientNotes}\n\n` +
    `Please find the prescription image attached.\n\n` +
    `Thank you,\n${patientName}\n\n` +
    `— Sent via UDIRA PHARMACY Website`
  );

  // Open Gmail compose in new tab
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  window.open(gmailUrl, '_blank');

  // Also log in internal system
  EmailSystem.send({
    from: customerEmail || 'patient@udira.lk',
    to: 'udheeraabhinidu95@gmail.com',
    subject: `Prescription Request from ${patientName}`,
    body: `Patient ${patientName} (Phone: ${patientPhone}) submitted a prescription via Gmail compose. Notes: ${patientNotes}`
  });

  showToast('success', 'Gmail Opened!', 'Please attach your prescription image in Gmail and click Send.');
}

// ============ INVENTORY (ADMIN ONLY) ============
const Inventory = {
  render() {
    const tbody = $('#inventoryTableBody');
    if (!tbody) return;
    tbody.innerHTML = AppData.products.map(p => `
      <tr>
        <td><div style="font-weight:700;">${p.name}</div><div style="font-size:0.7rem;color:var(--text-tertiary);">${p.generic}</div></td>
        <td>${p.category}</td>
        <td>${p.manufacturer}</td>
        <td style="font-weight:700;">LKR ${p.price}</td>
        <td><span class="badge badge-success">In Stock</span></td>
        <td><button class="btn btn-ghost btn-sm" onclick="showToast('info','Edit','Editing item')">Edit</button></td>
      </tr>
    `).join('');
  }
};

// ============ ADMIN SECRET PANEL (TRIPLE-CLICK LOGO) ============
const AdminSecretPanel = {
  clickCount: 0,
  clickTimer: null,

  init() {
    // Find the logo on the login page
    const loginLogo = document.querySelector('.auth-page .nav-brand, .auth-page .auth-logo-trigger');
    if (!loginLogo) return;

    loginLogo.addEventListener('click', (e) => {
      e.preventDefault();
      this.clickCount++;

      if (this.clickTimer) clearTimeout(this.clickTimer);

      this.clickTimer = setTimeout(() => {
        this.clickCount = 0;
      }, 800);

      if (this.clickCount >= 3) {
        this.clickCount = 0;
        this.revealPanel();
      }
    });
  },

  revealPanel() {
    const panel = document.getElementById('adminSecretPanel');
    if (!panel) return;

    if (panel.classList.contains('revealed')) {
      panel.classList.remove('revealed');
      showToast('info', 'Admin Panel Hidden', 'Admin login panel hidden');
    } else {
      panel.classList.add('revealed');
      showToast('info', 'Admin Access', 'Admin login panel revealed — Enter credentials');
      // Focus the email field
      const emailField = document.getElementById('adminLoginEmail');
      if (emailField) setTimeout(() => emailField.focus(), 300);
    }
  }
};

// ============ MOBILE MENU ============
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => mobileMenu.classList.add('open'));
  }
  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  }
  // Close on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }
}

// ============ SMOOTH SCROLL & ANIMATION ENGINE ============
const ScrollEngine = {
  init() {
    this.initProgressBar();
    this.initStickyNav();
    this.initBackToTop();
    this.initRevealAnimations();
    this.initCounterAnimations();
    this.initSmoothAnchors();
  },

  initProgressBar() {
    let progressBar = document.getElementById('scrollProgressBar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'scrollProgressBar';
      progressBar.className = 'scroll-progress-bar';
      document.body.appendChild(progressBar);
    }

    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      progressBar.style.width = scrolled + '%';
    }, { passive: true });
  },

  initStickyNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  },

  initBackToTop() {
    let btn = document.getElementById('backToTop');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'backToTop';
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', 'Scroll to Top');
      btn.innerHTML = '↑';
      document.body.appendChild(btn);
    }

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  },

  initRevealAnimations() {
    const targets = document.querySelectorAll('.animate-on-scroll, .reveal-on-scroll, .reveal-left, .reveal-right, .reveal-zoom');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(target => observer.observe(target));
  },

  initCounterAnimations() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const animateCount = (el) => {
      const targetStr = el.dataset.count;
      const targetNum = parseInt(targetStr.replace(/[^0-9]/g, ''), 10);
      const suffix = targetStr.replace(/[0-9]/g, '') || '+';
      if (isNaN(targetNum)) return;

      const duration = 1800;
      const startTime = performance.now();

      const updateCount = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOut * targetNum);
        
        el.textContent = currentCount.toLocaleString() + suffix;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = targetNum.toLocaleString() + suffix;
        }
      };

      requestAnimationFrame(updateCount);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCount);
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach(counter => observer.observe(counter));
  },

  initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || !href) return;
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
          const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
};

function openModal(id) { const m = $(`#${id}`); if (m) m.classList.add('open'); }
function closeModal(id) { const m = $(`#${id}`); if (m) m.classList.remove('open'); }

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Light/Dark Theme System
  ThemeSystem.init();

  // If user visits admin.html directly, enforce Admin Access Control
  if (window.location.pathname.includes('admin.html')) {
    if (!Auth.requireAdmin(true)) return;
  }

  ThemeCustomizer.load(); // Load global custom theme colors across ALL pages
  $$('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));

  // Theme toggle buttons
  $$('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => ThemeSystem.toggle());
  });

  renderCategories();
  renderProducts();
  renderTestimonials();
  renderBrands();

  initAdminSidebar();
  Inventory.render();
  EmailSystem.renderAdminInbox();
  CustomerSystem.renderAdminTable();

  // Dynamic Navigation state
  Auth.updateNavState();

  // Initialize Mobile Menu
  initMobileMenu();

  // Initialize Admin Secret Panel (on login page)
  AdminSecretPanel.init();

  // Initialize Smooth Scroll & Reveal Engine
  ScrollEngine.init();

  // Add page transition class
  const mainContent = document.getElementById('main-content');
  if (mainContent) mainContent.classList.add('page-transition');
});

// Global exports
window.Auth = Auth;
window.CustomerSystem = CustomerSystem;
window.EmailSystem = EmailSystem;
window.ThemeCustomizer = ThemeCustomizer;
window.ThemeSystem = ThemeSystem;
window.Inventory = Inventory;
window.ScrollEngine = ScrollEngine;
window.AdminSecretPanel = AdminSecretPanel;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitPrescription = submitPrescription;
window.submitContactForm = submitContactForm;
window.inquireProduct = inquireProduct;
window.toggleWishlist = toggleWishlist;
