# Sentinel | Autonomous Market Intelligence & Price Defense Platform

Modern full-stack intelligence platform for real-time competitor pricing telemetry, dark store stockout arbitrage detection (Blinkit, Zepto, Amazon, Flipkart, ONDC), and Government of India regulatory compliance enforcement (Legal Metrology, CCPA, CCI).

---

## ⚡ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 6](https://vitejs.dev/) + [Recharts](https://recharts.org/)
- **Backend**: [Express.js](https://expressjs.com/) + SSE (Server-Sent Events) live telemetry stream
- **Mobile & Desktop PWA**: Web App Manifest + Service Worker + high-resolution maskable icons
- **Styling**: Dark Theme (`#090d16`) with native mobile bottom navigation and touch optimization

---

## 🚀 1-Click Free Hosting on Render

This repository includes a [`render.yaml`](render.yaml) blueprint configuration for 100% free hosting:

1. Sign in to [Render.com](https://render.com) using your GitHub account.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select this repository: `Vishalahire23/sentinel`.
4. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Click **Create Web Service**. Render provides free automatic HTTPS/SSL and a public URL (e.g. `https://sentinel.onrender.com`).

---

## 📱 Mobile App (PWA) Installation

Sentinel is an installable Progressive Web App:
- **Android (Chrome)**: Tap the in-app **[ Install App ]** banner or open the Chrome menu (`⋮`) $\rightarrow$ **Install App** / **Add to Home screen**.
- **iPhone / iPad (Safari)**: Tap the **Share** button (`⎋`) at the bottom of Safari $\rightarrow$ **Add to Home Screen** (`⊞`).
- **Desktop (Chrome / Edge)**: Click the **Install** icon in the browser address bar.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build & Run Production Server Locally
```bash
npm run build
npm start
```
Default URL: `http://localhost:4000`

---

## 🔐 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@sentinel.local` | `sentinel123` |
| **Market Analyst** | `analyst@sentinel.local` | `analyst123` |
