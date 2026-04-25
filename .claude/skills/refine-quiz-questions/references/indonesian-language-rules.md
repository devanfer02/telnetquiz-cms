# Indonesian Language Rules for Quiz Refinement

Authoritative rule set for auditing the Indonesian text in TelNetQuiz quiz questions. Three layers: **PUEBI/EYD** (ejaan & tanda baca), **KBBI** (kata baku & makna), **SPOK** (struktur kalimat efektif).

The target audience is SMK (Vocational High School) students studying jaringan, so the register should be **baku tetapi komunikatif** — formal enough to be correct Indonesian, casual enough to engage. The dataset already lands close to this register; preserve it while fixing actual errors.

---

## 1. PUEBI / EYD — Ejaan & Tanda Baca

PUEBI (Pedoman Umum Ejaan Bahasa Indonesia) is the current spelling standard, replacing the old EYD. Project owners may say "EYD" colloquially — apply PUEBI rules.

### 1.1 Huruf Kapital

- Awal kalimat, nama orang, nama tempat, judul.
- **Singkatan dan akronim**: `TCP/IP`, `WLAN`, `IEEE 802.11`, `SSID`, `DHCP` — semua huruf kapital, tanpa titik di antara huruf.
- **Bukan nama diri** tetap huruf kecil: "jaringan", "sinyal", "perangkat".
- **Setelah titik dua** dalam kalimat dialog/keterangan: huruf kapital. Dalam list yang melanjutkan kalimat utuh: huruf kecil.

### 1.2 Tanda Baca

| Tanda | Aturan kunci untuk dataset ini |
|-------|--------------------------------|
| Titik (.) | Akhir kalimat berita. Tidak setelah singkatan huruf kapital semua (`TCP/IP`, bukan `T.C.P./I.P.`). |
| Koma (,) | Antar unsur perincian; sebelum konjungsi `tetapi`, `melainkan`. Sesudah keterangan di awal kalimat: "Saat router rusak, paket tidak terkirim." |
| Titik koma (;) | Pemisah klausa setara yang panjang. Jarang dipakai di dataset ini — biasanya pisah jadi dua kalimat lebih jelas. |
| Tanda tanya (?) | Soal seperti "Apa fungsi TCP?" Untuk soal pelengkapan ("... adalah ..."), titik tiga `...` cukup, **tidak perlu** tanda tanya. |
| Elipsis (...) | Tepat tiga titik. Untuk soal pelengkapan: `Kepanjangan TCP/IP adalah...` (tanpa spasi sebelum `...`, sesuai pola dataset). |
| Tanda seru (!) | Untuk CTA imperatif: "Yuk, jawab!" Hindari di pokok soal. |

### 1.3 Kata Serapan & Istilah Asing

Konsep teknis seperti `connection-oriented`, `three-way handshake`, `routing`, `acknowledgment` adalah istilah asing.

- Aturan PUEBI: istilah asing yang belum diserap **dimiringkan** (italics).
- Realita dataset: disimpan sebagai plain string di JSON, jadi italics tidak bisa dirender. Karena tidak ada cara teknis untuk memiringkan, **terima istilah asing apa adanya** selama:
  - Ejaannya benar
  - Konsepnya cukup teknis sehingga padanan Indonesia (`berorientasi koneksi`, `jabat tangan tiga arah`) justru membingungkan untuk SMK
- Boleh usulkan padanan Indonesia bila istilahnya sudah lazim diserap: `paket` (bukan `packet`), `jaringan` (bukan `network`), `keamanan` (bukan `security`).

### 1.4 Singkatan & Akronim

- Tulis dengan kapital konsisten: `TCP/IP`, `IPv4`, `IPv6`, `MAC address`, `WLAN`.
- Pertama kali muncul dalam konteks pembelajaran: berikan kepanjangan jika belum jelas. Tapi di pokok soal yang sudah dalam konteks bab, pengulangan kepanjangan justru mengganggu — gunakan akronim langsung.

---

## 2. KBBI — Kata Baku & Makna

