import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Brain, GraduationCap, Smartphone } from "lucide-react";

export const Route = createFileRoute("/")({
	component: LandingPage,
});

function LandingPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Nav */}
			<nav className="border-b border-gray-100">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
					<div className="flex items-center gap-2 sm:gap-3">
						<img
							src="/telnetquiz.webp"
							alt="TelNetQuiz"
							className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl"
						/>
						<span className="font-bold text-lg sm:text-xl text-[#F37704]">
							TelNetQuiz
						</span>
					</div>
					<div className="flex items-center gap-2 sm:gap-4">
						<Link
							to="/privacy"
							className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 hidden sm:inline"
						>
							Privacy Policy
						</Link>
						<Link
							to="/auth/sign-in"
							className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F37704] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d96800] transition-colors"
						>
							Admin Panel
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero */}
			<section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
				<div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
					{/* Mascot first on mobile */}
					<div className="flex-shrink-0 lg:order-2">
						<img
							src="/assets/mascot-hero.png"
							alt="TelNetQuiz mascot Litecartes"
							className="w-48 sm:w-64 lg:w-80 drop-shadow-xl"
						/>
					</div>
					<div className="flex-1 space-y-4 sm:space-y-6 text-center lg:text-left lg:order-1">
						<div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full text-xs sm:text-sm text-[#F37704] font-medium">
							<GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							Media Pembelajaran Interaktif
						</div>
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
							TelNetQuiz
						</h1>
						<p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
							Aplikasi media pembelajaran berbasis kuis interaktif untuk mata
							pelajaran{" "}
							<strong className="text-gray-800">
								Media dan Jaringan Telekomunikasi
							</strong>{" "}
							bagi siswa SMK jurusan Teknik Komputer dan Jaringan.
						</p>
						<div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
							<a
								href="https://github.com/devanfer02/telnetquiz-mobile"
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-[#F37704] text-white rounded-xl text-sm sm:text-base font-semibold hover:bg-[#d96800] transition-colors"
							>
								<Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
								Download App
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="bg-orange-50/50 py-12 sm:py-20">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
						Fitur Utama
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
						<FeatureCard
							icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-[#F37704]" />}
							title="Kuis Interaktif"
							description="Kuis bertingkat dengan berbagai level kesulitan untuk menguji pemahaman siswa tentang media dan jaringan telekomunikasi."
						/>
						<FeatureCard
							icon={
								<BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#F37704]" />
							}
							title="Materi Pelajaran"
							description="Materi pembelajaran lengkap dengan konten HTML, gambar, dan fitur text-to-speech untuk mendukung proses belajar."
						/>
						<FeatureCard
							icon={
								<GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-[#F37704]" />
							}
							title="Pretest & Evaluasi"
							description="Pretest untuk mengukur pengetahuan awal dan sistem pencapaian (achievement) untuk memotivasi siswa."
						/>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t border-gray-100 py-6 sm:py-8">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-4">
					<div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
						<img
							src="/telnetquiz.webp"
							alt="TelNetQuiz"
							className="w-4 h-4 sm:w-5 sm:h-5 rounded"
						/>
						TelNetQuiz &copy; {new Date().getFullYear()}
					</div>
					<div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500">
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
		<div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
			<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-3 sm:mb-4">
				{icon}
			</div>
			<h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2">{title}</h3>
			<p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
				{description}
			</p>
		</div>
	);
}
