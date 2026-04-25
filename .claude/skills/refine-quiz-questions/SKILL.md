---
name: refine-quiz-questions
description: Refine quiz questions in TelNetQuiz CMS production data at cli/content/data/prod/chapter-*.json. Plan-first audit of each question against PUEBI/EYD ejaan, KBBI vocabulary, SPOK sentence structure, kaidah penulisan soal pilihan ganda (materi-konstruksi-bahasa), topic coherence between chapter title → level title → description → question → options, image-text synchronization, distractor quality so the correct answer never looks obvious, and Voice & Journey feel that casts the SMK student as a "Penjelajah" on a learning quest. Use this skill whenever the user asks to refine, polish, perbaiki, audit, improve, rapikan, or perhalus quiz questions / soal kuis / soal pilihan ganda; or mentions checking question quality, alur soal seperti sungai, kesinkronan gambar dengan deskripsi, kalimat baku, distraktor yang terlalu jelas, pengecoh terlalu mudah, feel petualangan, rasa journey, vibe penjelajah, hook deskripsi yang flat, or CTA yang kayak chore. Operates on chapter quiz files only — never touches pretest.json, achievements.json, image-assignments.json, upload-manifest.json, and never modifies the studyMaterial field.
user-invocable: true
---

# Refine Quiz Questions

A plan-first auditor and refiner for TelNetQuiz quiz content. Your job is to make each question read like a clean, focused river: chapter → level → description → question → options all flow toward one concept, with no broken Indonesian, no off-topic distractor, and no mismatch between the image and the words around it.

## How questions render on the mobile app (read this first)

The audit only makes sense if you understand what the student actually sees. The Android client (`QuestionScreen.kt`) renders each question in this exact order, top to bottom:

```
[Progress bar — current/total, no titles]
┌─ QuestionHeaderBox ─────────────────────────┐
│  Level title  (= quiz.title in JSON)        │
│  Image        (= question.imageLink, if !null)│
│  Description  (= question.description)      │
└─────────────────────────────────────────────┘
Question text   (= question.question, centered, bold)
Option A   (= options[0].text)
Option B   (= options[1].text)
Option C   (= options[2].text)
Option D   (= options[3].text)
[Verify button]
```

Implications you must hold in mind while auditing:

- **The level title is the on-screen anchor**, not the chapter title. The chapter title is the conceptual scope ("we are in the TCP/IP chapter") but the user does not see it on this screen. So coherence is judged primarily against the **level title**; chapter title is the broader thematic check.
- **"Gambar di atas" is literal** — when `imageLink != null`, the image renders directly above the description inside `QuestionHeaderBox`. So phrases like "Gambar di atas" and "Perhatikan gambar" are physically accurate references.
- **Options are presented with letter labels A, B, C, D** at runtime (the JSON only stores `text` and `isCorrect` — the mobile app overlays the letter). Reference options as "Opsi A/B/C/D" in the change map so the user can match what they see.
- **TTS reads the description, question, and options aloud** when the speak button is pressed. The text is concatenated as `"<description>. <question>. Pilihan jawaban: A. <opt1>. B. <opt2>. ..."`. That means: punctuation directly affects TTS pacing, and foreign technical terms will be read with Indonesian phonetics. Don't pile on em-dashes, parenthetical asides, or unusual punctuation that breaks TTS rhythm.
- **`question.audioLink` exists** as a field on each question (pre-recorded audio). It is **out of scope** — never edit it.

## Non-negotiable scope

These rules exist because the wrong file can break the mobile app or the pretest, which is a separately curated artifact.

- **Read & write only**: `cli/content/data/prod/chapter-*.json` (currently `chapter-1-tcp-ip.json`, `chapter-2-wlan.json`, plus any future `chapter-*.json`). Within those files, only edit: `description`, `question`, `options[i].text`.
- **Read-only context** (never edit): `cli/content/data/prod/image-assignments.json`. This file maps which image belongs to which question — use it to verify image-text claims, but treat it as ground truth.
- **Do not touch**, even if the user pushes: `pretest.json`, `achievements.json`, `upload-manifest.json`, anything under `images/`, and these fields inside a question — `studyMaterial` (entire block), `audioLink`, `imageLink`, `isCorrect`. studyMaterial is locked per the project owner; audioLink is pre-recorded audio that won't match if the text changes drastically (raise that as a note if the rewrite is heavy); imageLink and isCorrect changes are dangerous.
- If a distractor is accidentally correct, flag it as `KEY-CHECK` so the user can confirm — do not silently flip the key.
- If a heavy rewrite of `description` or `question` would obviously desync the pre-recorded TTS in `audioLink`, mention it in the finding so the user knows audio re-recording may be needed.