KBBI (Kamus Besar Bahasa Indonesia) menentukan kata baku. Beberapa kesalahan umum di dataset jaringan/SMK:

| Tidak baku | Baku |
|------------|------|
| praktek | praktik |
| analisa | analisis |
| sistim | sistem |
| effektif | efektif |
| nasehat | nasihat |
| frekwensi | frekuensi |
| metoda | metode |
| antri | antre |
| jaman | zaman |
| ngambil, ngirim | mengambil, mengirim |
| dipake | dipakai |
| ngga, kagak | tidak |

### 2.0 Koreksi dari ahli materi (load-bearing — patuhi ini)

Daftar berikut adalah koreksi langsung dari ahli materi proyek TelNetQuiz. Treat them as authoritative — they reflect what an SMK content reviewer flagged when reading the dataset. Ketika kamu mengaudit, pakai pola ini sebagai contoh konkret untuk rule **B1 (baku & PUEBI/KBBI)**, **B2 (komunikatif tapi tidak slang)**, dan **B4 (tidak menggunakan kiasan di pokok soal)**.

| Pola yang harus dihindari | Pengganti yang disetujui ahli | Alasan |
|---------------------------|-------------------------------|--------|
| `Bongkar` (sebagai imperatif untuk "uraikan") | `Cari tahu` | "Bongkar" terasa terlalu kasar/colloquial untuk konteks pembelajaran; "cari tahu" mengundang eksplorasi. |
| `lemot` | `lambat` | "Lemot" adalah slang, bukan kata baku KBBI. |
| `tetangga` (sebagai kiasan untuk pengguna lain di jaringan) | `banyak pengguna` | Kiasan menimbulkan tafsir ganda di pokok soal — pakai bahasa literal. |
| `analisis` (sebagai imperatif "analisis ini!") | `teliti` atau `amati` | Bentuk imperatif dari "analisis" terasa kaku; "teliti" lebih pas untuk SMK. |
| `konek` (klip dari "connect") | `terkoneksi` atau `tersambung` | Bentuk klip tidak baku di KBBI. |
| `pancar` (bare stem) | `memancarkan` | Verba transitif harus berimbuhan. |
| `Satu bentuk ...` (sebagai stem soal) | `Pilih salah satu bentuk ...` | Stem harus eksplisit menyuruh siswa memilih, bukan asumsi. |
| `Wifi bisa jalan` | `Wifi bisa terkoneksi` | "Jalan" sebagai metafora untuk konektivitas terlalu informal. |
| `dia` (anafora untuk perangkat seperti router) | rujukan konkret: `kotak kecil`, `perangkat`, `router itu` | Pronomina personal untuk benda mati membingungkan dan tidak baku. |
| `sering punya` | `mempunyai` | "Punya" sebagai verba tidak berimbuhan + reduplikasi adverbial = pola lisan, bukan tulis. |
| Klaim absolut "802.11g cepat" / "ngejebret" | Klaim relatif: "Lebih cepat dibanding 802.11b", "kecepatan tinggi pada masanya" | Klaim absolut salah secara teknis (802.11g lambat dibanding 802.11n/ac/ax) dan tidak edukatif. Untuk standar lama, gunakan perbandingan relatif. |

**Aturan turunan dari koreksi di atas:**

- **Bare verb stems** (`pancar`, `kirim` sebagai verba penuh) — selalu pakai bentuk berimbuhan (`memancarkan`, `mengirim`, `mengirimkan`).
- **Klip / slang teknologi** (`konek`, `lemot`, `nge-` prefix, `-in` suffix) — selalu ganti dengan bentuk baku.
- **Kiasan di pokok soal** — terlarang. Boleh di hook (sentence 1 description) sebagai skenario, tapi pokok soal harus literal.
- **Pronomina personal untuk benda mati** — hindari "dia/ia" untuk perangkat keras. Gunakan rujukan konkret atau pengulangan nama.
- **Klaim absolut tentang teknologi lama** — selalu kontekstualisasi. "Standar X cepat" → "Standar X lebih cepat dibanding pendahulunya" atau "Standar X menjadi acuan kecepatan tahun [...]".
- **Verba lisan + adverbial** (`sering punya`, `bisa jalan`, `udah ada`) — ganti dengan verba baku tunggal yang setara.

