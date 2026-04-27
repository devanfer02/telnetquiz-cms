#!/usr/bin/env python3
"""Pre-scan TelNetQuiz chapter JSONs for mechanical signals consumed by validasi-konten.

Emits ONLY signals (data inputs for LLM scoring), not findings. Output is JSON.

Signals:
- term_first_occurrence: per chapter, first appearance of technical term in question text
  (vs in studyMaterial). Feeds S1 (Term Familiarity).
- sentence_lengths: word count per sentence in description+question. Feeds S3 (Cognitive Load).
- distinct_concepts_per_level: rough count of distinct concept-bearing nouns across questions
  in a level. Feeds G5 (Indicator Coverage).
- option_register: per question, longest/shortest option char ratio + "obvious distractor" hints.
  Feeds G4 sanity check.

Usage:
    python scripts/prescan.py                    # default dir, JSON to stdout
    python scripts/prescan.py path/to/dir
    python scripts/prescan.py --pretty           # indented JSON
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

DEFAULT_DIR = "cli/content/data/prod"

TECHNICAL_TERMS = [
    # TCP/IP
    "TCP", "UDP", "IP", "TCP/IP", "OSI", "handshake", "SYN", "ACK", "FIN",
    "segmen", "paket", "datagram", "encapsulation", "encapsulasi",
    "lapisan", "layer", "protokol", "port",
    "DNS", "DHCP", "ARP", "ICMP", "HTTP", "HTTPS", "FTP", "SMTP",
    # IP addressing
    "oktet", "subnet", "netmask", "gateway", "kelas A", "kelas B", "kelas C",
    "publik", "privat", "statis", "dinamis", "IPv4", "IPv6", "heksadesimal",
    "unicast", "broadcast", "multicast", "anycast",
    "routing", "router", "switch", "hub", "bridge", "repeater", "NIC",
    # WLAN
    "WLAN", "Wi-Fi", "wireless", "nirkabel", "SSID", "BSSID", "AP", "access point",
    "802.11", "2.4 GHz", "5 GHz", "kanal", "channel", "frekuensi",
    "interferensi", "MIMO", "MU-MIMO", "OFDM",
    "WEP", "WPA", "WPA2", "WPA3", "enkripsi",
    "ad-hoc", "infrastructure", "infrastruktur", "antena",
    "omnidireksional", "direksional", "beamforming",
    # Media
    "UTP", "STP", "fiber", "optik", "coaxial", "kabel", "RJ45",
]


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[.!?])\s+|\s*\.{3,}\s*", text.strip())
    return [s.strip() for s in parts if s.strip()]


def count_words(text: str) -> int:
    return len(re.findall(r"\S+", text))


def strip_html(html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def find_terms(text: str) -> list[str]:
    found = []
    lower = text.lower()
    for term in TECHNICAL_TERMS:
        pattern = r"\b" + re.escape(term.lower()) + r"\b"
        if re.search(pattern, lower):
            found.append(term)
    return found


def scan_chapter(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    chapter_terms_in_study: set[str] = set()
    chapter_terms_in_questions: dict[str, dict] = {}
    levels_out = []

    for level in data.get("levels", []):
        level_num = level.get("level")
        questions = level.get("questions", [])
        level_concepts: set[str] = set()
        questions_out = []

        for qidx, q in enumerate(questions):
            description = q.get("description", "") or ""
            question = q.get("question", "") or ""
            study = q.get("studyMaterial") or {}
            study_text = strip_html(study.get("content", "") or "")
            options = q.get("options", []) or []

            study_terms = find_terms(study_text)
            chapter_terms_in_study.update(study_terms)

            qa_text = description + " " + question
            qa_terms = find_terms(qa_text)
            opts_terms: list[str] = []
            for o in options:
                opts_terms.extend(find_terms(o.get("text", "") or ""))
            all_q_terms = set(qa_terms) | set(opts_terms)

            new_terms_here = []
            for term in all_q_terms:
                if term not in chapter_terms_in_study and term not in chapter_terms_in_questions:
                    new_terms_here.append(term)
                    chapter_terms_in_questions[term] = {
                        "level": level_num,
                        "qidx": qidx,
                    }

            sentences = split_sentences(description) + split_sentences(question)
            sent_lengths = [count_words(s) for s in sentences]
            longest_sentence = max(sent_lengths) if sent_lengths else 0

            opt_lens = [len(o.get("text", "") or "") for o in options]
            ratio = (max(opt_lens) / min(opt_lens)) if opt_lens and min(opt_lens) > 0 else None

            level_concepts.update(qa_terms)

            questions_out.append({
                "qidx": qidx,
                "question_preview": (question or description)[:80],
                "new_terms_introduced_here": new_terms_here,
                "sentence_lengths": sent_lengths,
                "longest_sentence_words": longest_sentence,
                "option_length_ratio": ratio,
                "image_link_present": q.get("imageLink") is not None,
            })

        levels_out.append({
            "level": level_num,
            "difficulty": level.get("difficulty"),
            "title": level.get("title"),
            "distinct_concepts": sorted(level_concepts),
            "distinct_concept_count": len(level_concepts),
            "question_count": len(questions),
            "questions": questions_out,
        })

    return {
        "file": path.name,
        "chapter_title": data.get("chapter", {}).get("title"),
        "studyMaterial_terms_seen": sorted(chapter_terms_in_study),
        "levels": levels_out,
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("dir", nargs="?", default=DEFAULT_DIR)
    parser.add_argument("--pretty", action="store_true")
    args = parser.parse_args(argv)

    target = Path(args.dir)
    if not target.is_dir():
        print(f"error: directory not found: {target}", file=sys.stderr)
        return 1

    files = sorted(target.glob("chapter-*.json"))
    if not files:
        print(f"error: no chapter-*.json under {target}", file=sys.stderr)
        return 1

    chapters = [scan_chapter(f) for f in files]
    out = {"chapters": chapters}

    if args.pretty:
        print(json.dumps(out, indent=2, ensure_ascii=False))
    else:
        print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
