# 🌏 WebGIS Project: Laravel Inertia React

Sistem Informasi Geografis berbasis Web yang dibangun menggunakan **Laravel 11**, **Inertia.js**, dan **React**. Aplikasi ini dirancang untuk mengelola data spasial fasilitas dan lahan secara interaktif.

---

## 🚀 Fitur Utama

* **Dashboard**: Ringkasan data statistik fasilitas dan total luas lahan dalam bentuk kartu informatif.
* **Peta Interaktif**: Map utama menggunakan **Leaflet.js** atau **Mapbox** dengan fitur:
* Rangkuman sebaran marker.
* Kontrol Layer (Layer Grouping).


* **Manajemen Fasilitas**: Terbagi menjadi 3 kategori utama:
* **Fasilitas Umum**: Sarana ibadah, taman, dll.
* **Fasilitas Publik**: Sekolah, rumah sakit, kantor polisi.
* **Fasilitas Jalan**: Halte, lampu jalan, dan infrastruktur jalan.


* **Kelola Lahan**: Manajemen data spasial berbentuk **Polygon** untuk mendefinisikan area atau batas wilayah.
* **Manajemen User**: Pengaturan hak akses pengguna (Admin & Operator).

---

## 🛠️ Teknologi yang Digunakan

* **Backend**: Laravel 11
* **Frontend**: React (Vite)
* **Bridge**: Inertia.js
* **Database**: MySQL / PostgreSQL (PostGIS recommended)
* **GIS Library**: Leaflet.js / React-Leaflet
* **Styling**: Tailwind CSS

---

## 📦 Instalasi

Ikuti langkah-langkah berikut untuk menjalankan proyek di lingkungan lokal:

### 1. Clone Repository

```bash
git clone https://github.com/dev-guse/webgis---akbar.git
cd webgis---akbar

```

### 2. Instalasi Dependensi Backend (PHP)

```bash
composer install

```

### 3. Instalasi Dependensi Frontend (Node.js)

```bash
npm install

```

### 4. Konfigurasi Lingkungan

Salin file `.env.example` menjadi `.env` dan sesuaikan konfigurasi database Anda.

```bash
cp .env.example .env

```

Lalu generate aplikasi key:

```bash
php artisan key:generate

```

### 5. Migrasi Database & Seeding

Jalankan migrasi untuk membuat tabel dan mengisi data awal (user admin).

```bash
php artisan migrate --seed

```

*Pastikan class `DatabaseSeeder` sudah terdaftar dengan benar.*

### 6. Menjalankan Aplikasi

Buka dua terminal terpisah:

**Terminal 1 (Laravel Server):**

```bash
php artisan serve

```

**Terminal 2 (Vite HMR):**

```bash
npm run dev

```

Akses aplikasi di: `http://127.0.0.1:8000`

---

## 📂 Struktur Folder Penting

* `app/Http/Controllers`: Logika bisnis dan pengolahan data spasial.
* `resources/js/Pages`: Komponen React untuk halaman Dashboard, Map, dan Manajemen Data.
* `resources/js/Components`: Komponen *reusable* (Sidebar, Navbar, Map Container).
* `database/migrations`: Skema tabel untuk Fasilitas (Point) dan Lahan (Polygon).

---

## 🤝 Kontribusi

1. Fork Repository ini.
2. Buat branch fitur baru (`git checkout -b fitur-baru`).
3. Commit perubahan Anda (`git commit -m 'Menambah fitur baru'`).
4. Push ke branch (`git push origin fitur-baru`).
5. Buat Pull Request.

---

## 📄 Lisensi

Proyek ini bersifat open-source di bawah lisensi [MIT](https://www.google.com/search?q=LICENSE).

---

**Dibuat oleh [dev-guse](Akbar)

---
