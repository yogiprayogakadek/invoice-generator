---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: Invoice Generator

## Scope and mode

Operate. Editor invoice, riwayat, dan profil usaha dalam satu aplikasi statis. Primary target: `index.html`.

## Audience and job

Pemilik usaha kecil atau freelancer yang perlu membuat invoice A4 untuk pelanggan, lalu mencetak atau menyimpan PDF. Staf dapat membuka dan menduplikasi invoice lama.

## Action and success

Isi data, lihat invoice terbentuk langsung, cetak tanpa kehilangan gradien atau memotong baris. Sukses berarti invoice selesai di bawah dua menit dan hasil cetak rapi.

## Content and constraints

Profil usaha, logo opsional, multi-rekening, pelanggan, item dinamis, diskon, PPN, biaya tambahan, terbilang, status, catatan. Offline, `file://`, localStorage, tanpa aset eksternal, cetak lewat `window.print()`, A4.

## Chosen direction and memorable moment

Arah dipin oleh PRD: minimalis elegan, sky blue, gradien halus, pratinjau A4 sebagai fokus. Momen yang diingat: kertas invoice di kanan berubah langsung saat form diisi, dengan strip gradien sky dan blok total yang tegas.

## Direction contract

THESIS: Invoice adalah antarmuka; form adalah instrumen tenang yang menulis langsung ke kertas A4. Menolak dashboard kartu generik dan estetika admin SaaS.

OWN-WORLD: Putih kertas yang sejuk, aksen deep sky untuk aksi dan total, strip gradien sky muda sebagai tanda tangan merek, tinta slate, garis rambut, angka tabular, sans sistem. Tanpa glass, tanpa glow selain focus, tanpa mosaik kartu.

STORY: Pengguna mengisi form, melihat invoice terbentuk di kanan, mencetak PDF A4 yang bersih, dan percaya angkanya benar.

FIRST VIEWPORT: Top bar dengan wordmark dan aksi; form di kiri mulai dari Informasi invoice; kertas A4 sticky di kanan dengan strip gradien, header usaha, nomor invoice, status, tabel, dan total. Kertas adalah objek paling terang dan paling besar. Aksi utama Cetak / PDF di top bar.

FORM: Dua kolom form dan pratinjau A4, dipin oleh PRD. seed: none (pinned) "minimalis dan elegan dengan palet sky blue dan gradien halus" serta layout A4 pada PRD 7.4-7.5.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
