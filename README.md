# Invoice Generator

Aplikasi invoice A4 yang berjalan sepenuhnya di browser. Tanpa server, tanpa database, tanpa akun, dan tanpa koneksi internet. Buka `index.html`, isi form, lalu cetak atau simpan sebagai PDF.

Dibangun dengan HTML, CSS, dan JavaScript murni. Data disimpan di `localStorage` perangkat.

## Fitur

- Profil usaha: nama, kontak, alamat, NPWP, logo, dan beberapa rekening bank.
- Nomor invoice otomatis dengan format yang dapat diatur, plus tombol nomor baru.
- Tanggal terbit, jatuh tempo, dan pilihan cepat Tunai, 7, 14, atau 30 hari.
- Data pelanggan dan status invoice: Draft, Terkirim, Lunas, Jatuh tempo.
- Item dinamis: tambah, hapus, ubah urutan, kolom satuan dan diskon opsional.
- Diskon per baris dan diskon total, baik nominal maupun persen.
- PPN yang dapat diaktifkan dan diatur tarifnya, plus biaya tambahan.
- Terbilang otomatis mengikuti total dan mata uang.
- Mata uang IDR, USD, dan EUR. Nilai tidak dikonversi saat mata uang diganti.
- Pratinjau A4 langsung di samping form, dengan skala proporsional.
- Cetak atau simpan PDF lewat dialog cetak browser.
- Riwayat invoice: cari, filter status, buka, duplikat, dan hapus.
- Autosave draft dan profil. Data tetap ada setelah browser ditutup.
- Ekspor dan impor JSON per invoice maupun seluruh data.
- Validasi inline, dialog konfirmasi, dan toast tanpa `alert()`.

## Menjalankan

1. Unduh atau salin folder ini.
2. Klik dua kali `index.html`, atau buka dengan browser.
3. Tidak perlu menjalankan server. Semua fitur bekerja dari protokol `file://`.

Browser yang didukung: versi modern Chrome, Edge, Firefox, dan Safari.

## Alur cepat

1. Buka tab **Profil**, isi identitas usaha, rekening, dan tanda tangan. Simpan.
2. Kembali ke **Buat**, isi pelanggan dan item.
3. Periksa pratinjau A4 di kanan. Total, PPN, dan terbilang diperbarui langsung.
4. Klik **Cetak / PDF** di top bar atau tombol **Cetak** di panel pratinjau.
5. Pilih **Save as PDF** di dialog cetak untuk menyimpan file.

## Cetak dan simpan PDF

Agar hasilnya rapi:

- Pilih ukuran kertas **A4**.
- Gunakan skala **100%**.
- Aktifkan **Background graphics** supaya gradien header tabel dan blok total ikut tercetak.
- Matikan **Headers and footers** agar tidak ada teks browser di tepi kertas.
- Margin **Default** atau **None**; layout sudah memakai margin internal 11 mm dan 13 mm.

Tips yang sama tersedia di tombol **Tips PDF** pada panel pratinjau. Pengaturan ini hanya perlu diatur sekali di dialog cetak browser.

## Data dan cadangan

Semua data disimpan di `localStorage` browser:

- `invoiceGenerator.v1.profile`
- `invoiceGenerator.v1.settings`
- `invoiceGenerator.v1.draft`
- `invoiceGenerator.v1.invoices`

Data tidak dikirim ke mana pun. Data juga tidak otomatis tersinkron antar perangkat atau antar browser.

Gunakan **Profil > Ekspor semua data** untuk membuat cadangan JSON lengkap. Gunakan **Impor data** untuk memulihkannya. Ekspor per invoice tersedia di panel pratinjau lewat tombol **Unduh JSON**.

Menghapus data browser, memakai mode incognito, atau mengganti profil browser akan menghapus invoice. Simpan cadangan secara rutin.

Kapasitas `localStorage` biasanya sekitar 5 MB. Logo dikompres otomatis agar tidak menghabiskan ruang.

## Mata uang

IDR memakai 0 desimal. USD dan EUR memakai 2 desimal. Saat mata uang diganti, angka yang sudah diketik dipertahankan sebagai nilai nominal, tanpa konversi kurs. Form menampilkan peringatan ini di dekat pilihan mata uang.

## Struktur file

```
invoice-generator/
├── index.html            # kerangka halaman, form, pratinjau, dialog
├── style.css             # tema, layout responsif, aturan cetak A4
├── core.js               # perhitungan, format uang, terbilang, validasi
├── app.js                # state, render, localStorage, impor/ekspor
├── tests/core.test.js    # tes logika inti dengan node:test
├── DESIGN.md             # sistem visual dan token
├── PRODUCT.md            # konteks produk
└── README.md
```

Tidak ada dependensi eksternal, font file, atau aset jaringan. Ikon berupa SVG inline. Font memakai tumpukan sistem, dengan Inter atau Poppins bila tersedia di perangkat.

## Pengembangan dan tes

Tes logika inti:

```bash
node --test tests/core.test.js
```

Pemeriksaan sintaks:

```bash
node --check core.js
node --check app.js
```

Tes browser end-to-end memakai Playwright dan tidak disertakan di folder aplikasi. Aplikasi sendiri tidak memerlukan Node.js untuk berjalan.

## Batasan

- Tarif PPN default 11% adalah nilai awal yang dapat diubah. Verifikasi tarif dan dasar pengenaan pajak yang berlaku sebelum menagih.
- Satu perangkat, satu browser, satu pengguna.
- Tidak ada login, sinkronisasi, email, payment gateway, atau e-Faktur.
- Nomor invoice tidak dijamin berurutan di banyak perangkat.
- Tema warna tetap terang karena pratinjau dan hasil cetak adalah dokumen kertas.
- Tanda tangan berupa nama dan jabatan, bukan gambar tanda tangan.
