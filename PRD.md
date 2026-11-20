[PRD Invoice Generator.md](https://github.com/user-attachments/files/35118107/PRD.Invoice.Generator.md)
# PRD: Invoice Generator

Versi 1.0 · 20 November 2026 · Disusun untuk Yogi

## 1. Ringkasan

Invoice Generator adalah aplikasi web ringan untuk membuat, mengelola, dan mencetak invoice dalam format A4 yang rapi. Aplikasi berjalan sepenuhnya di browser (HTML + CSS + JavaScript), tanpa server, tanpa database, dan tanpa instalasi. Cukup buka file `index.html`.

Desain mengikuti prinsip minimalis dan elegan dengan palet sky blue dan gradien halus.

## 2. Tujuan dan Non-Tujuan

**Tujuan**

- Membuat invoice lengkap dalam kurang dari 2 menit.
- Pratinjau invoice tampil langsung (live preview) saat form diisi.
- Hasil dapat dicetak atau disimpan sebagai PDF dengan kualitas rapi.
- Berjalan tanpa PHP, tanpa XAMPP, tanpa koneksi internet (setelah aset lokal tersedia).
- Kolom barang/jasa fleksibel: bisa tambah, hapus, dan ubah baris bebas.

**Non-Tujuan (versi 1.0)**

- Login multi-user dan peran akses.
- Database terpusat dan sinkronisasi antar perangkat.
- Pengiriman email otomatis dan integrasi payment gateway.
- Pelaporan keuangan dan pembukuan.
- Faktur pajak resmi (e-Faktur). Dokumen ini adalah invoice biasa, bukan faktur pajak.

## 3. Pengguna dan Skenario

| Pengguna | Kebutuhan |
| --- | --- |
| Pemilik usaha kecil / freelancer | Membuat invoice cepat untuk pelanggan tanpa software akuntansi. |
| Admin / staf | Menduplikasi invoice lama sebagai dasar invoice baru. |

Skenario utama: isi profil usaha sekali, tambah item, pilih pelanggan, cek pratinjau, cetak atau simpan PDF.

## 4. Keputusan Teknis

| Keputusan | Pilihan | Alasan |
| --- | --- | --- |
| Stack | HTML + CSS + JavaScript murni (vanilla), tanpa PHP | Paling mudah dijalankan: klik dua kali file. Tidak ada dependensi server. |
| jQuery | Tidak dipakai | Vanilla JS cukup untuk kebutuhan ini dan lebih ringan. |
| Penyimpanan | `localStorage` browser | Tanpa database. Data tersimpan di perangkat pengguna. |
| Output PDF | `window.print()` dengan stylesheet `@media print` | Tanpa library, hasil teks tetap tajam dan bisa diseleksi. |
| Font | Font sistem atau satu font Google (Inter / Poppins) dengan fallback | Ringan, tampil baik meski offline. |
| Ikon | SVG inline | Tanpa request tambahan. |

**Kapan PHP diperlukan?** Hanya bila Anda butuh data bersama untuk banyak pengguna, nomor invoice berurutan yang dijamin unik lintas perangkat, atau pengiriman email. Struktur kode versi ini dirancang agar bisa dipindah ke PHP + MySQL tanpa mengubah tampilan.

## 5. Fitur dan Kebutuhan Fungsional

### 5.1 Profil Usaha (pengaturan sekali isi)

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-01 | Isi nama usaha, alamat, no. telepon, email, website, NPWP (opsional). | Wajib |
| F-02 | Unggah logo (PNG/JPG/SVG, maks 1 MB), disimpan sebagai Base64 di localStorage. | Wajib |
| F-03 | Isi info pembayaran: nama bank, nomor rekening, atas nama (bisa lebih dari satu rekening). | Wajib |
| F-04 | Isi teks default catatan dan syarat pembayaran. | Sebaiknya |
| F-05 | Isi tanda tangan: nama penandatangan dan jabatan, serta opsi unggah gambar tanda tangan. | Sebaiknya |

### 5.2 Pembuatan Invoice

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-10 | Nomor invoice otomatis dengan format yang dapat diatur, misalnya `INV/2026/11/0001`. Dapat diedit manual. | Wajib |
| F-11 | Tanggal terbit (default hari ini) dan tanggal jatuh tempo (pilihan cepat: Tunai, 7, 14, 30 hari). | Wajib |
| F-12 | Data pelanggan: nama, perusahaan, alamat, telepon, email. | Wajib |
| F-13 | Tabel item dinamis: tambah baris, hapus baris, ubah urutan. Kolom: Deskripsi, Qty, Satuan, Harga Satuan, Jumlah (otomatis). | Wajib |
| F-14 | Kolom item dapat diatur: aktif/nonaktif untuk Satuan dan Diskon per baris, serta label kolom bisa diubah (mis. "Barang" atau "Jasa"). | Sebaiknya |
| F-15 | Diskon total (persen atau nominal), pajak (PPN persen, bisa dimatikan), biaya tambahan (ongkir dll.). | Wajib |
| F-16 | Hitung otomatis: subtotal, diskon, DPP, pajak, total akhir. | Wajib |
| F-17 | Terbilang otomatis dalam Bahasa Indonesia (mis. "Satu juta dua ratus ribu rupiah"). | Sebaiknya |
| F-18 | Status invoice: Draft, Terkirim, Lunas, Jatuh Tempo (cap/badge tampil di invoice). | Sebaiknya |
| F-19 | Catatan dan syarat pembayaran, bisa diedit per invoice. | Wajib |
| F-20 | Mata uang dapat dipilih (default IDR, format `Rp 1.250.000`). | Sebaiknya |

### 5.3 Pratinjau dan Output

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-30 | Live preview invoice di sisi kanan, ukuran proporsional A4. | Wajib |
| F-31 | Tombol Cetak / Simpan PDF memakai `window.print()`, hanya area invoice yang tercetak. | Wajib |
| F-32 | Ukuran kertas A4 dengan margin konsisten. Item panjang pindah halaman tanpa memotong baris. | Wajib |
| F-33 | Unduh invoice sebagai file JSON (cadangan) dan impor kembali. | Sebaiknya |
| F-34 | Pilihan tema aksen: Sky (default), Ocean, Mint. | Opsional |

### 5.4 Riwayat dan Pengelolaan

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F-40 | Daftar invoice tersimpan: nomor, pelanggan, tanggal, total, status. | Wajib |
| F-41 | Cari dan filter berdasarkan nomor, pelanggan, status. | Sebaiknya |
| F-42 | Buka, edit, duplikasi, dan hapus invoice (dengan konfirmasi). | Wajib |
| F-43 | Simpan otomatis (autosave) sebagai draft setiap perubahan. | Sebaiknya |
| F-44 | Ekspor seluruh data (profil + invoice) ke satu file JSON dan impor kembali. | Wajib |

## 6. Aturan Perhitungan

```
subtotal_baris = qty × harga_satuan − diskon_baris
subtotal       = Σ subtotal_baris
diskon_total   = persen ? subtotal × % : nominal
dpp            = subtotal − diskon_total
pajak          = dpp × tarif_ppn        (jika pajak aktif)
total          = dpp + pajak + biaya_tambahan
```

- Semua perhitungan memakai bilangan bulat rupiah. Pembulatan dilakukan satu kali di akhir tiap komponen (round half up). Hindari akumulasi pecahan floating point: simpan nilai dalam satuan terkecil atau bulatkan per baris.
- Qty boleh desimal (mis. 1,5 jam). Harga tidak boleh negatif. Diskon tidak boleh melebihi subtotal.
- Tarif PPN dibuat dapat diatur, bukan konstanta. Default 11%. **Perlu diverifikasi** terhadap aturan PPN yang berlaku sebelum dipakai untuk penagihan nyata, karena ketentuan tarif dan dasar pengenaan pajak bisa berubah dan berbeda untuk jenis barang/jasa tertentu.

## 7. Desain Antarmuka

### 7.1 Prinsip

Minimalis, lapang, elegan. Banyak ruang kosong, satu warna aksen, tipografi bersih, tanpa dekorasi berlebihan. Gradien dipakai hemat: header invoice, tombol utama, dan garis aksen.

### 7.2 Palet Warna

| Peran | Warna | Hex |
| --- | --- | --- |
| Aksen utama | Sky Blue | `#38BDF8` |
| Aksen gelap | Blue | `#0EA5E9` / `#0284C7` |
| Gradien utama | Sky → Blue | `linear-gradient(135deg, #7DD3FC 0%, #38BDF8 45%, #0284C7 100%)` |
| Gradien lembut (latar header) | Pucat | `linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)` |
| Latar halaman | Putih kebiruan | `#F8FBFE` |
| Teks utama | Slate | `#0F172A` |
| Teks sekunder | Slate muda | `#64748B` |
| Garis / border | Biru sangat pucat | `#E2EEF7` |
| Sukses (Lunas) | Hijau | `#10B981` |
| Peringatan (Jatuh Tempo) | Merah lembut | `#EF4444` |

Gunakan variabel CSS (`--sky-400`, `--sky-600`, `--ink`, dll.) agar tema mudah diganti.

### 7.3 Tipografi

- Font: Inter atau Poppins, fallback `system-ui, -apple-system, Segoe UI, sans-serif`.
- Judul "INVOICE": 28–32 px, weight 700, letter-spacing lebar.
- Teks isi: 13–14 px. Angka memakai `font-variant-numeric: tabular-nums` agar rata.

### 7.4 Tata Letak Aplikasi

Dua kolom pada layar lebar, satu kolom pada layar kecil.

```
┌──────────────────────────────────────────────────────────────┐
│  Top bar: Invoice Generator      [Riwayat] [Profil] [Cetak]  │
├───────────────────────────┬──────────────────────────────────┤
│  FORM (kiri, scroll)      │  PRATINJAU A4 (kanan, sticky)    │
│  • Info invoice           │                                  │
│  • Pelanggan              │   ┌──────────────────────────┐   │
│  • Item barang/jasa       │   │  invoice A4              │   │
│  • Diskon, pajak, biaya   │   └──────────────────────────┘   │
│  • Catatan                │                                  │
└───────────────────────────┴──────────────────────────────────┘
```

### 7.5 Tata Letak Invoice (A4)

Penempatan bersifat awal dan dapat disesuaikan (sesuai permintaan).

```
┌─────────────────────────────────────────────────────────┐
│▓▓▓ gradien tipis sky blue (strip 6 mm) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│                                                         │
│  [LOGO]  Nama Usaha                       INVOICE       │
│          Alamat usaha                     No: INV/...   │
│          Telp · Email · Website          [ STATUS ]    │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  DITAGIHKAN KEPADA            TANGGAL TERBIT : ...      │
│  Nama Pelanggan               JATUH TEMPO    : ...      │
│  Alamat · Telp · Email                                  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ No │ Deskripsi │ Qty │ Satuan │ Harga │ Jumlah   │   │ ← header gradien
│  ├──────────────────────────────────────────────────┤   │
│  │ 1  │ ...       │     │        │       │          │   │
│  └──────────────────────────────────────────────────┘   │
│                                   Subtotal      Rp ...  │
│  Terbilang: ...                   Diskon        Rp ...  │
│                                   PPN 11%       Rp ...  │
│                                   ┌────────────────┐    │
│                                   │ TOTAL  Rp ...  │    │ ← kotak gradien
│                                   └────────────────┘    │
│  Info Pembayaran                 Hormat kami,           │
│  Bank · No. Rek · a.n.           (tanda tangan)         │
│  Catatan & syarat                Nama · Jabatan         │
│▓▓▓ strip gradien bawah + ucapan terima kasih ▓▓▓▓▓▓▓▓▓▓│
└─────────────────────────────────────────────────────────┘
```

Detail desain invoice:

- Header tabel memakai gradien sky blue dengan teks putih. Baris item selang-seling latar `#F8FBFE`, tanpa garis vertikal.
- Kotak TOTAL memakai gradien utama dengan teks putih dan angka besar.
- Badge status berbentuk pil kecil di bawah nomor invoice.
- Logo dibatasi tinggi maks 60 px (`object-fit: contain`) agar proporsi terjaga.
- Pada cetak, gradien harus tetap tercetak: wajib `-webkit-print-color-adjust: exact; print-color-adjust: exact;`.

### 7.6 Interaksi

- Input dengan border halus, fokus bercahaya sky blue (`box-shadow` lembut).
- Transisi 150–200 ms, tanpa animasi berlebihan.
- Format angka otomatis saat mengetik (pemisah ribuan titik).
- Pesan validasi inline, bukan `alert()`.
- Responsif: di bawah 900 px, pratinjau pindah ke tab terpisah "Form | Pratinjau".

## 8. Struktur File

```
invoice-generator/
├── index.html      # kerangka halaman, form, area pratinjau
├── style.css       # tema, layout, @media print
├── app.js          # state, perhitungan, render, storage
└── assets/         # (opsional) logo contoh
```

Alternatif: satu file `index.html` berisi semuanya. Dua opsi ini setara. Pisah file lebih mudah dirawat, satu file lebih mudah dibagikan.

## 9. Model Data (localStorage)

Kunci: `ig_profile`, `ig_invoices`, `ig_counter`, `ig_settings`.

```json
{
  "id": "inv_1763600000000",
  "number": "INV/2026/11/0001",
  "status": "draft",
  "issueDate": "2026-11-20",
  "dueDate": "2026-12-04",
  "customer": { "name": "", "company": "", "address": "", "phone": "", "email": "" },
  "items": [
    { "desc": "Jasa desain logo", "qty": 1, "unit": "paket", "price": 1500000, "discount": 0 }
  ],
  "discount": { "type": "percent", "value": 0 },
  "tax": { "enabled": true, "rate": 11 },
  "extraFee": 0,
  "notes": "",
  "currency": "IDR",
  "createdAt": "",
  "updatedAt": ""
}
```

Profil usaha disimpan terpisah dan di-snapshot ke invoice saat status berubah menjadi Terkirim, agar invoice lama tidak berubah ketika profil diedit.

## 10. Kebutuhan Non-Fungsional

| Aspek | Target |
| --- | --- |
| Performa | Muat di bawah 1 detik, total aset di bawah 150 KB (tanpa logo). |
| Kompatibilitas | Chrome, Edge, Firefox, Safari versi terbaru; layar 360 px hingga desktop. |
| Offline | Seluruh fungsi inti bekerja tanpa internet bila font memakai fallback sistem. |
| Keamanan | Semua input yang dirender ke HTML di-escape untuk mencegah XSS. Tidak ada data dikirim ke server mana pun. |
| Aksesibilitas | Label pada semua input, kontras teks minimal WCAG AA, navigasi keyboard. |
| Keterbacaan cetak | Teks hitam/slate tetap terbaca bila dicetak hitam-putih. |

## 11. Kasus Tepi

- Logo belum diunggah: area logo disembunyikan, bukan kosong.
- Daftar item sangat panjang: tabel berlanjut ke halaman berikutnya, header tabel diulang, baris tidak terpotong, total tidak terpisah dari barisnya sendiri.
- Data localStorage penuh (batas sekitar 5 MB): tampilkan peringatan, sarankan kompres logo atau ekspor data.
- Browser mode privat atau data dihapus: data hilang. Tampilkan pengingat ekspor cadangan berkala.
- Nomor invoice duplikat: peringatkan sebelum menyimpan.
- Tanggal jatuh tempo lebih awal dari tanggal terbit: validasi error.
- Qty 0 atau harga kosong: baris dihitung 0 dan ditandai.
- Teks deskripsi sangat panjang: wrap otomatis, tidak merusak kolom angka.

## 12. Kriteria Penerimaan

1. Membuka `index.html` langsung dari folder (protokol `file://`) berfungsi penuh tanpa server.
2. Mengisi profil, 3 item, dan pelanggan menghasilkan pratinjau yang benar dalam waktu nyata.
3. Subtotal, diskon, pajak, dan total sesuai perhitungan manual pada 5 skenario uji (termasuk desimal dan diskon nominal vs persen).
4. Cetak ke PDF menghasilkan 1 halaman A4 rapi untuk invoice sampai 10 item, dengan gradien tetap tampil.
5. Invoice yang disimpan tetap ada setelah browser ditutup dan dibuka kembali.
6. Ekspor lalu impor JSON memulihkan seluruh data tanpa selisih.
7. Tampilan tetap bisa dipakai di layar ponsel.

## 13. Risiko dan Keterbatasan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Data hanya di satu browser/perangkat | Hilang bila cache dibersihkan atau ganti perangkat. | Ekspor JSON rutin, pengingat di aplikasi. |
| Nomor invoice berurutan tidak dijamin lintas perangkat | Potensi nomor ganda bila dipakai di dua komputer. | Hanya dipakai satu perangkat, atau migrasi ke PHP + MySQL. |
| "Simpan PDF" bergantung dialog cetak browser | Pengaturan margin/header-footer pengguna bisa mengganggu hasil. | Petunjuk singkat di aplikasi (matikan Header and footer, aktifkan Background graphics). |
| Tarif/aturan pajak berubah | Perhitungan salah untuk penagihan nyata. | Tarif dapat diatur, perlu verifikasi aturan terbaru. |
| Logo Base64 membesar penyimpanan | Cepat memenuhi batas localStorage. | Batas 1 MB dan kompresi otomatis via canvas. |
| Tanpa autentikasi | Siapa pun di perangkat yang sama dapat melihat data. | Tidak cocok untuk komputer bersama. Opsi PIN lokal di fase berikutnya. |

## 14. Rencana Rilis

| Fase | Cakupan | Perkiraan |
| --- | --- | --- |
| MVP | Profil usaha, form invoice, tabel item dinamis, perhitungan, pratinjau, cetak PDF. | 1–2 hari |
| v1.0 | Riwayat, simpan, duplikasi, status, terbilang, ekspor/impor JSON, validasi. | 1–2 hari |
| v1.1 | Beberapa tema warna, multi-rekening, tanda tangan gambar, pengingat cadangan. | 1 hari |
| v2.0 (opsional) | Migrasi ke PHP native + MySQL: login, nomor berurutan terpusat, banyak pengguna. | Sesuai kebutuhan |

Estimasi waktu bersifat kasar dan **perlu verifikasi** terhadap kapasitas pengembangan Anda.

## 15. Pertanyaan Terbuka

1. Apakah invoice dipakai satu orang di satu perangkat, atau lebih dari satu orang? Ini menentukan apakah versi tanpa PHP cukup.
2. Apakah perlu PPN, dan berapa tarif serta dasar pengenaannya untuk usaha Anda?
3. Apakah diperlukan satu template saja, atau beberapa gaya invoice?
4. Apakah perlu bahasa ganda (Indonesia dan Inggris)?
