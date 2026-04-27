# Quick Card — refine-quiz-questions

Audit reference padat. Baca ini lebih dulu; baru buka `references/deep/*.md` kalau perlu reasoning lengkap di balik suatu rule.

## 1. Rule codes — sebut tepat satu di setiap finding

### Materi (M) — apa yang diuji
- **M1**: tests one specific concept (no double-barrel)
- **M2**: exactly one correct answer (kalau ragu → KEY-CHECK, jangan flip `isCorrect`)
- **M3**: opsi homogen secara materi (semua function/definisi/angka/protokol — bukan campur)
- **M4**: konsep cocok dengan chapter title + level title

### Konstruksi (K) — bagaimana soal disusun
- **K1**: pokok soal jelas; siswa yang paham bisa jawab tanpa baca opsi
- **K2**: tidak ada negasi ganda
- **K3**: dilarang opsi "semua benar/salah", "A dan B benar"
- **K4**: opsi paralel gramatikal (semua diawali kategori sama: nomina/verba/frasa)
- **K5**: panjang opsi terhomogen (longest ≤ 1.5× shortest)
- **K6**: pokok soal tidak memberi petunjuk gramatikal ke kunci
- **K7**: posisi kunci acak antar A/B/C/D dalam satu level (jangan semua di A)
- **K8**: gambar relevan; deskripsi cocok dengan isi gambar (cek `image-assignments.json`)

### Bahasa (B) — pilihan kata
- **B1**: PUEBI/KBBI baku
- **B2**: komunikatif untuk SMK (no academic jargon, no slang)
- **B3**: tidak ada tafsir ganda
- **B4**: tidak ada kiasan/idiom di pokok soal (boleh di hook deskripsi)
- **B5**: konsistensi istilah dalam satu soal

### Voice & Journey (V) — rasa petualangan
- **V1**: hook (kalimat 1 deskripsi) vivid, bukan datar
- **V2**: CTA (kalimat akhir deskripsi) terasa undangan/quest, bukan chore
- **V3**: pacing antar soal di satu level naik (warm-up → deepen)

## 2. Kata tidak baku → baku (KBBI)

| Tidak baku | Baku |
|------------|------|
| praktek | praktik |
| analisa | analisis |
| sistim | sistem |
| frekwensi | frekuensi |
| metoda | metode |
| jaman | zaman |
| nasehat | nasihat |
| antri | antre |
| ngambil/ngirim | mengambil/mengirim |
| dipake | dipakai |
| ngga, kagak, gak | tidak |
| yg, dgn, krn, tdk, klo | yang, dengan, karena, tidak, kalau |

## 3. Pola dari koreksi ahli (load-bearing)

Daftar ini adalah hasil review ahli materi proyek TelNetQuiz. Treat as authoritative.

| Pola dihindari | Pengganti | Alasan |
|----------------|-----------|--------|
| `bongkar` (imperatif "uraikan") | `cari tahu` | colloquial untuk konteks pembelajaran |
| `lemot` | `lambat` | slang, bukan KBBI |
| `konek` | `terkoneksi` / `tersambung` | klip tidak baku |
| `pas hujan/jalan` (lisan) | `saat hujan` / `ketika` | preposisi lisan |
| `pancar` (bare stem) | `memancarkan` | verba transitif harus berimbuhan |
| `bisa jalan` (metafora konektivitas) | `bisa terkoneksi` | "jalan" terlalu informal |
| `tetangga` (kiasan jaringan lain) | `jaringan lain di sekitar` / `banyak pengguna` | kiasan menimbulkan tafsir ganda |
| `dia` / `ia` untuk perangkat | `router itu`, `perangkat`, nama konkret | pronomina personal untuk benda mati |
| `sering punya` | `mempunyai` | verba lisan + adverbial |
| `Satu bentuk ...` (sebagai stem) | `Pilih salah satu bentuk ...` | stem harus eksplisit |
| Klaim absolut "802.11g cepat" | "lebih cepat dibanding 802.11b" | salah teknis untuk standar lama |

**Aturan turunan**: bare verb stems pakai imbuhan; klip/slang teknologi diganti baku; kiasan terlarang di pokok soal (boleh di hook); pronomina personal jangan untuk benda mati; klaim absolut tentang teknologi lama selalu dikontekstualisasi.

## 4. SPOK quick-check

Per kalimat di `description`, `question`, dan opsi:
- **Subjek + Predikat ada?** Tidak ada → fragmen, gabungkan ke kalimat induk.
- **Verba transitif** (`mengirim`, `memecah`, `mengatur`)? Wajib ada Objek.
- **Bare stem** (`kirim`, `pancar`, `pancar`) di luar imperatif? Ganti ke berimbuhan.
- **Pronomina personal untuk benda mati**? Ganti ke nama konkret.

## 5. PUEBI essentials

- **Akronim**: `TCP/IP`, `WLAN`, `IEEE 802.11`, `SSID` — semua kapital, tanpa titik.
- **Singkatan SMS** (`yg`, `dgn`, `krn`, `tdk`, `klo`) terlarang.
- **Desimal**: pakai koma, bukan titik. `2,4 GHz` (bukan `2.4 GHz`), `4,3 miliar`.
- **Pelengkapan stem**: akhiri dengan `...` (tiga titik, tanpa spasi sebelum). Pertanyaan langsung: `?`.
- **Em-dash** (`—`) dan kurung penjelas — hindari di `description`/`question`. Pisah jadi dua kalimat. (TTS-friendly.)

