# Miskonsepsi Umum Siswa TKJ

Referensi untuk skoring **G4 (Distractor as Real Misconception)**. Daftar ini berisi miskonsepsi nyata yang sering muncul di kelas TKJ — bukan sekadar "jawaban salah". Distraktor yang baik mengangkat salah satu miskonsepsi ini sehingga siswa setengah-paham akan ragu.

## Cara pakai

Saat menilai G4 untuk satu soal:

1. Identifikasi topik soal (TCP/IP layering, IP class, WLAN security, dst.)
2. Cek bagian relevan di file ini
3. Untuk setiap distraktor, tanyakan: "Apakah ini cocok dengan salah satu miskonsepsi di sini, atau ini pernyataan yang asal salah?"
4. Bila ≥2 distraktor cocok dengan miskonsepsi → G4 = 2. 1 cocok → G4 = 1. 0 cocok → G4 = 0.

## TCP/IP umum

| Konsep | Miskonsepsi siswa | Kenapa muncul |
|--------|-------------------|----------------|
| TCP/IP layering | "TCP/IP punya 7 lapisan seperti OSI" | Confusion antara model OSI (7) vs TCP/IP (4-5) |
| TCP/IP layering | "Application layer adalah lapisan paling bawah" | Bingung urutan top-down vs bottom-up |
| TCP vs UDP | "UDP lebih cepat karena punya error correction" | Overlap istilah; UDP justru tanpa error correction |
| TCP vs UDP | "TCP digunakan untuk video streaming" | Real-time biasanya UDP; pelajar sering kebalik |
| Three-way handshake | "Handshake terjadi setiap paket dikirim" | Salah ingat scope; handshake hanya saat membuka koneksi |
| Three-way handshake | "Urutannya SYN-SYN-ACK" | Sering kelewat satu langkah (yang benar SYN → SYN/ACK → ACK) |
| Encapsulation | "Header ditambahkan di lapisan paling akhir" | Kebalik; header ditambahkan dari atas ke bawah |
| Port number | "Port = alamat IP" | Tertukar konsep alamat |

## IP Addressing (IPv4 / IPv6)

| Konsep | Miskonsepsi siswa | Kenapa muncul |
|--------|-------------------|----------------|
| Format IPv4 | "IPv4 punya 64 bit" | Bingung dengan IPv6 atau dengan ukuran lain |
| Oktet | "IPv4 punya 4 byte = 8 bit per byte" diikuti "jadi totalnya 16 bit" | Kalkulasi keliru |
| Class A | "Kelas A mulai dari 0" | Range A: 1-126 (0 dan 127 reserved) |
| Class C | "Kelas C bisa untuk jutaan host" | Class C hanya 254 host per network |
| Public vs Private | "192.168.x.x adalah IP publik karena bisa diakses internet" | Confusion karena bisa diakses *via NAT* |
| Static vs Dynamic | "IP statis selalu lebih cepat" | "Statis" disamakan dengan "dedicated bandwidth" |
| DHCP | "DHCP memberi IP secara permanen" | Confusion dengan static reservation |
| IPv6 | "IPv6 = IPv4 dengan tambahan angka" | Tidak paham bahwa IPv6 hex 128-bit |
| Subnet mask | "Subnet mask adalah IP" | Confusion bentuk |

## WLAN / Wireless

| Konsep | Miskonsepsi siswa | Kenapa muncul |
|--------|-------------------|----------------|
| 802.11 standar | "802.11n lebih lambat dari 802.11g" | Tidak tahu urutan kronologis |
| 802.11 standar | "Semua standar memakai 5 GHz" | Tidak tahu pembagian band |
| Frekuensi | "5 GHz selalu lebih cepat dari 2.4 GHz dalam segala kondisi" | Tidak paham trade-off range vs speed |
| Channel | "Channel 1, 2, 3, 4 boleh dipakai bersamaan tanpa interferensi" | Tidak tahu konsep channel overlap; yang non-overlap di 2.4 GHz adalah 1, 6, 11 |
| Interferensi | "Interferensi hanya datang dari Wi-Fi lain" | Lupa microwave, bluetooth, perangkat 2.4 GHz lain |
| Mode | "Ad-hoc lebih cepat dari infrastructure" | Confusion antara desentralisasi vs performa |
| Access Point | "AP adalah router" | Sering dipakai bergantian padahal beda fungsi |
| WEP/WPA | "WEP lebih aman karena lebih lama" | "Lama" disalahartikan sebagai "matang" |
| WPA2 | "WPA2 tidak bisa di-bruteforce" | Bisa, terutama dengan password lemah |
| MIMO | "MIMO = lebih banyak antena = pasti lebih cepat" | Tidak paham kondisi yang dibutuhkan |
| SSID | "SSID adalah password Wi-Fi" | Confusion karena keduanya field di setup |
| Antena | "Antena omni mengirim sinyal lebih jauh dari direksional" | Kebalik; direksional lebih fokus |

## Perangkat jaringan

| Konsep | Miskonsepsi siswa | Kenapa muncul |
|--------|-------------------|----------------|
| Switch vs Hub | "Switch dan hub fungsinya sama" | Tidak paham forwarding vs broadcasting |
| Switch vs Router | "Switch dan router sama-sama menghubungkan jaringan" | Tidak bisa beda layer 2 vs layer 3 |
| Router | "Router membagi sinyal Wi-Fi" | Confusion AP vs router |
| Modem vs Router | "Modem adalah router" | Sering bundled jadi disalahpaham |
| NIC | "NIC hanya ada di komputer desktop" | Tidak tahu HP/laptop juga punya NIC |
| Repeater | "Repeater memperkuat sinyal jadi lebih cepat" | Repeater hanya memperluas range, biasanya melambat |

## Keamanan dasar

| Konsep | Miskonsepsi siswa | Kenapa muncul |
|--------|-------------------|----------------|
| Enkripsi | "Wi-Fi terenkripsi pasti aman" | Tidak paham password lemah |
| Hidden SSID | "Menyembunyikan SSID = aman" | Bisa di-discover dengan mudah |
| MAC filtering | "MAC filtering tidak bisa ditembus" | MAC bisa di-spoof |
| Firewall | "Firewall = antivirus" | Confusion umum non-teknis |
| Sniffing | "Sniffing hanya bisa di kabel" | Wireless juga bisa di-sniff |

## Pola distraktor yang BUKAN miskonsepsi (G4 = 0 hint)

Distraktor seperti ini terlihat asal salah, bukan refleksi miskonsepsi:

- Pernyataan yang **out of domain** (mis. soal tentang TCP, distraktornya tentang HTML)
- Angka random tanpa alasan (mis. "IPv4 punya 47 bit")
- Nama protokol/teknologi yang **tidak ada** (mis. "TCQ/IQ")
- Pernyataan yang absurd secara akal sehat (mis. "Wi-Fi memerlukan kabel coaxial")

Saat melihat pola di atas, G4 < 2 dan `suggestion_hint` di flagged_for_refine sebaiknya menyebut miskonsepsi spesifik dari tabel sebagai pengganti.

## Catatan

- Daftar ini bukan eksklusif. Kalau menemukan miskonsepsi nyata yang tidak ada di sini tapi cocok dengan distraktor, tetap nilai G4 = 2 dan catat di concern. Daftar ini sebagai penjaga lower bound.
- Beberapa miskonsepsi *sengaja* dijelaskan di studyMaterial sebagai penjelas — kalau distraktor mengangkat misconception yang justru sudah dibahas, itu OK karena memvalidasi pembelajaran (bukan menjebak).
