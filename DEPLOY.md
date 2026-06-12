# 🚀 GrosirPJ - Deployment Guide
## Arsitektur: GitHub → Vercel → Turso → Cloudinary

---

## 📋 Prasyarat

Sebelum deploy, pastikan Anda sudah memiliki akun:

1. **GitHub** - https://github.com (untuk repository code)
2. **Vercel** - https://vercel.com (untuk hosting)
3. **Turso** - https://turso.tech (untuk database cloud)
4. **Cloudinary** - https://cloudinary.com (untuk image CDN)

---

## Step 1: Setup Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Buat database
turso db create grosirpj

# Dapatkan connection URL
turso db show grosirpj --url
# Output: libsql://grosirpj-xxxx.turso.io

# Buat auth token
turso db tokens create grosirpj
# Output: eyJhbGciOiJFZERTQSI...
```

Simpan URL dan token ini! Anda akan membutuhkannya untuk Vercel environment variables.

---

## Step 2: Setup Cloudinary

1. Buka https://cloudinary.com dan daftar akun gratis
2. Buka **Dashboard** di console Cloudinary
3. Catat informasi berikut:
   - **Cloud Name**: `your-cloud-name`
   - **API Key**: `123456789012345`
   - **API Secret**: `xxxxxxxxxxxxxxxxxxxxxx`

### Upload Images ke Cloudinary

Setelah Cloudinary dikonfigurasi, jalankan script upload:

```bash
# Set environment variables di .env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Upload semua gambar lokal ke Cloudinary
bun run upload:images
```

Script ini akan:
- Upload semua gambar dari `/public/images/` ke Cloudinary
- Generate file `cloudinary-mapping.json` dengan mapping URL
- Output SQL statements untuk update database

---

## Step 3: Push Code ke GitHub

```bash
# Initialize git (jika belum)
git init

# Buat .gitignore (pastikan .env tidak ikut ter-upload!)
echo "node_modules/
.next/
.env
*.db
dev.log
cloudinary-mapping.json" >> .gitignore

# Add & commit
git add .
git commit -m "GrosirPJ - Grosir Baju Anak & Remaja"

# Tambahkan remote GitHub
git remote add origin https://github.com/YOUR_USERNAME/grosirpj.git

# Push
git push -u origin main
```

---

## Step 4: Deploy ke Vercel

### Opsi A: Via Vercel Dashboard (Recommended)

1. Buka https://vercel.com/dashboard
2. Klik **"Add New Project"**
3. Pilih repository `grosirpj` dari GitHub
4. Konfigurasi build:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `bun run build` (atau biarkan default)
   - **Output Directory**: `.next` (auto-detected)
5. Tambahkan **Environment Variables**:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `file:./db/custom.db` | Development only |
| `TURSO_DATABASE_URL` | `libsql://grosirpj-xxxx.turso.io` | Production, Preview |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSI...` | Production, Preview |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Production, Preview, Development |
| `CLOUDINARY_API_KEY` | `123456789012345` | Production, Preview |
| `CLOUDINARY_API_SECRET` | `xxxxxxxxxxxxxxxxxxxxxx` | Production, Preview |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://grosirpj.com` | Production |

6. Klik **Deploy** 🚀
7. Setiap push ke `main` = auto deploy!

### Opsi B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy pertama (preview)
vercel

# Deploy ke production
vercel --prod
```

---

## Step 5: Seed Database Turso

Setelah Vercel deploy berhasil, Anda perlu mengisi database Turso dengan data awal:

```bash
# Set Turso env vars temporarily untuk local seeding
export TURSO_DATABASE_URL="libsql://grosirpj-xxxx.turso.io"
export TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSI..."

# Push schema ke Turso
DATABASE_URL="$TURSO_DATABASE_URL" npx prisma db push

# Seed data ke Turso
TURSO_DATABASE_URL="libsql://grosirpj-xxxx.turso.io" TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQSI..." bun run db:seed
```

---

## Step 6: Custom Domain (Opsional)

1. Di Vercel Dashboard → Settings → Domains
2. Tambahkan `grosirpj.com`
3. Update DNS di domain registrar:
   - **Type**: CNAME
   - **Name**: @
   - **Value**: `cname.vercel-dns.com`
   
   Atau:
   - **Type**: A
   - **Name**: @
   - **Value**: `76.76.21.21`

---

## 🔄 Workflow Setelah Deploy

### Update Code
```bash
git add .
git commit -m "deskripsi perubahan"
git push origin main
# Vercel akan auto-deploy!
```

### Tambah Produk Baru
1. Upload gambar ke Cloudinary via API atau dashboard
2. Update database Turso via Prisma atau API endpoint
3. Produk langsung muncul di website

### Update Gambar
```bash
# Tambah gambar baru ke /public/images/
# Lalu upload ke Cloudinary
bun run upload:images
```

---

## 🏗️ Arsitektur Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   Vercel    │────▶│   Turso     │     │ Cloudinary  │
│  (Code)     │     │  (Hosting)  │     │  (Database) │     │  (Images)   │
└─────────────┘     └──────┬──────┘     └─────────────┘     └─────────────┘
                           │                    ▲                    ▲
                           │                    │                    │
                           └────────────────────┴────────────────────┘
                                Serverless Functions
                                (API Routes)
```

- **GitHub**: Source code repository, trigger auto-deploy
- **Vercel**: Hosting, CDN, serverless API routes, SSL
- **Turso**: Cloud SQLite database (libSQL), edge-ready
- **Cloudinary**: Image CDN, auto-optimization, transformations

---

## ⚠️ Troubleshooting

### Build Gagal di Vercel
- Pastikan `postinstall` script berjalan: `prisma generate`
- Check environment variables sudah di-set dengan benar
- Check build log di Vercel Dashboard → Deployments

### Database Connection Error
- Pastikan `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` benar
- Test connection: `turso db shell grosirpj`

### Gambar Tidak Muncul
- Pastikan `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` sudah di-set
- Pastikan gambar sudah di-upload ke Cloudinary
- Check Cloudinary dashboard untuk verifikasi

### Hydration Error
- Pastikan tidak ada perbedaan antara server dan client rendering
- Check browser console untuk error detail