If the user asks for something out of scope, say so plainly and either narrow the request or stop. Do not improvise around the boundary.

## The five-phase workflow (hard stop at phase 4)

Run these phases in order. **Phase 4 is a hard stop** — never apply edits without explicit approval. The whole point of this skill is to give the user a chance to review every change before it lands in the quiz JSON.

### Phase 1 — Plan

1. Read every `chapter-*.json` under `cli/content/data/prod/` (excluding `pretest.json`).
2. Read `image-assignments.json` once and keep it as your source of truth for which image is paired with which question.
3. Print a scope summary to the user:
   - Chapters covered, levels per chapter, total questions
   - How many questions have a non-null `imageLink`
   - The audit dimensions you'll apply (see `references/mcq-rubric.md` and `references/indonesian-language-rules.md`)
4. Ask the user to confirm scope or scope down. Common narrowings:
   - "Only chapter 2"
   - "Only level 3 of chapter 1"
   - "Only the questions with images"
   - "Skip questions you'd only mark as OK"

Wait for the user's reply before moving on. A scope-down at this stage saves a lot of review effort later.

### Phase 2 — Audit

For each question in scope, run it against the rubric in `references/mcq-rubric.md` and the language rules in `references/indonesian-language-rules.md`. For each finding, capture:

- **Where** — file, level number, question index, and which field (`description`, `question`, `options[i].text`)
- **What's wrong** — one specific dimension from the rubric (e.g. "SPOK: predikat hilang", "Kaidah konstruksi: panjang opsi tidak homogen", "Sinkronisasi gambar: deskripsi menyebut 'Gambar di atas' tetapi imageLink null")
- **Proposed fix** — the exact replacement text
- **Why it matters** — one short clause tying the fix back to the rubric

