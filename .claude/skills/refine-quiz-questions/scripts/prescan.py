#!/usr/bin/env python3
"""Pre-scan TelNetQuiz chapter JSONs for mechanical findings.

Surfaces deterministic issues so the audit doesn't reinvent regex per question:
- image sync mismatches (description references "Gambar di atas" vs imageLink state)
- option length variance (longest > 1.5x shortest)
- bare-stem verbs / slang / KBBI tidak baku
- banned option patterns ("semua jawaban benar", etc.)
- number formatting (English decimal point in GHz/Mbps/etc.)
- key-position skew (per level)
- description sentence count

Usage:
    python scripts/prescan.py                              # default: cli/content/data/prod
    python scripts/prescan.py path/to/dir
    python scripts/prescan.py --md                         # markdown output
    python scripts/prescan.py --md --severity p1           # only must-fix items
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_DIR = "cli/content/data/prod"

# --- patterns --------------------------------------------------------------

# Slang / KBBI tidak baku — high-confidence (should always be fixed)
SLANG_OR_NONBAKU = [
    (r"\bbongkar\b", "B1: 'bongkar' (colloquial) -> 'cari tahu' / 'uraikan'"),
    (r"\blemot\b", "B1: 'lemot' (slang, bukan KBBI) -> 'lambat'"),
    (r"\bkonek\b", "B1: 'konek' (klip tidak baku) -> 'tersambung' / 'terkoneksi'"),
    (r"\bngga\b|\bkagak\b|\bgak\b", "B1: bentuk lisan 'ngga/kagak/gak' -> 'tidak'"),
    (r"\bpraktek\b", "B1: 'praktek' -> 'praktik' (KBBI)"),
    (r"\banalisa\b", "B1: 'analisa' -> 'analisis' (KBBI)"),
    (r"\bsistim\b", "B1: 'sistim' -> 'sistem' (KBBI)"),
    (r"\bfrekwensi\b", "B1: 'frekwensi' -> 'frekuensi' (KBBI)"),
    (r"\bjaman\b", "B1: 'jaman' -> 'zaman' (KBBI)"),
    (r"\bmetoda\b", "B1: 'metoda' -> 'metode' (KBBI)"),
    (r"\byg\b|\bdgn\b|\bkrn\b|\btdk\b|\bklo\b", "B1: singkatan SMS"),
    (r"\bdipake\b", "B1: 'dipake' (lisan) -> 'dipakai'"),
    (r"\bnyambung\b", "B1: 'nyambung' (lisan) -> 'tersambung'"),
    (r"\bnyala\b(?!kan|i\b)", "B1: 'nyala' bare stem -> 'menyala' / 'menyalakan' (cek konteks)"),
    (r"\bpancar\b(?!an|kan|i\b)", "B1: 'pancar' bare stem -> 'memancarkan' (per koreksi ahli)"),
]

# Lower-confidence flags — context-dependent, may be a real word in another sense
CONTEXT_HINTS = [
    (r"\btetangga\b", "B4: 'tetangga' kiasan jaringan tetangga -> 'jaringan lain di sekitar' (cek konteks)"),
    (r"\bsering punya\b", "B1: 'sering punya' (lisan) -> 'mempunyai'"),
    (r"\bbisa jalan\b", "B1: 'bisa jalan' metafora konektivitas -> 'bisa terkoneksi'"),
    (r"\bpas\s+(hujan|jalan|nyala|rusak|panas|sore|pagi|malam)\b", "B1: 'pas' lisan -> 'saat' / 'ketika'"),
]

# K2 negasi ganda — pokok soal harus pakai negasi tunggal
DOUBLE_NEGATION_PATTERNS = [
    (r"\bbukan\s+tidak\b", "K2: negasi ganda 'bukan tidak'"),
    (r"\btidak\s+bukan\b", "K2: negasi ganda 'tidak bukan'"),
    (r"\bjangan\s+tidak\b", "K2: negasi ganda 'jangan tidak'"),
]

# K1/K6 stem grammar tip-off — diakhiri kata yang membatasi opsi
STEM_TIP_PATTERNS = [
    (r"\bsebuah\s*\.{3,}\s*$", "K6: stem berakhir 'sebuah...' (memberi petunjuk gramatikal singular)"),
    (r"\bsuatu\s*\.{3,}\s*$", "K6: stem berakhir 'suatu...' (memberi petunjuk gramatikal)"),
    (r"^(Tentang|Mengenai|Berikut(?!\s+ini\s+yang)|Apa\s+yang\s+dimaksud)\b", "K1: stem mulai vague — pokok soal tidak tegas"),
]

# B5 konsistensi istilah — pasangan ID/EN yang sering bercampur
TERM_PAIRS = [
    ("paket", "packet"),
    ("jaringan", "network"),
    ("lapisan", "layer"),
    ("kabel", "cable"),
    ("alamat", "address"),
    ("antena", "antenna"),
    ("pengguna", "user"),
    ("kecepatan", "speed"),
    ("perangkat", "device"),
    ("nirkabel", "wireless"),
    ("kanal", "channel"),
    ("frekuensi", "frequency"),
    ("rentang", "range"),
    ("gambar", "image"),
]

# Stop words (untuk RF1 content-word matching)
STOP_WORDS = {
    "adalah", "yang", "dan", "atau", "di", "ke", "dari", "pada", "untuk",
    "dengan", "ini", "itu", "akan", "telah", "dapat", "merupakan", "yaitu",
    "ialah", "saat", "ketika", "para", "agar", "supaya", "oleh", "kepada",
    "sebagai", "bagi", "atas", "bawah", "dalam", "luar", "antara", "antar",
}

# Connector kata di pokok soal yang memisahkan subjek dari pelengkap
STEM_CONNECTORS = re.compile(
    r"\s+(adalah|artinya|yaitu|ialah|merupakan|berfungsi|bertugas|disebut|memiliki)\b",
    re.IGNORECASE,
)

# Banned option patterns
BANNED_OPTION = [
    (r"semua jawaban (di atas )?benar", "K3: 'semua jawaban benar' dilarang"),
    (r"semua jawaban (di atas )?salah", "K3: 'semua jawaban salah' dilarang"),
    (r"tidak ada jawaban yang benar", "K3: 'tidak ada jawaban yang benar' dilarang"),
    (r"jawaban [a-d] dan [a-d] benar", "K3: 'jawaban X dan Y benar' dilarang"),
]

# English decimal point inside Indonesian unit (PUEBI: pakai koma)
NUMBER_FORMAT = (
    r"\b\d+\.\d+\s*(GHz|Mbps|Gbps|MHz|kHz|KB|MB|GB)\b",
    "PUEBI: pakai koma desimal, bukan titik (mis. '2,4 GHz' bukan '2.4 GHz')",
)

# Image hint phrases in description
IMAGE_REF_PHRASES = re.compile(
    r"gambar\s+di\s+atas|lihat\s+gambar|perhatikan\s+gambar|pada\s+gambar",
    re.IGNORECASE,
)

# Filename keyword -> required concept words in description
IMAGE_KEYWORDS = {
    "three-way-handshake": ["handshake", "syn", "ack", "koneksi", "bangun"],
    "tcp-vs-udp": ["udp", "tcp"],
    "tcp-ip-layers": ["lapisan", "layer"],
    "tcp-segment": ["segmen", "tcp"],
    "segmentation-reassembly": ["paket", "pecah", "potongan", "segmen", "terbelah"],
    "ipv4-format": ["oktet", "32 bit", "format", "desimal", "ipv4"],
    "ipv4-classes": ["kelas"],
    "public-vs-private-ip": ["publik", "privat"],
    "static-vs-dynamic-ip": ["statis", "dinamis", "tetap", "berubah"],
    "ipv4-vs-ipv6": ["ipv4", "ipv6", "32", "128", "heksadesimal"],
    "ip-routing": ["routing", "jalur", "router"],
    "uni-broad-multi-anycast": ["unicast", "broadcast", "multicast", "anycast", "metode pengalamatan", "point"],
    "dhcp-dora": ["dhcp", "otomatis"],
    "wlan-overview": ["wlan", "nirkabel", "wireless", "jaringan"],
    "wlan-channels": ["kanal", "channel", "frekuensi"],
    "wlan-interference": ["interferensi", "gangguan", "sumber"],
    "wlan-security-risk": ["keamanan", "sadap", "rahasia", "risiko"],
    "ieee80211-comparison": ["802.11", "standar", "tabel"],
    "mimo-vs-mumimo": ["mimo", "antena", "mu-mimo"],
    "wlan-architecture": ["access point", " ap ", "arsitektur"],
    "adhoc-vs-infra": ["ad-hoc", "adhoc", "infrastructure", "infra", "mode koneksi"],
    "antenna-patterns": ["antena", "pola"],
    "nic-types": ["nic", "kartu", "usb", "wireless lan"],
    "channel-overlap": ["channel", "kanal", "overlap", "non-overlap"],
    "ssid-setup": ["ssid", "menu"],
    "wep-wpa-comparison": ["wep", "wpa", "enkripsi", "standar"],
}


def expected_keywords(image_link: str | None) -> list[str]:
    if not image_link:
        return []
    for key, kws in IMAGE_KEYWORDS.items():
        if key in image_link:
            return kws
    return []


def short(text: str, n: int = 200) -> str:
    return text if len(text) <= n else text[:n] + "..."


NOUN_LIKE_VERB_PREFIX = {
    # Look like verbs (start with me-/ber-/ter-/di-) but are actually nouns.
    "metode", "media", "metro", "menu", "meter", "menara", "menit", "merek",
    "mesin", "memo", "memori", "merah",
    "berita", "berkas", "berkah", "bersih",
    "teras", "terminal", "terapi", "terbang",
    "dinding", "dingin", "dinas", "diet", "diktat", "dioda", "dialog", "dia",
}


def first_word_category(text: str) -> str:
    """Best-effort POS-like category for an option's first word.

    Indonesian verb prefixes are usually reliable in this domain, but some common
    nouns share the same starting morphemes (e.g. 'Metode', 'Dinding'). Those are
    handled by an explicit whitelist.
    """
    if not text or not text.strip():
        return "empty"
    first_raw = text.strip().split()[0]
    first = first_raw.rstrip(",.?!:;").lower()
    if first in {"untuk", "dalam", "dengan", "pada", "kepada", "oleh", "ke", "dari", "sejak", "tanpa"}:
        return "preposition"
    if first_raw[0].isdigit():
        return "number"
    if first in NOUN_LIKE_VERB_PREFIX:
        return "noun"
    for prefix in ("memper", "diper", "meng", "men", "mem", "ber", "ter", "di"):
        if first.startswith(prefix) and len(first) > len(prefix) + 2:
            return "verb"
    if first.startswith("me") and len(first) > 4 and first[2] in "lmnrwy":
        return "verb"
    if first_raw[0].isupper():
        return "noun"
    return "other"


def check_parallelism(options: list[dict]) -> str | None:
    """Return a description of mismatched first-word categories, or None."""
    cats = [first_word_category(opt.get("text", "")) for opt in options]
    distinct = {c for c in cats if c not in {"empty", "other"}}
    if len(distinct) > 1:
        breakdown = " | ".join(f"{chr(65+i)}={c}" for i, c in enumerate(cats))
        return breakdown
    return None


def extract_stem_subject(qtext: str) -> str:
    """Pull the subject portion of a stem (before adalah/artinya/yaitu/...)."""
    if not qtext:
        return ""
    cleaned = qtext.strip().rstrip("?")
    cleaned = re.sub(r"\.{2,}\s*$", "", cleaned).strip()
    m = STEM_CONNECTORS.search(cleaned)
    if m:
        subject = cleaned[: m.start()].strip()
        if subject:
            return subject
    return cleaned


def stem_subject_in_description(qtext: str, description: str) -> bool:
    """RF1: at least one content word from the stem subject appears in description.

    Tokenizer keeps technical terms intact ("802.11a", "Wi-Fi", "MU-MIMO", "TCP/IP")
    so a stem like "Ciri utama 802.11a" properly matches a description mentioning 802.11a.
    """
    subject = extract_stem_subject(qtext)
    if not subject or not description:
        return True
    tokens = re.findall(r"[A-Za-z0-9][A-Za-z0-9.\-/]*", subject)
    content = [
        t for t in tokens
        if t.lower() not in STOP_WORDS
        and len(t) > 2
        and not t.replace(".", "").replace("-", "").isdigit()
    ]
    if not content:
        return True
    desc_lower = description.lower()
    return any(t.lower() in desc_lower for t in content)


def description_ends_with_cta(description: str) -> bool:
    """RF2: description final sentence should be an imperative CTA (ends with !).

    The dataset's house style is to end every description with '!'. A trailing '.'
    suggests the CTA was missed.
    """
    if not description:
        return True
    stripped = description.strip()
    return stripped.endswith("!") or stripped.endswith("?")


def find_term_inconsistencies(texts: list[str]) -> list[tuple[str, str]]:
    """Return list of (id_term, en_term) pairs where BOTH appear across texts."""
    blob = " ".join(texts).lower()
    hits: list[tuple[str, str]] = []
    for id_t, en_t in TERM_PAIRS:
        if re.search(rf"\b{re.escape(id_t)}\b", blob) and re.search(
            rf"\b{re.escape(en_t)}\b", blob
        ):
            hits.append((id_t, en_t))
    return hits


def scan_question(file: str, level: int, qidx: int, q: dict) -> list[dict]:
    findings: list[dict] = []
    desc = q.get("description") or ""
    qtext = q.get("question") or ""
    options = q.get("options") or []
    image_link = q.get("imageLink")

    # 1. Image sync
    has_phrase = bool(IMAGE_REF_PHRASES.search(desc))
    if image_link is None and has_phrase:
        findings.append({
            "field": "description",
            "rule": "K8 (image sync: imageLink null tapi deskripsi merujuk gambar)",
            "evidence": "description contains image-reference phrase but imageLink is null",
            "snippet": short(desc),
            "severity": "P1",
        })
    elif image_link is not None:
        kws = expected_keywords(image_link)
        if kws:
            text_lc = desc.lower()
            if not any(kw in text_lc for kw in kws):
                fname = image_link.split("/")[-1]
                findings.append({
                    "field": "description",
                    "rule": "K8 (image sync: konsep gambar tidak tersinggung di deskripsi)",
                    "evidence": f"image is {fname}; expected one of {kws}",
                    "snippet": short(desc),
                    "severity": "P1",
                })

    # 2. Slang / non-baku in description and question (high-confidence)
    for field, text in [("description", desc), ("question", qtext)]:
        for pat, msg in SLANG_OR_NONBAKU:
            for m in re.finditer(pat, text, re.IGNORECASE):
                findings.append({
                    "field": field,
                    "rule": msg,
                    "evidence": f"match: '{m.group(0)}'",
                    "snippet": short(text),
                    "severity": "P1",
                })
        for pat, msg in CONTEXT_HINTS:
            for m in re.finditer(pat, text, re.IGNORECASE):
                findings.append({
                    "field": field,
                    "rule": msg,
                    "evidence": f"match: '{m.group(0)}'",
                    "snippet": short(text),
                    "severity": "P2",
                })
        # Number format in description/question
        pat, msg = NUMBER_FORMAT
        for m in re.finditer(pat, text):
            findings.append({
                "field": field,
                "rule": msg,
                "evidence": f"match: '{m.group(0)}'",
                "snippet": short(text),
                "severity": "P2",
            })

    # 3. Banned option patterns + number format in options
    for i, opt in enumerate(options):
        text = opt.get("text", "")
        for pat, msg in BANNED_OPTION:
            if re.search(pat, text, re.IGNORECASE):
                findings.append({
                    "field": f"options[{i}].text (Opsi {chr(65+i)})",
                    "rule": msg,
                    "evidence": f"matched pattern",
                    "snippet": short(text),
                    "severity": "P1",
                })
        pat, msg = NUMBER_FORMAT
        for m in re.finditer(pat, text):
            findings.append({
                "field": f"options[{i}].text (Opsi {chr(65+i)})",
                "rule": msg,
                "evidence": f"match: '{m.group(0)}'",
                "snippet": short(text),
                "severity": "P2",
            })

    # 4. Option length variance
    if options:
        lens = [len(opt.get("text", "")) for opt in options]
        if min(lens) > 0:
            ratio = max(lens) / min(lens)
            if ratio > 1.5:
                imax = lens.index(max(lens))
                imin = lens.index(min(lens))
                breakdown = " | ".join(
                    f"{chr(65+i)}: {n}" for i, n in enumerate(lens)
                )
                findings.append({
                    "field": "options[*].text",
                    "rule": "K5 (panjang opsi tidak homogen)",
                    "evidence": (
                        f"longest {max(lens)} (Opsi {chr(65+imax)}), "
                        f"shortest {min(lens)} (Opsi {chr(65+imin)}), "
                        f"ratio {ratio:.2f}x (>1.5x)"
                    ),
                    "snippet": breakdown,
                    "severity": "P2",
                })

    # 5. Description sentence count
    sentences = [s for s in re.split(r"(?<=[.!?])\s+", desc.strip()) if s]
    if len(sentences) < 2:
        findings.append({
            "field": "description",
            "rule": "Description shape: hanya 1 kalimat (minimal hook + CTA)",
            "evidence": f"{len(sentences)} sentence(s)",
            "snippet": short(desc),
            "severity": "P2",
        })

    # 6. Question stem ends with elipsis or '?'
    if qtext and not re.search(r"(\.{3}|\?)\s*$", qtext.strip()):
        findings.append({
            "field": "question",
            "rule": "K1 (stem konvensi): akhiri dengan '...' atau '?'",
            "evidence": f"ends with '{qtext.strip()[-3:]}'",
            "snippet": short(qtext),
            "severity": "P2",
        })

    # 7. K2 negasi ganda di pokok soal & deskripsi
    for field, text in [("description", desc), ("question", qtext)]:
        for pat, msg in DOUBLE_NEGATION_PATTERNS:
            for m in re.finditer(pat, text, re.IGNORECASE):
                findings.append({
                    "field": field,
                    "rule": msg,
                    "evidence": f"match: '{m.group(0)}'",
                    "snippet": short(text),
                    "severity": "P1",
                })

    # 8. K1/K6 stem grammar tip-off
    for pat, msg in STEM_TIP_PATTERNS:
        if re.search(pat, qtext.strip()):
            findings.append({
                "field": "question",
                "rule": msg,
                "evidence": f"stem pattern hit",
                "snippet": short(qtext),
                "severity": "P2",
            })

    # 9. K4 paralelisme grammatikal opsi
    if len(options) >= 2:
        breakdown = check_parallelism(options)
        if breakdown:
            findings.append({
                "field": "options[*].text",
                "rule": "K4 (paralelisme: kategori awal opsi tidak seragam)",
                "evidence": breakdown,
                "snippet": " | ".join(
                    short(opt.get("text", ""), 40) for opt in options
                ),
                "severity": "P2",
            })

    # 10. B5 konsistensi istilah dalam satu soal (lintas description/question/options)
    all_texts = [desc, qtext] + [opt.get("text", "") for opt in options]
    inconsistencies = find_term_inconsistencies(all_texts)
    for id_t, en_t in inconsistencies:
        findings.append({
            "field": "question (cross-field)",
            "rule": f"B5 (inkonsistensi istilah): '{id_t}' dan '{en_t}' bercampur",
            "evidence": f"both '{id_t}' (ID) and '{en_t}' (EN) appear in this question",
            "snippet": f"pilih salah satu: '{id_t}' atau '{en_t}'",
            "severity": "P2",
        })

    # 11. RF1 (river flow): subjek pokok soal harus muncul di description
    if qtext and desc and not stem_subject_in_description(qtext, desc):
        subject = extract_stem_subject(qtext)
        findings.append({
            "field": "description",
            "rule": "RF1 (river flow: subjek pokok soal tidak tersinggung di deskripsi)",
            "evidence": f"stem subject '{short(subject, 60)}' has no content word in description",
            "snippet": short(desc),
            "severity": "P2",
        })

    # 12. RF2 (river flow): description final sentence harus CTA imperatif (!)
    if desc and not description_ends_with_cta(desc):
        findings.append({
            "field": "description",
            "rule": "RF2 (river flow: deskripsi tidak diakhiri CTA imperatif '!')",
            "evidence": f"ends with '{desc.strip()[-3:]}'",
            "snippet": short(desc),
            "severity": "P2",
        })

    return [{"file": file, "level": level, "question": qidx, **f} for f in findings]


def scan_chapter(path: Path) -> tuple[list[dict], dict[int, list[str]]]:
    data = json.loads(path.read_text())
    findings: list[dict] = []
    key_positions: dict[int, list[str]] = {}
    for level in data.get("levels", []):
        lvl_num = level.get("level")
        key_positions.setdefault(lvl_num, [])
        for qidx, q in enumerate(level.get("questions", []), start=1):
            findings.extend(scan_question(path.name, lvl_num, qidx, q))
            for i, opt in enumerate(q.get("options", [])):
                if opt.get("isCorrect"):
                    key_positions[lvl_num].append(chr(65 + i))
                    break
    return findings, key_positions


def render_markdown(
    findings: list[dict],
    key_positions: dict[str, dict[int, list[str]]],
) -> str:
    out: list[str] = []
    p1 = sum(1 for f in findings if f["severity"] == "P1")
    p2 = sum(1 for f in findings if f["severity"] == "P2")
    out.append(f"# Prescan — {len(findings)} candidate findings")
    out.append("")
    out.append(f"**P1** (must review): {p1} — image sync, slang, banned options, KBBI tidak baku")
    out.append(f"**P2** (polish): {p2} — option length, number format, context hints, description shape")
    out.append("")
    out.append("Use this as a starting list; the agent still applies semantic judgment per finding (e.g. 'tetangga' may be acceptable in a literal sense). Items not flagged here still need a human/LLM pass for V1/V2/V3 (Voice & Journey), M1-M4 (materi), and B3/B4 (ambiguity, kiasan).")
    out.append("")

    by_file: dict[str, list[dict]] = {}
    for f in findings:
        by_file.setdefault(f["file"], []).append(f)
    for file, fs in by_file.items():
        out.append(f"## {file}")
        by_lvl: dict[int, list[dict]] = {}
        for f in fs:
            by_lvl.setdefault(f["level"], []).append(f)
        for lvl in sorted(by_lvl):
            out.append("")
            out.append(f"### Level {lvl}")
            for f in by_lvl[lvl]:
                tag = "P1" if f["severity"] == "P1" else "P2"
                out.append(
                    f"- [{tag}] **Q{f['question']} · {f['field']}** — {f['rule']}"
                )
                out.append(f"    - {f['evidence']}")
                out.append(f"    - snippet: `{f['snippet']}`")
        kps = key_positions.get(file, {})
        if kps:
            out.append("")
            out.append("#### Key positions per level (flag if all same)")
            for lvl, positions in sorted(kps.items()):
                unique = set(positions)
                tag = "WARN-all-same" if len(unique) == 1 and len(positions) > 1 else "ok"
                out.append(f"- Level {lvl}: {' '.join(positions)} [{tag}]")
        out.append("")
    return "\n".join(out)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "dir",
        nargs="?",
        default=DEFAULT_DIR,
        help=f"Directory containing chapter-*.json files (default: {DEFAULT_DIR})",
    )
    parser.add_argument("--md", action="store_true", help="Output markdown (default: JSON)")
    parser.add_argument(
        "--severity",
        choices=["p1", "p2", "all"],
        default="all",
        help="Filter findings by severity",
    )
    args = parser.parse_args()

    root = Path(args.dir)
    if not root.is_dir():
        print(f"prescan: not a directory: {root}", file=sys.stderr)
        return 1
    chapter_files = sorted(p for p in root.glob("chapter-*.json"))
    if not chapter_files:
        print(f"prescan: no chapter-*.json under {root}", file=sys.stderr)
        return 1

    all_findings: list[dict] = []
    all_key_positions: dict[str, dict[int, list[str]]] = {}
    for cf in chapter_files:
        findings, key_positions = scan_chapter(cf)
        all_findings.extend(findings)
        all_key_positions[cf.name] = key_positions

    if args.severity != "all":
        wanted = "P1" if args.severity == "p1" else "P2"
        all_findings = [f for f in all_findings if f["severity"] == wanted]

    if args.md:
        print(render_markdown(all_findings, all_key_positions))
    else:
        result = {
            "summary": {
                "files": [cf.name for cf in chapter_files],
                "total_findings": len(all_findings),
                "p1": sum(1 for f in all_findings if f["severity"] == "P1"),
                "p2": sum(1 for f in all_findings if f["severity"] == "P2"),
            },
            "findings": all_findings,
            "key_positions": all_key_positions,
        }
        print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
