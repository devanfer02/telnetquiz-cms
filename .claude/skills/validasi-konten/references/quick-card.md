# Quick Card — validasi-konten

Rubrik utama untuk skoring 11 dimensi (5 Guru + 5 Siswa + 1 Cross-POV). Setiap dimensi diberi skor 0/1/2 berdasarkan anchor di sini. Buka `deep/*.md` hanya kalau kasus borderline butuh penalaran lebih dalam.

## Skor anchors (universal)

- **2 — Pass**: Tidak ada concern. Soal lulus dimensi ini tanpa catatan.
- **1 — Partial**: Ada satu concern minor. Soal masih layak, tapi sebaiknya disempurnakan.
- **0 — Fail**: Concern yang serius. Soal sebaiknya direvisi sebelum dipakai.

Kalau ragu antara 1 dan 2 → pilih 1. Kalau ragu antara 0 dan 1 → pilih 0. Konservatif lebih baik.

## POV Guru TKJ — G1-G5

### G1 — Curriculum Alignment

> Apakah konsep yang diuji termasuk elemen CP "Media dan jaringan telekomunikasi" pada mata pelajaran "Dasar-Dasar Teknik Jaringan Komputer dan Telekomunikasi" (Kurikulum Merdeka, Fase E SMK TKJ)?

| Skor | Anchor |
|------|--------|
| 2 | Konsep jelas tercantum di elemen CP dan sesuai kedalaman Fase E |
| 1 | Konsep relate tapi terlalu dalam (Fase F / konsentrasi keahlian), atau menyinggung elemen CP lain (mis. pemrograman jaringan murni) |
| 0 | Konsep di luar scope SMK TKJ (mis. teori antrian matematis, riset jaringan akademis) |

Buka `deep/kurikulum-smk-tkj.md` untuk peta CP → chapter.

### G2 — Technical Accuracy

> Apakah pernyataan, konsep, kunci jawaban, dan distraktor benar secara teknis?

| Skor | Anchor |
|------|--------|
| 2 | Semua pernyataan teknis benar; kunci tepat; distraktor jelas keliru secara teknis (bukan ambigu) |
| 1 | Pernyataan benar tapi disederhanakan ke titik di mana ahli akan mengerutkan dahi (mis. "Wi-Fi = nirkabel" tanpa konteks) |
| 0 | Ada pernyataan yang faktual salah (mis. "TTL diukur dalam detik", "kelas A mulai dari 0.0.0.0") atau kunci sebenarnya bukan jawaban paling benar → flag KEY-CHECK |

G2 = 0 selalu memicu `key_check: true` di report.

### G3 — Bloom Level Match

> Apakah level kognitif soal sesuai dengan `difficulty` level?

Pemetaan target:
- `difficulty: "easy"` → C1 (mengingat) atau C2 (memahami)
- `difficulty: "medium"` → C2 atau C3 (menerapkan)
- `difficulty: "hard"` → C3 atau C4 (menganalisis)

| Skor | Anchor |
|------|--------|
| 2 | Level kognitif tepat sasaran |
| 1 | Off by one (mis. easy berisi C3) tapi siswa target masih bisa) |
| 0 | Off by ≥2 (easy berisi C4 analisis kompleks, atau hard berisi pure C1 hafalan) |

Kata kerja kunci stem:
- C1: sebutkan, definisi, kepanjangan, nama
- C2: jelaskan, artinya, fungsi, perbedaan
- C3: gunakan, hitung, terapkan, pilih (untuk skenario)
- C4: analisis, bandingkan, simpulkan, identifikasi penyebab

### G4 — Distractor as Real Misconception

> Apakah setiap distraktor mencerminkan kesalahpahaman nyata yang ditemui di kelas?

| Skor | Anchor |
|------|--------|
| 2 | Setiap distraktor adalah miskonsepsi yang siswa setengah-paham akan ragu |
| 1 | 1 dari 3 distraktor terasa "asal salah" (mis. domain berbeda, terlalu absurd) |
| 0 | ≥2 distraktor bukan miskonsepsi (siswa langsung eliminasi tanpa berpikir) |

Buka `deep/miskonsepsi-tkj.md` untuk daftar miskonsepsi umum per topik.

Catatan tumpang tindih: refine-quiz-questions juga punya rubrik distraktor (panjang, register, tautological). Validasi fokus pada **substansi miskonsepsi**, bukan bentuk. Soal bisa bagus secara form (refine pass) tapi distraktor-nya fiktif (validasi G4 fail).

### G5 — Indicator Coverage

> Dalam satu level, apakah soal-soal menyentuh berbagai aspek konsep?

Dinilai per **level**, bukan per soal. Skor disebar rata ke semua soal di level tersebut.

