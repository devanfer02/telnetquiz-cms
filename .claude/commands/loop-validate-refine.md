Run a closed-loop content quality cycle for TelNetQuiz quiz questions: validate → refine flagged items → re-validate, until the validate skill reports `approval_pct >= 90` or a safety cap is hit.

Scope: $ARGUMENTS — interpret as scope hint for both skills (e.g. "Penuh", "chapter 1", "chapter-2-wlan.json", "level 3"). If empty, default to **Penuh** (all chapters).

## Loop semantics

You run this loop manually (no `loop` skill needed — this is a single multi-iteration command). Track state in your head + announce each iteration to the user.

### Constants

- `THRESHOLD = 90` (approval percentage to stop on)
- `MAX_ITERATIONS = 5` (hard safety cap)
- Report path: `.claude/skills/validasi-konten/reports/latest.json`

### Iteration N (start with N=1)

#### Step 1 — Run validasi-konten in loop-mode

Invoke the `validasi-konten` skill with the prompt:

> "loop-mode — validate scope `<SCOPE>`. Write report to `.claude/skills/validasi-konten/reports/latest.json`. Print one-line confirmation only."

Loop-mode skips the human-readable Phase 4 summary; it only writes JSON and prints the parse line.

#### Step 2 — Read the report

```bash
cat .claude/skills/validasi-konten/reports/latest.json
```

Parse `approval_pct`, `passed`, `flagged_for_refine`, `key_checks`.

Announce to user:

```
[Iter N/5] Approval: XX.X% | flagged: M soal | KEY-CHECK: K
```

#### Step 3 — Decide next action

| Condition | Action |
|-----------|--------|
| `approval_pct >= THRESHOLD` | **STOP — success**. Print final report (see "Final report" below). |
| `len(flagged_for_refine) == 0` | **STOP — converged below threshold**. Print final report with note "tidak ada lagi finding actionable; threshold tidak tercapai (likely needs human content rewrite)". |
| iteration `N >= MAX_ITERATIONS` | **STOP — cap hit**. Print final report. |
| Else | Continue to Step 4. |

If KEY-CHECK count > 0 *and* approval is still below threshold, **STOP and surface KEY-CHECKs to user first** — KEY-CHECKs cannot be auto-resolved. Print:

```
⚠️  KEY-CHECK perlu keputusan manual sebelum loop bisa lanjut:
- <file> L<n> Q<idx>: <issue>
- ...

Balas dengan keputusan per item, lalu ketik /loop-validate-refine lagi untuk lanjut.
```

Then exit the loop.

#### Step 4 — Refine flagged items

Build a refine scope string from `flagged_for_refine`. Example: `"chapter-1-tcp-ip.json L2 Q3, chapter-2-wlan.json L1 Q5, L3 Q1"`.

Invoke the `refine-quiz-questions` skill with this prompt:

> "loop-context — refine ONLY these specific items: `<refine_scope>`. For each item, the validasi-konten suggestion_hint is: `<list of hints from flagged_for_refine>`. Auto-approve all non-KEY-CHECK findings (this is iteration `N` of `/loop-validate-refine`); skip KEY-CHECK items entirely (they are surfaced separately). Skip the standard Phase 4 approval gate; go straight to Phase 5 application. Print a brief diff summary."

**Critical**: refine-quiz-questions has a hard stop at Phase 4 (approval gate) by default. The phrase "loop-context" in the prompt + explicit "Auto-approve all non-KEY-CHECK findings" + "Skip the standard Phase 4 approval gate" overrides this for the loop. KEY-CHECK still requires manual user decision and is surfaced via Step 3 above, not silently auto-applied.

If refine reports zero edits applied (no actionable findings despite validate flagging), STOP — converged below threshold. Print final report.

#### Step 5 — Loop

Increment N. Goto Step 1.

## Final report

Print a Markdown block:

```markdown
# /loop-validate-refine — Selesai

**Status**: ✅ lulus (XX.X% ≥ 90%)  |  ⏸️  cap iterasi (5)  |  ⏸️  konvergen di bawah threshold  |  ⏸️  KEY-CHECK pending

**Iterasi**: N
**Approval awal**: <iter 1 approval_pct>%
**Approval akhir**: <iter N approval_pct>%

## Per iterasi
| Iter | Approval | Flagged | KEY-CHECK | Edit applied |
|------|----------|---------|-----------|--------------|
| 1    | 78.5%    | 18      | 2         | 16           |
| 2    | 86.0%    | 9       | 2         | 9            |
| 3    | 91.5%    | 4       | 2         | -            |

## Yang masih perlu manual
- KEY-CHECK: <list dari report terakhir>
- Catatan non-skor: <jumlah image_in_english flag>

Report akhir: `.claude/skills/validasi-konten/reports/latest.json`
```

## Safety rails

- **Never silently flip `isCorrect`**. KEY-CHECKs always pause for the user — even inside the loop.
- **Never edit files outside `cli/content/data/prod/chapter-*.json`**. Refine and validate skills already enforce this; don't relax it inside the loop.
- **Always announce each iteration before invoking skills** so the user can interrupt mid-loop.
- **If `latest.json` doesn't exist after Step 1**, the validate skill failed. Print the error and STOP. Do not assume.
- **If approval_pct decreases between iterations** (regression), STOP and print: "Regresi terdeteksi: iter N-1 = X%, iter N = Y%. Periksa edit terakhir." Don't continue auto-applying.

## Read this for context

- `.claude/skills/validasi-konten/SKILL.md` — what the report contains
- `.claude/skills/refine-quiz-questions/SKILL.md` — Phase 4/5 details that this loop overrides

$ARGUMENTS
