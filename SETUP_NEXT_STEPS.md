# Langkah Setelah Database Dibuat

Setelah Anda berhasil membuat database `appointment_db` di MySQL Workbench, ikuti langkah berikut:

## 1. Verifikasi Database dan Tabel

Di MySQL Workbench:
1. Pastikan database `appointment_db` sudah dibuat
2. Double-click `appointment_db` di panel kiri (agar aktif)
3. Klik tab "Schemas" → expand `appointment_db` → expand "Tables"
4. Harus ada 3 tabel:
   - `users`
   - `appointments`
   - `appointment_participants`

Jika tabel belum ada, jalankan migration:
- File → Open SQL Script → pilih `backend/database/migrations.sql`
- Klik Execute (⚡)

## 2. Buat File .env di Backend

1. Buka folder `backend`
2. Buat file baru bernama `.env` (tanpa ekstensi, titik di depan)
3. Copy-paste isi berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_mysql_anda_disini
DB_NAME=appointment_db

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_HOURS=1
PORT=8000
GIN_MODE=debug
```

**PENTING:** Ganti `password_mysql_anda_disini` dengan password MySQL root Anda!

## 3. Install Dependencies Backend

Buka terminal/command prompt di folder `backend`:

```bash
cd backend
go mod download
```

Tunggu sampai selesai (mungkin beberapa menit pertama kali).

## 4. Test Koneksi Database

Masih di folder `backend`, jalankan:

```bash
go run main.go
```

**Jika berhasil**, akan muncul:
```
Database connected successfully
Database migration completed
```

**Jika error**, kemungkinan:
- Password MySQL salah → cek file `.env`
- MySQL tidak running → start MySQL service
- Port salah → pastikan port 3306

## 5. Setup Frontend

Buka terminal baru (jangan tutup yang backend), di folder root project:

```bash
npm install
```

Tunggu sampai selesai.

## 6. Jalankan Frontend

Masih di folder root:

```bash
npm start
```

Frontend akan jalan di `http://localhost:4200`

## 7. Test Aplikasi

1. Buka browser: http://localhost:4200
2. Akan redirect ke login page
3. **Tapi belum ada user!** Kita perlu buat user dulu

## 8. Buat User untuk Testing

Ada 2 cara:

### Cara 1: Via MySQL Workbench (Langsung)

Di MySQL Workbench, jalankan query:

```sql
USE appointment_db;

INSERT INTO users (name, username, preferred_timezone) VALUES
('John Doe', 'john', 'Asia/Jakarta'),
('Jane Smith', 'jane', 'Pacific/Auckland');
```

### Cara 2: Via API (Setelah backend jalan)

Backend harus jalan dulu, lalu:
- Buat user via API (akan ada fitur create user di frontend nanti)
- Atau pakai Postman/curl untuk POST ke `/api/users`

## 9. Login dan Test

1. Buka http://localhost:4200
2. Login dengan username yang sudah dibuat (misalnya: `john`)
3. Tidak perlu password (sesuai requirement - login hanya username)
4. Setelah login, akan masuk ke halaman appointments

## Checklist Final

- [ ] Database `appointment_db` dibuat
- [ ] Tabel `users`, `appointments`, `appointment_participants` ada
- [ ] File `.env` dibuat dengan password yang benar
- [ ] Backend jalan tanpa error (`go run main.go`)
- [ ] Frontend jalan (`npm start`)
- [ ] Bisa login dengan username yang sudah dibuat
- [ ] Bisa lihat halaman appointments

## Troubleshooting

### Backend error: "Failed to connect to database"
- Cek password di `.env` sudah benar
- Cek MySQL service running (Services → MySQL)
- Cek port 3306 tidak dipakai aplikasi lain

### Frontend error: "Cannot GET /"
- Pastikan backend jalan di port 8000
- Cek `proxy.conf.json` target ke `http://localhost:8000`

### Login error: "Invalid username"
- Pastikan user sudah dibuat di database
- Cek di MySQL Workbench: `SELECT * FROM users;`

## Selesai!

Jika semua checklist sudah, aplikasi siap digunakan!