| Skor | Anchor |
|------|--------|
| 2 | Soal-soal di level ini menyentuh ≥3 sudut berbeda dari konsep (definisi, fungsi, contoh, perbandingan, dll.) |
| 1 | Menyentuh 2 sudut |
| 0 | Semua soal menumpuk di satu sudut (mis. semua tanya definisi) |

## POV Siswa TKJ — S1-S5

### S1 — Term Familiarity

> Apakah semua istilah teknis di deskripsi/pertanyaan/opsi sudah pernah muncul di studyMaterial chapter ini atau chapter sebelumnya?

| Skor | Anchor |
|------|--------|
| 2 | Semua istilah teknis sudah ada di studyMaterial sebelum soal ini |
| 1 | 1 istilah baru muncul di soal sebelum dijelaskan (acceptable kalau bisa diinfer dari konteks) |
| 0 | ≥2 istilah baru, atau 1 istilah baru yang load-bearing untuk jawaban |

Prescan output `term_first_occurrence` membantu — kalau term first appearance di question text, bukan di studyMaterial, itu sinyal S1 < 2.

### S2 — Real-world Relatability

> Apakah skenario soal terhubung dengan dunia siswa SMK TKJ?

Touchpoint yang relate untuk siswa SMK TKJ:
- Wi-Fi sekolah / kos / rumah
- HP terhubung internet, paket data
- Warnet, game online, latency
- Lab praktikum (kabel UTP, switch, router)
- Tugas TKJ: setting AP, IP statis, sharing printer
- Dunia kerja IT entry-level (teknisi, helpdesk)

| Skor | Anchor |
|------|--------|
| 2 | Deskripsi punya hook relate ke salah satu touchpoint di atas |
| 1 | Hook ada tapi generik ("dalam jaringan komputer...") tanpa skenario konkret |
| 0 | Soal sepenuhnya abstrak/akademis tanpa anchor ke pengalaman siswa |

S2 dinilai dari **description**, bukan question stem. Stem boleh teknis kalau description sudah relate.

### S3 — Cognitive Load

> Apakah panjang & jumlah informasi baru per soal masuk akal?

Aturan praktis:
- Kalimat description ≤ 20 kata per kalimat (TTS-friendly + cognitive load)
- ≤ 2 istilah teknis baru per soal
- Total panjang description+question ≤ 4 kalimat

| Skor | Anchor |
|------|--------|
| 2 | Semua kriteria di atas terpenuhi |
| 1 | 1 kriteria pelanggaran (mis. 1 kalimat 25 kata) |
| 0 | ≥2 kriteria pelanggaran, atau ada kalimat majemuk berlapis yang siswa harus baca 2x |

Prescan `sentence_lengths` membantu di sini.

### S4 — Engagement

> Apakah konteks deskripsi membuat siswa penasaran atau terasa monoton?

| Skor | Anchor |
|------|--------|
| 2 | Hook konkret + CTA yang terasa undangan (Voice & Journey ON) |
| 1 | Hook ada tapi datar; CTA functional ("Tentukan jawaban yang benar") |
| 0 | Tidak ada hook (langsung definisi); CTA hilang atau berupa instruksi ujian biasa |

Catatan tumpang tindih dengan refine V1/V2: refine memperbaiki kalimat hook & CTA secara redaksi; validasi menilai apakah konteks yang dipilih (skenario) memang menarik untuk audiens TKJ.

### S5 — Mental Navigation Clarity

> Setelah baca deskripsi+pertanyaan, apakah siswa langsung tahu *jenis jawaban* yang dicari?

| Skor | Anchor |
|------|--------|
| 2 | Stem mengarahkan ke jenis jawaban spesifik (definisi/angka/protokol/fungsi/kelas) — siswa langsung scan opsi dengan target |
| 1 | Stem agak vague tapi opsi homogen membantu siswa menebak target |
| 0 | Stem ambigu + opsi heterogen → siswa harus baca 4x semua opsi sambil menebak target |

S5 fail biasanya disebabkan stem terlalu pendek ("TCP adalah ...") atau opsi non-homogen.

## Cross-POV — C1

### C1 — Content Coherence

> Apakah `image (jika ada) → description → question → opsi` semua membahas satu konsep yang sama, tanpa drift topik atau loncat istilah di tengah?

Cara cek (jalankan empat verifikasi berurutan):

