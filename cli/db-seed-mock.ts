import { faker } from "@faker-js/faker";
import {
	hashPassword,
	generateRandomString,
} from "better-auth/crypto";
import { asc, eq, inArray, like } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
	chapters,
	quizzes,
	questions,
	options,
	studyMaterials,
	schools,
	users,
	accounts,
	submissions,
	pretestSubmissions,
} from "../src/database/schema";

// ============================================================================
// STUDY MATERIALS DATA
// ============================================================================

const studyMaterialsData = [
	// IP Chapter Materials
	{
		title: "Pengenalan Alamat IP",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Ipv4_address.svg/1200px-Ipv4_address.svg.png",
		content: `<h2>Apa Itu Alamat IP?</h2>
<p>Alamat IP (Internet Protocol) adalah serangkaian angka yang digunakan untuk mengidentifikasi perangkat dalam jaringan komputer. Alamat IP berfungsi seperti alamat rumah yang memungkinkan data dikirim ke tujuan yang tepat.</p>

<h3>Fungsi Alamat IP</h3>
<ul>
<li><strong>Identifikasi Host:</strong> Memberikan identitas unik pada setiap perangkat dalam jaringan.</li>
<li><strong>Pengalamatan:</strong> Menentukan lokasi perangkat dalam jaringan.</li>
<li><strong>Routing:</strong> Membantu router mengarahkan paket data ke tujuan yang benar.</li>
</ul>

<h3>Jenis Alamat IP</h3>
<p>Terdapat dua versi utama alamat IP:</p>
<ol>
<li><strong>IPv4:</strong> Menggunakan 32 bit, ditulis dalam format desimal bertitik (contoh: 192.168.1.1)</li>
<li><strong>IPv6:</strong> Menggunakan 128 bit, ditulis dalam format heksadesimal (contoh: 2001:0db8:85a3:0000:0000:8a2e:0370:7334)</li>
</ol>`,
	},
	{
		title: "Struktur Alamat IPv4",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/IPv4_address_structure_and_writing_systems-en.svg/1200px-IPv4_address_structure_and_writing_systems-en.svg.png",
		content: `<h2>Struktur Alamat IPv4</h2>
<p>Alamat IPv4 terdiri dari 32 bit yang dibagi menjadi 4 oktet. Setiap oktet terdiri dari 8 bit dan dipisahkan oleh tanda titik.</p>

<h3>Format Penulisan</h3>
<p>Alamat IPv4 ditulis dalam notasi desimal bertitik, contoh: <code>192.168.1.100</code></p>
<ul>
<li>Setiap oktet bernilai 0-255</li>
<li>Total kombinasi: 2^32 = 4.294.967.296 alamat</li>
</ul>

<h3>Bagian Alamat IPv4</h3>
<p>Alamat IPv4 terdiri dari dua bagian:</p>
<ol>
<li><strong>Network ID:</strong> Mengidentifikasi jaringan tempat perangkat berada</li>
<li><strong>Host ID:</strong> Mengidentifikasi perangkat spesifik dalam jaringan tersebut</li>
</ol>

<h3>Kelas Alamat IPv4</h3>
<table>
<tr><th>Kelas</th><th>Rentang Oktet Pertama</th><th>Default Subnet Mask</th></tr>
<tr><td>A</td><td>1-126</td><td>255.0.0.0</td></tr>
<tr><td>B</td><td>128-191</td><td>255.255.0.0</td></tr>
<tr><td>C</td><td>192-223</td><td>255.255.255.0</td></tr>
</table>`,
	},
	{
		title: "Konsep Subnetting",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Subnetting_Concept-en.svg/1200px-Subnetting_Concept-en.svg.png",
		content: `<h2>Apa Itu Subnetting?</h2>
<p>Subnetting adalah teknik membagi jaringan besar menjadi beberapa jaringan kecil (subnet) untuk meningkatkan efisiensi dan keamanan jaringan.</p>

<h3>Tujuan Subnetting</h3>
<ul>
<li><strong>Efisiensi Alamat IP:</strong> Mengoptimalkan penggunaan alamat IP yang tersedia</li>
<li><strong>Mengurangi Broadcast:</strong> Membatasi domain broadcast untuk meningkatkan performa</li>
<li><strong>Keamanan:</strong> Memisahkan segmen jaringan untuk kontrol akses yang lebih baik</li>
<li><strong>Organisasi:</strong> Memudahkan pengelolaan jaringan berdasarkan departemen atau fungsi</li>
</ul>

<h3>Subnet Mask</h3>
<p>Subnet mask digunakan untuk memisahkan Network ID dan Host ID. Contoh subnet mask:</p>
<ul>
<li><code>/24</code> = 255.255.255.0 (256 alamat, 254 host)</li>
<li><code>/25</code> = 255.255.255.128 (128 alamat, 126 host)</li>
<li><code>/26</code> = 255.255.255.192 (64 alamat, 62 host)</li>
</ul>

<h3>Rumus Perhitungan</h3>
<p>Jumlah host yang tersedia = 2^n - 2, dengan n adalah jumlah bit host.</p>`,
	},
	{
		title: "Alamat IPv6",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Ipv6_address_leading_zeros.svg/1200px-Ipv6_address_leading_zeros.svg.png",
		content: `<h2>Pengenalan IPv6</h2>
<p>IPv6 (Internet Protocol version 6) adalah versi terbaru dari protokol internet yang dikembangkan untuk menggantikan IPv4 karena keterbatasan jumlah alamat.</p>

<h3>Karakteristik IPv6</h3>
<ul>
<li><strong>Panjang Alamat:</strong> 128 bit (dibandingkan 32 bit pada IPv4)</li>
<li><strong>Notasi:</strong> Heksadesimal, dipisahkan dengan titik dua (:)</li>
<li><strong>Jumlah Alamat:</strong> 2^128 = 340 undecillion alamat</li>
</ul>

<h3>Format Alamat IPv6</h3>
<p>Contoh: <code>2001:0db8:85a3:0000:0000:8a2e:0370:7334</code></p>

<h3>Penyederhanaan Alamat IPv6</h3>
<ol>
<li><strong>Menghilangkan nol di depan:</strong> 0db8 menjadi db8</li>
<li><strong>Kompresi grup nol berurutan:</strong> Menggunakan :: (hanya sekali)</li>
</ol>
<p>Contoh penyederhanaan: <code>2001:db8:85a3::8a2e:370:7334</code></p>

<h3>Jenis Alamat IPv6</h3>
<ul>
<li><strong>Unicast:</strong> Satu-ke-satu</li>
<li><strong>Multicast:</strong> Satu-ke-banyak</li>
<li><strong>Anycast:</strong> Satu-ke-terdekat</li>
</ul>`,
	},
	{
		title: "Alamat IP Privat dan Publik",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Private_network.svg/1200px-Private_network.svg.png",
		content: `<h2>Alamat IP Privat vs Publik</h2>
<p>Alamat IP dibagi menjadi dua kategori utama berdasarkan aksesibilitasnya di internet.</p>

<h3>Alamat IP Publik</h3>
<ul>
<li>Dapat diakses langsung dari internet</li>
<li>Unik secara global</li>
<li>Diberikan oleh ISP (Internet Service Provider)</li>
<li>Digunakan untuk komunikasi antar jaringan</li>
</ul>

<h3>Alamat IP Privat</h3>
<p>Rentang alamat IP privat menurut RFC 1918:</p>
<table>
<tr><th>Kelas</th><th>Rentang</th><th>CIDR</th></tr>
<tr><td>A</td><td>10.0.0.0 - 10.255.255.255</td><td>10.0.0.0/8</td></tr>
<tr><td>B</td><td>172.16.0.0 - 172.31.255.255</td><td>172.16.0.0/12</td></tr>
<tr><td>C</td><td>192.168.0.0 - 192.168.255.255</td><td>192.168.0.0/16</td></tr>
</table>

<h3>NAT (Network Address Translation)</h3>
<p>NAT memungkinkan perangkat dengan IP privat berkomunikasi dengan internet menggunakan IP publik router.</p>`,
	},
	{
		title: "CIDR (Classless Inter-Domain Routing)",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/CIDR_Address.svg/1200px-CIDR_Address.svg.png",
		content: `<h2>Apa Itu CIDR?</h2>
<p>CIDR (Classless Inter-Domain Routing) adalah metode pengalamatan IP yang lebih fleksibel dibandingkan sistem kelas tradisional.</p>

<h3>Notasi CIDR</h3>
<p>Format: <code>alamat_IP/prefix_length</code></p>
<p>Contoh: <code>192.168.1.0/24</code></p>
<ul>
<li>Prefix length menunjukkan jumlah bit untuk Network ID</li>
<li>Sisa bit digunakan untuk Host ID</li>
</ul>

<h3>Keuntungan CIDR</h3>
<ul>
<li><strong>Efisiensi:</strong> Alokasi alamat IP lebih presisi</li>
<li><strong>Agregasi Rute:</strong> Mengurangi ukuran tabel routing</li>
<li><strong>Fleksibilitas:</strong> Tidak terikat pada batasan kelas A, B, atau C</li>
</ul>

<h3>Tabel Referensi CIDR</h3>
<table>
<tr><th>CIDR</th><th>Subnet Mask</th><th>Jumlah Host</th></tr>
<tr><td>/30</td><td>255.255.255.252</td><td>2</td></tr>
<tr><td>/28</td><td>255.255.255.240</td><td>14</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>254</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>65.534</td></tr>
</table>`,
	},
	// Topology Chapter Materials
	{
		title: "Pengenalan Topologi Jaringan",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/NetworkTopologies.svg/1200px-NetworkTopologies.svg.png",
		content: `<h2>Apa Itu Topologi Jaringan?</h2>
<p>Topologi jaringan adalah susunan atau pola hubungan antarperangkat dalam sebuah jaringan komputer, baik secara fisik maupun logis.</p>

<h3>Jenis Topologi</h3>
<ol>
<li><strong>Topologi Fisik:</strong> Tata letak kabel dan perangkat secara nyata</li>
<li><strong>Topologi Logis:</strong> Alur data dalam jaringan</li>
</ol>

<h3>Faktor Pemilihan Topologi</h3>
<ul>
<li>Biaya implementasi dan pemeliharaan</li>
<li>Skalabilitas jaringan</li>
<li>Keandalan dan toleransi kesalahan</li>
<li>Kecepatan transfer data</li>
<li>Kemudahan troubleshooting</li>
</ul>

<h3>Topologi Umum</h3>
<p>Topologi yang sering digunakan meliputi Bus, Star, Ring, Mesh, Tree, dan Hybrid.</p>`,
	},
	{
		title: "Topologi Bus",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/BusNetwork.svg/1200px-BusNetwork.svg.png",
		content: `<h2>Topologi Bus</h2>
<p>Topologi Bus menggunakan satu kabel utama (backbone) sebagai jalur transmisi data. Semua perangkat terhubung langsung ke kabel utama ini.</p>

<h3>Karakteristik</h3>
<ul>
<li>Kabel utama disebut backbone atau trunk</li>
<li>Menggunakan terminator di kedua ujung kabel</li>
<li>Data dikirim dalam satu arah (half-duplex)</li>
</ul>

<h3>Kelebihan</h3>
<ul>
<li>Biaya instalasi murah</li>
<li>Mudah diimplementasikan</li>
<li>Cocok untuk jaringan kecil</li>
</ul>

<h3>Kekurangan</h3>
<ul>
<li>Jika kabel utama putus, seluruh jaringan terganggu</li>
<li>Sulit mendeteksi lokasi kerusakan</li>
<li>Performa menurun saat lalu lintas tinggi</li>
<li>Terbatas pada jarak dan jumlah perangkat</li>
</ul>`,
	},
	{
		title: "Topologi Star",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/StarNetwork.svg/1200px-StarNetwork.svg.png",
		content: `<h2>Topologi Star (Bintang)</h2>
<p>Topologi Star menghubungkan semua perangkat ke satu titik pusat, biasanya berupa switch atau hub.</p>

<h3>Karakteristik</h3>
<ul>
<li>Setiap perangkat memiliki koneksi tersendiri ke pusat</li>
<li>Perangkat pusat mengatur seluruh komunikasi</li>
<li>Paling banyak digunakan dalam LAN modern</li>
</ul>

<h3>Kelebihan</h3>
<ul>
<li>Mudah dalam penambahan perangkat baru</li>
<li>Kerusakan satu kabel tidak memengaruhi perangkat lain</li>
<li>Mudah dalam troubleshooting</li>
<li>Performa stabil</li>
</ul>

<h3>Kekurangan</h3>
<ul>
<li>Bergantung pada perangkat pusat (single point of failure)</li>
<li>Membutuhkan lebih banyak kabel</li>
<li>Biaya perangkat pusat relatif tinggi</li>
</ul>`,
	},
	{
		title: "Topologi Ring",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/RingNetwork.svg/1200px-RingNetwork.svg.png",
		content: `<h2>Topologi Ring (Cincin)</h2>
<p>Topologi Ring menghubungkan setiap perangkat dengan dua perangkat tetangganya, membentuk jalur melingkar tertutup.</p>

<h3>Karakteristik</h3>
<ul>
<li>Data bergerak dalam satu arah (unidirectional) atau dua arah (bidirectional)</li>
<li>Menggunakan token untuk mengatur akses</li>
<li>Setiap perangkat bertindak sebagai repeater</li>
</ul>

<h3>Kelebihan</h3>
<ul>
<li>Tidak terjadi collision data</li>
<li>Performa konsisten meski lalu lintas tinggi</li>
<li>Setiap perangkat memiliki akses yang sama</li>
</ul>

<h3>Kekurangan</h3>
<ul>
<li>Kerusakan satu perangkat dapat mengganggu seluruh jaringan</li>
<li>Sulit dalam troubleshooting</li>
<li>Penambahan perangkat dapat mengganggu jaringan sementara</li>
</ul>

<h3>Token Ring</h3>
<p>Token Ring adalah implementasi topologi ring yang menggunakan token (paket khusus) untuk mengontrol akses transmisi.</p>`,
	},
	{
		title: "Topologi Mesh",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/NetworkTopology-Mesh.svg/1200px-NetworkTopology-Mesh.svg.png",
		content: `<h2>Topologi Mesh</h2>
<p>Topologi Mesh menghubungkan setiap perangkat dengan banyak atau semua perangkat lain dalam jaringan.</p>

<h3>Jenis Topologi Mesh</h3>
<ol>
<li><strong>Full Mesh:</strong> Setiap perangkat terhubung ke semua perangkat lain</li>
<li><strong>Partial Mesh:</strong> Beberapa perangkat terhubung ke banyak perangkat, tidak semua</li>
</ol>

<h3>Rumus Koneksi Full Mesh</h3>
<p>Jumlah koneksi = n(n-1)/2, dengan n adalah jumlah perangkat</p>

<h3>Kelebihan</h3>
<ul>
<li>Redundansi tinggi (fault tolerant)</li>
<li>Tidak ada single point of failure</li>
<li>Komunikasi langsung antarperangkat</li>
<li>Privasi dan keamanan lebih baik</li>
</ul>

<h3>Kekurangan</h3>
<ul>
<li>Biaya instalasi sangat tinggi</li>
<li>Kompleksitas konfigurasi</li>
<li>Membutuhkan banyak port dan kabel</li>
</ul>

<h3>Penggunaan</h3>
<p>Topologi Mesh sering digunakan pada backbone jaringan WAN dan infrastruktur kritis.</p>`,
	},
	{
		title: "Topologi Tree dan Hybrid",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/TreeTopology.svg/1200px-TreeTopology.svg.png",
		content: `<h2>Topologi Tree (Pohon)</h2>
<p>Topologi Tree adalah kombinasi dari beberapa topologi Star yang dihubungkan secara hierarki.</p>

<h3>Karakteristik Topologi Tree</h3>
<ul>
<li>Struktur bertingkat dengan node root di puncak</li>
<li>Setiap level terhubung ke level di atasnya</li>
<li>Cocok untuk jaringan dengan hierarki organisasi</li>
</ul>

<h3>Kelebihan Topologi Tree</h3>
<ul>
<li>Skalabilitas baik</li>
<li>Mudah mengidentifikasi masalah</li>
<li>Segmentasi jaringan jelas</li>
</ul>

<h3>Kekurangan Topologi Tree</h3>
<ul>
<li>Bergantung pada kabel backbone</li>
<li>Konfigurasi kompleks</li>
</ul>

<h2>Topologi Hybrid</h2>
<p>Topologi Hybrid adalah kombinasi dari dua atau lebih topologi berbeda untuk memenuhi kebutuhan spesifik.</p>

<h3>Contoh Kombinasi</h3>
<ul>
<li>Star-Bus: Beberapa topologi Star dihubungkan dengan Bus</li>
<li>Star-Ring: Topologi Star dengan backbone Ring</li>
</ul>

<p>Topologi Hybrid memberikan fleksibilitas maksimal dalam desain jaringan.</p>`,
	},
	{
		title: "Perangkat Jaringan dalam Topologi",
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Switch-Ede.jpg/1200px-Switch-Ede.jpg",
		content: `<h2>Perangkat Jaringan</h2>
<p>Berbagai perangkat digunakan untuk membangun dan menghubungkan topologi jaringan.</p>

<h3>Hub</h3>
<ul>
<li>Perangkat layer 1 (Physical)</li>
<li>Mengirim data ke semua port (broadcast)</li>
<li>Tidak efisien untuk jaringan besar</li>
</ul>

<h3>Switch</h3>
<ul>
<li>Perangkat layer 2 (Data Link)</li>
<li>Mengirim data hanya ke port tujuan berdasarkan MAC address</li>
<li>Lebih efisien dari hub</li>
</ul>

<h3>Router</h3>
<ul>
<li>Perangkat layer 3 (Network)</li>
<li>Menghubungkan jaringan berbeda</li>
<li>Melakukan routing berdasarkan IP address</li>
</ul>

<h3>Access Point</h3>
<ul>
<li>Menyediakan koneksi nirkabel</li>
<li>Menghubungkan perangkat wireless ke jaringan kabel</li>
</ul>

<h3>Repeater</h3>
<ul>
<li>Memperkuat sinyal yang melemah</li>
<li>Memperpanjang jangkauan jaringan</li>
</ul>`,
	},
];

