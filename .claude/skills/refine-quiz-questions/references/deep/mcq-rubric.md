# MCQ Rubric — Kaidah Penulisan Soal Pilihan Ganda

Authoritative checklist for auditing the quiz questions. Adapted from Pusat Penilaian Pendidikan (Puspendik) and the standard Indonesian assessment-writing guidance, scoped to TelNetQuiz's playful-but-baku register.

The rubric has three layers: **Materi**, **Konstruksi**, **Bahasa**. A finding cites exactly one layer + one specific rule. Don't write a finding that says "the question is bad" — name which rule it broke.

---

## Layer 1 — Kaidah Materi (content rules)

These rules govern *what* the question tests, not how it's written.

### M1. Tests one specific concept

Each question must test exactly one concept relevant to the level title. If a question mixes "what is TCP" with "how does it differ from UDP", split it or pick one.

**Audit check**: Read the level title and the question. Ask: which single concept is being tested? If you can name two unrelated concepts, the question is overloaded.

### M2. Exactly one correct answer

Out of four options, exactly one must be correct. Watch for:

- Two options that are both technically correct (e.g. for "Fungsi TCP", both "memastikan data utuh" and "mengurutkan paket" are correct — they need to be combined into the key, with distractors drawn from non-functions).
- A "correct" option that is actually wrong because of a precision issue.

If you suspect a key error, raise it as `KEY-CHECK` — do not silently flip `isCorrect`.

### M3. Pilihan jawaban homogen secara materi

All four options must be drawn from the same domain or category. If the question is about TCP layers, all four options should name layers — not three layers and one protocol.

**Audit check**: Are all four options the same *kind of thing*? E.g. all functions, all definitions, all numerical answers, all protocol names.

### M4. Topic coherence with chapter & level

The question's concept must fit the chapter title and the level title. A question about WLAN security inside "Konsep Dasar dan Prinsip Kerja WLAN" is misplaced — flag it and either rewrite to fit the level or note that it belongs in another level.

---

## Layer 2 — Kaidah Konstruksi (structural rules)

### K1. Pokok soal jelas dan tegas

The stem (`question` field) must be unambiguous. A student who knows the material should be able to answer without reading the options.

**Bad**: `Tentang TCP/IP, berikut ini...`
**Good**: `Kepanjangan TCP/IP adalah...`

### K2. Tidak ada negasi ganda

Avoid stems with two negatives: "manakah yang **bukan tidak** termasuk ...". Use a single negative if needed, and bold/capitalize the negative for clarity ("Manakah yang **BUKAN** termasuk ...").

### K3. No "semua benar" / "semua salah"

Banned options:

- "Semua jawaban benar" / "Semua jawaban di atas benar"
- "Semua jawaban salah" / "Tidak ada jawaban yang benar"
- "Jawaban A dan B benar"
- "Jawaban C dan D benar"

These reduce the question to a guessability puzzle. Replace with concrete distractors.

### K4. Pilihan jawaban paralel secara struktur

All options should follow the same grammatical structure:
- All start with the same kind of word (all nouns, or all verbs, or all phrases).
- All have similar length (within ~50% of each other — see K5).
- All complete the stem with the same syntactic role.

**Bad** (mixed):
```
Fungsi router adalah...
- Meneruskan paket data        ← verb phrase
- Pengaturan jaringan          ← noun phrase
- Untuk komunikasi             ← prepositional phrase
- Komputer client              ← noun
```

**Good** (parallel):
```
Fungsi router adalah...
- Meneruskan paket data antar jaringan
- Menyimpan file pengguna secara terpusat
- Mengubah sinyal digital menjadi analog
- Mengamankan koneksi dengan enkripsi
```

### K5. Panjang pilihan jawaban relatif sama

The correct answer should not be visually conspicuous due to length. If the key is much longer (because it includes more qualifiers to be precise) or much shorter (because the distractors are padded), students will pick by visual cue.

Rule of thumb: longest option ≤ 1.5× shortest option, measured by character count for the dataset's typical option lengths (40–80 characters). If you find a stark length mismatch:

- Lengthen the distractors by adding plausible but wrong qualifiers
- Shorten the key by trimming redundant words while keeping it correct
- Or rewrite all four to a similar length

### K6. Tidak ada petunjuk gramatikal

Don't let the stem grammatically hint at the answer. Common pitfalls:

- Stem ends with `sebuah ...` → only singular options agree
- Stem ends with `... yang berfungsi untuk` → only verb-phrase options grammatically fit
- Stem uses a gendered or specific term → only a matching option fits

