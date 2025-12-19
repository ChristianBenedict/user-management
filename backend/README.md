# Appointment Management System - Backend

Backend API untuk User Appointment Management System menggunakan Golang, Gin Framework, dan MySQL.

## Requirements

- Go 1.21 atau lebih baru
- MySQL 5.7+ atau MySQL 8.0+
- Git

## Setup

### 1. Install Dependencies

```bash
cd backend
go mod download
```

### 2. Setup Database

1. Buat database MySQL:
```sql
CREATE DATABASE appointment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Atau jalankan migration SQL:
```bash
mysql -u root -p appointment_db < database/migrations.sql
```

### 3. Konfigurasi Environment

Buat file `.env` di folder `backend` (copy dari `.env.example`):

```env
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

### 4. Run Application

```bash
go run main.go
```

Server akan berjalan di `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/login` - Login dengan username
  ```json
  {
    "username": "john"
  }
  ```

### Users (Protected - requires JWT token)

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

### Appointments (Protected - requires JWT token)

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
- `DELETE /api/appointments/:id` - Delete appointment (creator only)

## Authentication

Semua endpoint kecuali `/api/login` memerlukan JWT token di header:

```
Authorization: Bearer <token>
```

Token akan expire setelah 1 jam (dapat dikonfigurasi di `.env`).

## Timezone Support

Sistem mendukung timezone IANA (contoh: `Asia/Jakarta`, `Pacific/Auckland`, `America/New_York`).

- Appointment harus dalam jam kerja (09:00 - 17:00) untuk semua peserta
- Waktu ditampilkan sesuai timezone user yang login

## Project Structure

```
backend/
├── config/          # Configuration
├── database/        # Database connection & migrations
├── handlers/        # HTTP handlers
├── middleware/      # Middleware (auth, CORS)
├── models/          # Data models
├── routes/          # Route definitions
├── utils/           # Utilities (JWT, timezone)
├── main.go          # Application entry point
└── go.mod           # Go dependencies
```

