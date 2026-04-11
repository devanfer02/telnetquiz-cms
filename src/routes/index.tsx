import { createFileRoute, Link } from "@tanstack/react-router";
import {
	BookOpen,
	Brain,
	GraduationCap,
	Shield,
	Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Nav */}
			<nav className="border-b border-gray-100">
				<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<img
							src="/telnetquiz.webp"
							alt="TelNetQuiz"
							className="w-9 h-9 rounded-xl"
						/>
						<span className="font-bold text-xl text-[#F37704]">TelNetQuiz</span>
					</div>
					<div className="flex items-center gap-4">
						<Link
							to="/privacy"
							className="text-sm text-gray-500 hover:text-gray-700"
						>
							Privacy Policy
						</Link>
						<Link
							to="/auth/sign-in"
							className="px-4 py-2 bg-[#F37704] text-white rounded-lg text-sm font-medium hover:bg-[#d96800] transition-colors"
						>
							Admin Panel
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="max-w-6xl mx-auto px-6 py-20">
				<div className="flex flex-col lg:flex-row items-center gap-12">
					<div className="flex-1 space-y-6">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full text-sm text-[#F37704] font-medium">
							<GraduationCap className="w-4 h-4" />
							Media Pembelajaran Interaktif
						</div>
						<h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
							TelNetQuiz
						</h1>
						<p className="text-lg text-gray-600 leading-relaxed max-w-lg">
							Aplikasi media pembelajaran berbasis kuis interaktif untuk mata
							pelajaran{" "}
							<strong className="text-gray-800">
								Media dan Jaringan Telekomunikasi
							</strong>{" "}
							bagi siswa SMK jurusan Teknik Komputer dan Jaringan.
						</p>
						<div className="flex items-center gap-4 pt-2">
							<a
								href="https://github.com/devanfer02/telnetquiz-mobile"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-5 py-3 bg-[#F37704] text-white rounded-xl font-semibold hover:bg-[#d96800] transition-colors"
							>
								<Smartphone className="w-5 h-5" />
								Download App
							</a>
						</div>
					</div>
					<div className="flex-shrink-0">
						<img
							src="/assets/mascot-hero.png"
							alt="TelNetQuiz mascot Litecartes"
							className="w-72 lg:w-80 drop-shadow-xl"
						/>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="bg-orange-50/50 py-20">
				<div className="max-w-6xl mx-auto px-6">
					<h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
						Fitur Utama
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<FeatureCard
							icon={<Brain className="w-6 h-6 text-[#F37704]" />}
							title="Kuis Interaktif"
							description="Kuis bertingkat dengan berbagai level kesulitan untuk menguji pemahaman siswa tentang media dan jaringan telekomunikasi."
						/>
						<FeatureCard
							icon={<BookOpen className="w-6 h-6 text-[#F37704]" />}
							title="Materi Pelajaran"
							description="Materi pembelajaran lengkap dengan konten HTML, gambar, dan fitur text-to-speech untuk mendukung proses belajar."
						/>
						<FeatureCard
							icon={<GraduationCap className="w-6 h-6 text-[#F37704]" />}
							title="Pretest & Evaluasi"
							description="Pretest untuk mengukur pengetahuan awal dan sistem pencapaian (achievement) untuk memotivasi siswa."
						/>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-100 py-8">
				<div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2 text-sm text-gray-500">
						<img
							src="/telnetquiz.webp"
							alt="TelNetQuiz"
							className="w-5 h-5 rounded"
						/>
						TelNetQuiz &copy; {new Date().getFullYear()}
					</div>
					<div className="flex items-center gap-6 text-sm text-gray-500">
						<Link to="/privacy" className="hover:text-gray-700">
							Privacy Policy
						</Link>
						<a
							href="mailto:devanferrel04@gmail.com"
							className="hover:text-gray-700"
						>
							Contact
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
			<div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
				{icon}
			</div>
			<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
			<p className="text-sm text-gray-600 leading-relaxed">{description}</p>
		</div>
	);
}