1. **Image ↔ description**: kalau `imageLink != null`, apakah deskripsi membahas konsep yang sama dengan filename gambar? (mis. `ch1-three-way-handshake.png` → deskripsi harus tentang handshake/SYN-ACK/koneksi, bukan tentang routing)
2. **Description ↔ question**: apakah hook + concept hint di description menjembatani ke question stem? Kalau description bicara Wi-Fi tapi question tiba-tiba tanya tentang IP routing, itu drift.
3. **Question ↔ opsi**: apakah semua opsi (kunci + distraktor) berada dalam domain yang sama dengan stem? Distraktor dari topik lain = drift.
4. **Konsistensi istilah**: apakah istilah inti (mis. "Wi-Fi" / "WLAN" / "nirkabel") dipakai konsisten lintas image-description-question-opsi, atau loncat-loncat tanpa jembatan?

| Skor | Anchor |
|------|--------|
| 2 | Keempat verifikasi lulus — semua elemen satu topik, satu istilah inti, alur jelas dari image → opsi |
| 1 | Satu disconnect — mis. image filename `wlan-overview` tapi description sama sekali tidak nyebut WLAN, ATAU description bagus tapi 1 distraktor dari topik berbeda |
| 0 | Dua atau lebih disconnect — kerangka terasa potongan-potongan, mis. "image three-way-handshake" + "description tentang reliability" + "question tentang routing" |

Contoh disconnect nyata:

- **Image-description disconnect**: `imageLink` mengarah ke `ch1-tcp-segment.png` tapi description tidak menyebut segmen/header/sequence sama sekali — siswa lihat gambar tapi tidak tahu kenapa muncul.
- **Description-question drift**: deskripsi pakai analogi "tukang pos kirim surat" tapi pertanyaan tiba-tiba minta sebut "protokol Layer 4" — analogi tidak menjembatani ke jargon.
- **Question-option mismatch**: pertanyaan tentang "fungsi Application Layer" tapi salah satu distraktor adalah definisi IPv6 — out-of-domain distractor.
- **Istilah loncat**: image labelnya "Wi-Fi setup", description pakai "Wi-Fi", question pakai "WLAN" tanpa pernah jembatani bahwa "Wi-Fi = WLAN konsumen" → siswa Fase E bisa kira itu dua hal beda.

C1 dinilai per soal (bukan per level). Kalau soal tidak punya gambar, lewati verifikasi 1; tiga verifikasi sisa tetap berlaku.

Catatan tumpang tindih: refine-quiz-questions K8 cek "image keyword muncul di description" (mekanik, regex). C1 jauh lebih luas — substansi koherensi lintas keempat elemen. Soal bisa lulus K8 tapi gagal C1.

## Tabel ringkas: 11 dimensi → fokus

| Dim | Fokus | Sumber data |
|-----|-------|-------------|
| G1 | Apakah ini SMK TKJ? | deep/kurikulum-smk-tkj.md |
| G2 | Apakah benar secara teknis? | Pengetahuan TKJ + studyMaterial |
| G3 | Bloom match difficulty? | Stem verb + difficulty field |
| G4 | Distraktor = miskonsepsi nyata? | deep/miskonsepsi-tkj.md |
| G5 | Coverage per level? | Pola soal di satu level |
| S1 | Istilah sudah dijelaskan? | Prescan term_first_occurrence + studyMaterial chapter sebelumnya |
| S2 | Skenario dunia siswa? | description hook |
| S3 | Beban kognitif wajar? | Prescan sentence_lengths + count istilah baru |
| S4 | Bikin penasaran? | description hook + CTA |
| S5 | Arah jawaban jelas? | question stem + opsi homogenity |
| C1 | Image+description+question+opsi satu topik? | 4-step verification di section C1 |

## Saat tergoda menilai >11 dimensi

Skill ini sengaja dibatasi 11 dimensi (G1-G5 + S1-S5 + C1) dengan skor diskrit 0/1/2 supaya output deterministik dan dapat dibandingkan antar iterasi loop. Jangan menambah dimensi ad-hoc. Concern yang tidak masuk salah satu dimensi → tulis di field `concerns` tanpa skor.

## Hand-off ke refine-quiz-questions

Soal dengan skor di bawah threshold (per default <90% per soal) masuk ke `flagged_for_refine`. Untuk tiap entry, isi `failed_dims` dan `suggestion_hint`. `suggestion_hint` boleh sebut rule code refine (M, K, B, V) untuk arahkan refine. Contoh:

- Failed S4 → hint: "Hook flat — V1: tulis ulang kalimat 1 deskripsi dengan skenario konkret (Wi-Fi sekolah)."
- Failed G4 → hint: "Distraktor B & D bukan miskonsepsi — refine dengan mempertahankan kunci, ganti B & D dengan miskonsepsi dari deep/miskonsepsi-tkj.md (kelas IP)."

`suggestion_hint` adalah arahan, bukan teks pengganti. Refine yang tulis ulang.
