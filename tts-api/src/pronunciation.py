"""
Pronunciation preprocessing for Indonesian TTS (edge-tts id-ID-ArdiNeural).

The Indonesian neural voice reads English acronyms/abbreviations using Indonesian
letter names (e.g. "IP" → "i pé" instead of "ai pi"). This module rewrites
technical terms into phonetic Indonesian spelling so the TTS produces the
correct English pronunciation that Indonesian students expect to hear.
"""

import re

# Mapping: original term → phonetic Indonesian spelling for correct TTS output.
# Order matters: longer/more-specific terms must come before shorter substrings
# (e.g. "TCP/IP" before "TCP" before "IP").
#
# The replacement values are written in Indonesian orthography so that the
# id-ID voice reads them with the intended English sounds.
TERM_PRONUNCIATIONS: list[tuple[str, str]] = [
    # ── Compound / slash-separated terms (match first) ────────────────
    ("TCP/IP", "ti si pi/ai pi"),
    ("SYN-ACK", "sin ek"),
    ("HTTP/HTTPS", "eich ti ti pi/eich ti ti pi es"),
    ("CSMA/CD", "si es em ei/si di"),
    ("MU-MIMO", "em yu maimo"),

    # ── Multi-word / versioned terms ──────────────────────────────────
    ("WPA2-Personal", "dabliyu pi ei dua personal"),
    ("WPA3-Personal", "dabliyu pi ei tiga personal"),
    ("802.11ac", "delapan nol dua titik sebelas ei si"),
    ("802.11n", "delapan nol dua titik sebelas en"),
    ("802.11g", "delapan nol dua titik sebelas ji"),
    ("802.11b", "delapan nol dua titik sebelas bi"),
    ("802.11a", "delapan nol dua titik sebelas ei"),
    ("IEEE 802.11", "ai tripel i delapan nol dua titik sebelas"),
    ("Wi-Fi 5", "wai fai lima"),
    ("Wi-Fi 4", "wai fai empat"),
    ("Wi-Fi", "wai fai"),

    # ── Protocols & standards (longer first) ──────────────────────────
    ("HTTPS", "eich ti ti pi es"),
    ("HTTP", "eich ti ti pi"),
    ("SMTP", "es em ti pi"),
    ("DHCP", "di eich si pi"),
    ("ICMP", "ai si em pi"),
    ("OFDM", "o ef di em"),
    ("FDMA", "ef di em ei"),
    ("TDMA", "ti di em ei"),
    ("CSMA", "si es em ei"),
    ("TKIP", "ti kei ai pi"),
    ("PCMCIA", "pi si em si ai ei"),
    ("TCP", "ti si pi"),
    ("UDP", "yu di pi"),
    ("FTP", "ef ti pi"),
    ("DNS", "di en es"),
    ("ARP", "ei ar pi"),
    ("NAT", "en ei ti"),
    ("VoIP", "vo ai pi"),
    ("IoT", "ai o ti"),

    # ── IP versions ───────────────────────────────────────────────────
    ("IPv6", "ai pi versi enam"),
    ("IPv4", "ai pi versi empat"),
    ("IP", "ai pi"),

    # ── Networking terms ──────────────────────────────────────────────
    ("WLAN", "wireless len"),
    ("SSID", "es es ai di"),
    ("IEEE", "ai tripel i"),
    ("MIMO", "maimo"),
    ("IBSS", "ai bi es es"),
    ("BSS", "bi es es"),
    ("NIC", "en ai si"),
    ("MAC", "em ei si"),
    ("LAN", "len"),
    ("ISP", "ai es pi"),
    ("DSL", "di es el"),
    ("WEP", "dabliyu i pi"),
    ("WPA3", "dabliyu pi ei tiga"),
    ("WPA2", "dabliyu pi ei dua"),
    ("WPA", "dabliyu pi ei"),
    ("AES", "ei i es"),
    ("ACK", "ek"),
    ("SYN", "sin"),
    ("RFC", "ar ef si"),

    # ── Hardware / interface ──────────────────────────────────────────
    ("USB", "yu es bi"),
    ("PCI", "pi si ai"),
    ("UTP", "yu ti pi"),
    ("AP", "ei pi"),

    # ── Units ─────────────────────────────────────────────────────────
    ("Gbps", "giga bit per sekon"),
    ("Mbps", "mega bit per sekon"),
    ("GHz", "giga hertz"),
    ("MHz", "mega hertz"),
    ("dBi", "di bi ai"),
    ("dB", "desibel"),
]

# Pre-compile a single regex that matches any term as a whole word.
# We use word-boundary-like logic: each term is escaped and wrapped so that
# it only matches when not embedded inside a longer word.
_pattern = re.compile(
    "|".join(
        # For terms that start/end with word chars, enforce boundaries.
        # For terms containing "/" or "-", they naturally won't appear
        # inside normal words, but boundaries still help.
        r"(?<![A-Za-z0-9/])" + re.escape(term) + r"(?![A-Za-z0-9])"
        for term, _ in TERM_PRONUNCIATIONS
    )
)

# Build a dict for O(1) lookup during replacement.
_lookup: dict[str, str] = {term: replacement for term, replacement in TERM_PRONUNCIATIONS}


def preprocess_for_tts(text: str) -> str:
    """Replace technical terms with phonetic Indonesian equivalents.

    The regex matches terms in priority order (longest/most-specific first),
    so "TCP/IP" is replaced before "TCP" or "IP" individually.
    """

    def _replace(match: re.Match[str]) -> str:
        return _lookup[match.group(0)]

    return _pattern.sub(_replace, text)
