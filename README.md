# Asisten Belajar Offline - Bahan Latihan P13

Aplikasi web modern (**HTML, CSS, JavaScript**) yang berjalan **100% lokal di browser secara offline** sebagai Asisten Belajar cerdas berbasis seluruh koleksi modul materi di folder **Bahan Latihan P13** (`Koleksi_Modul_P13`) SMA Mutiara Bangsa 2 Kota Tangerang.

---

## 🌟 Fitur Unggulan Aplikasi

### 1. 🤖 AI Chatbot Asisten Mandiri (Tanpa Kalimat Template)
- **Penalaran Mandiri & Konseptual:** Mampu mengurai pertanyaan pengguna, menganalisis hubungan kausalitas, dan merumuskan penjelasan mendalam secara otonom tanpa bergantung pada kalimat template yang kaku.
- **Kutipan Sumber Presisi:** Setiap jawaban dilengkapi rujukan resmi modul, mencakup nama modul, nomor bab, rentang halaman, serta instansi penyusun (contoh: `[Modul 01: Sejarah Indonesia, Bab 2 Halaman 5-8]`).
- **Suara AI (Text-to-Speech):** Tersedia tombol pembacaan audio bahasa Indonesia untuk mendengarkan penjelasan materi secara lisan.

### 2. 📎 Lampiran Multimedia & Analisis Dokumen Multi-Format
- **Mendukung Ragam Berkas:** Tombol lampiran (`📎`) pada kolom chat mendukung pengunggahan file foto/gambar (`.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`), video (`.mp4`, `.webm`), rekaman suara/audio (`.mp3`, `.wav`, `.ogg`), serta dokumen teks/akademik (`.pdf`, `.docx`, `.txt`, `.json`, `.csv`, `.md`).
- **Pratinjau Interaktif:**
  - *Gambar:* Penampil gambar responsif dengan fitur Lightbox zoom.
  - *Video:* Pemutar video HTML5 dengan kendali penuh.
  - *Audio:* Pemutar audio HTML5 terintegrasi.
  - *Dokumen:* Kartu berkas dengan tombol **"Baca Dokumen"** untuk menelaah cuplikan isi dokumen dalam jendela modal.
- **Analisis AI Terpadu:** AI chatbot mampu membaca, mengekstraksi, dan menghubungkan isi berkas lampiran dengan kurikulum modul yang sedang aktif.

### 3. 📝 Generator Kuis Interaktif (250 Soal Lengkap Tanpa Reload)
Tersedia mode generator kuis pada bilah navigasi atas sesuai modul yang dipilih di dashboard kiri:
- **15 Soal Pilihan Ganda (PG)** per modul (150 total soal lintas 10 modul).
- **5 Soal True / False (Benar / Salah)** per modul (50 total soal lintas 10 modul).
- **5 Soal Esai Mandiri / Menulis Kalimat** per modul (50 total soal lintas 10 modul) dilengkapi tombol **"Periksa Esai & Evaluasi AI"** yang menilai kata kunci dan memberikan umpan balik konstruktif.
- **Kalkulator Skor Real-Time:** Menghitung skor total (0 - 100), skor PG, TF, dan Esai secara otomatis di tempat tanpa memuat ulang (*reload*) halaman.
- **Kunci Jawaban & Pembahasan Lengkap:** Tombol buka-tutup pembahasan yang langsung menyajikan kunci jawaban resmi, rasionalisasi ilmiah, dan rujukan bab/halaman buku teks.

