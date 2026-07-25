# 🍲 KSM Katering — System Management & Operations Web App

Aplikasi web manajemen dan operasional **KSM Katering** berbasis **Next.js (App Router)** & **TypeScript**, terintegrasi dengan Headless CMS **Strapi REST API**. 

Project ini dirancang dengan standar arsitektur perangkat lunak modern,  menerapkan sistem Role-Based Access Control (RBAC), standar keamanan OWASP Top 10, dan integrasi Progressive Web App (PWA).

---

## 📖 Latar Belakang & Deskripsi Project

**KSM Katering** adalah platform manajemen operasional catering terpadu yang memfasilitasi pengelolaan pesanan (orders), manajemen hidangan (dishes) & paket menu, data pelanggan (customers), jadwal pengiriman, hingga manajemen staf operasional.

Aplikasi ini menggunakan pendekatan **Decoupled Architecture**:
- **Frontend (Repo Ini)**: Next.js 16, TypeScript, Tailwind CSS, Radix UI.
- **Backend**: Strapi Headless CMS (REST API) untuk persistent database & media storage.

---

## ⚡ Fitur Utama & Modul

1. **Role-Based Access Control (RBAC)**:
   - **Manager**: Hak akses ke statistik grafik, manajemen pengguna/staf, menu & hidangan.
   - **Sales**: Hak akses membuat & mengubah order, manajemen pelanggan.
   - **Driver / Kurir**: Hak akses memperbarui status pengiriman menggunakan QR Code.
2. **Manajemen Order & Penjadwalan**:
   - Pembuatan order bertahap dengan kalkulasi otomatis.
   - Generasi PDF untuk Invoice, Delivery Order (Surat Jalan), dan laporan Excel.
   - Integrasi peta lokasi (Leaflet & OpenStreetMap) untuk titik antaran.
3. **PWA (Progressive Web App)**:
   - Dukungan akses mobile yang fleksibel dengan performa tinggi.

---

## 🏗️ Arsitektur & Struktur Folder

Proyek ini disusun rapi dan modul terpisah per komponen fitur (*Feature-Driven Architecture*):

```text
ksm_katering/
├── app/                  # Next.js App Router (Pages, API Routes, Layouts)
│   ├── admin/            # Halaman Dasbor Admin (Order, Menu, Customer, User, Graph)
│   ├── api/              # Proxy Endpoints & Internal Server Handlers
│   └── auth/             # Halaman Autentikasi (Login)
├── components/           # Komponen UI Reusable
│   ├── admin/            # Form & Tabel Spesifik Admin
│   ├── custom/           # Custom Reusable Components
│   └── ui/               # Primitive Design System (Radix UI / Shadcn)
├── const/                # Konfigurasi Konstanta & Permission RBAC
│   └── permissions.ts    # Matriks Otorisasi Peran (Manager, Sales, Driver)
├── features/             # Business Logic Layer (Clean API Integration & Services)
│   └── admin/            # CRUD Handler (Order, Customer, Dish, Menu, Staff)
├── hooks/                # Custom React Hooks
├── lib/                  # Helper Utilities & API Wrapper
├── types/                # TypeScript Type Definitions & Interfaces
├── middleware.ts         # Server-Side Security Middleware (Route Protection & JWT)
└── next.config.ts        # Konfigurasi Next.js & PWA
```

---

## 🛠️ Teknologi & Dependency Stack

- **Framework Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Radix UI, Lucide React, Sonner (Toasts)
- **Validation**: Zod (Schema Validation)
- **Charts & Maps**: Recharts, Leaflet, React-Leaflet
- **Document Generation**: `@react-pdf/renderer`, `qrcode`, `date-fns`
- **PWA & Offline**: `next-pwa`

---

## 🔒 Standar Keamanan & Keandalan (OWASP & RBAC)

Aplikasi ini menerapkan praktik keamanan terbaik sesuai pedoman OWASP:

1. **Authentication & JWT Security**:
   - Autentikasi berbasis JSON Web Token (JWT) yang disimpan secara aman via `HttpOnly Cookie`.
   - Pencegahan pencurian token dari serangan XSS di sisi client-side.
2. **Server-Side Route Protection (Middleware)**:
   - File `middleware.ts` memeriksa token JWT dan role pengguna sebelum halaman dilayani.
   - Percobaan akses ilegal akan didaur ulang (*redirect*) otomatis ke rute yang berhak.
3. **Data Sanitization & Injection Prevention**:
   - Seluruh input diproses melalui schema validation (**Zod**) & REST API Strapi dengan *parameterized queries* bawaan ORM/Strapi untuk mencegah SQL/NoSQL Injection.
4. **Proteksi Form & Data Validation**:
   - Validasi nomor HP/identitas unik di tingkat server sebelum eksekusi mutasi.

---

## 🌐 Konfigurasi CORS & Decoupled Architecture

Karena aplikasi ini menggunakan arsitektur **Decoupled (Frontend Next.js terpisah dengan Backend Strapi)**:
- **CORS Handling**: Pengaturan Cross-Origin Resource Sharing dikonfigurasi pada Backend Strapi untuk hanya mengizinkan origin domain Frontend ini.
- **Image Domain Whitelisting**: Remote media patterns telah didaftarkan secara aman pada `next.config.ts` untuk media server Strapi.

---

## 🚀 Petunjuk Instalasi & Setup Guide

### Prasyarat
- **Node.js**: v20.x atau versi lebih baru
- **npm** / **yarn** / **pnpm**

### 1. Clone Repository & Install Dependencies
```bash
git clone <URL_REPOSITORY_ANDA>
cd ksm_katering
npm install
```

### 2. Konfigurasi Environment Variables
Buat file `.env` di root direktori project berdasarkan `.env.example`:

```bash
cp .env.example .env
```

Isi variabel environment berikut:
```env
NEXT_PUBLIC_STRAPI_URL=https://your-strapi-backend-url.com
```

### 3. Menjalankan Mode Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

### 4. Build untuk Production
```bash
npm run build
npm run start
```

---

## 👥 Kontributor / Pengembang Project

| No | Nama | Peran | Repository / Kontribusi |
|---|---|---|---|
| 1 | Disa Ufairah | Full Stack Developer | 
