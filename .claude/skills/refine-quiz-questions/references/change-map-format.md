# Change Map Output Format

The change map is what the user reviews at phase 4 — the approval gate. Its job: let the user accept, reject, or skip individual findings without re-reading the source JSON. Keep it scannable. Verbatim diffs only.

## Top-level structure

```markdown
# Change Map — refine-quiz-questions

**Scope**: <chapters/levels covered>
**Source files**: chapter-1-tcp-ip.json, chapter-2-wlan.json
**Image map**: image-assignments.json (read-only context)

## Summary
- N total questions audited
- N findings across N questions
  - N description rewrites
  - N question rewrites
  - N option/distractor rewrites
  - N KEY-CHECK flags (require user decision)
- Untouched questions: list compactly per level

## Findings
[grouped by file → level → question]

## Approval prompt
[final paragraph asking the user how to proceed]
```

## Per-finding block

One block per `(question, field)` pair. Each block contains exactly six lines plus a blank line separator:

```
### chapter-2-wlan.json · Level 1 · Q3 · options[2].text (Opsi C)
- **Rule**: K5 (panjang opsi tidak homogen) + Distractor: obviously wrong
- **Before**: "Pengguna terkurung di satu titik koneksi"
- **After**: "Pengguna terbatas pada perangkat yang terhubung kabel"
- **Reason**: Opsi C 32% lebih pendek dan terlalu jelas salah karena bertentangan dengan akal sehat. Versi baru menjadi miskonsepsi yang masuk akal sambil menyamakan panjang.
- **TTS impact**: none
```

Field rules:

- **Heading**: `### <file> · L<n> · Q<n> · <field>`. Use `·` (middle dot) as separator. Always include the human-readable letter for options ("Opsi A/B/C/D"). The JSON path is the source of truth.
- **Rule**: name one or two rule codes from `references/mcq-rubric.md` (e.g. `M3`, `K4 + Distractor: out of register`) or from `references/indonesian-language-rules.md` (e.g. `PUEBI: tanda baca`, `SPOK: predikat hilang`, `KBBI: kata tidak baku 'praktek'`).
- **Before** / **After**: quote the exact string. Don't trim trailing punctuation. Don't paraphrase. If the field is the entire `description` (multi-sentence), quote the whole thing.
- **Reason**: one sentence. Tie back to the rule.
- **TTS impact**: `none` if punctuation/wording change is invisible to TTS; otherwise note specifically (e.g. "removes em-dash, smoother TTS pacing"; "audioLink may need re-recording due to substantial wording change").

## KEY-CHECK block

If the finding is a key-correctness concern, replace the standard block with:

```
### ⚠️  chapter-1-tcp-ip.json · Level 3 · Q4 · KEY-CHECK
- **Rule**: M2 (kemungkinan dua jawaban benar)
- **Issue**: Opsi B juga benar secara teknis berdasarkan rubrik M2.
- **Resolution path A** (keep current key, tighten Opsi A): rewrite Opsi A as "..."
- **Resolution path B** (change key to Opsi B, tighten A as distractor): rewrite Opsi A as "..."
- **Decision needed**: user must pick A or B before any edit lands.
```

KEY-CHECK blocks are never auto-applied. Even if the user says "approve all", they must explicitly approve each KEY-CHECK individually.

## Untouched questions section

For levels where some questions need no changes, list them on a single line per level:

```
**chapter-1-tcp-ip.json · Level 2 — OK**: Q3, Q4, Q5
```

This signals to the user that you actually checked these (they're not silently skipped) but found nothing to change.

## Approval prompt (always last)

End the change map with a single paragraph asking how to proceed. Use this exact form:

```
---

**Cara menyetujui**: balas dengan salah satu dari:
- "Setuju semua" — terapkan semua perubahan kecuali KEY-CHECK (yang harus disetujui per item)
- "Setuju chapter X" / "Setuju level X" — terapkan hanya yang disebut
- "Setuju Q[file]L[n]Q[n]" — terapkan hanya soal yang disebut (boleh beberapa)
- "Skip ..." — daftar finding yang ingin dilewati; sisanya diterapkan
- "Tolak" — jangan terapkan apa-apa, akhiri sesi

Untuk KEY-CHECK, sebut "KEY-CHECK Q[...] path A" atau "path B" untuk tiap item.
```

After printing this prompt, **stop** and wait for the user's reply. Do not invoke any Edit tool until the reply arrives.

## Constraints when applying (phase 5)

After approval, when you do apply:

- Use `Edit` tool with exact string replacement. Never `Write` over the whole file (that would reformat).
- The `Before` text in the change map must match the JSON byte-for-byte. If `Edit` fails because the source has changed since you read it, re-read and re-confirm with the user before retrying — do not improvise.
- After all edits to a file, do **not** run any formatter on the chapter JSON. Indentation must be preserved exactly.
- After edits land, print a one-block summary: files touched, count of fields changed per file, count of KEY-CHECKs the user explicitly approved, and any findings that were skipped or rejected.
