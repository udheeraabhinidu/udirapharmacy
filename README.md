# UDIRA PHARMACY — Premium Healthcare Platform

[![Version](https://img.shields.io/badge/version-2.0.0-0ea5e9.svg)](https://github.com/)
[![Status](https://img.shields.io/badge/status-production_ready-22c55e.svg)](https://github.com/)
[![License](https://img.shields.io/badge/license-proprietary-8b5cf6.svg)](https://github.com/)

An enterprise-grade, ultra-fast pharmaceutical care and medicine platform for **UDIRA PHARMACY**, Sri Lanka. Designed with high-performance glassmorphism, micro-animations, light/dark theme modes, Google customer authentication, and an executive administration portal.

---

## 🏬 Pharmacy Credentials & Administration

- **Pharmacy Name**: UDIRA PHARMACY & GROCERY
- **Location**: No. 9 Ala Para, Vijayapura, Anuradhapura 50000, Sri Lanka
- **Owner**: Saman Karunarathna
- **Chief Pharmacist**: Dinusha Madhushani
- **System Administrator**: Udheera Abhinidu (`udheeraabhinidu95@gmail.com`)
- **Hotline / Contact**: 0772073568 / `udheeraabhinidu95@gmail.com`

---

## ✨ Key Features & Capabilities

### 🔐 1. Customer Authentication (Google Only)
- Customers register and log in **exclusively via Google Accounts**.
- New customer accounts are automatically provisioned upon first Google sign-in.
- Traditional email/password forms and public registration modals are removed for customer ease and security.

### 🔒 2. Secret Admin Access Portal
- The Admin login form is **hidden from the public interface**.
- **Hidden Trigger**: On [login.html](file:///c:/Users/UDHEERA/Desktop/2.0/login.html), **triple-click the UDIRA logo** to reveal the secret Administrator Portal.
- **Admin Credentials**:
  - **Email**: `udheeraabhinidu95@gmail.com`
  - **Password**: `admin123`
- **Dashboard Access**: Access to [admin.html](file:///c:/Users/UDHEERA/Desktop/2.0/admin.html) is strictly protected. The Dashboard button is dynamically hidden for non-admin users.

### 🌓 3. Light & Dark Theme Switcher
- Responsive Theme Toggle button (☀️ / 🌙) integrated into the navigation header across all pages.
- Allows customers to switch between Dark Mode (default) and Light Mode seamlessly.
- State is persisted across visits via `localStorage`.

### 📄 4. Prescription Dispatch via Gmail Compose
- Prescription requests on [prescription.html](file:///c:/Users/UDHEERA/Desktop/2.0/prescription.html) launch a pre-filled **Gmail Compose** window directly addressed to `udheeraabhinidu95@gmail.com` from the customer's Gmail account.
- Includes pre-filled patient name, phone number, and special notes so customers can easily attach prescription photos and dispatch.

### 📊 5. Executive Administration & Customer Database
- **Registered Customer Directory**: View registered customer accounts with registration method, role, and location.
- **CSV Spreadsheet Export**: Export registered customer database directly to a `.csv` file.
- **Inventory Management**: Internal price catalog and medicine stock management.
- **Live Theme Customizer**: Real-time color picker for root CSS variable customization across the platform (Admin only).
- **Mail Inbox**: Admin view for incoming contact inquiries and automated sales reports.

---

## 📁 File & Directory Structure

```
c:\Users\UDHEERA\Desktop\2.0\
├── index.html            # Main website homepage
├── about.html            # About pharmacy, owner & chief pharmacist
├── products.html         # Medicine and healthcare catalog
├── medicine-finder.html  # Interactive medicine finder tool
├── prescription.html     # Doctor prescription upload & Gmail dispatch
├── contact.html          # Store location & direct pharmacist contact form
├── blog.html             # Healthcare news & articles
├── faq.html              # Frequently asked questions
├── login.html            # Customer Google Auth & secret Admin trigger
├── admin.html            # Executive Admin Dashboard (Admin restricted)
├── app.js                # Core JavaScript engine (Auth, Themes, Email, Animations)
├── styles.css            # Design system, CSS variables & keyframe animations
└── README.md             # Technical documentation & project guide
```

---

## 🚀 How to Run Locally

Because this project is built using native **HTML5**, **Vanilla CSS**, and **ES6+ JavaScript**, no server build steps or node installation are required.

1. Open the project folder in VS Code or your preferred editor.
2. Launch `index.html` in any web browser (or use **Live Server** extension in VS Code).
3. To test Admin access:
   - Navigate to `login.html`.
   - Triple-click the **UDIRA PHARMACY** logo at the top of the card.
   - Enter Admin credentials: `udheeraabhinidu95@gmail.com` / `admin123`.

---

## 🎨 Tech Stack & Design System

- **Language**: Standard HTML5 & Vanilla ES6+ JavaScript
- **Styling**: Pure Vanilla CSS3 with CSS Custom Properties (Variables)
- **Typography**: Google Fonts — *Inter*
- **Theme**: Dark Mode default with full Light Mode support (`[data-theme="light"]`)
- **Effects**: Glassmorphism, CSS Backdrop Filters, SVG Animations, Particle Engine

---

© 2026 UDIRA PHARMACY. All rights reserved. Managed by Saman Karunarathna, Chief Pharmacist Dinusha Madhushani & Administrator Udheera Abhinidu.