Audit the four fields in this priority order: image sync first (it's structural and binary), then language correctness, then MCQ kaidah, then river-flow coherence. This order matters because a description that references a non-existent image is a higher-impact bug than a missing comma — fix the load-bearing problems first.

**Distractor rewrites**: when an option is so obviously wrong that it gives the correct answer away, or when an option is plausible enough to also be correct, propose a replacement that is homogen with the key (similar length, parallel grammar, drawn from the same domain) but unambiguously distinct. Never silently change `isCorrect`. If you suspect the keyed answer is actually wrong, flag it as a separate finding labeled `KEY-CHECK` and let the user decide.

### Phase 3 — Map

Render the findings as a Markdown change map following the template in `references/change-map-format.md`. Group by file → level → question. For each affected field, show **Before** and **After** verbatim so the user can eyeball the diff. Include a one-line `Reason` referencing the rubric dimension. Questions with no findings are listed in a single compact line per level: `Level 1: Q1, Q2 — OK (no changes)`.

If the change map is going to be very long (more than ~30 questions touched), you may render it in chunks per chapter and ask the user mid-stream whether to continue. Keep each chunk self-contained.

### Phase 4 — Approval gate (hard stop)

Stop. Print a one-paragraph summary of what you propose to change (e.g. "Proposed: 18 description rewrites, 7 question rewrites, 12 distractor rewrites, 3 KEY-CHECK flags") and ask the user how they want to proceed. Accept these forms of approval:

- **All** — apply every proposed change
- **Per chapter** — apply only changes in the chapters the user names
- **Per question** — apply only the question IDs the user names
- **Skip** — drop specific findings the user names; apply the rest
- **Reject** — apply nothing; end the run

Do not interpret silence, "ok", "looks good", or "go" as approval to apply if the message is ambiguous about which scope. Ask one clarifying question and wait.

### Phase 5 — Apply

Only after explicit, scoped approval:

1. Edit the relevant `chapter-*.json` files using exact-string replacements. Do not reformat unrelated lines, do not reorder keys, do not change indentation.
2. After all edits, print a short summary: files touched, count of fields changed, any KEY-CHECK items the user explicitly approved.
3. If the user accepted some findings and skipped others, restate which findings were *not* applied so the next session has a clean handoff.

## Voice & Journey — make the student feel like an explorer

The mobile app already addresses the user as **"Penjelajah"** ("explorer" — see the exit dialog in `QuestionScreen.kt`). The dataset's voice should reinforce that: each question is one waypoint in a journey through jaringan telekomunikasi, not a sterile exam item. A student should close a level feeling "I just unlocked something", not "I just clicked four buttons."

This is a real audit dimension, not decoration. A grammatically perfect question that reads like a textbook still fails this rubric.

**What journey-feel looks like in practice:**

- **Hook (description sentence 1)**: a relatable, sensory, specific scene the student can step into. "Kamu buka HP, langsung konek Wi-Fi." > "Wi-Fi adalah teknologi nirkabel."
- **CTA (description final sentence)**: framed as a milestone or challenge in a quest. "Yuk, bongkar kepanjangannya!", "Saatnya uji insting kamu!", "Ayo pecahkan misterinya!", "Gas, jawabannya!" > "Pilih jawaban yang benar."
- **Across a level**: the four-five questions should feel cumulative — early questions warm up, later questions deepen. A flat sequence of identically-toned questions feels like a worksheet; a paced sequence feels like a chapter.
- **Across a chapter**: the level titles should sound like stages on a journey. "Konsep Dasar", "Lapisan-Lapisan", "Pengalamatan IP", "Routing & Distribusi" — already pretty good. If a level title sounds drier than the others, flag it (low priority).
- **Address the student**: implicit second-person ("Kamu ...") works. Direct address ("Penjelajah!") is reserved for app-level moments (dialogs, results screens) — don't sprinkle it inside individual descriptions or it loses force.

**What journey-feel does NOT mean:**

- Not flowery prose. Sentences stay short and SPOK-correct.
- Not gamified jargon. No "XP", "level up", "achievement unlocked" inside question text. The mobile app surfaces those concepts in its UI; quiz content stays focused on the concept being tested.
- Not condescending. SMK students are not children; cringe-y enthusiasm reads worse than dryness.
- Not at the cost of correctness. A vivid hook that misrepresents the concept is worse than a dull one that's accurate.

**Audit check (Voice/Journey dimension)**: read the description out loud. Does it pull you in for ~2 seconds before the question hits? If you'd happily skim past it, the hook is too flat — propose a sharper scenario. If the CTA feels like a chore prompt rather than a challenge invitation, propose a livelier one (preserving baku Indonesian).

When proposing a Voice/Journey rewrite in a finding, cite rule code `V1` (flat hook) or `V2` (chore-y CTA) or `V3` (level pacing inconsistent) so the user can see this dimension was checked.

## Audit dimensions — quick map to references

Read the relevant reference file when you need depth. The summaries below are deliberately terse so the workflow stays readable.

| Dimension | Reference | One-line check |
|-----------|-----------|---------------|
| Image sync | this file (below) | Description says "Gambar di atas" iff `imageLink != null` AND image content actually matches the hint |
| PUEBI/EYD ejaan | `references/indonesian-language-rules.md` | Capitalization, tanda baca, kata serapan, italics convention for foreign terms |
| KBBI baku | `references/indonesian-language-rules.md` (esp. §2.0 — expert-corrected patterns) | Words exist in KBBI; kata baku used over kata tidak baku; bare-stem verbs replaced with imbuhan forms; no slang/klip ("lemot", "konek", "bongkar"); kiasan banned in pokok soal; no anaphoric pronoun for inanimate devices; no absolute speed claims for older standards |
| SPOK structure | `references/indonesian-language-rules.md` | Subjek + Predikat present; Objek/Keterangan as needed; no fragmen |
| MCQ materi | `references/mcq-rubric.md` | Tests one concept; one correct answer; options homogen secara materi |
| MCQ konstruksi | `references/mcq-rubric.md` | Stem clear & not negative-double; no "semua benar/salah"; options parallel & length-similar |
| MCQ bahasa | `references/mcq-rubric.md` | Komunikatif, not ambiguous, no grammatical clue to the answer |
| Coherence | this file (below) | Chapter → level → description → question → options stay on one concept |
| Distractor quality | `references/mcq-rubric.md` | Plausible, not obviously wrong, not accidentally correct |
| Voice & Journey | this file (above) | Hook is vivid, CTA feels like a quest beat, level pacing builds |

## Image synchronization rules (load-bearing — read carefully)

The mobile app shows the question's `imageLink` above the description, so the words and the picture must agree. Use `image-assignments.json` to verify which image is actually attached.

- If `imageLink` is `null`: the description must NOT contain phrases like "Gambar di atas", "lihat gambar", "perhatikan gambar". If it does, propose removing the image reference.
- If `imageLink` is non-null: the description should explicitly tie a sentence to what the image shows. Generic language is fine ("Gambar di atas menampilkan ...") as long as the named concept matches the actual image. Cross-check with `image-assignments.json`:
  - e.g. `chapter1/ch1-three-way-handshake.png` → description should reference handshake / SYN / ACK
  - e.g. `chapter1/ch1-tcp-vs-udp.png` → description should reference comparison between TCP and UDP
- If the image filename and the description's claim don't agree, the description is wrong (the image assignment is ground truth here). Propose rewriting the description.

## "River flow" coherence rule

The user's mental model is that a single question should flow like a river from broad context down to one specific ask. There are two layers — the *conceptual* river (what topic we are testing) and the *visible* river (what the student literally sees on the screen):

**Conceptual river (thematic coherence — used during audit):**
```
Chapter title       (broadest topic, off-screen)
  └── Level title   (visible on-screen anchor)
        └── description, question, options    (must all stay within the level's subtopic)
```

**Visible river (what the student sees on the question screen):**
```
Level title                       (= quiz.title)
  └── Image (if any)              (= question.imageLink)
        └── description sentence 1  (real-world hook / scenario)
              └── description sentence 2  (image hint, only if imageLink != null)
                    └── description sentence 3  (concept hint pointing at the question)
                          └── description sentence 4  (CTA — "Yuk pilih jawabannya!")
                                └── question              (crystallizes the ask, centered & bold)
                                      └── Opsi A          (= options[0].text)
                                      └── Opsi B          (= options[1].text)
                                      └── Opsi C          (= options[2].text)
                                      └── Opsi D          (= options[3].text)
```

Every step in the visible river should narrow toward the same concept. If sentence 1 talks about Wi-Fi but the question is about IP routing, the river is broken. The fix is usually to rewrite the description (cheaper) rather than the question.

The four-sentence description shape is the *typical* pattern in this dataset, not a rigid template. Three sentences is fine when there's no image. The CTA can be playful ("Gas, jawabannya!", "Saatnya uji insting kamu!") — that's part of the dataset's voice and you should preserve it. What's not OK is: incoherence between sentences, a CTA that adds noise but no progression, or a hook that doesn't connect to the question.

A coherence break against the **chapter title** is unusual but not impossible — flag it as low priority since the student doesn't see chapter title on the question screen. A break against the **level title** is high priority since the level title is rendered directly above the description.

## Output discipline

- Write the change map in Indonesian where the source is in Indonesian — don't translate user-facing strings into English just because you're explaining yourself.
- Quote `Before` and `After` verbatim. Don't paraphrase. The user is reviewing a diff, not a summary.
- Reasons stay short and reference one rubric dimension. "Kaidah konstruksi: opsi A jauh lebih panjang dari B/C/D, memberi petunjuk jawaban" is good. "Improved clarity" is not.
- Never bundle two unrelated fixes into one finding. Each finding is one field, one dimension, one fix. The user needs to be able to accept or reject each independently.

## Common pitfalls (don't repeat these)

- **Editing the wrong file**: always confirm the file path starts with `cli/content/data/prod/chapter-` and the filename is not `pretest.json` before any Edit call.
- **Silently flipping `isCorrect`**: never. Always raise as `KEY-CHECK`.
- **Reformatting JSON**: use exact-string Edit, not Write. Preserve original indentation and key order.
- **Over-editing the voice**: the dataset has a distinctive playful CTA register. Don't sand it into corporate prose. Refine grammar and structure, keep the personality.
- **Skipping the approval gate**: the hard stop at phase 4 is the entire point of the skill. If you find yourself about to apply changes without an explicit scoped approval, stop.