// ============================================================================
// CHAPTERS DATA
// ============================================================================

const chaptersData = [
	{
		title: "Protokol Internet (IP)",
		description:
			"Mempelajari konsep dasar pengalamatan IP, termasuk IPv4, IPv6, subnetting, dan teknik pembagian jaringan.",
		mascotId: 1,
	},
	{
		title: "Topologi Jaringan",
		description:
			"Memahami berbagai jenis topologi jaringan komputer, karakteristik, kelebihan, dan kekurangan masing-masing topologi.",
		mascotId: 2,
	},
];

// ============================================================================
// PRETEST DATA
// ============================================================================

const pretestData = [
	// Chapter 1: IP - Pretest
	{
		chapterIndex: 0,
		materialIndex: 0, // Pengenalan Alamat IP
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Ipv4_address.svg/800px-Ipv4_address.svg.png",
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang alamat IP.",
		question:
			"Alamat IP berfungsi sebagai identitas unik perangkat dalam jaringan. Manakah pernyataan berikut yang BENAR mengenai alamat IP?",
		options: [
			{
				text: "IPv4 menggunakan 128 bit sedangkan IPv6 menggunakan 32 bit",
				isCorrect: false,
			},
			{
				text: "IPv4 menggunakan 32 bit sedangkan IPv6 menggunakan 128 bit",
				isCorrect: true,
			},
			{
				text: "IPv4 dan IPv6 sama-sama menggunakan 64 bit",
				isCorrect: false,
			},
			{
				text: "IPv4 menggunakan notasi heksadesimal sedangkan IPv6 menggunakan desimal",
				isCorrect: false,
			},
		],
	},
	// Chapter 2: Topology - Pretest
	{
		chapterIndex: 1,
		materialIndex: 6, // Pengenalan Topologi Jaringan
		imageLink:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/NetworkTopologies.svg/800px-NetworkTopologies.svg.png",
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang topologi jaringan.",
		question:
			"Topologi jaringan menentukan bagaimana perangkat terhubung satu sama lain. Topologi manakah yang menggunakan satu perangkat pusat (seperti switch atau hub) sebagai titik koneksi semua perangkat?",
		options: [
			{ text: "Topologi Bus", isCorrect: false },
			{ text: "Topologi Ring", isCorrect: false },
			{ text: "Topologi Star", isCorrect: true },
			{ text: "Topologi Mesh", isCorrect: false },
		],
	},
];

// ============================================================================
// QUIZZES AND QUESTIONS DATA
// ============================================================================