## 6. Image sync rule

- `imageLink == null` → deskripsi tidak boleh mengandung "Gambar di atas", "lihat gambar", "perhatikan gambar".
- `imageLink != null` → deskripsi harus menyebut konsep yang sesuai dengan filename gambar.

Filename → kata kunci yang harus muncul di deskripsi:

| Filename pattern | Konsep yang wajib disinggung |
|------------------|------------------------------|
| `*three-way-handshake*` | handshake / SYN / ACK / koneksi / bangun |
| `*tcp-vs-udp*` | TCP & UDP |
| `*tcp-ip-layers*` | lapisan / layer |
| `*tcp-segment*` | segmen TCP |
| `*segmentation-reassembly*` | paket / pecah / potongan / segmen |
| `*ipv4-format*` | oktet / 32 bit / format / desimal |
| `*ipv4-classes*` | kelas (A/B/C) |
| `*public-vs-private-ip*` | publik / privat |
| `*static-vs-dynamic-ip*` | statis / dinamis / tetap / berubah |
| `*ipv4-vs-ipv6*` | 32 bit / 128 bit / heksadesimal |
| `*ip-routing*` | routing / jalur / router |
| `*uni-broad-multi-anycast*` | unicast / broadcast / multicast / anycast / point |
| `*dhcp-dora*` | DHCP / IP otomatis |
| `*wlan-overview*` | WLAN / nirkabel / wireless |
| `*wlan-channels*` | kanal / channel / frekuensi |
| `*wlan-interference*` | interferensi / gangguan |
| `*wlan-security-risk*` | keamanan / sadap / kerahasiaan |
| `*ieee80211-comparison*` | 802.11 / standar / tabel |
| `*mimo-vs-mumimo*` | MIMO / MU-MIMO / antena |
| `*wlan-architecture*` | access point / AP |
| `*adhoc-vs-infra*` | ad-hoc / infrastructure / mode koneksi |
| `*antenna-patterns*` | antena / pola |
| `*nic-types*` | NIC / kartu / USB |
| `*channel-overlap*` | channel non-overlap / 1, 6, 11 |
| `*ssid-setup*` | SSID / menu |
| `*wep-wpa-comparison*` | WEP / WPA / enkripsi |

Prescan sudah otomatis cek tabel ini — kamu cukup verifikasi temuannya.

## 7. Description shape

```
[Hook]        kalimat 1 — skenario sehari-hari, SPOK lengkap
[Image hint]  kalimat 2 — hanya jika imageLink != null, "Gambar di atas ..."
[Concept]     kalimat 3 — arahkan ke konsep tanpa bocorkan kunci
[CTA]         kalimat 4 — imperatif singkat ("Yuk, ...", "Saatnya ...", "Gas, ...")
```

3 kalimat OK kalau tidak ada gambar. Setiap kalimat harus berkontribusi ke alur menuju soal — tidak ada kalimat pengisi. CTA harus terasa milestone, bukan chore.

## 8. Question stem checklist

- Diawali subjek jelas (`Sifat X`, `Fungsi utama Y`, `Lapisan terbawah pada Z`)
- Predikat lugas (`adalah`, `artinya`, `berfungsi untuk`)
- Akhiri `...` (untuk pelengkapan) atau `?` (pertanyaan langsung) — konsisten per level
- Tanpa kiasan, idiom, atau kata tidak baku
- Tanpa negasi ganda

## 9. Distractor quality (dari rubrik)

Distractor bagus = **plausibly wrong** (siswa setengah-paham akan ragu). Failure mode → fix:

| Failure | Fix |
|---------|-----|
| Out of domain (silly/jokey) | Ganti dengan miskonsepsi se-domain |
| Two correct (accidentally) | Ketatkan bahasa kunci, atau buat distractor baru |
| Out of register (panjang/pendek/formal beda) | Samakan tone & length |
| Tautological (mengulang stem) | Ganti dengan miskonsepsi substantif |
| Taxonomically off (kategori beda) | Samakan kategori |

## 10. TTS rules (App reads aloud)

App membaca `description + question + Pilihan jawaban: A. ... B. ...` saat speak ditekan.

- Kalimat pendek > kalimat majemuk panjang (sudah jadi house style).
- Hindari em-dash (`—`) dan kurung penjelas — bingung untuk TTS Indonesia.
- Akronim slash (`TCP/IP`) dibaca "ti-si-pi i-pi" — OK.
- Angka unit pakai digit (`5 GHz`); angka kecil dalam prosa pakai kata (`empat lapisan`).
- Tidak emoji, tidak unicode aneh.

## Kapan buka deep/

| Buka file | Kalau... |
|-----------|----------|
| `deep/indonesian-language-rules.md` | Perlu argumen lengkap PUEBI/KBBI/SPOK untuk kasus borderline, atau perlu contoh edge case |
| `deep/mcq-rubric.md` | Perlu contoh paralel/non-paralel detail untuk K4, atau breakdown distractor failure modes |