### 4. 🗂️ Dashboard Samping Kiri (10 Modul Terpisah + Multi-Modul)
Menampilkan seluruh modul kurikulum dari folder **Bahan Latihan P13** secara terpisah:
1. 📜 **Modul 01: Sejarah Indonesia** (`MOD-SEJ-11-01`) - Dinamika Perjuangan Menuju Proklamasi & Diplomasi Kedaulatan RI
2. 🧬 **Modul 02: Biologi** (`MOD-BIO-11-02`) - Fisiologi Saluran Pencernaan, Kinetika Enzimologis, dan Patofisiologi Nutrisi
3. ⚛️ **Modul 03: Fisika** (`MOD-FIS-11-03`) - Dinamika Partikel, Analisis Vektor Gaya, dan Formulasi Hukum Gerak Newton
4. 🧪 **Modul 04: Kimia** (`MOD-KIM-11-04`) - Termodinamika Kimia, Entalpi Reaksi, Kinetika Molekuler, dan Teori Tumbukan
5. 📐 **Modul 05: Matematika Lanjut** (`MOD-MAT-11-05`) - Kalkulus Lanjut: Limit Aljabar, Turunan Derivatif, dan Aplikasi Integral Tentu
6. 👥 **Modul 06: Sosiologi Terapan** (`MOD-SOS-11-06`) - Stratifikasi Sosial, Diferensiasi Kultural, Dinamika Konflik, dan Kohesi Komunitas
7. 🌍 **Modul 07: Geografi Fisik** (`MOD-GEO-11-07`) - Geodinamika Litosfer: Tektonisme, Vulkanisme, Seismologi, dan Mitigasi Bencana
8. 📈 **Modul 08: Ekonomi & Keuangan** (`MOD-EKO-11-08`) - Sistem Moneter, Lembaga Keuangan Bank/Non-Bank, Pasar Modal, dan Kebijakan Fiskal
9. 💻 **Modul 09: Informatika Lanjut** (`MOD-INF-11-09`) - Arsitektur Komputer Modern, Organisasi Memori, Protokol TCP/IP, dan Keamanan Sistem
10. 📚 **Modul 10: Bahasa Indonesia** (`MOD-IND-11-10`) - Kaidah Penulisan Karya Ilmiah, Sistematika Artikel Jurnal, dan Analisis Sastra
- 🌐 **Opsi "Semua Modul":** Untuk sintesis komprehensif lintas disiplin ilmu.

### 5. 💡 Alur Kerja & Perumus Prompt Mandiri
- **Visualisasi Pipeline 5 Langkah:** Menjabarkan alur kerja pemuatan data dari Bahan Latihan P13, pengindeksan semantik, dekonstruksi multimedia, penalaran mandiri, hingga evaluasi kuis.
- **Autonomous Inquiry Formulator:** Siswa cukup memasukkan satu kata kunci/topik, sistem akan merumuskan 4 tingkatan prompt Taksonomi Bloom (Konseptual, Kausalitas, Komparasi, dan Pemecahan Masalah) yang dapat langsung dikirim ke AI.

---

## 🚀 Cara Menjalankan Aplikasi

Aplikasi dirancang murni dengan teknologi web standar (**Vanilla HTML5, CSS3, ES6 JavaScript**), tanpa dependensi eksternal, sehingga dapat dijalankan dengan dua cara:

### Cara 1: Langsung Buka di Browser (Paling Praktis)
1. Buka File Explorer di komputer Anda.
2. Masuk ke folder `asisten-belajar-offline`.
3. Klik dua kali berkas **`index.html`** untuk membukanya di Google Chrome, Microsoft Edge, atau Mozilla Firefox.

### Cara 2: Menjalankan Server Lokal (Opsional)
Jalankan perintah berikut di terminal / PowerShell:
```bash
node server.js
```
Lalu buka peramban dan kunjungi alamat:
```
http://localhost:3000/
```

---

## 📁 Struktur Berkas

```
asisten-belajar-offline/
├── index.html               # Halaman antarmuka utama aplikasi
├── index.css                # Desain sistem & stylesheet glassmorphism modern
├── app.js                   # Kontroler logika: Chatbot, Kuis, Reader, TTS, Lampiran
├── modules_data.js          # Basis data 10 modul kurikulum & 250 butir soal kuis
├── server.js                # Server statis lokal ringan berbasis Node.js
├── Koleksi_Modul_P13/       # Direktori sumber PDF & TXT materi Bahan Latihan P13
│   ├── Modul_01_Sejarah_Kemerdekaan_Indonesia.pdf
│   ├── Modul_02_Biologi_Sistem_Pencernaan_dan_Metabolisme.pdf
│   ├── Modul_03_Fisika_Mekanika_Klasik_dan_Hukum_Newton.pdf
│   ├── ... (hingga Modul 10)
├── sample_assets/           # Berkas contoh untuk uji coba lampiran (SVG, TXT)
│   ├── diagram_sistem_pencernaan.svg
│   ├── diagram_hukum_newton.svg
│   └── catatan_sejarah_rengasdengklok.txt
└── README.md
```