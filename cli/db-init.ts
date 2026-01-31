import { db } from "../src/lib/db";
import {
	chapters,
	quizzes,
	questions,
	options,
	studyMaterials,
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
// MAIN SEED FUNCTION
// ============================================================================

async function seed() {
	console.log("🌱 Memulai proses seeding database...\n");

	try {
		// Step 1: Insert Study Materials
		console.log("📚 Memasukkan data materi pembelajaran...");
		const insertedMaterials = await db
			.insert(studyMaterials)
			.values(studyMaterialsData)
			.returning();
		console.log(`   ✓ ${insertedMaterials.length} materi pembelajaran berhasil dimasukkan\n`);

		// Step 2: Insert Chapters
		console.log("📖 Memasukkan data bab...");
		const insertedChapters = await db
			.insert(chapters)
			.values(chaptersData)
			.returning();
		console.log(`   ✓ ${insertedChapters.length} bab berhasil dimasukkan\n`);

		// Step 3: Insert Pretest Questions
		console.log("📝 Memasukkan data pertanyaan pretes...");
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

			await db.insert(options).values(
				pretest.options.map((opt) => ({
					questionId: insertedQuestion.id,
					text: opt.text,
					isCorrect: opt.isCorrect,
				}))
			);
		}
		console.log(`   ✓ ${pretestData.length} pertanyaan pretes berhasil dimasukkan\n`);

		// Step 4: Insert Quizzes and Questions
		console.log("🎯 Memasukkan data kuis dan pertanyaan...");
		let totalQuizzes = 0;
		let totalQuestions = 0;

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
					}))
				);

				totalQuestions++;
			}
		}
		console.log(`   ✓ ${totalQuizzes} kuis berhasil dimasukkan`);
		console.log(`   ✓ ${totalQuestions} pertanyaan kuis berhasil dimasukkan\n`);

		// Summary
		console.log("═══════════════════════════════════════════════════════════");
		console.log("                    RINGKASAN SEEDING                       ");
		console.log("═══════════════════════════════════════════════════════════");
		console.log(`   📚 Materi Pembelajaran : ${insertedMaterials.length}`);
		console.log(`   📖 Bab                 : ${insertedChapters.length}`);
		console.log(`   📝 Pertanyaan Pretes   : ${pretestData.length}`);
		console.log(`   🎯 Kuis                : ${totalQuizzes}`);
		console.log(`   ❓ Pertanyaan Kuis     : ${totalQuestions}`);
		console.log(`   🔘 Opsi Jawaban        : ${(pretestData.length + totalQuestions) * 4}`);
		console.log("═══════════════════════════════════════════════════════════");
		console.log("\n✅ Seeding database berhasil diselesaikan!");
	} catch (error) {
		console.error("\n❌ Terjadi kesalahan saat seeding:");
		console.error(error);
		process.exit(1);
	}

	process.exit(0);
}

seed();
