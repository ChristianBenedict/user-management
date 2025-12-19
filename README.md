# User Appointment Management System

Sistem manajemen appointment dengan fitur timezone handling, authentication, dan user management.

## Tech Stack

### Frontend
- **Angular 21** - Framework untuk frontend
- **Bootstrap 5** - UI styling
- **TypeScript** - Programming language

### Backend
- **Golang 1.21+** - Programming language
- **Gin Framework** - HTTP web framework
- **GORM** - ORM untuk database
- **JWT** - Authentication

### Database
- **MySQL** - Relational database

## Features

- ✅ **Authentication**: Login sederhana dengan username menggunakan JWT
- ✅ **User Management**: CRUD users dengan timezone preference
- ✅ **Appointment System**: Create, view, dan manage appointments
- ✅ **Timezone Handling**: Validasi working hours (09:00 - 17:00) untuk semua peserta
- ✅ **Timezone Display**: Waktu ditampilkan sesuai timezone user yang login

## Prerequisites

- Node.js 18+ dan npm
- Go 1.21+
- MySQL 5.7+ atau MySQL 8.0+

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd user-management
```

### 2. Setup Database

**PENTING**: Setup database terlebih dahulu sebelum menjalankan backend!

**Cara membuat database:**
1. Buka MySQL Workbench
2. Connect ke MySQL server
3. Klik ikon "Create a new schema" (database icon dengan +)
4. Schema name: `appointment_db`
5. Collation: `utf8mb4_unicode_ci`
6. Klik "Apply"
7. Double-click `appointment_db` di panel kiri
8. File → Open SQL Script → pilih `backend/database/migrations.sql`
9. Klik "Execute" (⚡)

**Setelah database dibuat**, lihat [SETUP_NEXT_STEPS.md](./SETUP_NEXT_STEPS.md) untuk langkah selanjutnya.

### 3. Setup Backend

**Setelah database dibuat**, ikuti langkah lengkap di [SETUP_NEXT_STEPS.md](./SETUP_NEXT_STEPS.md).

**Quick summary:**
1. Buat file `backend/.env` dengan konfigurasi database
2. Install dependencies: `cd backend && go mod download`
3. Test koneksi: `go run main.go`

Backend akan berjalan di `http://localhost:8000`

### 4. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Update environment (optional, jika perlu)
# Edit src/app/environments/environment.ts jika API URL berbeda

# Run development server
npm start
```

Frontend akan berjalan di `http://localhost:4200`

### 5. Proxy Configuration

Frontend menggunakan proxy untuk API calls. Pastikan `proxy.conf.json` sudah dikonfigurasi dengan benar:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Database Schema

### Users Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR)
- `username` (VARCHAR, UNIQUE)
- `preferred_timezone` (VARCHAR, default: 'Asia/Jakarta')
- `created_at`, `updated_at`, `deleted_at`

### Appointments Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `title` (VARCHAR)
- `creator_id` (INT, FOREIGN KEY)
- `start` (DATETIME)
- `end` (DATETIME)
- `created_at`, `updated_at`, `deleted_at`

### Appointment Participants Table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `appointment_id` (INT, FOREIGN KEY)
- `user_id` (INT, FOREIGN KEY)
- `created_at`, `updated_at`

## API Endpoints

### Authentication
- `POST /api/login` - Login dengan username
  ```json
  {
    "username": "john"
  }
  ```

### Users (Protected)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
  ```json
  {
    "name": "John Doe",
    "username": "john",
    "preferred_timezone": "Asia/Jakarta"
  }
  ```
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Appointments (Protected)
- `POST /api/appointments` - Create appointment
  ```json
  {
    "title": "Team Meeting",
    "start": "2024-01-15T09:00:00Z",
    "end": "2024-01-15T10:00:00Z",
    "participant_ids": [2, 3]
  }
  ```
- `GET /api/appointments` - Get user's upcoming appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `DELETE /api/appointments/:id` - Delete appointment

## Usage

1. **Login**: Gunakan username yang sudah terdaftar di database
2. **Create User**: Buat user baru dengan timezone preference
3. **Create Appointment**: 
   - Pilih tanggal dan waktu
   - Pilih peserta (opsional)
   - Sistem akan validasi bahwa waktu berada dalam jam kerja (09:00 - 17:00) untuk semua peserta
4. **View Appointments**: Lihat daftar appointment yang akan datang, waktu ditampilkan sesuai timezone Anda

## Timezone Support

Sistem mendukung timezone IANA standard:
- `Asia/Jakarta` (WIB)
- `Asia/Singapore` (SGT)
- `Pacific/Auckland` (NZDT)
- `America/New_York` (EST)
- Dan timezone lainnya sesuai IANA database

## Project Structure

```
user-management/
├── backend/                 # Golang backend
│   ├── config/            # Configuration
│   ├── database/          # Database connection & migrations
│   ├── handlers/          # HTTP handlers
│   ├── middleware/        # Middleware (auth, CORS)
│   ├── models/            # Data models
│   ├── routes/            # Route definitions
│   ├── utils/             # Utilities (JWT, timezone)
│   └── main.go            # Application entry point
├── src/                   # Angular frontend
│   └── app/
│       ├── core/          # Core services, guards, interceptors
│       ├── features/      # Feature modules
│       │   ├── auth/      # Authentication
│       │   ├── users/     # User management
│       │   └── appointments/ # Appointment management
│       └── shared/        # Shared components
├── answers.md             # Technical questions answers
└── README.md              # This file
```

## Technical Questions

Jawaban untuk pertanyaan teknis dapat dilihat di file [answers.md](./answers.md)

## Development

### Backend Development
```bash
cd backend
go run main.go
```

### Frontend Development
```bash
npm start
```

### Build for Production

**Backend:**
```bash
cd backend
go build -o appointment-api main.go
./appointment-api
```

**Frontend:**
```bash
npm run build
```

## Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
npm test
```

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=appointment_db
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY_HOURS=1
PORT=8000
GIN_MODE=debug
```

## Troubleshooting

### Database Connection Error
- Pastikan MySQL service berjalan
- Periksa credentials di `.env`
- Pastikan database sudah dibuat

### CORS Error
- Pastikan backend CORS middleware sudah dikonfigurasi
- Periksa proxy configuration di `proxy.conf.json`

### JWT Token Expired
- Token expire setelah 1 jam (dapat dikonfigurasi)
- Login ulang untuk mendapatkan token baru

## License

This project is for educational purposes.

## Author

Christian Benedict Lumbantoruan
