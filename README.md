# GINGERTRENDZ — THE FASHION DISCIPLES
### Luxury Editorial Streetwear & Contemporary Silhouette Boutique

An editorial boutique e-commerce web application inspired by high-fashion aesthetics, built with **Node.js, Express, Vanilla CSS**, and powered by **Supabase PostgreSQL** and **Nodemailer**.

---

## ✨ Key Features

1. **Editorial Boutique Storefront**:
   - Hero banner featuring **THE FASHION DISCIPLES** editorial campaign.
   - Luxury Dark/Gilded color palette: Smoked Truffle (`#09080B`), Gilded Champagne Gold (`#E6BD7B`), Spiced Ginger Ochre (`#DF6932`), and Silk Alabaster (`#FAF7F2`).
   - Dynamic lookbook filtering (Hoodies, Outerwear, Pants, Tees) and live search.

2. **Garment Sizing & Inventory Matrix**:
   - Size selector (`XS`, `S`, `M`, `L`, `XL`, `XXL`) with per-size real-time stock counters.
   - Low stock warnings and interactive Size Guide Modal.

3. **Slide-Over Shopping Bag**:
   - Complimentary delivery progress bar (Free shipping over ₦120,000).
   - Quantity controls, instant subtotal calculation, and seamless checkout transition.

4. **Automated Drop Notification Email Engine**:
   - **Checkout Email Auto-Capture**: Every customer email entered during checkout is enrolled to receive drop announcements.
   - **VIP Newsletter Subscription**: Instant enrollment modal with notification badges.
   - Whenever a new garment drops, an editorial HTML email previewing the garment, sizes, and price is dispatched.

5. **Curator Portal (Workspace)**:
   - Private Access Key gate (`admin123`) — no generic "admin" terminology in visible UI.
   - Real-time catalog editor (add/edit garments, stock levels, sizes, and upload photos).
   - Orders fulfillment dashboard with printable courier receipts.
   - Email subscribers directory and dispatch campaign history with live email template previewer.

6. **Supabase Cloud PostgreSQL Database**:
   - Direct connection via `@supabase/supabase-js`.
   - Full Row Level Security (RLS) policies.
   - 1-click local JSON cache fallback for offline resilience.
   - Interactive database sync and connection status directly inside the Curator Portal.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **Git**

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/gingertrendz.git
cd gingertrendz
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your configuration (or enter them directly in the Curator Portal):
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

### 4. Setup Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Copy and run the script in [`supabase_schema.sql`](./supabase_schema.sql).
4. All tables (`products`, `orders`, `subscribers`, `email_logs`) and seed garments will be created automatically.

### 5. Start the Application
```bash
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Storefront**: `http://localhost:3000/`
- **Curator Portal**: Click **"Portal"** in the top navigation or visit `http://localhost:3000/#portal`
- **Curator Key**: `admin123`

---

## 📁 Project Architecture

```
Gingertrendz/
├── data/                    # Offline JSON cache directory
│   ├── products.json        # Garment catalog cache
│   ├── orders.json          # Customer orders cache
│   ├── subscribers.json     # Enrolled customer emails
│   └── email_logs.json      # Dispatch campaign logs
├── lib/
│   └── supabase.js          # Supabase client adapter & sync manager
├── public/                  # Storefront & Curator UI
│   ├── assets/images/       # Editorial lookbook photography
│   ├── js/
│   │   ├── app.js           # Client-side boutique logic & cart
│   │   └── admin.js         # Curator portal & database manager
│   ├── styles.css           # Luxury editorial styling
│   └── index.html           # Single-page application template
├── uploads/                 # Product image uploads
├── .env.example             # Environment template
├── .gitignore               # Ignored files (node_modules, .env, etc.)
├── package.json             # Node.js dependencies
├── server.js                # Express REST API & Nodemailer engine
└── supabase_schema.sql      # Supabase PostgreSQL schema script
```

---

## 🛡️ License
Private Proprietary — Gingertrendz Atelier & The Fashion Disciples.
