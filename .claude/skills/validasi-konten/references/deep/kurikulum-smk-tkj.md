# Kurikulum SMK TKJ — Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi

Referensi untuk skoring **G1 (Curriculum Alignment)**. Buka file ini hanya saat menilai G1 borderline — apakah sebuah konsep masuk scope SMK TKJ atau tidak.

## Konteks

- **Mata pelajaran**: "Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi" (Kurikulum Merdeka, Fase E — kelas X SMK Program Keahlian TKJ).
- **Elemen CP yang relevan**: "Media dan jaringan telekomunikasi" (salah satu elemen CP di dalam mata pelajaran ini).
- **Audiens**: siswa 15-16 tahun di tahun pertama SMK TKJ, mempersiapkan kompetensi dasar sebelum masuk konsentrasi keahlian di Fase F.

Catatan penting: scope quiz TelNetQuiz mengikuti elemen **Media dan jaringan telekomunikasi**. Konsep yang masuk scope adalah pengetahuan dasar yang diajarkan di Fase E — bukan kompetensi lanjut Fase F yang sudah masuk konsentrasi (Sistem Komputer, Administrasi Sistem Jaringan, Teknologi Layanan Jaringan, dll.).

## Capaian Pembelajaran (CP) ringkas

Berikut elemen CP yang relevan dengan konten quiz TelNetQuiz. Kalau soal menguji konsep yang **tidak** ada di tabel ini, kemungkinan G1 < 2.

| Elemen CP | Ruang lingkup yang in-scope | Out of scope (G1 = 0) |
|-----------|----------------------------|----------------------|
| **Sistem komunikasi data** | Konsep dasar komunikasi data, model OSI, model TCP/IP, layering, encapsulation | Detail formal information theory, kapasitas channel Shannon |
| **Pengalamatan jaringan** | IPv4 (kelas, format, public/private, static/dynamic), IPv6 (format dasar, perbedaan IPv4), subnetting dasar | Subnetting VLSM lanjut dengan kalkulasi kompleks (boleh sebagai pengantar saja) |
| **Protokol TCP/IP** | TCP vs UDP, three-way handshake, segmentasi, port, DHCP, DNS dasar | Implementasi protokol level kode (mis. socket programming detail) |
| **Routing dasar** | Konsep routing, router vs switch, statik vs dinamik (pengenalan) | Konfigurasi protokol routing kompleks (OSPF area, BGP) — itu domain CCNA |
| **WLAN / wireless** | Standar 802.11 (a/b/g/n/ac/ax overview), kanal & frekuensi (2.4/5 GHz), arsitektur (ad-hoc, infrastructure, AP), keamanan (WEP/WPA/WPA2/WPA3), antena dasar (omni/direksional, MIMO) | Detail rumus modulasi OFDM, riset propagasi gelombang |
| **Media transmisi** | Kabel (UTP/STP, kategori, fiber optic single/multi mode pengenalan), nirkabel | Detail spek elektrik kabel level engineering |
| **Perangkat jaringan** | NIC, hub, switch, router, AP, modem, repeater — fungsi & perbedaan | Spek hardware vendor-spesifik |
| **Keamanan jaringan dasar** | Konsep firewall, enkripsi WLAN, ancaman dasar (sniffing, rogue AP) | Penetration testing teknik lanjut |

## Tingkat kedalaman yang diharapkan

| Tingkat | Indikator soal |
|---------|----------------|
| **In-scope, sesuai Fase E** | Definisi, fungsi, perbedaan dasar, pengenalan komponen, kasus penggunaan sehari-hari |
| **In-scope tapi terlalu dalam (G1 = 1)** | Soal yang sebenarnya milik Fase F / konsentrasi keahlian (konfigurasi vendor-spesifik Cisco/Mikrotik, subnetting VLSM kompleks, troubleshooting protokol routing) |
| **Out of scope (G1 = 0)** | Topik kuliah jaringan lanjut (queueing theory, congestion control algorithm), riset akademis, atau topik elemen CP lain (pemrograman jaringan murni, sistem operasi internal) |

## Pemetaan chapter saat ini

| Chapter | Topik utama | CP yang diuji |
|---------|-------------|----------------|
| `chapter-1-tcp-ip.json` | Prinsip TCP/IP | Sistem komunikasi data, Protokol TCP/IP, Pengalamatan jaringan |
| `chapter-2-wlan.json` | WLAN | WLAN / wireless, Media transmisi nirkabel, Keamanan dasar wireless |

Saat menilai G1 untuk soal di chapter-1, tanyakan: "Apakah konsep ini termasuk Sistem komunikasi data / Protokol TCP/IP / Pengalamatan?" Kalau bukan salah satunya, G1 < 2.

## Heuristik cepat

- Soal menguji **definisi, fungsi, perbedaan** dari salah satu istilah tabel di atas → G1 = 2
- Soal menguji **kalkulasi subnetting kompleks lebih dari /24** → G1 = 1 (lebih cocok untuk Fase F konsentrasi keahlian, bukan Fase E)
- Soal menguji **socket programming, kernel networking, atau topik di luar tabel** → G1 = 0

## Catatan untuk reviewer

- Kurikulum bisa berkembang. Kalau ragu apakah suatu topik baru (mis. Wi-Fi 6E, Wi-Fi 7) sudah masuk CP, default ke G1 = 1 (relate, tapi mungkin terlalu baru).
- Jangan menilai G1 = 0 hanya karena topik terasa "terlalu dasar" — easy level memang seharusnya membahas konsep dasar. G1 menilai *cocok dengan SMK TKJ*, bukan *menarik untuk ahli*.