const quizzesData = [
	// ========== CHAPTER 1: IP ==========
	// Quiz 1: Pengenalan IP
	{
		chapterIndex: 0,
		title: "Pengenalan Alamat IP",
		level: 1,
		difficulty: "easy" as const,
		questions: [
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang definisi dan fungsi alamat IP.",
				question: "Apa fungsi utama dari alamat IP dalam jaringan komputer?",
				options: [
					{
						text: "Mengenkripsi data yang dikirim melalui jaringan",
						isCorrect: false,
					},
					{
						text: "Memberikan identitas unik pada setiap perangkat dalam jaringan",
						isCorrect: true,
					},
					{ text: "Mempercepat koneksi internet", isCorrect: false },
					{ text: "Menyimpan data pengguna", isCorrect: false },
				],
			},
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang jenis-jenis alamat IP.",
				question:
					"Terdapat dua versi utama alamat IP yang digunakan saat ini. Apakah kedua versi tersebut?",
				options: [
					{ text: "IPv3 dan IPv4", isCorrect: false },
					{ text: "IPv4 dan IPv6", isCorrect: true },
					{ text: "IPv5 dan IPv6", isCorrect: false },
					{ text: "IPv1 dan IPv2", isCorrect: false },
				],
			},
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang analogi alamat IP.",
				question:
					"Alamat IP dapat dianalogikan dengan konsep apa dalam kehidupan sehari-hari?",
				options: [
					{
						text: "Alamat rumah yang memungkinkan surat dikirim ke tujuan yang tepat",
						isCorrect: true,
					},
					{
						text: "Nomor telepon yang digunakan untuk menelepon",
						isCorrect: false,
					},
					{ text: "Kata sandi untuk mengakses akun", isCorrect: false },
					{ text: "Nama pengguna di media sosial", isCorrect: false },
				],
			},
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang protokol internet.",
				question: 'Apa kepanjangan dari "IP" dalam alamat IP?',
				options: [
					{ text: "Internal Protocol", isCorrect: false },
					{ text: "Internet Provider", isCorrect: false },
					{ text: "Internet Protocol", isCorrect: true },
					{ text: "Information Processing", isCorrect: false },
				],
			},
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang kegunaan alamat IP.",
				question:
					"Dalam proses routing, alamat IP digunakan oleh router untuk...",
				options: [
					{ text: "Mengenkripsi paket data", isCorrect: false },
					{ text: "Mengarahkan paket data ke tujuan yang benar", isCorrect: true },
					{ text: "Menyimpan paket data sementara", isCorrect: false },
					{ text: "Menghapus paket data yang tidak valid", isCorrect: false },
				],
			},
			{
				materialIndex: 0,
				imageLink: null,
				description: "Pertanyaan tentang karakteristik alamat IP.",
				question:
					"Manakah pernyataan berikut yang BENAR tentang alamat IP dalam sebuah jaringan?",
				options: [
					{
						text: "Setiap perangkat boleh memiliki alamat IP yang sama",
						isCorrect: false,
					},
					{
						text: "Alamat IP hanya diperlukan untuk komputer, bukan perangkat lain",
						isCorrect: false,
					},
					{
						text: "Setiap perangkat harus memiliki alamat IP yang unik dalam jaringan yang sama",
						isCorrect: true,
					},
					{
						text: "Alamat IP tidak diperlukan untuk koneksi internet",
						isCorrect: false,
					},
				],
			},
		],
	},
	// Quiz 2: Struktur IPv4
	{
		chapterIndex: 0,
		title: "Struktur Alamat IPv4",
		level: 2,
		difficulty: "easy" as const,
		questions: [
			{
				materialIndex: 1,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/IPv4_address_structure_and_writing_systems-en.svg/800px-IPv4_address_structure_and_writing_systems-en.svg.png",
				description: "Pertanyaan tentang panjang bit alamat IPv4.",
				question: "Berapa jumlah bit yang digunakan dalam alamat IPv4?",
				options: [
					{ text: "16 bit", isCorrect: false },
					{ text: "32 bit", isCorrect: true },
					{ text: "64 bit", isCorrect: false },
					{ text: "128 bit", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang format penulisan IPv4.",
				question:
					"Alamat IPv4 ditulis dalam format apa dan dipisahkan oleh karakter apa?",
				options: [
					{ text: "Heksadesimal, dipisahkan titik dua (:)", isCorrect: false },
					{ text: "Desimal, dipisahkan titik (.)", isCorrect: true },
					{ text: "Biner, dipisahkan koma (,)", isCorrect: false },
					{ text: "Oktal, dipisahkan strip (-)", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang oktet dalam IPv4.",
				question: "Alamat IPv4 terdiri dari berapa oktet?",
				options: [
					{ text: "2 oktet", isCorrect: false },
					{ text: "3 oktet", isCorrect: false },
					{ text: "4 oktet", isCorrect: true },
					{ text: "8 oktet", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang nilai maksimum oktet.",
				question: "Berapa nilai maksimum yang dapat dimiliki setiap oktet IPv4?",
				options: [
					{ text: "128", isCorrect: false },
					{ text: "200", isCorrect: false },
					{ text: "255", isCorrect: true },
					{ text: "512", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang bagian alamat IPv4.",
				question: "Alamat IPv4 terdiri dari dua bagian utama, yaitu...",
				options: [
					{ text: "Header ID dan Footer ID", isCorrect: false },
					{ text: "Network ID dan Host ID", isCorrect: true },
					{ text: "Source ID dan Destination ID", isCorrect: false },
					{ text: "Public ID dan Private ID", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang kelas alamat IPv4.",
				question:
					"Jika sebuah alamat IPv4 memiliki oktet pertama 192, termasuk kelas apakah alamat tersebut?",
				options: [
					{ text: "Kelas A", isCorrect: false },
					{ text: "Kelas B", isCorrect: false },
					{ text: "Kelas C", isCorrect: true },
					{ text: "Kelas D", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang subnet mask default.",
				question: "Berapakah subnet mask default untuk alamat IP kelas B?",
				options: [
					{ text: "255.0.0.0", isCorrect: false },
					{ text: "255.255.0.0", isCorrect: true },
					{ text: "255.255.255.0", isCorrect: false },
					{ text: "255.255.255.255", isCorrect: false },
				],
			},
			{
				materialIndex: 1,
				imageLink: null,
				description: "Pertanyaan tentang contoh alamat IPv4 valid.",
				question: "Manakah di antara berikut ini yang merupakan alamat IPv4 valid?",
				options: [
					{ text: "192.168.1.256", isCorrect: false },
					{ text: "192.168.1.100", isCorrect: true },
					{ text: "192.168.1", isCorrect: false },
					{ text: "192.168.1.1.1", isCorrect: false },
				],
			},
		],
	},
	// Quiz 3: Subnetting
	{
		chapterIndex: 0,
		title: "Konsep Subnetting",
		level: 3,
		difficulty: "medium" as const,
		questions: [
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang definisi subnetting.",
				question: "Apa yang dimaksud dengan subnetting?",
				options: [
					{
						text: "Menggabungkan beberapa jaringan kecil menjadi satu jaringan besar",
						isCorrect: false,
					},
					{
						text: "Membagi jaringan besar menjadi beberapa jaringan kecil (subnet)",
						isCorrect: true,
					},
					{
						text: "Mengubah alamat IP privat menjadi publik",
						isCorrect: false,
					},
					{ text: "Mengenkripsi alamat IP untuk keamanan", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang tujuan subnetting.",
				question: "Manakah yang BUKAN merupakan tujuan dari subnetting?",
				options: [
					{ text: "Mengoptimalkan penggunaan alamat IP", isCorrect: false },
					{ text: "Mengurangi domain broadcast", isCorrect: false },
					{ text: "Mempercepat koneksi internet secara langsung", isCorrect: true },
					{ text: "Meningkatkan keamanan jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang subnet mask /24.",
				question:
					"Jika subnet mask adalah /24 (255.255.255.0), berapa jumlah alamat host yang tersedia?",
				options: [
					{ text: "256 alamat", isCorrect: false },
					{ text: "254 alamat", isCorrect: true },
					{ text: "252 alamat", isCorrect: false },
					{ text: "128 alamat", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang perhitungan host.",
				question:
					"Rumus untuk menghitung jumlah host yang tersedia dalam sebuah subnet adalah...",
				options: [
					{ text: "2^n", isCorrect: false },
					{ text: "2^n - 1", isCorrect: false },
					{ text: "2^n - 2", isCorrect: true },
					{ text: "2^n + 2", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang subnet mask /26.",
				question:
					"Subnet mask /26 setara dengan nilai desimal bertitik berapa?",
				options: [
					{ text: "255.255.255.128", isCorrect: false },
					{ text: "255.255.255.192", isCorrect: true },
					{ text: "255.255.255.224", isCorrect: false },
					{ text: "255.255.255.240", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang jumlah subnet.",
				question:
					"Jika jaringan kelas C (contoh: 192.168.1.0/24) di-subnet menjadi /26, berapa jumlah subnet yang dihasilkan?",
				options: [
					{ text: "2 subnet", isCorrect: false },
					{ text: "4 subnet", isCorrect: true },
					{ text: "8 subnet", isCorrect: false },
					{ text: "16 subnet", isCorrect: false },
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang broadcast domain.",
				question:
					"Mengapa subnetting dapat meningkatkan performa jaringan terkait broadcast?",
				options: [
					{
						text: "Subnetting menghilangkan semua broadcast dalam jaringan",
						isCorrect: false,
					},
					{
						text: "Subnetting membatasi broadcast hanya dalam subnet masing-masing",
						isCorrect: true,
					},
					{
						text: "Subnetting mengubah broadcast menjadi unicast",
						isCorrect: false,
					},
					{
						text: "Subnetting mempercepat proses broadcast ke semua perangkat",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 2,
				imageLink: null,
				description: "Pertanyaan tentang alamat network dan broadcast.",
				question:
					"Dalam sebuah subnet, mengapa jumlah host yang dapat digunakan adalah 2^n - 2?",
				options: [
					{ text: "Karena dua alamat digunakan untuk gateway", isCorrect: false },
					{
						text: "Karena satu alamat untuk network dan satu untuk broadcast",
						isCorrect: true,
					},
					{ text: "Karena dua alamat dicadangkan untuk DNS", isCorrect: false },
					{ text: "Karena dua alamat digunakan untuk DHCP", isCorrect: false },
				],
			},
		],
	},
	// Quiz 4: IPv6
	{
		chapterIndex: 0,
		title: "Alamat IPv6",
		level: 4,
		difficulty: "medium" as const,
		questions: [
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang panjang bit IPv6.",
				question: "Berapa panjang alamat IPv6 dalam bit?",
				options: [
					{ text: "32 bit", isCorrect: false },
					{ text: "64 bit", isCorrect: false },
					{ text: "128 bit", isCorrect: true },
					{ text: "256 bit", isCorrect: false },
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang notasi IPv6.",
				question: "Alamat IPv6 ditulis menggunakan notasi apa?",
				options: [
					{ text: "Desimal, dipisahkan titik", isCorrect: false },
					{ text: "Heksadesimal, dipisahkan titik dua", isCorrect: true },
					{ text: "Biner, dipisahkan strip", isCorrect: false },
					{ text: "Oktal, dipisahkan koma", isCorrect: false },
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang alasan pengembangan IPv6.",
				question: "Apa alasan utama dikembangkannya IPv6?",
				options: [
					{ text: "IPv4 tidak aman", isCorrect: false },
					{ text: "IPv4 terlalu lambat", isCorrect: false },
					{ text: "Keterbatasan jumlah alamat IPv4", isCorrect: true },
					{ text: "IPv4 tidak mendukung multimedia", isCorrect: false },
				],
			},
			{
				materialIndex: 3,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Ipv6_address_leading_zeros.svg/800px-Ipv6_address_leading_zeros.svg.png",
				description: "Pertanyaan tentang penyederhanaan IPv6.",
				question:
					"Dalam penyederhanaan alamat IPv6, simbol :: dapat digunakan untuk...",
				options: [
					{
						text: "Menggantikan satu grup nol",
						isCorrect: false,
					},
					{
						text: "Menggantikan satu atau lebih grup nol berurutan (hanya sekali)",
						isCorrect: true,
					},
					{
						text: "Menggantikan semua grup nol di mana pun posisinya",
						isCorrect: false,
					},
					{
						text: "Menggantikan huruf dalam notasi heksadesimal",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang jenis alamat IPv6.",
				question:
					"Jenis alamat IPv6 yang mengirim data ke satu penerima terdekat dari sekumpulan penerima disebut...",
				options: [
					{ text: "Unicast", isCorrect: false },
					{ text: "Multicast", isCorrect: false },
					{ text: "Anycast", isCorrect: true },
					{ text: "Broadcast", isCorrect: false },
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang unicast IPv6.",
				question:
					"Alamat IPv6 yang digunakan untuk komunikasi satu-ke-satu disebut...",
				options: [
					{ text: "Anycast", isCorrect: false },
					{ text: "Multicast", isCorrect: false },
					{ text: "Broadcast", isCorrect: false },
					{ text: "Unicast", isCorrect: true },
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang grup dalam IPv6.",
				question: "Alamat IPv6 terdiri dari berapa grup heksadesimal?",
				options: [
					{ text: "4 grup", isCorrect: false },
					{ text: "6 grup", isCorrect: false },
					{ text: "8 grup", isCorrect: true },
					{ text: "16 grup", isCorrect: false },
				],
			},
			{
				materialIndex: 3,
				imageLink: null,
				description: "Pertanyaan tentang penyederhanaan leading zero.",
				question:
					"Alamat IPv6 2001:0db8:0000:0042:0000:0000:0000:0001 dapat disederhanakan menjadi...",
				options: [
					{ text: "2001:db8:0:42::1", isCorrect: true },
					{ text: "2001:db8::42::1", isCorrect: false },
					{ text: "2001:db8:42:1", isCorrect: false },
					{ text: "2001::db8:42:1", isCorrect: false },
				],
			},
		],
	},
	// Quiz 5: IP Privat dan Publik
	{
		chapterIndex: 0,
		title: "Alamat IP Privat dan Publik",
		level: 5,
		difficulty: "medium" as const,
		questions: [
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang perbedaan IP privat dan publik.",
				question:
					"Apa perbedaan utama antara alamat IP privat dan alamat IP publik?",
				options: [
					{ text: "IP privat lebih cepat dari IP publik", isCorrect: false },
					{
						text: "IP publik dapat diakses langsung dari internet, IP privat tidak",
						isCorrect: true,
					},
					{
						text: "IP privat hanya untuk komputer, IP publik untuk semua perangkat",
						isCorrect: false,
					},
					{ text: "Tidak ada perbedaan antara keduanya", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang rentang IP privat kelas A.",
				question:
					"Manakah rentang alamat IP yang termasuk dalam IP privat kelas A?",
				options: [
					{ text: "192.168.0.0 - 192.168.255.255", isCorrect: false },
					{ text: "172.16.0.0 - 172.31.255.255", isCorrect: false },
					{ text: "10.0.0.0 - 10.255.255.255", isCorrect: true },
					{ text: "169.254.0.0 - 169.254.255.255", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang contoh IP privat.",
				question:
					"Manakah di antara alamat IP berikut yang termasuk alamat IP privat?",
				options: [
					{ text: "8.8.8.8", isCorrect: false },
					{ text: "192.168.1.1", isCorrect: true },
					{ text: "203.0.113.50", isCorrect: false },
					{ text: "1.1.1.1", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Private_network.svg/800px-Private_network.svg.png",
				description: "Pertanyaan tentang NAT.",
				question:
					"NAT (Network Address Translation) memungkinkan perangkat dengan IP privat untuk...",
				options: [
					{
						text: "Berkomunikasi dengan internet menggunakan IP publik router",
						isCorrect: true,
					},
					{
						text: "Berkomunikasi langsung dengan IP publik sendiri",
						isCorrect: false,
					},
					{ text: "Mengubah IP privat menjadi IP publik permanen", isCorrect: false },
					{ text: "Menghapus kebutuhan akan IP publik sepenuhnya", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang pemberi IP publik.",
				question: "Siapakah yang memberikan alamat IP publik kepada pengguna?",
				options: [
					{ text: "Pengguna menentukan sendiri", isCorrect: false },
					{ text: "Internet Service Provider (ISP)", isCorrect: true },
					{ text: "Produsen perangkat jaringan", isCorrect: false },
					{ text: "Pemerintah setempat", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang RFC 1918.",
				question: "Standar yang mendefinisikan rentang alamat IP privat adalah...",
				options: [
					{ text: "RFC 1918", isCorrect: true },
					{ text: "RFC 2000", isCorrect: false },
					{ text: "IEEE 802.11", isCorrect: false },
					{ text: "ISO 9001", isCorrect: false },
				],
			},
			{
				materialIndex: 4,
				imageLink: null,
				description: "Pertanyaan tentang rentang IP privat kelas C.",
				question:
					"Rentang alamat IP privat kelas C menurut RFC 1918 adalah...",
				options: [
					{ text: "10.0.0.0 - 10.255.255.255", isCorrect: false },
					{ text: "172.16.0.0 - 172.31.255.255", isCorrect: false },
					{ text: "192.168.0.0 - 192.168.255.255", isCorrect: true },
					{ text: "169.254.0.0 - 169.254.255.255", isCorrect: false },
				],
			},
		],
	},
	// Quiz 6: CIDR
	{
		chapterIndex: 0,
		title: "CIDR (Classless Inter-Domain Routing)",
		level: 6,
		difficulty: "hard" as const,
		questions: [
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang definisi CIDR.",
				question: "Apa yang dimaksud dengan CIDR?",
				options: [
					{
						text: "Metode pengalamatan IP berbasis kelas tradisional",
						isCorrect: false,
					},
					{
						text: "Metode pengalamatan IP yang lebih fleksibel tanpa batasan kelas",
						isCorrect: true,
					},
					{
						text: "Protokol enkripsi untuk alamat IP",
						isCorrect: false,
					},
					{
						text: "Sistem penamaan domain di internet",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang notasi CIDR.",
				question: "Dalam notasi CIDR 192.168.1.0/24, angka 24 menunjukkan...",
				options: [
					{ text: "Jumlah host dalam jaringan", isCorrect: false },
					{ text: "Jumlah bit untuk Network ID", isCorrect: true },
					{ text: "Jumlah subnet yang tersedia", isCorrect: false },
					{ text: "Kecepatan jaringan dalam Mbps", isCorrect: false },
				],
			},
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang keuntungan CIDR.",
				question: "Manakah yang merupakan keuntungan penggunaan CIDR?",
				options: [
					{ text: "Membuat jaringan lebih lambat tapi lebih aman", isCorrect: false },
					{
						text: "Alokasi alamat IP lebih presisi dan mengurangi ukuran tabel routing",
						isCorrect: true,
					},
					{ text: "Menghilangkan kebutuhan subnet mask", isCorrect: false },
					{
						text: "Membatasi jaringan hanya pada kelas A, B, atau C",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang konversi CIDR ke subnet mask.",
				question: "CIDR /28 setara dengan subnet mask berapa?",
				options: [
					{ text: "255.255.255.192", isCorrect: false },
					{ text: "255.255.255.224", isCorrect: false },
					{ text: "255.255.255.240", isCorrect: true },
					{ text: "255.255.255.248", isCorrect: false },
				],
			},
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang jumlah host CIDR /30.",
				question:
					"Jika sebuah jaringan menggunakan CIDR /30, berapa jumlah host yang dapat digunakan?",
				options: [
					{ text: "2 host", isCorrect: true },
					{ text: "4 host", isCorrect: false },
					{ text: "6 host", isCorrect: false },
					{ text: "8 host", isCorrect: false },
				],
			},
			{
				materialIndex: 5,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/CIDR_Address.svg/800px-CIDR_Address.svg.png",
				description: "Pertanyaan tentang route aggregation.",
				question:
					"Proses menggabungkan beberapa rute jaringan menjadi satu rute yang lebih besar dalam CIDR disebut...",
				options: [
					{ text: "Subnetting", isCorrect: false },
					{ text: "Route aggregation (supernetting)", isCorrect: true },
					{ text: "NAT translation", isCorrect: false },
					{ text: "DHCP allocation", isCorrect: false },
				],
			},
			{
				materialIndex: 5,
				imageLink: null,
				description: "Pertanyaan tentang jumlah host CIDR /16.",
				question: "Berapa jumlah host yang tersedia pada jaringan dengan CIDR /16?",
				options: [
					{ text: "254", isCorrect: false },
					{ text: "65.534", isCorrect: true },
					{ text: "16.777.214", isCorrect: false },
					{ text: "256", isCorrect: false },
				],
			},
		],
	},
	// ========== CHAPTER 2: TOPOLOGY ==========
	// Quiz 1: Pengenalan Topologi
	{
		chapterIndex: 1,
		title: "Pengenalan Topologi Jaringan",
		level: 1,
		difficulty: "easy" as const,
		questions: [
			{
				materialIndex: 6,
				imageLink: null,
				description: "Pertanyaan tentang definisi topologi jaringan.",
				question: "Apa yang dimaksud dengan topologi jaringan?",
				options: [
					{ text: "Kecepatan transfer data dalam jaringan", isCorrect: false },
					{
						text: "Susunan atau pola hubungan antarperangkat dalam jaringan",
						isCorrect: true,
					},
					{ text: "Jenis kabel yang digunakan dalam jaringan", isCorrect: false },
					{ text: "Protokol komunikasi dalam jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 6,
				imageLink: null,
				description: "Pertanyaan tentang jenis topologi.",
				question: "Topologi jaringan dapat dibagi menjadi dua jenis, yaitu...",
				options: [
					{ text: "Topologi kabel dan nirkabel", isCorrect: false },
					{ text: "Topologi fisik dan logis", isCorrect: true },
					{ text: "Topologi internal dan eksternal", isCorrect: false },
					{ text: "Topologi lokal dan global", isCorrect: false },
				],
			},
			{
				materialIndex: 6,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/NetworkTopologies.svg/800px-NetworkTopologies.svg.png",
				description: "Pertanyaan tentang topologi umum.",
				question:
					"Manakah yang BUKAN merupakan jenis topologi jaringan yang umum?",
				options: [
					{ text: "Topologi Star", isCorrect: false },
					{ text: "Topologi Bus", isCorrect: false },
					{ text: "Topologi Square", isCorrect: true },
					{ text: "Topologi Ring", isCorrect: false },
				],
			},
			{
				materialIndex: 6,
				imageLink: null,
				description: "Pertanyaan tentang faktor pemilihan topologi.",
				question:
					"Manakah yang merupakan faktor pertimbangan dalam memilih topologi jaringan?",
				options: [
					{ text: "Warna kabel yang digunakan", isCorrect: false },
					{ text: "Biaya, skalabilitas, dan keandalan", isCorrect: true },
					{ text: "Merek perangkat yang digunakan", isCorrect: false },
					{ text: "Lokasi geografis kantor pusat", isCorrect: false },
				],
			},
			{
				materialIndex: 6,
				imageLink: null,
				description: "Pertanyaan tentang topologi fisik.",
				question: "Topologi fisik menggambarkan...",
				options: [
					{ text: "Alur perjalanan data dalam jaringan", isCorrect: false },
					{ text: "Tata letak kabel dan perangkat secara nyata", isCorrect: true },
					{ text: "Kecepatan transfer data maksimum", isCorrect: false },
					{ text: "Protokol yang digunakan untuk komunikasi", isCorrect: false },
				],
			},
			{
				materialIndex: 6,
				imageLink: null,
				description: "Pertanyaan tentang topologi logis.",
				question: "Topologi logis menggambarkan...",
				options: [
					{ text: "Posisi fisik perangkat dalam ruangan", isCorrect: false },
					{ text: "Alur data dalam jaringan", isCorrect: true },
					{ text: "Jenis konektor yang digunakan", isCorrect: false },
					{ text: "Jumlah perangkat maksimum", isCorrect: false },
				],
			},
		],
	},
	// Quiz 2: Topologi Bus
	{
		chapterIndex: 1,
		title: "Topologi Bus",
		level: 2,
		difficulty: "easy" as const,
		questions: [
			{
				materialIndex: 7,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/BusNetwork.svg/800px-BusNetwork.svg.png",
				description: "Pertanyaan tentang karakteristik topologi Bus.",
				question: "Apa karakteristik utama dari topologi Bus?",
				options: [
					{
						text: "Semua perangkat terhubung ke satu perangkat pusat",
						isCorrect: false,
					},
					{
						text: "Semua perangkat terhubung ke satu kabel utama (backbone)",
						isCorrect: true,
					},
					{
						text: "Setiap perangkat terhubung ke dua perangkat tetangga",
						isCorrect: false,
					},
					{
						text: "Setiap perangkat terhubung ke semua perangkat lain",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 7,
				imageLink: null,
				description: "Pertanyaan tentang terminator pada topologi Bus.",
				question: "Apa fungsi terminator pada ujung kabel topologi Bus?",
				options: [
					{ text: "Memperkuat sinyal data", isCorrect: false },
					{
						text: "Menyerap sinyal agar tidak terjadi pantulan",
						isCorrect: true,
					},
					{ text: "Menghubungkan ke jaringan lain", isCorrect: false },
					{ text: "Mengenkripsi data yang dikirim", isCorrect: false },
				],
			},
			{
				materialIndex: 7,
				imageLink: null,
				description: "Pertanyaan tentang kelebihan topologi Bus.",
				question: "Manakah yang merupakan kelebihan dari topologi Bus?",
				options: [
					{ text: "Sangat handal jika kabel utama putus", isCorrect: false },
					{ text: "Biaya instalasi murah dan mudah diimplementasikan", isCorrect: true },
					{ text: "Cocok untuk jaringan skala besar", isCorrect: false },
					{ text: "Performa tetap optimal saat lalu lintas tinggi", isCorrect: false },
				],
			},
			{
				materialIndex: 7,
				imageLink: null,
				description: "Pertanyaan tentang kekurangan topologi Bus.",
				question:
					"Apa yang terjadi jika kabel utama (backbone) pada topologi Bus mengalami kerusakan?",
				options: [
					{ text: "Hanya satu perangkat yang terputus", isCorrect: false },
					{ text: "Seluruh jaringan akan terganggu", isCorrect: true },
					{ text: "Jaringan tetap berfungsi normal", isCorrect: false },
					{
						text: "Data akan dialihkan ke jalur cadangan",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 7,
				imageLink: null,
				description: "Pertanyaan tentang transmisi data pada Bus.",
				question: "Bagaimana arah transmisi data pada topologi Bus?",
				options: [
					{ text: "Data bergerak dalam dua arah secara bersamaan", isCorrect: false },
					{ text: "Data bergerak dalam satu arah (half-duplex)", isCorrect: true },
					{ text: "Data bergerak secara melingkar", isCorrect: false },
					{ text: "Data dikirim ke semua perangkat secara langsung", isCorrect: false },
				],
			},
			{
				materialIndex: 7,
				imageLink: null,
				description: "Pertanyaan tentang penggunaan topologi Bus.",
				question: "Topologi Bus paling cocok digunakan untuk...",
				options: [
					{ text: "Jaringan perusahaan besar", isCorrect: false },
					{ text: "Jaringan kecil dengan jumlah perangkat terbatas", isCorrect: true },
					{ text: "Data center dengan kebutuhan redundansi tinggi", isCorrect: false },
					{ text: "Jaringan nirkabel modern", isCorrect: false },
				],
			},
		],
	},
	// Quiz 3: Topologi Star
	{
		chapterIndex: 1,
		title: "Topologi Star",
		level: 3,
		difficulty: "easy" as const,
		questions: [
			{
				materialIndex: 8,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/StarNetwork.svg/800px-StarNetwork.svg.png",
				description: "Pertanyaan tentang karakteristik topologi Star.",
				question: "Apa karakteristik utama dari topologi Star?",
				options: [
					{ text: "Semua perangkat terhubung dalam jalur melingkar", isCorrect: false },
					{
						text: "Semua perangkat terhubung ke satu titik pusat (switch/hub)",
						isCorrect: true,
					},
					{ text: "Setiap perangkat terhubung ke semua perangkat lain", isCorrect: false },
					{ text: "Semua perangkat berbagi satu kabel utama", isCorrect: false },
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang perangkat pusat topologi Star.",
				question:
					"Perangkat apa yang biasanya digunakan sebagai titik pusat dalam topologi Star?",
				options: [
					{ text: "Modem dan terminator", isCorrect: false },
					{ text: "Switch atau hub", isCorrect: true },
					{ text: "Repeater dan amplifier", isCorrect: false },
					{ text: "Firewall dan antivirus", isCorrect: false },
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang kelebihan topologi Star.",
				question: "Manakah yang merupakan kelebihan dari topologi Star?",
				options: [
					{ text: "Tidak memerlukan perangkat pusat", isCorrect: false },
					{
						text: "Kerusakan satu kabel tidak memengaruhi perangkat lain",
						isCorrect: true,
					},
					{ text: "Biaya implementasi paling murah", isCorrect: false },
					{ text: "Tidak memiliki single point of failure", isCorrect: false },
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang kelemahan topologi Star.",
				question: "Apa kelemahan utama dari topologi Star?",
				options: [
					{ text: "Sulit menambahkan perangkat baru", isCorrect: false },
					{ text: "Bergantung pada perangkat pusat (single point of failure)", isCorrect: true },
					{ text: "Tidak cocok untuk LAN modern", isCorrect: false },
					{ text: "Data harus melewati semua perangkat", isCorrect: false },
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang troubleshooting topologi Star.",
				question: "Mengapa topologi Star mudah dalam troubleshooting?",
				options: [
					{
						text: "Karena tidak ada kabel yang digunakan",
						isCorrect: false,
					},
					{
						text: "Karena setiap perangkat memiliki koneksi tersendiri ke pusat",
						isCorrect: true,
					},
					{
						text: "Karena semua perangkat berbagi satu kabel",
						isCorrect: false,
					},
					{
						text: "Karena data bergerak dalam lingkaran",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang penggunaan topologi Star.",
				question:
					"Topologi Star adalah topologi yang paling banyak digunakan dalam...",
				options: [
					{ text: "Jaringan WAN internasional", isCorrect: false },
					{ text: "Local Area Network (LAN) modern", isCorrect: true },
					{ text: "Jaringan telepon analog", isCorrect: false },
					{ text: "Jaringan satelit", isCorrect: false },
				],
			},
			{
				materialIndex: 8,
				imageLink: null,
				description: "Pertanyaan tentang kebutuhan kabel topologi Star.",
				question:
					"Dibandingkan topologi Bus, topologi Star membutuhkan...",
				options: [
					{ text: "Lebih sedikit kabel", isCorrect: false },
					{ text: "Lebih banyak kabel", isCorrect: true },
					{ text: "Jumlah kabel yang sama", isCorrect: false },
					{ text: "Tidak membutuhkan kabel sama sekali", isCorrect: false },
				],
			},
		],
	},
	// Quiz 4: Topologi Ring
	{
		chapterIndex: 1,
		title: "Topologi Ring",
		level: 4,
		difficulty: "medium" as const,
		questions: [
			{
				materialIndex: 9,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/RingNetwork.svg/800px-RingNetwork.svg.png",
				description: "Pertanyaan tentang karakteristik topologi Ring.",
				question: "Bagaimana perangkat terhubung dalam topologi Ring?",
				options: [
					{ text: "Semua terhubung ke satu perangkat pusat", isCorrect: false },
					{
						text: "Setiap perangkat terhubung dengan dua perangkat tetangga membentuk lingkaran",
						isCorrect: true,
					},
					{ text: "Semua berbagi satu kabel utama", isCorrect: false },
					{ text: "Setiap perangkat terhubung ke semua perangkat lain", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang token dalam topologi Ring.",
				question: "Apa fungsi token dalam topologi Ring (Token Ring)?",
				options: [
					{ text: "Mengenkripsi data yang dikirim", isCorrect: false },
					{ text: "Mengontrol akses transmisi data", isCorrect: true },
					{ text: "Menyimpan data sementara", isCorrect: false },
					{ text: "Memperkuat sinyal jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang arah data topologi Ring.",
				question: "Dalam topologi Ring unidirectional, data bergerak...",
				options: [
					{ text: "Ke semua arah secara acak", isCorrect: false },
					{ text: "Dalam satu arah saja (searah jarum jam atau sebaliknya)", isCorrect: true },
					{ text: "Bolak-balik antara dua titik", isCorrect: false },
					{ text: "Langsung ke tujuan tanpa melewati perangkat lain", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang kelebihan topologi Ring.",
				question: "Manakah yang merupakan kelebihan dari topologi Ring?",
				options: [
					{ text: "Mudah menambahkan perangkat tanpa mengganggu jaringan", isCorrect: false },
					{ text: "Tidak terjadi collision data", isCorrect: true },
					{ text: "Biaya implementasi sangat murah", isCorrect: false },
					{ text: "Tidak bergantung pada perangkat manapun", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang kelemahan topologi Ring.",
				question:
					"Apa yang terjadi jika satu perangkat dalam topologi Ring mengalami kerusakan?",
				options: [
					{ text: "Hanya perangkat tersebut yang terputus", isCorrect: false },
					{ text: "Dapat mengganggu seluruh jaringan", isCorrect: true },
					{ text: "Jaringan tetap berfungsi normal", isCorrect: false },
					{ text: "Data akan otomatis dialihkan", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang repeater pada topologi Ring.",
				question: "Dalam topologi Ring, setiap perangkat bertindak sebagai...",
				options: [
					{ text: "Server utama", isCorrect: false },
					{ text: "Repeater yang meneruskan sinyal", isCorrect: true },
					{ text: "Firewall", isCorrect: false },
					{ text: "Gateway", isCorrect: false },
				],
			},
			{
				materialIndex: 9,
				imageLink: null,
				description: "Pertanyaan tentang Dual Ring.",
				question: "Apa tujuan dari implementasi Dual Ring?",
				options: [
					{ text: "Menggandakan kecepatan transfer data", isCorrect: false },
					{ text: "Menyediakan jalur cadangan jika jalur utama gagal", isCorrect: true },
					{ text: "Mengurangi jumlah kabel yang diperlukan", isCorrect: false },
					{ text: "Menghilangkan kebutuhan token", isCorrect: false },
				],
			},
		],
	},
	// Quiz 5: Topologi Mesh
	{
		chapterIndex: 1,
		title: "Topologi Mesh",
		level: 5,
		difficulty: "medium" as const,
		questions: [
			{
				materialIndex: 10,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/NetworkTopology-Mesh.svg/800px-NetworkTopology-Mesh.svg.png",
				description: "Pertanyaan tentang karakteristik topologi Mesh.",
				question: "Apa karakteristik utama dari topologi Full Mesh?",
				options: [
					{ text: "Semua perangkat terhubung ke satu perangkat pusat", isCorrect: false },
					{ text: "Setiap perangkat terhubung ke semua perangkat lain", isCorrect: true },
					{ text: "Perangkat terhubung dalam bentuk lingkaran", isCorrect: false },
					{ text: "Semua perangkat berbagi satu kabel utama", isCorrect: false },
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang rumus koneksi Full Mesh.",
				question:
					"Jika terdapat 5 perangkat dalam topologi Full Mesh, berapa jumlah koneksi yang diperlukan? (Rumus: n(n-1)/2)",
				options: [
					{ text: "5 koneksi", isCorrect: false },
					{ text: "10 koneksi", isCorrect: true },
					{ text: "15 koneksi", isCorrect: false },
					{ text: "20 koneksi", isCorrect: false },
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang jenis topologi Mesh.",
				question:
					"Apa perbedaan antara Full Mesh dan Partial Mesh?",
				options: [
					{
						text: "Full Mesh hanya untuk jaringan kecil, Partial Mesh untuk jaringan besar",
						isCorrect: false,
					},
					{
						text: "Full Mesh menghubungkan semua perangkat, Partial Mesh menghubungkan sebagian perangkat",
						isCorrect: true,
					},
					{
						text: "Full Mesh menggunakan kabel, Partial Mesh nirkabel",
						isCorrect: false,
					},
					{
						text: "Tidak ada perbedaan antara keduanya",
						isCorrect: false,
					},
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang kelebihan topologi Mesh.",
				question: "Manakah yang merupakan kelebihan utama dari topologi Mesh?",
				options: [
					{ text: "Biaya implementasi sangat murah", isCorrect: false },
					{ text: "Redundansi tinggi dan tidak ada single point of failure", isCorrect: true },
					{ text: "Konfigurasi sangat sederhana", isCorrect: false },
					{ text: "Membutuhkan sedikit port jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang kelemahan topologi Mesh.",
				question: "Apa kelemahan utama dari topologi Full Mesh?",
				options: [
					{ text: "Tidak memiliki toleransi kesalahan", isCorrect: false },
					{ text: "Biaya instalasi sangat tinggi dan kompleks", isCorrect: true },
					{ text: "Kecepatan transfer data rendah", isCorrect: false },
					{ text: "Sulit dalam troubleshooting", isCorrect: false },
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang penggunaan topologi Mesh.",
				question: "Topologi Mesh sering digunakan pada...",
				options: [
					{ text: "Jaringan rumah sederhana", isCorrect: false },
					{ text: "Backbone jaringan WAN dan infrastruktur kritis", isCorrect: true },
					{ text: "Jaringan lab komputer sekolah", isCorrect: false },
					{ text: "Jaringan warung internet", isCorrect: false },
				],
			},
			{
				materialIndex: 10,
				imageLink: null,
				description: "Pertanyaan tentang fault tolerance Mesh.",
				question:
					"Mengapa topologi Mesh dikatakan memiliki fault tolerance yang tinggi?",
				options: [
					{
						text: "Karena menggunakan kabel berkualitas tinggi",
						isCorrect: false,
					},
					{
						text: "Karena memiliki jalur alternatif jika satu jalur rusak",
						isCorrect: true,
					},
					{
						text: "Karena tidak menggunakan perangkat elektronik",
						isCorrect: false,
					},
					{
						text: "Karena semua data dienkripsi",
						isCorrect: false,
					},
				],
			},
		],
	},
	// Quiz 6: Topologi Tree, Hybrid, dan Perangkat
	{
		chapterIndex: 1,
		title: "Topologi Lanjutan dan Perangkat Jaringan",
		level: 6,
		difficulty: "hard" as const,
		questions: [
			{
				materialIndex: 11,
				imageLink: null,
				description: "Pertanyaan tentang topologi Tree.",
				question: "Topologi Tree merupakan kombinasi dari...",
				options: [
					{ text: "Beberapa topologi Bus yang dihubungkan", isCorrect: false },
					{ text: "Beberapa topologi Star yang dihubungkan secara hierarki", isCorrect: true },
					{ text: "Beberapa topologi Ring yang dihubungkan", isCorrect: false },
					{ text: "Beberapa topologi Mesh yang dihubungkan", isCorrect: false },
				],
			},
			{
				materialIndex: 11,
				imageLink:
					"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/TreeTopology.svg/800px-TreeTopology.svg.png",
				description: "Pertanyaan tentang struktur topologi Tree.",
				question: "Dalam topologi Tree, node yang berada di puncak hierarki disebut...",
				options: [
					{ text: "Node leaf", isCorrect: false },
					{ text: "Node root", isCorrect: true },
					{ text: "Node branch", isCorrect: false },
					{ text: "Node child", isCorrect: false },
				],
			},
			{
				materialIndex: 11,
				imageLink: null,
				description: "Pertanyaan tentang topologi Hybrid.",
				question: "Apa yang dimaksud dengan topologi Hybrid?",
				options: [
					{ text: "Topologi yang hanya menggunakan kabel fiber optik", isCorrect: false },
					{
						text: "Kombinasi dari dua atau lebih topologi berbeda untuk memenuhi kebutuhan spesifik",
						isCorrect: true,
					},
					{ text: "Topologi yang menggabungkan jaringan kabel dan nirkabel", isCorrect: false },
					{ text: "Topologi yang digunakan khusus untuk cloud computing", isCorrect: false },
				],
			},
			{
				materialIndex: 12,
				imageLink: null,
				description: "Pertanyaan tentang perbedaan Hub dan Switch.",
				question: "Apa perbedaan utama antara Hub dan Switch?",
				options: [
					{ text: "Hub lebih cepat dari Switch", isCorrect: false },
					{
						text: "Hub mengirim data ke semua port, Switch mengirim hanya ke port tujuan",
						isCorrect: true,
					},
					{ text: "Hub bekerja di layer 3, Switch di layer 1", isCorrect: false },
					{ text: "Hub lebih mahal dari Switch", isCorrect: false },
				],
			},
			{
				materialIndex: 12,
				imageLink: null,
				description: "Pertanyaan tentang layer perangkat jaringan.",
				question: "Pada layer OSI manakah Router beroperasi?",
				options: [
					{ text: "Layer 1 (Physical)", isCorrect: false },
					{ text: "Layer 2 (Data Link)", isCorrect: false },
					{ text: "Layer 3 (Network)", isCorrect: true },
					{ text: "Layer 4 (Transport)", isCorrect: false },
				],
			},
			{
				materialIndex: 12,
				imageLink: null,
				description: "Pertanyaan tentang fungsi Router.",
				question: "Apa fungsi utama dari Router dalam jaringan?",
				options: [
					{ text: "Memperkuat sinyal dalam satu jaringan", isCorrect: false },
					{
						text: "Menghubungkan jaringan berbeda dan melakukan routing berdasarkan IP",
						isCorrect: true,
					},
					{ text: "Menyediakan koneksi nirkabel", isCorrect: false },
					{ text: "Menyimpan data jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 12,
				imageLink: null,
				description: "Pertanyaan tentang Access Point.",
				question: "Apa fungsi utama dari Access Point dalam jaringan?",
				options: [
					{ text: "Menghubungkan dua jaringan yang berbeda", isCorrect: false },
					{
						text: "Menyediakan koneksi nirkabel dan menghubungkan perangkat wireless ke jaringan kabel",
						isCorrect: true,
					},
					{ text: "Mempercepat koneksi internet", isCorrect: false },
					{ text: "Mengenkripsi semua data jaringan", isCorrect: false },
				],
			},
			{
				materialIndex: 12,
				imageLink: null,
				description: "Pertanyaan tentang Repeater.",
				question: "Perangkat yang berfungsi memperkuat sinyal yang melemah disebut...",
				options: [
					{ text: "Router", isCorrect: false },
					{ text: "Switch", isCorrect: false },
					{ text: "Repeater", isCorrect: true },
					{ text: "Firewall", isCorrect: false },
				],
			},
		],
	},
];

// ============================================================================
// TELCO CHAPTER DEFINITIONS (5 new chapters)
// ============================================================================

const telcoChaptersData = [
	{
		title: "Media Transmisi",
		description:
			"Mempelajari jenis-jenis media transmisi dalam jaringan telekomunikasi, termasuk kabel tembaga, fiber optik, dan media nirkabel.",
		mascotId: 3,
	},
	{
		title: "Jaringan Nirkabel (Wireless)",
		description:
			"Memahami teknologi jaringan nirkabel, standar WiFi, Bluetooth, dan teknologi seluler dari 2G hingga 5G.",
		mascotId: 4,
	},
	{
		title: "Protokol dan Standar Telekomunikasi",
		description:
			"Mempelajari berbagai protokol dan standar yang digunakan dalam telekomunikasi modern, termasuk OSI, VoIP, dan SIP.",
		mascotId: 5,
	},
	{
		title: "Teknik Modulasi dan Multiplexing",
		description:
			"Memahami teknik modulasi sinyal dan multiplexing untuk efisiensi transmisi data dalam jaringan telekomunikasi.",
		mascotId: 6,
	},
	{
		title: "Keamanan Jaringan Telekomunikasi",
		description:
			"Mempelajari aspek keamanan dalam jaringan telekomunikasi, enkripsi, firewall, VPN, dan sistem deteksi intrusi.",
		mascotId: 7,
	},
];

// ============================================================================
// TELCO STUDY MATERIALS (3 per chapter = 15 total)
// ============================================================================

const telcoStudyMaterialsData = [
	// Chapter: Media Transmisi
	{
		title: "Pengenalan Media Transmisi",
		imageLink: null,
		content: `<h2>Media Transmisi dalam Jaringan</h2>
<p>Media transmisi adalah jalur fisik atau nirkabel yang digunakan untuk mengirimkan data dari satu perangkat ke perangkat lain dalam jaringan telekomunikasi.</p>
<h3>Klasifikasi Media Transmisi</h3>
<ul>
<li><strong>Guided (Terpandu):</strong> Kabel tembaga (UTP, STP, Coaxial), Fiber Optik</li>
<li><strong>Unguided (Tidak Terpandu):</strong> Gelombang radio, Microwave, Infrared</li>
</ul>
<h3>Faktor Pemilihan Media</h3>
<ol>
<li>Bandwidth dan kecepatan transfer</li>
<li>Jarak transmisi maksimum</li>
<li>Ketahanan terhadap interferensi</li>
<li>Biaya instalasi dan pemeliharaan</li>
</ol>`,
	},
	{
		title: "Kabel Tembaga (UTP, STP, Coaxial)",
		imageLink: null,
		content: `<h2>Jenis-Jenis Kabel Tembaga</h2>
<h3>Kabel UTP (Unshielded Twisted Pair)</h3>
<ul>
<li>Terdiri dari pasangan kabel yang dipilin tanpa pelindung</li>
<li>Kategori: Cat5e (1 Gbps), Cat6 (10 Gbps), Cat6a (10 Gbps 100m)</li>
<li>Konektor: RJ-45</li>
<li>Jarak maksimum: 100 meter</li>
</ul>
<h3>Kabel STP (Shielded Twisted Pair)</h3>
<ul>
<li>Memiliki pelindung logam untuk mengurangi interferensi elektromagnetik</li>
<li>Lebih mahal dari UTP tetapi lebih tahan terhadap noise</li>
</ul>
<h3>Kabel Coaxial</h3>
<ul>
<li>Terdiri dari konduktor pusat, isolator, pelindung, dan jaket luar</li>
<li>Impedansi: 50 ohm (data) atau 75 ohm (video)</li>
<li>Digunakan pada TV kabel dan jaringan lama</li>
</ul>`,
	},
	{
		title: "Fiber Optik (Single-mode dan Multi-mode)",
		imageLink: null,
		content: `<h2>Teknologi Fiber Optik</h2>
<p>Fiber optik menggunakan cahaya untuk mentransmisikan data melalui serat kaca atau plastik dengan kecepatan sangat tinggi.</p>
<h3>Single-mode Fiber (SMF)</h3>
<ul>
<li>Diameter inti: 8-10 mikron</li>
<li>Jarak transmisi: hingga 100 km</li>
<li>Bandwidth sangat tinggi</li>
<li>Digunakan untuk jaringan backbone dan WAN</li>
</ul>
<h3>Multi-mode Fiber (MMF)</h3>
<ul>
<li>Diameter inti: 50-62.5 mikron</li>
<li>Jarak transmisi: hingga 2 km</li>
<li>Lebih murah dari single-mode</li>
<li>Digunakan untuk jaringan LAN dan data center</li>
</ul>
<h3>Konektor Fiber Optik</h3>
<p>Jenis konektor umum: SC, LC, ST, FC, dan MPO/MTP.</p>`,
	},
	// Chapter: Jaringan Nirkabel
	{
		title: "Teknologi WiFi dan Standar IEEE 802.11",
		imageLink: null,
		content: `<h2>Standar WiFi IEEE 802.11</h2>
<p>WiFi adalah teknologi jaringan nirkabel yang menggunakan gelombang radio untuk menyediakan koneksi internet berkecepatan tinggi.</p>
<h3>Evolusi Standar WiFi</h3>
<table>
<tr><th>Standar</th><th>Nama WiFi</th><th>Frekuensi</th><th>Kecepatan Maks</th></tr>
<tr><td>802.11b</td><td>WiFi 1</td><td>2.4 GHz</td><td>11 Mbps</td></tr>
<tr><td>802.11g</td><td>WiFi 3</td><td>2.4 GHz</td><td>54 Mbps</td></tr>
<tr><td>802.11n</td><td>WiFi 4</td><td>2.4/5 GHz</td><td>600 Mbps</td></tr>
<tr><td>802.11ac</td><td>WiFi 5</td><td>5 GHz</td><td>6.9 Gbps</td></tr>
<tr><td>802.11ax</td><td>WiFi 6</td><td>2.4/5/6 GHz</td><td>9.6 Gbps</td></tr>
</table>
<h3>Komponen Jaringan WiFi</h3>
<ul>
<li><strong>Access Point (AP):</strong> Perangkat yang memancarkan sinyal WiFi</li>
<li><strong>SSID:</strong> Nama jaringan WiFi</li>
<li><strong>Channel:</strong> Saluran frekuensi yang digunakan</li>
</ul>`,
	},
	{
		title: "Bluetooth dan Teknologi NFC",
		imageLink: null,
		content: `<h2>Teknologi Bluetooth</h2>
<p>Bluetooth adalah standar teknologi nirkabel jarak pendek untuk pertukaran data menggunakan gelombang radio UHF pada pita ISM 2.4 GHz.</p>
<h3>Versi Bluetooth</h3>
<ul>
<li><strong>Bluetooth 4.0 (BLE):</strong> Low Energy, cocok untuk IoT</li>
<li><strong>Bluetooth 5.0:</strong> Jangkauan 4x lebih jauh, kecepatan 2x</li>
<li><strong>Bluetooth 5.3:</strong> Efisiensi daya lebih baik</li>
</ul>
<h3>NFC (Near Field Communication)</h3>
<ul>
<li>Jarak operasi: maksimum 10 cm</li>
<li>Frekuensi: 13.56 MHz</li>
<li>Digunakan untuk pembayaran digital, akses kontrol, dan transfer data</li>
<li>Mode operasi: reader/writer, peer-to-peer, card emulation</li>
</ul>`,
	},
	{
		title: "Jaringan Seluler (2G, 3G, 4G, 5G)",
		imageLink: null,
		content: `<h2>Evolusi Jaringan Seluler</h2>
<h3>Generasi Jaringan Seluler</h3>
<table>
<tr><th>Generasi</th><th>Teknologi</th><th>Kecepatan</th><th>Fitur</th></tr>
<tr><td>2G</td><td>GSM, CDMA</td><td>14.4-384 Kbps</td><td>SMS, MMS</td></tr>
<tr><td>3G</td><td>UMTS, HSPA</td><td>384 Kbps-42 Mbps</td><td>Internet mobile, video call</td></tr>
<tr><td>4G</td><td>LTE, LTE-A</td><td>100 Mbps-1 Gbps</td><td>HD streaming, VoLTE</td></tr>
<tr><td>5G</td><td>NR</td><td>1-20 Gbps</td><td>IoT masif, ultra-low latency</td></tr>
</table>
<h3>Arsitektur Jaringan Seluler</h3>
<ul>
<li><strong>RAN:</strong> Radio Access Network (base station/tower)</li>
<li><strong>Core Network:</strong> Mengelola koneksi dan routing</li>
<li><strong>Backhaul:</strong> Koneksi antara base station dan core network</li>
</ul>`,
	},
	// Chapter: Protokol dan Standar Telekomunikasi
	{
		title: "Model OSI dan TCP/IP dalam Telekomunikasi",
		imageLink: null,
		content: `<h2>Model OSI dalam Konteks Telekomunikasi</h2>
<p>Model OSI (Open Systems Interconnection) menyediakan kerangka kerja standar untuk komunikasi jaringan dengan 7 lapisan.</p>
<h3>7 Lapisan OSI</h3>
<ol>
<li><strong>Physical:</strong> Transmisi bit melalui media fisik</li>
<li><strong>Data Link:</strong> Framing, MAC address, error detection</li>
<li><strong>Network:</strong> Routing, IP addressing</li>
<li><strong>Transport:</strong> TCP/UDP, flow control, error recovery</li>
<li><strong>Session:</strong> Manajemen sesi komunikasi</li>
<li><strong>Presentation:</strong> Enkripsi, kompresi, format data</li>
<li><strong>Application:</strong> HTTP, FTP, SMTP, DNS</li>
</ol>
<h3>Model TCP/IP</h3>
<p>Model TCP/IP memiliki 4 lapisan: Network Access, Internet, Transport, dan Application.</p>`,
	},
	{
		title: "Protokol VoIP dan SIP",
		imageLink: null,
		content: `<h2>Voice over IP (VoIP)</h2>
<p>VoIP adalah teknologi yang memungkinkan komunikasi suara melalui jaringan IP, menggantikan jaringan telepon tradisional (PSTN).</p>
<h3>Protokol VoIP Utama</h3>
<ul>
<li><strong>SIP (Session Initiation Protocol):</strong> Protokol signaling untuk memulai, memodifikasi, dan mengakhiri sesi multimedia</li>
<li><strong>RTP (Real-time Transport Protocol):</strong> Mengangkut data audio/video secara real-time</li>
<li><strong>H.323:</strong> Standar ITU-T untuk komunikasi multimedia melalui jaringan paket</li>
</ul>
<h3>Parameter Kualitas VoIP</h3>
<ul>
<li><strong>Latency:</strong> Delay kurang dari 150ms untuk kualitas baik</li>
<li><strong>Jitter:</strong> Variasi delay, harus minimal</li>
<li><strong>Packet Loss:</strong> Kehilangan paket kurang dari 1%</li>
<li><strong>Codec:</strong> G.711, G.729, Opus</li>
</ul>`,
	},
	{
		title: "Standar ITU-T dan IEEE",
		imageLink: null,
		content: `<h2>Organisasi Standar Telekomunikasi</h2>
<h3>ITU-T (International Telecommunication Union)</h3>
<ul>
<li>Mengembangkan standar telekomunikasi internasional</li>
<li>Standar penting: G.711 (codec audio), G.984 (GPON), H.264 (video coding)</li>
<li>Seri rekomendasi: G (transmisi), H (multimedia), V (modem), X (data network)</li>
</ul>
<h3>IEEE (Institute of Electrical and Electronics Engineers)</h3>
<ul>
<li><strong>IEEE 802.3:</strong> Ethernet</li>
<li><strong>IEEE 802.11:</strong> WiFi</li>
<li><strong>IEEE 802.15:</strong> Bluetooth, Zigbee</li>
<li><strong>IEEE 802.16:</strong> WiMAX</li>
</ul>
<h3>Standar Lainnya</h3>
<p>IETF (Internet Engineering Task Force) mengelola standar internet seperti RFC untuk HTTP, DNS, SMTP, dan lainnya.</p>`,
	},
	// Chapter: Teknik Modulasi dan Multiplexing
	{
		title: "Modulasi Analog (AM, FM, PM)",
		imageLink: null,
		content: `<h2>Teknik Modulasi Analog</h2>
<p>Modulasi adalah proses mengubah karakteristik sinyal pembawa (carrier) sesuai dengan sinyal informasi yang akan dikirim.</p>
<h3>Amplitude Modulation (AM)</h3>
<ul>
<li>Mengubah amplitudo sinyal pembawa</li>
<li>Rentan terhadap noise</li>
<li>Digunakan pada radio AM dan komunikasi penerbangan</li>
</ul>
<h3>Frequency Modulation (FM)</h3>
<ul>
<li>Mengubah frekuensi sinyal pembawa</li>
<li>Lebih tahan noise dibanding AM</li>
<li>Digunakan pada radio FM dan komunikasi darurat</li>
</ul>
<h3>Phase Modulation (PM)</h3>
<ul>
<li>Mengubah fase sinyal pembawa</li>
<li>Basis untuk modulasi digital modern (PSK)</li>
<li>Bandwidth lebih efisien</li>
</ul>`,
	},
	{
		title: "Modulasi Digital (ASK, FSK, PSK, QAM)",
		imageLink: null,
		content: `<h2>Teknik Modulasi Digital</h2>
<h3>ASK (Amplitude Shift Keying)</h3>
<ul>
<li>Mengubah amplitudo untuk merepresentasikan bit 0 dan 1</li>
<li>Sederhana namun rentan noise</li>
</ul>
<h3>FSK (Frequency Shift Keying)</h3>
<ul>
<li>Menggunakan frekuensi berbeda untuk bit 0 dan 1</li>
<li>Lebih tahan noise, digunakan pada modem dial-up</li>
</ul>
<h3>PSK (Phase Shift Keying)</h3>
<ul>
<li>BPSK: 2 fase (1 bit/simbol), QPSK: 4 fase (2 bit/simbol)</li>
<li>Efisien bandwidth, digunakan pada WiFi dan satelit</li>
</ul>
<h3>QAM (Quadrature Amplitude Modulation)</h3>
<ul>
<li>Kombinasi AM dan PM</li>
<li>16-QAM: 4 bit/simbol, 64-QAM: 6 bit/simbol, 256-QAM: 8 bit/simbol</li>
<li>Digunakan pada WiFi, LTE, dan TV kabel digital</li>
</ul>`,
	},
	{
		title: "Multiplexing (TDM, FDM, WDM, CDM)",
		imageLink: null,
		content: `<h2>Teknik Multiplexing</h2>
<p>Multiplexing adalah teknik menggabungkan beberapa sinyal untuk ditransmisikan melalui satu media transmisi secara bersamaan.</p>
<h3>FDM (Frequency Division Multiplexing)</h3>
<ul>
<li>Membagi bandwidth menjadi sub-channel dengan frekuensi berbeda</li>
<li>Digunakan pada radio FM, TV analog, ADSL</li>
</ul>
<h3>TDM (Time Division Multiplexing)</h3>
<ul>
<li>Membagi waktu transmisi menjadi slot waktu untuk setiap channel</li>
<li>Digunakan pada ISDN, GSM, telepon digital</li>
</ul>
<h3>WDM (Wavelength Division Multiplexing)</h3>
<ul>
<li>Menggunakan panjang gelombang berbeda pada fiber optik</li>
<li>DWDM: Dense WDM, hingga 160 channel per fiber</li>
</ul>
<h3>CDM (Code Division Multiplexing)</h3>
<ul>
<li>Setiap channel menggunakan kode unik</li>
<li>Digunakan pada CDMA (jaringan seluler 3G)</li>
</ul>`,
	},
	// Chapter: Keamanan Jaringan Telekomunikasi
	{
		title: "Ancaman Keamanan Jaringan",
		imageLink: null,
		content: `<h2>Jenis-Jenis Ancaman Keamanan Jaringan</h2>
<h3>Serangan Pasif</h3>
<ul>
<li><strong>Eavesdropping:</strong> Menyadap komunikasi jaringan</li>
<li><strong>Traffic Analysis:</strong> Menganalisis pola lalu lintas data</li>
</ul>
<h3>Serangan Aktif</h3>
<ul>
<li><strong>Man-in-the-Middle (MITM):</strong> Menyisipkan diri di antara dua pihak yang berkomunikasi</li>
<li><strong>DDoS:</strong> Membanjiri server dengan permintaan palsu</li>
<li><strong>Spoofing:</strong> Memalsukan identitas (IP, MAC, DNS)</li>
<li><strong>Phishing:</strong> Menipu pengguna untuk memberikan informasi sensitif</li>
</ul>
<h3>Malware</h3>
<ul>
<li>Virus, Worm, Trojan, Ransomware, Spyware</li>
<li>Menyebar melalui jaringan dan dapat merusak infrastruktur telekomunikasi</li>
</ul>`,
	},
	{
		title: "Enkripsi dan Kriptografi",
		imageLink: null,
		content: `<h2>Dasar-Dasar Kriptografi</h2>
<h3>Enkripsi Simetris</h3>
<ul>
<li>Menggunakan satu kunci yang sama untuk enkripsi dan dekripsi</li>
<li>Algoritma: AES (128/192/256 bit), DES, 3DES, Blowfish</li>
<li>Kelebihan: cepat, cocok untuk data besar</li>
<li>Kekurangan: masalah distribusi kunci</li>
</ul>
<h3>Enkripsi Asimetris</h3>
<ul>
<li>Menggunakan pasangan kunci publik dan kunci privat</li>
<li>Algoritma: RSA, ECC, Diffie-Hellman</li>
<li>Kelebihan: distribusi kunci aman</li>
<li>Kekurangan: lebih lambat dari enkripsi simetris</li>
</ul>
<h3>Hashing</h3>
<p>Fungsi hash menghasilkan output tetap dari input apapun. Algoritma: MD5, SHA-1, SHA-256, SHA-3.</p>`,
	},
	{
		title: "Firewall, VPN, dan IDS/IPS",
		imageLink: null,
		content: `<h2>Perangkat Keamanan Jaringan</h2>
<h3>Firewall</h3>
<ul>
<li><strong>Packet Filtering:</strong> Menyaring berdasarkan header paket</li>
<li><strong>Stateful Inspection:</strong> Melacak status koneksi</li>
<li><strong>Application Gateway:</strong> Proxy pada layer aplikasi</li>
<li><strong>Next-Gen Firewall:</strong> Deep packet inspection + threat intelligence</li>
</ul>
<h3>VPN (Virtual Private Network)</h3>
<ul>
<li>Membuat tunnel terenkripsi melalui jaringan publik</li>
<li>Protokol: IPSec, OpenVPN, WireGuard, L2TP</li>
<li>Jenis: Site-to-site VPN, Remote access VPN</li>
</ul>
<h3>IDS/IPS</h3>
<ul>
<li><strong>IDS (Intrusion Detection System):</strong> Mendeteksi dan melaporkan ancaman</li>
<li><strong>IPS (Intrusion Prevention System):</strong> Mendeteksi dan memblokir ancaman secara otomatis</li>
<li>Metode: Signature-based, Anomaly-based, Hybrid</li>
</ul>`,
	},
];

// ============================================================================
// TELCO PRETEST DATA (1 per chapter = 5 total)
// ============================================================================

const telcoPretestData = [
	{
		chapterOffset: 2,
		materialOffset: 13,
		imageLink: null,
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang media transmisi.",
		question:
			"Media transmisi yang menggunakan cahaya untuk mentransmisikan data dengan kecepatan sangat tinggi disebut...",
		options: [
			{ text: "Kabel UTP", isCorrect: false },
			{ text: "Kabel Coaxial", isCorrect: false },
			{ text: "Fiber Optik", isCorrect: true },
			{ text: "Kabel STP", isCorrect: false },
		],
	},
	{
		chapterOffset: 3,
		materialOffset: 16,
		imageLink: null,
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang jaringan nirkabel.",
		question:
			"Standar WiFi yang dikenal sebagai WiFi 6 dan mendukung frekuensi 2.4, 5, dan 6 GHz adalah...",
		options: [
			{ text: "IEEE 802.11n", isCorrect: false },
			{ text: "IEEE 802.11ac", isCorrect: false },
			{ text: "IEEE 802.11ax", isCorrect: true },
			{ text: "IEEE 802.11g", isCorrect: false },
		],
	},
	{
		chapterOffset: 4,
		materialOffset: 19,
		imageLink: null,
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang protokol telekomunikasi.",
		question:
			"Protokol yang digunakan untuk memulai, memodifikasi, dan mengakhiri sesi komunikasi multimedia melalui jaringan IP adalah...",
		options: [
			{ text: "HTTP", isCorrect: false },
			{ text: "SIP (Session Initiation Protocol)", isCorrect: true },
			{ text: "FTP", isCorrect: false },
			{ text: "SMTP", isCorrect: false },
		],
	},
	{
		chapterOffset: 5,
		materialOffset: 22,
		imageLink: null,
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang teknik modulasi.",
		question:
			"Teknik modulasi yang mengkombinasikan perubahan amplitudo dan fase sehingga dapat mengirim banyak bit per simbol disebut...",
		options: [
			{ text: "ASK (Amplitude Shift Keying)", isCorrect: false },
			{ text: "FSK (Frequency Shift Keying)", isCorrect: false },
			{ text: "PSK (Phase Shift Keying)", isCorrect: false },
			{ text: "QAM (Quadrature Amplitude Modulation)", isCorrect: true },
		],
	},
	{
		chapterOffset: 6,
		materialOffset: 25,
		imageLink: null,
		description:
			"Pertanyaan pretes untuk mengukur pemahaman awal tentang keamanan jaringan.",
		question:
			"Sistem yang berfungsi mendeteksi DAN secara otomatis memblokir ancaman keamanan pada jaringan disebut...",
		options: [
			{ text: "Firewall", isCorrect: false },
			{ text: "IDS (Intrusion Detection System)", isCorrect: false },
			{ text: "IPS (Intrusion Prevention System)", isCorrect: true },
			{ text: "VPN (Virtual Private Network)", isCorrect: false },
		],
	},
];

// ============================================================================
// TELCO QUESTION TEMPLATES (~25 per chapter, reused across levels)
// ============================================================================

type QuestionTemplate = {
	description: string;
	question: string;
	correct: string;
	wrong: [string, string, string];
};

const telcoQuestionTemplates: QuestionTemplate[][] = [
	// Chapter 0: Media Transmisi
	[
		{ description: "Pertanyaan tentang klasifikasi media transmisi.", question: "Media transmisi yang menggunakan jalur fisik seperti kabel disebut media...", correct: "Guided (Terpandu)", wrong: ["Unguided", "Wireless", "Broadcast"] },
		{ description: "Pertanyaan tentang kabel UTP.", question: "Konektor yang digunakan pada kabel UTP adalah...", correct: "RJ-45", wrong: ["RJ-11", "BNC", "SC"] },
		{ description: "Pertanyaan tentang kategori kabel.", question: "Kabel UTP Cat6 mendukung kecepatan maksimum...", correct: "10 Gbps", wrong: ["100 Mbps", "1 Gbps", "40 Gbps"] },
		{ description: "Pertanyaan tentang jarak kabel UTP.", question: "Jarak maksimum kabel UTP untuk jaringan Ethernet adalah...", correct: "100 meter", wrong: ["50 meter", "200 meter", "500 meter"] },
		{ description: "Pertanyaan tentang kabel STP.", question: "Keunggulan kabel STP dibandingkan UTP adalah...", correct: "Lebih tahan terhadap interferensi elektromagnetik", wrong: ["Lebih murah", "Lebih ringan", "Jarak lebih jauh"] },
		{ description: "Pertanyaan tentang kabel coaxial.", question: "Impedansi kabel coaxial yang digunakan untuk transmisi data adalah...", correct: "50 ohm", wrong: ["75 ohm", "100 ohm", "25 ohm"] },
		{ description: "Pertanyaan tentang fiber optik.", question: "Keuntungan utama fiber optik dibandingkan kabel tembaga adalah...", correct: "Bandwidth sangat tinggi dan tahan interferensi elektromagnetik", wrong: ["Harga lebih murah", "Lebih mudah dipasang", "Tidak memerlukan konektor"] },
		{ description: "Pertanyaan tentang single-mode fiber.", question: "Single-mode fiber optik cocok digunakan untuk...", correct: "Jaringan backbone dan WAN jarak jauh", wrong: ["Jaringan LAN kantor", "Koneksi desktop", "Jaringan rumah"] },
		{ description: "Pertanyaan tentang multi-mode fiber.", question: "Diameter inti multi-mode fiber optik adalah...", correct: "50-62.5 mikron", wrong: ["8-10 mikron", "100-125 mikron", "1-2 mikron"] },
		{ description: "Pertanyaan tentang konektor fiber optik.", question: "Konektor fiber optik yang paling umum digunakan di data center modern adalah...", correct: "LC (Lucent Connector)", wrong: ["BNC", "RJ-45", "DB-9"] },
		{ description: "Pertanyaan tentang media unguided.", question: "Contoh media transmisi unguided adalah...", correct: "Gelombang radio dan microwave", wrong: ["Kabel UTP dan STP", "Fiber optik", "Kabel coaxial"] },
		{ description: "Pertanyaan tentang atenuasi.", question: "Atenuasi dalam media transmisi adalah...", correct: "Pelemahan sinyal seiring bertambahnya jarak", wrong: ["Penguatan sinyal", "Perubahan frekuensi", "Penambahan noise"] },
		{ description: "Pertanyaan tentang bandwidth.", question: "Bandwidth pada media transmisi mengacu pada...", correct: "Kapasitas maksimum data yang dapat ditransmisikan per satuan waktu", wrong: ["Panjang kabel", "Jumlah konektor", "Tegangan listrik"] },
		{ description: "Pertanyaan tentang crosstalk.", question: "Crosstalk pada kabel tembaga terjadi karena...", correct: "Interferensi sinyal antar pasangan kabel yang berdekatan", wrong: ["Kabel terlalu panjang", "Konektor rusak", "Tegangan terlalu tinggi"] },
		{ description: "Pertanyaan tentang kabel straight-through.", question: "Kabel straight-through digunakan untuk menghubungkan...", correct: "Komputer ke switch", wrong: ["Switch ke switch", "Router ke router", "Komputer ke komputer"] },
		{ description: "Pertanyaan tentang kabel crossover.", question: "Kabel crossover digunakan untuk menghubungkan...", correct: "Dua perangkat sejenis (switch ke switch)", wrong: ["Komputer ke switch", "Komputer ke router", "Printer ke komputer"] },
		{ description: "Pertanyaan tentang fiber optik splicing.", question: "Teknik penyambungan fiber optik permanen disebut...", correct: "Fusion splicing", wrong: ["Crimping", "Soldering", "Twisting"] },
		{ description: "Pertanyaan tentang OTDR.", question: "Alat yang digunakan untuk mengukur karakteristik fiber optik disebut...", correct: "OTDR (Optical Time-Domain Reflectometer)", wrong: ["Multimeter", "Oscilloscope", "Spectrum analyzer"] },
		{ description: "Pertanyaan tentang throughput.", question: "Perbedaan antara bandwidth dan throughput adalah...", correct: "Bandwidth adalah kapasitas maksimum, throughput adalah kecepatan aktual", wrong: ["Keduanya sama", "Throughput selalu lebih besar", "Bandwidth diukur dalam meter"] },
		{ description: "Pertanyaan tentang plenum cable.", question: "Kabel plenum digunakan di...", correct: "Ruang sirkulasi udara gedung (plenum space)", wrong: ["Di luar ruangan", "Di bawah air", "Di jalur kereta api"] },
		{ description: "Pertanyaan tentang PoE.", question: "Power over Ethernet (PoE) memungkinkan...", correct: "Mengirim daya listrik melalui kabel Ethernet bersamaan dengan data", wrong: ["Meningkatkan kecepatan internet", "Menambah jarak kabel", "Mengenkripsi data"] },
		{ description: "Pertanyaan tentang EMI.", question: "EMI (Electromagnetic Interference) paling mempengaruhi jenis kabel...", correct: "Kabel UTP (tanpa pelindung)", wrong: ["Fiber optik", "Kabel STP", "Kabel coaxial berpelindung"] },
		{ description: "Pertanyaan tentang Cat5e.", question: "Kabel Cat5e mendukung kecepatan maksimum...", correct: "1 Gbps", wrong: ["100 Mbps", "10 Gbps", "10 Mbps"] },
		{ description: "Pertanyaan tentang konektor BNC.", question: "Konektor BNC umumnya digunakan pada kabel...", correct: "Coaxial", wrong: ["UTP", "Fiber optik", "STP"] },
		{ description: "Pertanyaan tentang media transmisi terbaik untuk jarak jauh.", question: "Untuk transmisi data jarak lebih dari 10 km, media yang paling tepat adalah...", correct: "Single-mode fiber optik", wrong: ["Kabel UTP Cat6", "Kabel coaxial", "Kabel STP"] },
	],
	// Chapter 1: Jaringan Nirkabel
	[
		{ description: "Pertanyaan tentang standar WiFi.", question: "Standar WiFi 5 (802.11ac) beroperasi pada frekuensi...", correct: "5 GHz", wrong: ["2.4 GHz", "6 GHz", "60 GHz"] },
		{ description: "Pertanyaan tentang WiFi 6.", question: "Kecepatan maksimum teoritis WiFi 6 (802.11ax) adalah...", correct: "9.6 Gbps", wrong: ["1.3 Gbps", "6.9 Gbps", "54 Mbps"] },
		{ description: "Pertanyaan tentang frekuensi WiFi.", question: "Frekuensi 2.4 GHz memiliki keunggulan dibanding 5 GHz dalam hal...", correct: "Jangkauan lebih jauh dan penetrasi dinding lebih baik", wrong: ["Kecepatan lebih tinggi", "Lebih sedikit interferensi", "Latency lebih rendah"] },
		{ description: "Pertanyaan tentang SSID.", question: "SSID pada jaringan WiFi adalah...", correct: "Nama identifikasi jaringan nirkabel", wrong: ["Alamat IP router", "Kata sandi jaringan", "Kecepatan koneksi"] },
		{ description: "Pertanyaan tentang keamanan WiFi.", question: "Protokol keamanan WiFi yang paling aman saat ini adalah...", correct: "WPA3", wrong: ["WEP", "WPA", "WPA2"] },
		{ description: "Pertanyaan tentang Bluetooth.", question: "Bluetooth beroperasi pada frekuensi...", correct: "2.4 GHz (pita ISM)", wrong: ["5 GHz", "900 MHz", "60 GHz"] },
		{ description: "Pertanyaan tentang BLE.", question: "BLE (Bluetooth Low Energy) diperkenalkan pada versi...", correct: "Bluetooth 4.0", wrong: ["Bluetooth 2.0", "Bluetooth 3.0", "Bluetooth 5.0"] },
		{ description: "Pertanyaan tentang NFC.", question: "Jarak operasi maksimum NFC adalah...", correct: "10 cm", wrong: ["1 meter", "10 meter", "100 meter"] },
		{ description: "Pertanyaan tentang frekuensi NFC.", question: "NFC beroperasi pada frekuensi...", correct: "13.56 MHz", wrong: ["2.4 GHz", "5 GHz", "900 MHz"] },
		{ description: "Pertanyaan tentang 4G LTE.", question: "Kecepatan download maksimum 4G LTE secara teoritis adalah...", correct: "100 Mbps - 1 Gbps", wrong: ["10 Mbps", "42 Mbps", "20 Gbps"] },
		{ description: "Pertanyaan tentang 5G.", question: "Salah satu keunggulan utama 5G dibanding 4G adalah...", correct: "Ultra-low latency (di bawah 1 ms)", wrong: ["Jangkauan lebih jauh", "Tidak memerlukan tower", "Harga lebih murah"] },
		{ description: "Pertanyaan tentang GSM.", question: "GSM (Global System for Mobile Communications) termasuk generasi jaringan seluler...", correct: "2G", wrong: ["1G", "3G", "4G"] },
		{ description: "Pertanyaan tentang MIMO.", question: "Teknologi MIMO pada WiFi berarti...", correct: "Multiple-Input Multiple-Output, menggunakan beberapa antena", wrong: ["Koneksi satu arah", "Hanya satu antena", "Mode sleep otomatis"] },
		{ description: "Pertanyaan tentang channel WiFi.", question: "Pada frekuensi 2.4 GHz, jumlah channel WiFi yang tidak saling overlap adalah...", correct: "3 (channel 1, 6, 11)", wrong: ["11", "14", "1"] },
		{ description: "Pertanyaan tentang Access Point.", question: "Fungsi Access Point dalam jaringan WiFi adalah...", correct: "Memancarkan sinyal WiFi dan menghubungkan perangkat wireless ke jaringan kabel", wrong: ["Menyimpan data", "Mengenkripsi semua trafik", "Menggantikan router"] },
		{ description: "Pertanyaan tentang roaming WiFi.", question: "WiFi roaming memungkinkan perangkat untuk...", correct: "Berpindah antar Access Point tanpa kehilangan koneksi", wrong: ["Menggunakan data seluler", "Meningkatkan kecepatan", "Mengubah SSID otomatis"] },
		{ description: "Pertanyaan tentang WiMAX.", question: "WiMAX (IEEE 802.16) dirancang untuk...", correct: "Jaringan nirkabel area luas (metropolitan)", wrong: ["Bluetooth jarak pendek", "NFC", "Jaringan LAN kantor"] },
		{ description: "Pertanyaan tentang Zigbee.", question: "Zigbee (IEEE 802.15.4) paling cocok digunakan untuk...", correct: "Perangkat IoT dengan konsumsi daya rendah", wrong: ["Streaming video HD", "Transfer file besar", "VoIP"] },
		{ description: "Pertanyaan tentang jaringan ad-hoc.", question: "Jaringan WiFi ad-hoc adalah...", correct: "Koneksi langsung antar perangkat tanpa Access Point", wrong: ["Jaringan dengan banyak AP", "Koneksi melalui kabel", "Jaringan 5G"] },
		{ description: "Pertanyaan tentang beamforming.", question: "Beamforming pada WiFi berfungsi untuk...", correct: "Mengarahkan sinyal secara fokus ke perangkat tertentu", wrong: ["Memperluas jangkauan ke segala arah", "Mengenkripsi data", "Mengurangi kecepatan"] },
		{ description: "Pertanyaan tentang RAN.", question: "RAN (Radio Access Network) pada jaringan seluler terdiri dari...", correct: "Base station dan tower yang menghubungkan perangkat ke core network", wrong: ["Server pusat data", "Kabel bawah laut", "Satellite uplink saja"] },
		{ description: "Pertanyaan tentang handover.", question: "Handover dalam jaringan seluler adalah proses...", correct: "Perpindahan koneksi dari satu base station ke base station lain", wrong: ["Mematikan ponsel", "Mengubah nomor telepon", "Mengganti SIM card"] },
		{ description: "Pertanyaan tentang Bluetooth 5.0.", question: "Bluetooth 5.0 memiliki jangkauan hingga...", correct: "240 meter (outdoor)", wrong: ["10 meter", "30 meter", "1 km"] },
		{ description: "Pertanyaan tentang WiFi Direct.", question: "WiFi Direct memungkinkan...", correct: "Dua perangkat terhubung langsung via WiFi tanpa Access Point", wrong: ["Koneksi melalui kabel", "Akses internet gratis", "Transfer data via NFC"] },
		{ description: "Pertanyaan tentang interferensi.", question: "Perangkat yang paling sering menyebabkan interferensi pada WiFi 2.4 GHz adalah...", correct: "Microwave oven", wrong: ["Televisi", "Kulkas", "Mesin cuci"] },
	],
	// Chapter 2: Protokol dan Standar Telekomunikasi
	[
		{ description: "Pertanyaan tentang model OSI.", question: "Model OSI memiliki berapa lapisan?", correct: "7 lapisan", wrong: ["4 lapisan", "5 lapisan", "6 lapisan"] },
		{ description: "Pertanyaan tentang layer Physical.", question: "Layer 1 (Physical) pada model OSI bertanggung jawab untuk...", correct: "Transmisi bit melalui media fisik", wrong: ["Routing paket", "Enkripsi data", "Manajemen sesi"] },
		{ description: "Pertanyaan tentang layer Transport.", question: "Protokol TCP bekerja pada layer...", correct: "Layer 4 (Transport)", wrong: ["Layer 3 (Network)", "Layer 2 (Data Link)", "Layer 7 (Application)"] },
		{ description: "Pertanyaan tentang TCP/IP.", question: "Model TCP/IP memiliki berapa lapisan?", correct: "4 lapisan", wrong: ["7 lapisan", "5 lapisan", "3 lapisan"] },
		{ description: "Pertanyaan tentang SIP.", question: "SIP (Session Initiation Protocol) digunakan untuk...", correct: "Memulai, memodifikasi, dan mengakhiri sesi multimedia", wrong: ["Transfer file", "Mengirim email", "Browsing web"] },
		{ description: "Pertanyaan tentang RTP.", question: "RTP (Real-time Transport Protocol) berfungsi untuk...", correct: "Mengangkut data audio dan video secara real-time", wrong: ["Transfer file besar", "Mengirim email", "Resolusi DNS"] },
		{ description: "Pertanyaan tentang H.323.", question: "H.323 adalah standar yang dikeluarkan oleh...", correct: "ITU-T", wrong: ["IEEE", "IETF", "W3C"] },
		{ description: "Pertanyaan tentang VoIP.", question: "Kualitas VoIP yang baik memerlukan latency kurang dari...", correct: "150 ms", wrong: ["500 ms", "1 detik", "10 ms"] },
		{ description: "Pertanyaan tentang codec.", question: "Codec G.711 pada VoIP menghasilkan audio dengan bitrate...", correct: "64 Kbps", wrong: ["8 Kbps", "128 Kbps", "256 Kbps"] },
		{ description: "Pertanyaan tentang jitter.", question: "Jitter dalam komunikasi jaringan adalah...", correct: "Variasi delay antar paket data", wrong: ["Kecepatan download", "Jumlah paket hilang", "Bandwidth total"] },
		{ description: "Pertanyaan tentang packet loss.", question: "Untuk kualitas VoIP yang baik, packet loss harus kurang dari...", correct: "1%", wrong: ["5%", "10%", "25%"] },
		{ description: "Pertanyaan tentang IEEE 802.3.", question: "Standar IEEE 802.3 mendefinisikan...", correct: "Ethernet", wrong: ["WiFi", "Bluetooth", "WiMAX"] },
		{ description: "Pertanyaan tentang IEEE 802.15.", question: "Standar IEEE 802.15 mencakup teknologi...", correct: "Bluetooth dan Zigbee", wrong: ["Ethernet", "WiFi", "WiMAX"] },
		{ description: "Pertanyaan tentang IETF.", question: "IETF (Internet Engineering Task Force) bertanggung jawab untuk...", correct: "Mengembangkan standar dan protokol internet (RFC)", wrong: ["Membuat hardware jaringan", "Menjual domain", "Mengatur frekuensi radio"] },
		{ description: "Pertanyaan tentang QoS.", question: "QoS (Quality of Service) pada jaringan berfungsi untuk...", correct: "Memprioritaskan trafik tertentu untuk menjamin kualitas layanan", wrong: ["Mempercepat semua koneksi", "Memblokir trafik berbahaya", "Mengenkripsi data"] },
		{ description: "Pertanyaan tentang ISDN.", question: "ISDN (Integrated Services Digital Network) menyediakan...", correct: "Layanan suara dan data digital melalui jaringan telepon", wrong: ["Hanya layanan internet", "Hanya layanan TV", "Hanya layanan radio"] },
		{ description: "Pertanyaan tentang SS7.", question: "SS7 (Signaling System 7) digunakan pada...", correct: "Jaringan telepon untuk signaling dan kontrol panggilan", wrong: ["Jaringan WiFi", "Internet browsing", "Email server"] },
		{ description: "Pertanyaan tentang SDP.", question: "SDP (Session Description Protocol) digunakan bersama SIP untuk...", correct: "Mendeskripsikan parameter media dalam sesi multimedia", wrong: ["Mengenkripsi panggilan", "Transfer file", "Routing paket"] },
		{ description: "Pertanyaan tentang layer Network.", question: "Protokol IP bekerja pada layer OSI...", correct: "Layer 3 (Network)", wrong: ["Layer 1 (Physical)", "Layer 4 (Transport)", "Layer 7 (Application)"] },
		{ description: "Pertanyaan tentang layer Data Link.", question: "MAC address digunakan pada layer...", correct: "Layer 2 (Data Link)", wrong: ["Layer 1 (Physical)", "Layer 3 (Network)", "Layer 4 (Transport)"] },
		{ description: "Pertanyaan tentang UDP.", question: "Perbedaan utama UDP dengan TCP adalah...", correct: "UDP tidak menjamin pengiriman data (connectionless)", wrong: ["UDP lebih lambat", "UDP menggunakan 3-way handshake", "UDP hanya untuk email"] },
		{ description: "Pertanyaan tentang codec G.729.", question: "Codec G.729 menghasilkan audio dengan bitrate...", correct: "8 Kbps", wrong: ["64 Kbps", "128 Kbps", "32 Kbps"] },
		{ description: "Pertanyaan tentang GPON.", question: "GPON (G.984) adalah standar untuk...", correct: "Jaringan fiber optik pasif (Passive Optical Network)", wrong: ["Jaringan WiFi", "Jaringan seluler 5G", "Bluetooth mesh"] },
		{ description: "Pertanyaan tentang layer Session.", question: "Layer 5 (Session) pada model OSI bertanggung jawab untuk...", correct: "Manajemen sesi komunikasi antar aplikasi", wrong: ["Routing paket", "Transmisi bit", "Kompresi data"] },
		{ description: "Pertanyaan tentang encapsulation.", question: "Proses encapsulation pada model OSI adalah...", correct: "Penambahan header pada setiap layer saat data dikirim ke bawah", wrong: ["Penghapusan header", "Enkripsi data", "Kompresi file"] },
	],
	// Chapter 3: Teknik Modulasi dan Multiplexing
	[
		{ description: "Pertanyaan tentang AM.", question: "Pada modulasi AM, parameter sinyal pembawa yang diubah adalah...", correct: "Amplitudo", wrong: ["Frekuensi", "Fase", "Panjang gelombang"] },
		{ description: "Pertanyaan tentang FM.", question: "Keunggulan FM dibandingkan AM adalah...", correct: "Lebih tahan terhadap noise", wrong: ["Jangkauan lebih jauh", "Bandwidth lebih kecil", "Implementasi lebih murah"] },
		{ description: "Pertanyaan tentang PM.", question: "Phase Modulation (PM) mengubah parameter...", correct: "Fase sinyal pembawa", wrong: ["Amplitudo", "Frekuensi", "Panjang gelombang"] },
		{ description: "Pertanyaan tentang ASK.", question: "ASK (Amplitude Shift Keying) merepresentasikan data digital dengan mengubah...", correct: "Amplitudo sinyal pembawa", wrong: ["Frekuensi sinyal", "Fase sinyal", "Durasi sinyal"] },
		{ description: "Pertanyaan tentang FSK.", question: "FSK (Frequency Shift Keying) digunakan pada...", correct: "Modem dial-up dan komunikasi data sederhana", wrong: ["WiFi modern", "Satellite TV", "Jaringan 5G"] },
		{ description: "Pertanyaan tentang BPSK.", question: "BPSK (Binary Phase Shift Keying) mengirimkan berapa bit per simbol?", correct: "1 bit", wrong: ["2 bit", "4 bit", "8 bit"] },
		{ description: "Pertanyaan tentang QPSK.", question: "QPSK (Quadrature Phase Shift Keying) mengirimkan berapa bit per simbol?", correct: "2 bit", wrong: ["1 bit", "4 bit", "8 bit"] },
		{ description: "Pertanyaan tentang QAM.", question: "16-QAM mengirimkan berapa bit per simbol?", correct: "4 bit", wrong: ["2 bit", "8 bit", "16 bit"] },
		{ description: "Pertanyaan tentang 64-QAM.", question: "64-QAM mengirimkan berapa bit per simbol?", correct: "6 bit", wrong: ["4 bit", "8 bit", "64 bit"] },
		{ description: "Pertanyaan tentang 256-QAM.", question: "256-QAM digunakan pada teknologi...", correct: "WiFi (802.11ac) dan TV kabel digital", wrong: ["Radio AM", "Bluetooth", "NFC"] },
		{ description: "Pertanyaan tentang FDM.", question: "FDM (Frequency Division Multiplexing) bekerja dengan cara...", correct: "Membagi bandwidth menjadi sub-channel dengan frekuensi berbeda", wrong: ["Membagi waktu transmisi", "Menggunakan kode unik", "Menggunakan panjang gelombang berbeda"] },
		{ description: "Pertanyaan tentang TDM.", question: "TDM (Time Division Multiplexing) membagi transmisi berdasarkan...", correct: "Slot waktu untuk setiap channel", wrong: ["Frekuensi", "Kode", "Panjang gelombang"] },
		{ description: "Pertanyaan tentang WDM.", question: "WDM (Wavelength Division Multiplexing) digunakan pada...", correct: "Jaringan fiber optik", wrong: ["Kabel tembaga", "Jaringan WiFi", "Jaringan seluler"] },
		{ description: "Pertanyaan tentang DWDM.", question: "DWDM (Dense WDM) dapat menampung hingga...", correct: "160 channel per fiber", wrong: ["10 channel", "32 channel", "1000 channel"] },
		{ description: "Pertanyaan tentang CDM.", question: "CDM (Code Division Multiplexing) menggunakan...", correct: "Kode unik untuk setiap channel", wrong: ["Frekuensi berbeda", "Waktu berbeda", "Panjang gelombang berbeda"] },
		{ description: "Pertanyaan tentang CDMA.", question: "CDMA banyak digunakan pada jaringan seluler generasi...", correct: "3G", wrong: ["1G", "2G", "5G"] },
		{ description: "Pertanyaan tentang OFDM.", question: "OFDM (Orthogonal FDM) digunakan pada...", correct: "WiFi, LTE, dan DVB-T", wrong: ["Radio AM", "Telepon analog", "Telegraph"] },
		{ description: "Pertanyaan tentang baud rate.", question: "Baud rate mengukur...", correct: "Jumlah perubahan sinyal per detik", wrong: ["Jumlah bit per detik", "Jumlah byte per detik", "Jumlah paket per detik"] },
		{ description: "Pertanyaan tentang bit rate vs baud rate.", question: "Jika menggunakan QPSK, hubungan bit rate dan baud rate adalah...", correct: "Bit rate = 2 × baud rate", wrong: ["Bit rate = baud rate", "Bit rate = 4 × baud rate", "Bit rate = baud rate / 2"] },
		{ description: "Pertanyaan tentang Nyquist.", question: "Teorema Nyquist menyatakan bahwa sampling rate minimum harus...", correct: "2 kali frekuensi sinyal tertinggi", wrong: ["Sama dengan frekuensi sinyal", "3 kali frekuensi sinyal", "4 kali frekuensi sinyal"] },
		{ description: "Pertanyaan tentang Shannon.", question: "Rumus kapasitas Shannon menghitung...", correct: "Kapasitas maksimum channel berdasarkan bandwidth dan SNR", wrong: ["Kecepatan cahaya", "Impedansi kabel", "Jarak transmisi"] },
		{ description: "Pertanyaan tentang SNR.", question: "SNR (Signal-to-Noise Ratio) yang tinggi berarti...", correct: "Kualitas sinyal baik dengan noise rendah", wrong: ["Banyak noise", "Sinyal lemah", "Bandwidth rendah"] },
		{ description: "Pertanyaan tentang constellation diagram.", question: "Constellation diagram digunakan untuk memvisualisasikan...", correct: "Posisi simbol dalam modulasi digital (seperti QAM dan PSK)", wrong: ["Topologi jaringan", "Routing tabel", "Struktur kabel"] },
		{ description: "Pertanyaan tentang ADSL.", question: "ADSL menggunakan teknik multiplexing...", correct: "FDM (membagi frekuensi untuk voice dan data)", wrong: ["TDM", "CDM", "WDM"] },
		{ description: "Pertanyaan tentang penggunaan AM.", question: "Modulasi AM masih digunakan pada...", correct: "Siaran radio AM dan komunikasi penerbangan", wrong: ["WiFi modern", "Jaringan 5G", "Bluetooth"] },
	],
	// Chapter 4: Keamanan Jaringan Telekomunikasi
	[
		{ description: "Pertanyaan tentang MITM.", question: "Serangan Man-in-the-Middle (MITM) bekerja dengan cara...", correct: "Menyisipkan diri di antara dua pihak yang berkomunikasi", wrong: ["Membanjiri server", "Menebak password", "Menghapus file"] },
		{ description: "Pertanyaan tentang DDoS.", question: "Serangan DDoS bertujuan untuk...", correct: "Membuat layanan tidak tersedia dengan membanjiri trafik", wrong: ["Mencuri data pengguna", "Mengenkripsi file korban", "Menyadap komunikasi"] },
		{ description: "Pertanyaan tentang spoofing.", question: "IP Spoofing adalah teknik...", correct: "Memalsukan alamat IP sumber pada paket data", wrong: ["Mengenkripsi alamat IP", "Mempercepat koneksi", "Menambah bandwidth"] },
		{ description: "Pertanyaan tentang phishing.", question: "Phishing adalah serangan yang...", correct: "Menipu pengguna agar memberikan informasi sensitif melalui situs palsu", wrong: ["Menyerang hardware", "Merusak kabel jaringan", "Memblokir sinyal WiFi"] },
		{ description: "Pertanyaan tentang enkripsi simetris.", question: "Pada enkripsi simetris, jumlah kunci yang digunakan adalah...", correct: "Satu kunci yang sama untuk enkripsi dan dekripsi", wrong: ["Dua kunci berbeda", "Tiga kunci", "Tidak menggunakan kunci"] },
		{ description: "Pertanyaan tentang AES.", question: "AES (Advanced Encryption Standard) mendukung ukuran kunci...", correct: "128, 192, dan 256 bit", wrong: ["Hanya 64 bit", "Hanya 128 bit", "512 bit"] },
		{ description: "Pertanyaan tentang RSA.", question: "RSA termasuk jenis enkripsi...", correct: "Asimetris (menggunakan kunci publik dan privat)", wrong: ["Simetris", "Hashing", "Encoding"] },
		{ description: "Pertanyaan tentang hashing.", question: "Perbedaan hashing dengan enkripsi adalah...", correct: "Hashing bersifat satu arah (tidak bisa didekripsi)", wrong: ["Hashing bisa didekripsi", "Enkripsi lebih cepat", "Hashing menggunakan kunci"] },
		{ description: "Pertanyaan tentang SHA-256.", question: "SHA-256 menghasilkan output hash sepanjang...", correct: "256 bit", wrong: ["128 bit", "512 bit", "64 bit"] },
		{ description: "Pertanyaan tentang firewall.", question: "Stateful inspection firewall bekerja dengan cara...", correct: "Melacak status koneksi dan menyaring berdasarkan konteks sesi", wrong: ["Hanya memeriksa header paket", "Memblokir semua trafik", "Hanya bekerja di layer 7"] },
		{ description: "Pertanyaan tentang packet filtering.", question: "Packet filtering firewall menyaring trafik berdasarkan...", correct: "Header paket (IP, port, protokol)", wrong: ["Isi konten data", "Identitas pengguna", "Waktu akses saja"] },
		{ description: "Pertanyaan tentang VPN.", question: "VPN (Virtual Private Network) berfungsi untuk...", correct: "Membuat tunnel terenkripsi melalui jaringan publik", wrong: ["Mempercepat koneksi internet", "Menghapus virus", "Memblokir iklan"] },
		{ description: "Pertanyaan tentang IPSec.", question: "IPSec beroperasi pada layer...", correct: "Layer 3 (Network)", wrong: ["Layer 2 (Data Link)", "Layer 4 (Transport)", "Layer 7 (Application)"] },
		{ description: "Pertanyaan tentang IDS vs IPS.", question: "Perbedaan utama IDS dan IPS adalah...", correct: "IDS hanya mendeteksi, IPS mendeteksi dan memblokir", wrong: ["IDS lebih baru", "IPS hanya mendeteksi", "Keduanya sama"] },
		{ description: "Pertanyaan tentang SSL/TLS.", question: "SSL/TLS digunakan untuk...", correct: "Mengamankan komunikasi web (HTTPS) dengan enkripsi", wrong: ["Transfer file besar", "Routing paket", "Kompresi data"] },
		{ description: "Pertanyaan tentang PKI.", question: "PKI (Public Key Infrastructure) menyediakan...", correct: "Kerangka kerja untuk manajemen sertifikat digital dan kunci publik", wrong: ["Hardware firewall", "Antivirus", "Jaringan VPN"] },
		{ description: "Pertanyaan tentang digital certificate.", question: "Sertifikat digital dikeluarkan oleh...", correct: "Certificate Authority (CA)", wrong: ["ISP", "Pengguna sendiri", "Firewall"] },
		{ description: "Pertanyaan tentang ransomware.", question: "Ransomware adalah malware yang...", correct: "Mengenkripsi file korban dan meminta tebusan", wrong: ["Menghapus semua file", "Memperlambat internet", "Menampilkan iklan"] },
		{ description: "Pertanyaan tentang social engineering.", question: "Social engineering dalam konteks keamanan adalah...", correct: "Memanipulasi orang untuk memberikan informasi rahasia", wrong: ["Membangun jaringan sosial", "Teknik pemrograman", "Desain antarmuka pengguna"] },
		{ description: "Pertanyaan tentang WireGuard.", question: "WireGuard adalah...", correct: "Protokol VPN modern yang ringan dan cepat", wrong: ["Firewall hardware", "Antivirus", "Sistem operasi"] },
		{ description: "Pertanyaan tentang Diffie-Hellman.", question: "Protokol Diffie-Hellman digunakan untuk...", correct: "Pertukaran kunci secara aman melalui channel tidak aman", wrong: ["Enkripsi file", "Hashing password", "Transfer file"] },
		{ description: "Pertanyaan tentang next-gen firewall.", question: "Next-Generation Firewall (NGFW) memiliki kemampuan tambahan berupa...", correct: "Deep packet inspection dan threat intelligence", wrong: ["Hanya packet filtering", "Hanya NAT", "Hanya logging"] },
		{ description: "Pertanyaan tentang anomaly-based detection.", question: "Anomaly-based detection pada IDS bekerja dengan...", correct: "Mendeteksi pola trafik yang menyimpang dari baseline normal", wrong: ["Mencocokkan signature malware", "Memblokir semua trafik", "Hanya memeriksa email"] },
		{ description: "Pertanyaan tentang eavesdropping.", question: "Eavesdropping pada jaringan termasuk jenis serangan...", correct: "Pasif (hanya menyadap tanpa mengubah data)", wrong: ["Aktif", "Fisik", "Internal"] },
		{ description: "Pertanyaan tentang 3DES.", question: "3DES (Triple DES) melakukan proses enkripsi sebanyak...", correct: "3 kali", wrong: ["1 kali", "2 kali", "6 kali"] },
	],
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDifficultyForLevel(level: number): "easy" | "medium" | "hard" {
	if (level <= 7) return "easy";
	if (level <= 14) return "medium";
	return "hard";
}

function generateQuestionsForQuiz(
	chapterTemplateIndex: number,
	quizId: number,
	chapterId: number,
	materialIds: number[],
): {
	chapterId: number;
	quizId: number;
	materialId: number;
	description: string;
	question: string;
	options: { text: string; isCorrect: boolean }[];
}[] {
	const templates = telcoQuestionTemplates[chapterTemplateIndex];
	const picked = faker.helpers.arrayElements(templates, 10);

	return picked.map((t) => {
		const shuffledOptions = faker.helpers.shuffle([
			{ text: t.correct, isCorrect: true },
			{ text: t.wrong[0], isCorrect: false },
			{ text: t.wrong[1], isCorrect: false },
			{ text: t.wrong[2], isCorrect: false },
		]);

		return {
			chapterId,
			quizId,
			materialId: faker.helpers.arrayElement(materialIds),
			description: t.description,
			question: t.question,
			options: shuffledOptions,
		};
	});
}

const schoolNames = [
	"SMKN 1 Jakarta",
	"SMKN 2 Bandung",
	"SMKN 3 Surabaya",
	"SMA Negeri 1 Yogyakarta",
	"SMK Telkom Purwokerto",
];

async function generateMockUsers(schoolIds: number[]) {
	const passwordHash = await hashPassword("password123");

	return Array.from({ length: 100 }, (_, i) => {
		const id = generateRandomString(32, "a-z", "0-9");
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();

		return {
			user: {
				id,
				name: `${firstName} ${lastName}`,
				email: `user${i}@mock.test`,
				emailVerified: true,
				image: null,
				role: "user",
				schoolId: faker.helpers.arrayElement(schoolIds),
				gender: faker.datatype.boolean(),
				grade: faker.helpers.arrayElement(["X", "XI", "XII"]),
				bio: faker.lorem.sentence(),
				hasTakenPretest: false,
				banned: false,
			},
			account: {
				id: generateRandomString(32, "a-z", "0-9"),
				accountId: id,
				providerId: "credential",
				userId: id,
				password: passwordHash,
			},
		};
	});
}

function generateQuizSubmissions(
	userIds: string[],
	allQuizData: { quizId: number; chapterId: number; level: number }[],
) {
	const byChapter = new Map<
		number,
		{ quizId: number; chapterId: number; level: number }[]
	>();
	for (const q of allQuizData) {
		const arr = byChapter.get(q.chapterId) ?? [];
		arr.push(q);
		byChapter.set(q.chapterId, arr);
	}

	const subs: {
		userId: string;
		chapterId: number;
		quizId: number;
		score: number;
	}[] = [];

	for (const userId of userIds) {
		const userType = faker.helpers.weightedArrayElement([
			{ value: "power" as const, weight: 20 },
			{ value: "regular" as const, weight: 50 },
			{ value: "casual" as const, weight: 30 },
		]);

		const maxLevel =
			userType === "power" ? 20 : userType === "regular" ? 10 : 3;
		const skipChance =
			userType === "power" ? 0.1 : userType === "regular" ? 0.4 : 0.6;

		for (const [chapterId, chapterQuizzes] of byChapter) {
			if (faker.number.float({ max: 1 }) < skipChance) continue;

			const userMaxLevel = faker.number.int({ min: 1, max: maxLevel });
			const eligible = chapterQuizzes
				.filter((q) => q.level <= userMaxLevel)
				.sort((a, b) => a.level - b.level);

			for (const quiz of eligible) {
				const baseMin =
					quiz.level <= 7 ? 50 : quiz.level <= 14 ? 30 : 20;
				const baseMax =
					quiz.level <= 7 ? 100 : quiz.level <= 14 ? 90 : 80;
				const score = Math.round(
					faker.number.int({ min: baseMin, max: baseMax }),
				);

				subs.push({ userId, chapterId, quizId: quiz.quizId, score });
			}
		}
	}

	return subs;
}

function generatePretestSubmissions(
	userIds: string[],
	pretestQuestionsWithOptions: {
		questionId: number;
		correctOptionId: number;
		wrongOptionIds: number[];
	}[],
) {
	const takenUserIds = faker.helpers.arrayElements(
		userIds,
		Math.min(80, userIds.length),
	);
	const subs: {
		userId: string;
		questionId: number;
		answeredOptionId: number;
		isCorrect: boolean;
	}[] = [];

	for (const userId of takenUserIds) {
		for (const pq of pretestQuestionsWithOptions) {
			const answersCorrectly = faker.number.float({ max: 1 }) < 0.7;
			const answeredOptionId = answersCorrectly
				? pq.correctOptionId
				: faker.helpers.arrayElement(pq.wrongOptionIds);

			subs.push({
				userId,
				questionId: pq.questionId,
				answeredOptionId,
				isCorrect: answersCorrectly,
			});
		}
	}

	return { submissions: subs, userIdsWhoTookPretest: takenUserIds };
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

const scaleMode = process.argv.includes("--scale");

async function seed() {
	faker.seed(42);

	if (scaleMode) {
		console.log("MODE: --scale (essentials + telco chapters + 100 users + submissions)\n");
	} else {
		console.log("MODE: essentials only (2 chapters, 12 quizzes, ~89 questions)\n");
		console.log("  Tip: run with --scale for full scale-test data\n");
	}

	try {
		// ================================================================
		// PHASE 1: CONTENT DATA (essentials)
		// ================================================================

		const allChapterTitles = scaleMode
			? [...chaptersData, ...telcoChaptersData].map((c) => c.title)
			: chaptersData.map((c) => c.title);

		const existingChapters = await db
			.select()
			.from(chapters)
			.where(inArray(chapters.title, allChapterTitles))
			.orderBy(asc(chapters.id));

		const contentAlreadySeeded = existingChapters.length === allChapterTitles.length;

		// 1. Study Materials
		let insertedMaterials: (typeof studyMaterials.$inferSelect)[];
		if (contentAlreadySeeded) {
			console.log("[Phase 1] Materi pembelajaran sudah ada, skip insert...");
			insertedMaterials = await db
				.select()
				.from(studyMaterials)
				.orderBy(asc(studyMaterials.id));
		} else {
			console.log("[Phase 1] Memasukkan data materi pembelajaran...");
			const materialsToInsert = scaleMode
				? [...studyMaterialsData, ...telcoStudyMaterialsData]
				: studyMaterialsData;
			insertedMaterials = await db
				.insert(studyMaterials)
				.values(materialsToInsert)
				.returning();
			console.log(`  ${insertedMaterials.length} materi pembelajaran berhasil dimasukkan`);
		}

		// 2. Chapters
		let insertedChapters: (typeof chapters.$inferSelect)[];
		if (contentAlreadySeeded) {
			console.log("[Phase 1] Bab sudah ada, skip insert...");
			insertedChapters = existingChapters;
		} else {
			console.log("[Phase 1] Memasukkan data bab...");
			const chaptersToInsert = scaleMode
				? [...chaptersData, ...telcoChaptersData]
				: chaptersData;
			insertedChapters = await db
				.insert(chapters)
				.values(chaptersToInsert)
				.returning();
			console.log(`  ${insertedChapters.length} bab berhasil dimasukkan`);
		}

		// 3–5. Pretest questions, quizzes, and quiz questions
		const pretestQuestionsWithOptions: {
			questionId: number;
			correctOptionId: number;
			wrongOptionIds: number[];
		}[] = [];
		let totalQuizzes = 0;
		let totalQuestions = 0;
		const allQuizData: {
			quizId: number;
			chapterId: number;
			level: number;
		}[] = [];

		if (contentAlreadySeeded) {
			console.log("[Phase 1] Pertanyaan & kuis sudah ada, skip insert...");

			const chapterIds = insertedChapters.map((c) => c.id);
			const existingPretestQs = await db
				.select({ id: questions.id, chapterId: questions.chapterId })
				.from(questions)
				.where(
					eq(questions.type, "pretest"),
				);
			for (const pq of existingPretestQs) {
				const opts = await db
					.select()
					.from(options)
					.where(eq(options.questionId, pq.id));
				const correct = opts.find((o) => o.isCorrect);
				if (correct) {
					pretestQuestionsWithOptions.push({
						questionId: pq.id,
						correctOptionId: correct.id,
						wrongOptionIds: opts.filter((o) => !o.isCorrect).map((o) => o.id),
					});
				}
			}

			const existingQuizzes = await db
				.select()
				.from(quizzes)
				.where(inArray(quizzes.chapterId, chapterIds))
				.orderBy(asc(quizzes.id));
			for (const q of existingQuizzes) {
				allQuizData.push({
					quizId: q.id,
					chapterId: q.chapterId!,
					level: q.level,
				});
			}
			totalQuizzes = existingQuizzes.length;

			console.log(`  ${pretestQuestionsWithOptions.length} pertanyaan pretes ditemukan`);
			console.log(`  ${totalQuizzes} kuis ditemukan`);
		} else {
			// 3. Insert Pretest Questions (existing 2)
			console.log("[Phase 1] Memasukkan data pertanyaan pretes...");
			for (const pretest of pretestData) {
				const chapter = insertedChapters[pretest.chapterIndex];
				const material = insertedMaterials[pretest.materialIndex];

				const [insertedQuestion] = await db
					.insert(questions)
					.values({
						type: "pretest",
						chapterId: chapter.id,
						quizId: null,
						materialId: material.id,
						imageLink: pretest.imageLink,
						description: pretest.description,
						question: pretest.question,
					})
					.returning();

				const insertedOpts = await db
					.insert(options)
					.values(
						pretest.options.map((opt) => ({
							questionId: insertedQuestion.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					)
					.returning();

				pretestQuestionsWithOptions.push({
					questionId: insertedQuestion.id,
					correctOptionId: insertedOpts.find((o) => o.isCorrect)!.id,
					wrongOptionIds: insertedOpts
						.filter((o) => !o.isCorrect)
						.map((o) => o.id),
				});
			}
			console.log(`  ${pretestData.length} pertanyaan pretes berhasil dimasukkan`);

			// 3b. Insert Telco Pretest Questions (scale only)
			if (scaleMode) {
				console.log("[Phase 1] Memasukkan data pertanyaan pretes (telco)...");
				for (const pretest of telcoPretestData) {
					const chapter = insertedChapters[pretest.chapterOffset];
					const material = insertedMaterials[pretest.materialOffset];

					const [insertedQuestion] = await db
						.insert(questions)
						.values({
							type: "pretest",
							chapterId: chapter.id,
							quizId: null,
							materialId: material.id,
							imageLink: pretest.imageLink,
							description: pretest.description,
							question: pretest.question,
						})
						.returning();

					const insertedOpts = await db
						.insert(options)
						.values(
							pretest.options.map((opt) => ({
								questionId: insertedQuestion.id,
								text: opt.text,
								isCorrect: opt.isCorrect,
							})),
						)
						.returning();

					pretestQuestionsWithOptions.push({
						questionId: insertedQuestion.id,
						correctOptionId: insertedOpts.find((o) => o.isCorrect)!.id,
						wrongOptionIds: insertedOpts
							.filter((o) => !o.isCorrect)
							.map((o) => o.id),
					});
				}
				console.log(
					`  ${telcoPretestData.length} pertanyaan pretes (telco) berhasil dimasukkan`,
				);
			}

			// 4. Insert Existing Quizzes and Questions (12 quizzes, ~89 questions)
			console.log("[Phase 1] Memasukkan data kuis existing...");

			for (const quizData of quizzesData) {
				const chapter = insertedChapters[quizData.chapterIndex];

				const [insertedQuiz] = await db
					.insert(quizzes)
					.values({
						chapterId: chapter.id,
						title: quizData.title,
						level: quizData.level,
						difficulty: quizData.difficulty,
					})
					.returning();

				allQuizData.push({
					quizId: insertedQuiz.id,
					chapterId: chapter.id,
					level: quizData.level,
				});
				totalQuizzes++;

				for (const questionData of quizData.questions) {
					const material = insertedMaterials[questionData.materialIndex];

					const [insertedQuestion] = await db
						.insert(questions)
						.values({
							type: "quiz",
							chapterId: chapter.id,
							quizId: insertedQuiz.id,
							materialId: material.id,
							imageLink: questionData.imageLink,
							description: questionData.description,
							question: questionData.question,
						})
						.returning();

					await db.insert(options).values(
						questionData.options.map((opt) => ({
							questionId: insertedQuestion.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					);

					totalQuestions++;
				}
			}
			console.log(`  ${totalQuizzes} kuis existing berhasil dimasukkan`);
			console.log(`  ${totalQuestions} pertanyaan existing berhasil dimasukkan`);

			// 5. Insert Telco Quizzes (scale only)
			if (scaleMode) {
				console.log(
					"[Phase 1] Memasukkan data kuis telco (5 bab x 20 level x 10 soal)...",
				);
				let telcoQuizCount = 0;
				let telcoQuestionCount = 0;

				for (let ci = 0; ci < telcoChaptersData.length; ci++) {
					const chapter = insertedChapters[ci + 2];
					const chapterMaterialIds = [
						insertedMaterials[13 + ci * 3].id,
						insertedMaterials[13 + ci * 3 + 1].id,
						insertedMaterials[13 + ci * 3 + 2].id,
					];

					const quizInsertData = Array.from({ length: 20 }, (_, li) => ({
						chapterId: chapter.id,
						title: `${telcoChaptersData[ci].title} - Level ${li + 1}`,
						level: li + 1,
						difficulty: getDifficultyForLevel(li + 1),
					}));
					const insertedQuizzes = await db
						.insert(quizzes)
						.values(quizInsertData)
						.returning();

					for (const quiz of insertedQuizzes) {
						allQuizData.push({
							quizId: quiz.id,
							chapterId: chapter.id,
							level: quiz.level,
						});
					}
					telcoQuizCount += insertedQuizzes.length;

					const allQuestionsData = insertedQuizzes.flatMap((quiz) =>
						generateQuestionsForQuiz(
							ci,
							quiz.id,
							chapter.id,
							chapterMaterialIds,
						),
					);

					const insertedQs = await db
						.insert(questions)
						.values(
							allQuestionsData.map((q) => ({
								type: "quiz" as const,
								chapterId: q.chapterId,
								quizId: q.quizId,
								materialId: q.materialId,
								imageLink: null,
								description: q.description,
								question: q.question,
							})),
						)
						.returning();

					const allOptionsData = insertedQs.flatMap((iq, idx) =>
						allQuestionsData[idx].options.map((opt) => ({
							questionId: iq.id,
							text: opt.text,
							isCorrect: opt.isCorrect,
						})),
					);
					await db.insert(options).values(allOptionsData);

					telcoQuestionCount += insertedQs.length;
					console.log(
						`  Bab "${telcoChaptersData[ci].title}": ${insertedQuizzes.length} kuis, ${insertedQs.length} soal`,
					);
				}

				totalQuizzes += telcoQuizCount;
				totalQuestions += telcoQuestionCount;
			}
		}

		// ================================================================
		// PHASE 2 & 3: USERS + SUBMISSIONS (scale only)
		// ================================================================

		let schoolCount = 0;
		let userCount = 0;
		let quizSubCount = 0;
		let pretestSubCount = 0;

		if (scaleMode) {
			// 6. Insert Schools
			console.log("\n[Phase 2] Memasukkan data sekolah...");
			const existingSchools = await db
				.select()
				.from(schools)
				.where(inArray(schools.name, schoolNames));

			let insertedSchools: (typeof schools.$inferSelect)[];
			if (existingSchools.length === schoolNames.length) {
				console.log("  Sekolah sudah ada, skip insert...");
				insertedSchools = existingSchools;
			} else {
				const existingNames = new Set(existingSchools.map((s) => s.name));
				const newSchools = schoolNames
					.filter((name) => !existingNames.has(name))
					.map((name) => ({ name }));
				const freshSchools = newSchools.length > 0
					? await db.insert(schools).values(newSchools).returning()
					: [];
				insertedSchools = [...existingSchools, ...freshSchools];
				console.log(`  ${freshSchools.length} sekolah baru dimasukkan, ${existingSchools.length} sudah ada`);
			}
			schoolCount = insertedSchools.length;

			// 7. Insert Users + Accounts
			const existingMockUsers = await db
				.select({ id: users.id })
				.from(users)
				.where(like(users.email, "user%@mock.test"));

			let userIds: string[];
			if (existingMockUsers.length > 0) {
				console.log(`[Phase 2] ${existingMockUsers.length} mock users sudah ada, skip insert...`);
				userIds = existingMockUsers.map((u) => u.id);
				userCount = existingMockUsers.length;
			} else {
				console.log("[Phase 2] Generating 100 mock users...");
				const schoolIds = insertedSchools.map((s) => s.id);
				const mockUsers = await generateMockUsers(schoolIds);

				const insertedUsers = await db
					.insert(users)
					.values(mockUsers.map((m) => m.user))
					.returning();
				userCount = insertedUsers.length;
				console.log(`  ${userCount} pengguna berhasil dimasukkan`);

				await db.insert(accounts).values(mockUsers.map((m) => m.account));
				console.log(`  ${mockUsers.length} akun berhasil dimasukkan`);
				userIds = insertedUsers.map((u) => u.id);
			}

			// 9. Quiz Submissions
			console.log("\n[Phase 3] Clearing existing mock user submissions...");
			await db.delete(submissions).where(inArray(submissions.userId, userIds));
			await db.delete(pretestSubmissions).where(inArray(pretestSubmissions.userId, userIds));

			console.log("[Phase 3] Generating quiz submissions...");
			const quizSubs = generateQuizSubmissions(userIds, allQuizData);
			for (let i = 0; i < quizSubs.length; i += 500) {
				await db
					.insert(submissions)
					.values(quizSubs.slice(i, i + 500));
			}
			quizSubCount = quizSubs.length;
			console.log(`  ${quizSubCount} quiz submissions berhasil dimasukkan`);

			// 10. Pretest Submissions
			console.log("[Phase 3] Generating pretest submissions...");
			const { submissions: pretestSubs, userIdsWhoTookPretest } =
				generatePretestSubmissions(
					userIds,
					pretestQuestionsWithOptions,
				);
			for (let i = 0; i < pretestSubs.length; i += 500) {
				await db
					.insert(pretestSubmissions)
					.values(pretestSubs.slice(i, i + 500));
			}
			pretestSubCount = pretestSubs.length;
			console.log(
				`  ${pretestSubCount} pretest submissions berhasil dimasukkan`,
			);

			// 11. Update hasTakenPretest
			if (userIdsWhoTookPretest.length > 0) {
				await db
					.update(users)
					.set({ hasTakenPretest: true })
					.where(inArray(users.id, userIdsWhoTookPretest));
				console.log(
					`  ${userIdsWhoTookPretest.length} pengguna ditandai sudah pretest`,
				);
			}

			// 12. Activity logs for devan@gmail.com
			console.log("\n[Phase 4] Generating activity logs for devan@gmail.com...");

			const existingDevan = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, "devan@gmail.com"))
				.limit(1);

			let devanId: string;

			if (existingDevan.length > 0) {
				devanId = existingDevan[0].id;
				console.log(`  User devan@gmail.com already exists (id: ${devanId}), skipping creation`);
				await db
					.delete(submissions)
					.where(eq(submissions.userId, devanId));
				console.log("  Cleared existing submissions for devan@gmail.com");
			} else {
				devanId = generateRandomString(32, "a-z", "0-9");
				const devanPasswordHash = await hashPassword("password123");

				await db.insert(users).values({
					id: devanId,
					name: "Devan",
					email: "devan@gmail.com",
					emailVerified: true,
					image: null,
					role: "user",
					schoolId: insertedSchools[0].id,
					gender: true,
					grade: "XI",
					bio: "Test user for activity logs",
					hasTakenPretest: false,
					banned: false,
				});
				await db.insert(accounts).values({
					id: generateRandomString(32, "a-z", "0-9"),
					accountId: devanId,
					providerId: "credential",
					userId: devanId,
					password: devanPasswordHash,
				});
				console.log("  User devan@gmail.com created");
			}

			const now = new Date();
			const activitySubs: {
				userId: string;
				chapterId: number;
				quizId: number;
				score: number;
				createdAt: Date;
			}[] = [];

			for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
				const date = new Date(
					Date.UTC(
						now.getUTCFullYear(),
						now.getUTCMonth(),
						now.getUTCDate() - dayOffset,
						faker.number.int({ min: 8, max: 20 }),
						faker.number.int({ min: 0, max: 59 }),
					),
				);

				const quizzesForDay = faker.helpers.arrayElements(
					allQuizData,
					faker.number.int({ min: 1, max: Math.min(4, allQuizData.length) }),
				);

				for (const quiz of quizzesForDay) {
					const retries = faker.number.int({ min: 1, max: 3 });
					for (let r = 0; r < retries; r++) {
						activitySubs.push({
							userId: devanId,
							chapterId: quiz.chapterId,
							quizId: quiz.quizId,
							score: faker.number.int({ min: 40, max: 100 }),
							createdAt: new Date(date.getTime() + r * 60_000),
						});
					}
				}
			}

			await db.insert(submissions).values(activitySubs);
			console.log(
				`  ${activitySubs.length} activity submissions for devan@gmail.com berhasil dimasukkan`,
			);
		}

		// Summary
		const totalPretests =
			pretestData.length + (scaleMode ? telcoPretestData.length : 0);
		console.log("\n===================================================");
		console.log(
			`     RINGKASAN SEEDING ${scaleMode ? "(SCALE)" : "(ESSENTIALS)"}`,
		);
		console.log("===================================================");
		console.log(`  Materi Pembelajaran : ${insertedMaterials.length}`);
		console.log(`  Bab                 : ${insertedChapters.length}`);
		console.log(`  Pertanyaan Pretes   : ${totalPretests}`);
		console.log(`  Kuis                : ${totalQuizzes}`);
		console.log(`  Pertanyaan Kuis     : ${totalQuestions}`);
		console.log(
			`  Opsi Jawaban        : ~${(totalPretests + totalQuestions) * 4}`,
		);
		if (scaleMode) {
			console.log(`  Sekolah             : ${schoolCount}`);
			console.log(`  Pengguna            : ${userCount}`);
			console.log(`  Quiz Submissions    : ${quizSubCount}`);
			console.log(`  Pretest Submissions : ${pretestSubCount}`);
		}
		console.log("===================================================");
		console.log("\nSeeding database berhasil diselesaikan!");
	} catch (error) {
		console.error("\nTerjadi kesalahan saat seeding:");
		console.error(error);
		process.exit(1);
	}

	process.exit(0);
}

seed();
