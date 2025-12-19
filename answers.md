# Technical Questions - Answers

## 1. Timezone Conflicts: How would you handle timezone conflicts between participants in an appointment?

Saya handle timezone conflict dengan cara:

- Waktu input diinterpretasikan sebagai waktu lokal di timezone creator (user yang buat appointment)
- Waktu disimpan dalam UTC di database supaya konsisten
- Saat validasi, sistem cek apakah waktu tersebut masuk jam kerja (09:00-17:00) untuk timezone creator
- Participant lain akan lihat waktu yang sudah dikonversi ke timezone mereka masing-masing
- Kalau waktu di timezone creator tidak masuk jam kerja, appointment ditolak

**Contoh:** Saya (Asia/Jakarta) buat appointment jam 10:00. Sistem cek: 10:00 di Asia/Jakarta masuk jam kerja, jadi appointment bisa dibuat. User lain di Pacific/Auckland akan lihat waktu yang sudah dikonversi ke timezone mereka (misalnya 16:00), meskipun mungkin di luar jam kerja untuk mereka. Yang penting waktu creator masuk jam kerja.

---

## 2. Database Optimization: How can you optimize database queries to efficiently fetch user-specific appointments?

Untuk optimize query appointment, saya lakukan:

- **Index pada kolom penting**: Index di `appointment_participants.user_id` dan `appointments.start` supaya query cepat
- **JOIN langsung**: Pakai JOIN antara `appointments` dan `appointment_participants` langsung, tidak perlu query terpisah
- **Preload relationships**: Pakai GORM Preload untuk ambil Creator dan Participants sekaligus, mengurangi N+1 query problem
- **Filter soft delete**: Filter `deleted_at IS NULL` di query JOIN supaya tidak ambil data yang sudah dihapus
- **Query spesifik**: Hanya ambil appointment yang user ikut sebagai participant, tidak ambil semua appointment

Dengan cara ini, query jadi lebih cepat karena pakai index dan tidak perlu multiple round-trip ke database.

---

## 3. Additional Features: If this application were to become a real product, what additional features would you implement? Why?

Kalau jadi real product, fitur penting yang saya tambahkan:

1. **Notifikasi Email/SMS**: Reminder sebelum meeting supaya user tidak lupa. Penting karena banyak user yang lupa kalau ada appointment.

2. **Integrasi Calendar**: Sync ke Google Calendar atau Outlook. User sudah pakai calendar mereka sehari-hari, lebih praktis kalau appointment langsung masuk.

3. **Meeting Berulang**: Support meeting harian, mingguan, atau bulanan. Banyak meeting rutin seperti daily standup, tidak perlu buat manual setiap hari.

4. **RSVP/Konfirmasi**: User bisa konfirmasi hadir atau tidak. Organizer jadi tahu siapa yang akan datang dan bisa prepare.

5. **Deteksi Konflik**: Warning kalau ada 2 meeting di waktu bersamaan. Mencegah double-booking yang bikin repot.

6. **Link Video Conference**: Auto-generate link Zoom atau Google Meet. Banyak meeting sekarang virtual, lebih praktis kalau link langsung tersedia.

Fitur lain yang berguna: catatan meeting, lampiran file, template meeting, search dan filter, mobile app.

---

## 4. Session Management: How would you manage user sessions securely while keeping them lightweight (e.g., avoiding large JWT payloads)?

Saya pakai pendekatan minimal untuk JWT payload supaya ringan dan aman.

**Yang sudah dilakukan:**
- JWT hanya berisi `user_id` dan `exp` (expiration time), data minimal saja
- Token expire setelah 1 jam, mengurangi risiko kalau token hilang atau dicuri
- Data lain seperti name, timezone, atau preferences diambil dari database saat diperlukan, tidak disimpan di token
- Token disimpan di localStorage di frontend

**Untuk production bisa ditambah:**
- **Refresh token**: Access token pendek (15-30 menit), refresh token panjang (7 hari) disimpan di database. User tidak perlu login ulang terus.
- **Token blacklist**: Saat logout, token di-blacklist di database supaya tidak bisa dipakai lagi meskipun belum expire
- **Rate limiting**: Batasi percobaan login per IP, mencegah brute force attack
- **httpOnly cookies**: Alternatif lebih aman dari localStorage untuk production, mencegah XSS attack

**Intinya:** Token dibuat kecil dan cepat, data besar diambil dari database saat perlu. Ini membuat token ringan tapi tetap aman.