Fix: rephrase the stem to be grammatically neutral, or rephrase distractors to match the grammatical hook.

### K7. Posisi kunci jawaban acak

In the dataset, look at where `isCorrect: true` lands across questions in the same level. If the correct answer is always the first option, students will guess A. The correct position should be randomized across A/B/C/D within a level.

If a level has all keys in the same position, raise it as a finding (suggest reordering options for some questions). This is a **structural** issue, not a per-question fix.

### K8. Image relevant if present

If `imageLink != null`, the image must be necessary or supportive — not decorative. The description's image hint must match what the image actually shows (cross-check with `image-assignments.json`). If the image is irrelevant, two paths:
- Rewrite the description so it doesn't reference the image (and propose removing the image — flag, do not edit imageLink), OR
- Rewrite the description to actually use the image's content.

---

## Layer 3 — Kaidah Bahasa (language rules)

### B1. Bahasa Indonesia baku & sesuai PUEBI/KBBI

See `references/indonesian-language-rules.md` for the full PUEBI/KBBI/SPOK rule set.

### B2. Komunikatif untuk jenjang SMK

Vocabulary should be appropriate for vocational high school students studying Media dan Jaringan Telekomunikasi. Avoid:
- Overly academic technical jargon without context
- Slang or jokes that don't land
- Local-dialect terms

The dataset's "Yuk, ...", "Gas, ..." CTAs hit the right note — preserve them.

### B3. Tidak menimbulkan tafsir ganda

The stem and options must each have one unambiguous reading. If a sentence can be parsed two ways, rewrite it.

### B4. Tidak menggunakan kiasan di pokok soal

Idioms and figurative language are OK in the description's hook (it's a real-world scenario), but the `question` field must be literal.

**Bad**: `Mata-mata jaringan yang terus mengintai data adalah...` (kiasan)
**Good**: `Perangkat yang memantau lalu lintas data dalam jaringan adalah...`

### B5. Konsistensi istilah

If you use "paket data" in the description, don't switch to "packet" in the question or "datagram" in the options. Pick one term for the concept and use it consistently within a single question.

Across the chapter, prefer the term used in the level title and the chapter title's domain.

---

## Distractor quality rubric

A good distractor is **plausibly wrong** — a student who half-learned the material would consider it. A bad distractor is either:

| Failure mode | Symptom | Fix |
|--------------|---------|-----|
| **Obviously wrong** | Out of domain, silly, or jokey. Gives the answer away by elimination. | Replace with a near-miss from the same concept space. E.g. for "fungsi TCP", a distractor "Menampilkan antarmuka grafis" is too obviously wrong — replace with "Mengenkripsi setiap paket data" (related to networking, not TCP's job). |
| **Accidentally correct** | Two options are technically true. | Tighten the language so only one is fully correct. Or fold both into the key and create new distractors. |
| **Out of register** | Sounds different from the others (more formal, more casual, longer, shorter). | Rewrite to match the tone & length of the key. |
| **Tautological** | Restates the question without testing knowledge. | Replace with a substantive misconception. |
| **Taxonomically off** | Different category from the others. | Replace with same-category content. |

When you propose a distractor rewrite, note in the finding which failure mode it addresses. This helps the user evaluate whether your fix is good.

---

## Finding template (use this exactly)

Each finding is one field, one rule, one fix:

```
File: chapter-2-wlan.json
Level: 1 — "Konsep Dasar dan Prinsip Kerja WLAN"
Question: Q3
Field: options[2].text (Opsi C)
Rule: K5 (panjang opsi tidak homogen) + Distractor: obviously wrong
Before: "Pengguna terkurung di satu titik koneksi"
After:  "Pengguna terbatas pada perangkat yang terhubung kabel"
Reason: Opsi C 32% lebih pendek dan terlalu jelas salah karena bertentangan dengan akal sehat. Versi baru sepanjang opsi lain dan menjadi miskonsepsi yang masuk akal.
```

If the finding is a `KEY-CHECK`:

```
File: chapter-1-tcp-ip.json
Level: 3 — "Pengalamatan IP"
Question: Q4
Field: KEY-CHECK (do not auto-edit)
Rule: M2 (kunci jawaban diragukan)
Issue: Opsi B juga benar secara teknis. Mohon konfirmasi kunci.
Suggested resolution: (a) terima Opsi B sebagai kunci, atau (b) tighten opsi A sehingga hanya satu yang benar — versi ketat untuk A: "..."
```
