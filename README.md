# Sentinel | Competitor Intelligence & Price Defense Platform

Modern web platform for real-time competitor price monitoring, catalog scraping, stock outage detection, and automated pricing policy enforcement.

---

## ⚡ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 📁 Architecture

```text
src/
├── components/
│   ├── layout/        # Navbar, Footer
│   └── ui/            # Reusable design tokens (Button, Badge, Cards)
├── features/
│   ├── landing/       # Marketing views (Hero, Live Simulation, Features, Pricing)
│   └── dashboard/     # Interactive console (Monitors table, live stats, filters, modal)
├── types/             # Domain TypeScript definitions
├── App.tsx            # Root application container & view manager
├── index.css          # Tailwind CSS layer setup
└── main.tsx           # React DOM root entry
```