### 2.1 Register

Dataset menggunakan register **baku-komunikatif**. Yang diizinkan:

- CTA santai: "Yuk, ...", "Gas, ...", "Saatnya ...", "Ayo ..."
- Sapaan kedua tunggal: "Kamu", "kamu" (bukan "Anda" yang terlalu formal, bukan "lu/lo" yang tidak baku)

Yang **tidak** diizinkan:

- Singkatan SMS: "yg", "dgn", "krn", "tdk", "klo"
- Bahasa daerah: "lho", "kok" (kecuali memang gaya CTA — borderline, pakai sparingly)
- Bahasa kasar atau slang yang tidak ada di KBBI
- Bahasa kiasan yang ambigu di pokok soal — boleh di hook, tidak boleh di `question`

### 2.2 Larangan khusus untuk pokok soal (`question` field)

Pokok soal harus **literal dan unambigu**. Dilarang di field `question`:

- Idiom atau kiasan ("makan hati", "buah tangan")
- Bahasa figuratif yang membuka tafsir ganda
- Pertanyaan retoris atau berbingkai opini ("Menurutmu, mana yang ...")

Hook (di `description`) boleh figuratif. CTA boleh playful. Pokok soal harus lugas.

---

## 3. SPOK — Struktur Kalimat Efektif

SPOK = **S**ubjek - **P**redikat - **O**bjek - **K**eterangan. Kalimat efektif minimal punya S+P. O dan K opsional tergantung jenis predikat.

### 3.1 Definisi singkat

- **Subjek**: pelaku atau pokok pembicaraan. Bisa nomina, frasa nomina, atau klausa.
- **Predikat**: kata kerja (atau kata sifat, untuk kalimat nominal) yang menerangkan apa yang dilakukan/dialami subjek.
- **Objek**: sasaran predikat. Wajib untuk verba transitif (`mengirim apa?`, `memecah apa?`).
- **Keterangan**: tempat, waktu, cara, alat, tujuan. Opsional, tapi membuat kalimat lebih utuh.

### 3.2 Contoh untuk konteks dataset

| Kalimat | S | P | O | K |
|---------|---|---|---|---|
| `Router meneruskan paket ke jalur terbaik.` | Router | meneruskan | paket | ke jalur terbaik |
| `TCP membangun koneksi sebelum mengirim data.` | TCP | membangun | koneksi | sebelum mengirim data |
| `Sinyal radio merambat tanpa kabel.` | Sinyal radio | merambat | — | tanpa kabel |

### 3.3 Kesalahan SPOK yang sering muncul

- **Subjek hilang**: "Mengirim data lewat udara." → siapa yang mengirim? Tambahkan: "WLAN mengirim data lewat udara."
- **Predikat ganda tanpa konjungsi**: "TCP memecah data mengirim ke tujuan." → "TCP memecah data lalu mengirimnya ke tujuan."
- **Objek hilang pada verba transitif**: "Penerima mengkonfirmasi." → "Penerima mengkonfirmasi paket data."
- **Frasa terputus jadi kalimat sendiri**: "Karena cepat dan andal." sebagai kalimat lengkap → gabungkan dengan kalimat induk.

### 3.4 Khusus pokok soal (`question` field)

Pokok soal di dataset ini berbentuk pelengkapan, contoh: `Sifat connection-oriented TCP artinya...`

Bentuk ini sah dan efektif. SPOK-nya tetap utuh setelah opsi terisi:

- `Sifat connection-oriented TCP` (S) `artinya` (P) `[opsi]` (Pelengkap)

Yang harus dijaga:

- S dan P pokok soal harus jelas sebelum elipsis.
- Opsi harus paralel secara gramatikal — semua diawali frasa nomina, atau semua diawali frasa verba, **bukan campur**.

