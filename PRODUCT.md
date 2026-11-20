# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and vanilla JavaScript. Classic scripts, no bundler, no framework, no server. Data in localStorage. Pinned by the PRD.

## Users

Pemilik usaha kecil dan freelancer di Indonesia yang membuat invoice untuk pelanggan tanpa software akuntansi. Staf atau admin yang menduplikasi invoice lama sebagai dasar invoice baru. Satu pengguna, satu perangkat, satu browser.

## Product Purpose

Membuat, mengelola, dan mencetak invoice A4 yang rapi dalam waktu kurang dari dua menit. Aplikasi harus bisa dibuka langsung dari `index.html`, bekerja offline, dan tidak mengirim data ke mana pun. Sukses berarti invoice siap dicetak atau disimpan sebagai PDF tanpa perlu server, instalasi, atau akun.

## Positioning

Meja invoice lokal yang terbuka dari satu file: form dan pratinjau A4 berdampingan, data tetap di perangkat, dan hasil cetak adalah dokumen teks yang tajam. Tidak ada login, database, atau layanan pihak ketiga.

## Operating Context

Dipakai di browser desktop (Chrome, Edge, Firefox, Safari) dari protokol `file://` atau hosting statis. Alur kerja: isi profil usaha sekali, buat invoice, tambah item, cek pratinjau, cetak atau simpan PDF. Bahasa Indonesia, format rupiah, PPN dapat diatur. Data bertahan di localStorage dan dicadangkan lewat ekspor/impor JSON.

## Capabilities and Constraints

Scope yang dibangun: MVP + v1.0 dari PRD. Semua kebutuhan Wajib dan Sebaiknya, kecuali item v1.1 (tema warna, gambar tanda tangan, pengingat cadangan). Multi-rekening bank termasuk karena F-03.

Fitur: profil usaha dan logo Base64, nomor invoice otomatis yang dapat diedit, tanggal dan jatuh tempo, pelanggan, item dinamis dengan urutan dan kolom opsional, diskon per baris dan total, PPN, biaya tambahan, terbilang, status, catatan/syarat, mata uang, pratinjau A4, cetak, JSON per invoice, riwayat, cari/filter, buka/duplikat/hapus, autosave, ekspor/impor seluruh data, validasi inline.

Non-goals: login, multi-user, server, database, email, payment gateway, e-Faktur, laporan keuangan, sinkronisasi perangkat.

Constraints: localStorage sekitar 5 MB; logo dikompres; semua input di-escape; tidak ada dependensi eksternal; aset total di bawah 150 KB tanpa logo; font sistem; cetak lewat `window.print()`; A4 dengan header tabel berulang dan baris tidak terpotong.

## Brand Commitments

Palet sky blue dan gradien halus yang ditetapkan PRD: `#38BDF8`, `#0EA5E9`, `#0284C7`, latar `#F8FBFE`, teks `#0F172A`, sekunder `#64748B`, border `#E2EEF7`, sukses `#10B981`, peringatan `#EF4444`. Prinsip minimalis, lapang, elegan. Judul INVOICE 28-32 px, letter-spacing lebar. Angka tabular. Font Inter/Poppins dengan fallback `system-ui`. Layout dua kolom dengan pratinjau A4 di kanan.

## Evidence on Hand

Tidak ada profil usaha, logo, rekening, atau pelanggan nyata. Aplikasi harus memakai placeholder yang jelas dan tidak boleh mengarang testimoni, statistik, atau klaim. Logo disembunyikan jika belum diunggah.

## Product Principles

1. Invoice adalah fokus; form adalah alat yang tenang.
2. Angka harus benar dan bisa dipercaya sebelum terlihat cantik.
3. Cetak adalah hasil akhir: A4, tajam, dan tetap terbaca hitam-putih.
4. Data milik pengguna: lokal, dapat diekspor, dan tidak dikirim ke mana pun.
5. Satu alur, sedikit keputusan, selesai di bawah dua menit.

## Accessibility & Inclusion

Target WCAG AA: kontras teks minimal 4.5:1, label pada semua input, navigasi keyboard, focus yang terlihat, target sentuh 44 px, dialog dapat ditutup dengan Escape, dan `prefers-reduced-motion` dihormati.