Contoh paralel (baik):
```
Sifat connection-oriented TCP artinya...
- Koneksi harus dibangun terlebih dahulu sebelum data dikirim
- Data dikirim tanpa membangun koneksi terlebih dahulu
- Koneksi hanya bisa berjalan satu arah
- Data dikirim secara acak tanpa urutan
```
Semua opsi diawali nomina (`Koneksi`, `Data`, `Koneksi`, `Data`). Cocok dengan stem `... artinya ...`.

Contoh tidak paralel (buruk):
```
Apa fungsi TCP?
- Memastikan data sampai utuh         ← verba
- Pengaturan alamat                    ← nomina
- Untuk routing paket                  ← frasa preposisi
- Komunikasi dengan UDP                ← nomina
```
Campur kategori; usulkan rewrite agar semuanya diawali kategori yang sama.

---

## 4. Quick checklist for the `description` field

Dataset's typical description has 3–4 short sentences. For each:

1. **Sentence 1 (hook)**: Real-world scenario. SPOK lengkap. Boleh sehari-hari ("Buka HP, langsung konek Wi-Fi.").
2. **Sentence 2 (image hint, only if `imageLink != null`)**: "Gambar di atas menampilkan [konsep yang sesuai dengan filename gambar]." Pastikan konsepnya cocok dengan `image-assignments.json`.
3. **Sentence 3 (concept hint)**: Mengarahkan pembaca ke konsep yang akan ditanyakan, tanpa membocorkan jawaban.
4. **Sentence 4 (CTA)**: Imperatif singkat ("Yuk, jawab!", "Saatnya uji insting kamu!").

Tidak semua deskripsi harus 4 kalimat. Jika tidak ada gambar, 3 kalimat (hook + concept hint + CTA) sudah cukup. Yang penting: **setiap kalimat berkontribusi pada alur menuju pokok soal**, tidak ada kalimat pengisi.

## 5. Quick checklist for the `question` field

- Diawali dengan subjek yang jelas (`Sifat X TCP`, `Fungsi utama Y`, `Lapisan terbawah pada Z`).
- Predikat lugas (`adalah`, `artinya`, `berfungsi untuk`).
- Diakhiri dengan elipsis tiga titik (`...`) untuk pola pelengkapan, atau tanda tanya (`?`) untuk pola pertanyaan langsung. Konsisten dengan pola dominan di level itu.
- Tanpa kiasan, tanpa idiom, tanpa kata tidak baku.
- Tidak mengandung negasi ganda ("manakah yang **tidak** **bukan** termasuk ...") — tunggal saja.

---

## 6. TTS-aware writing

The mobile app reads `description`, `question`, and options aloud when the speak button is pressed. The text is concatenated as:

```
"<description>. <question>. Pilihan jawaban: A. <opt1>. B. <opt2>. C. <opt3>. D. <opt4>"
```

This means the reader's ear hears your punctuation. Practical implications:

- **Periods cause pauses**, commas cause shorter pauses. Short crisp sentences read better than long compound ones — already the dataset's house style.
- **Avoid em-dashes (—) and parenthetical asides** in `description` and `question`. They confuse Indonesian TTS engines. Use a comma or split into two sentences.
- **Foreign technical terms** (`TCP`, `IPv4`, `WLAN`, `IEEE 802.11`, `connection-oriented`) will be read with Indonesian phonetics — usually OK because students hear the same in class. But avoid stacking three foreign words in a row in the same sentence; the listener loses thread. Break it up.
- **Acronyms with slashes** like `TCP/IP` are typically read as "ti-si-pi i-pi" by Indonesian TTS. Acceptable, but be aware.
- **Numbers**: prefer Indonesian words for small numbers in flowing prose (`empat lapisan`) and digits when the value is a unit (`5 GHz`, `2,4 GHz`). Use comma as decimal separator per PUEBI (`2,4` not `2.4`).
- **Question marks and elipsis** at the end of the `question` field are spoken as a slight rising intonation — both work fine.
- Don't introduce **emoji or special unicode** in `description`, `question`, or options. They render poorly in TTS.

Don't sand the language down so much that it loses personality — the dataset's playful CTAs ("Yuk, jawab!", "Gas, jawabannya!") read just fine. Just keep punctuation clean and avoid TTS speed bumps.
