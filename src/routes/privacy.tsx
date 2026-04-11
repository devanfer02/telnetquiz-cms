import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/privacy")({
	component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Nav */}
			<nav className="border-b border-gray-100">
				<div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
					<Link
						to="/"
						className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
					>
						<ArrowLeft className="w-5 h-5 text-gray-600" />
					</Link>
					<div className="flex items-center gap-3">
						<img
							src="/telnetquiz.webp"
							alt="TelNetQuiz"
							className="w-8 h-8 rounded-xl"
						/>
						<span className="font-bold text-lg text-[#F37704]">TelNetQuiz</span>
					</div>
				</div>
			</nav>

			{/* Content */}
			<div className="max-w-4xl mx-auto px-6 py-12">
				<div className="flex items-center gap-3 mb-8">
					<div className="p-2.5 bg-orange-50 rounded-xl">
						<Shield className="w-6 h-6 text-[#F37704]" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
				</div>

				<div className="prose prose-gray max-w-none">
					<p className="text-sm text-gray-500 mb-8">
						Last updated:{" "}
						{new Date().toLocaleDateString("en-US", {
							month: "long",
							day: "numeric",
							year: "numeric",
						})}
					</p>

					<Section title="1. Introduction">
						<p>
							TelNetQuiz ("we", "our", or "us") is an educational quiz
							application designed for vocational high school (SMK) students
							studying Telecommunication Network and Media (Media dan Jaringan
							Telekomunikasi) under the Computer Network Engineering (Teknik
							Komputer dan Jaringan) program. This Privacy Policy explains how
							we collect, use, and protect your information.
						</p>
					</Section>

					<Section title="2. Information We Collect">
						<p>When you use TelNetQuiz, we may collect:</p>
						<ul>
							<li>
								<strong>Account information:</strong> Name, email address, and
								profile picture provided through Google OAuth sign-in.
							</li>
							<li>
								<strong>Educational data:</strong> Quiz scores, pretest results,
								submission history, and learning progress.
							</li>
							<li>
								<strong>School information:</strong> School name and grade level
								provided during registration.
							</li>
							<li>
								<strong>Device information:</strong> IP address, browser user
								agent, and session data for security purposes.
							</li>
						</ul>
					</Section>

					<Section title="3. How We Use Your Information">
						<p>We use collected information to:</p>
						<ul>
							<li>Provide and improve the educational quiz experience.</li>
							<li>
								Track learning progress and generate performance analytics.
							</li>
							<li>Authenticate users and maintain account security.</li>
							<li>
								Generate text-to-speech audio for study materials to support
								accessibility.
							</li>
						</ul>
					</Section>

					<Section title="4. Data Storage and Security">
						<p>
							Your data is stored securely in a PostgreSQL database hosted on
							Supabase. Media files (images and audio) are stored on Cloudflare
							R2. We implement appropriate technical measures to protect your
							personal information from unauthorized access.
						</p>
					</Section>

					<Section title="5. Third-Party Services">
						<p>TelNetQuiz uses the following third-party services:</p>
						<ul>
							<li>
								<strong>Google OAuth:</strong> For authentication (sign-in).
								Subject to{" "}
								<a
									href="https://policies.google.com/privacy"
									target="_blank"
									rel="noopener noreferrer"
								>
									Google's Privacy Policy
								</a>
								.
							</li>
							<li>
								<strong>Supabase:</strong> For database hosting.
							</li>
							<li>
								<strong>Cloudflare R2:</strong> For file storage.
							</li>
							<li>
								<strong>Microsoft Edge TTS:</strong> For text-to-speech audio
								generation.
							</li>
						</ul>
					</Section>

					<Section title="6. Data Sharing">
						<p>
							We do not sell or share your personal information with third
							parties. Your educational data is only accessible to you and
							authorized administrators of the TelNetQuiz platform.
						</p>
					</Section>

					<Section title="7. Your Rights">
						<p>You have the right to:</p>
						<ul>
							<li>Access your personal data stored in the application.</li>
							<li>Request deletion of your account and associated data.</li>
							<li>Opt out of non-essential data collection.</li>
						</ul>
					</Section>

					<Section title="8. Children's Privacy">
						<p>
							TelNetQuiz is designed for vocational high school students. We do
							not knowingly collect personal information from children under 13.
							If you are a parent or guardian and believe your child has
							provided personal information, please contact us.
						</p>
					</Section>

					<Section title="9. Contact">
						<p>
							For questions about this Privacy Policy or your data, contact us
							at:{" "}
							<a href="mailto:devanferrel04@gmail.com">
								devanferrel04@gmail.com
							</a>
						</p>
					</Section>
				</div>
			</div>

			{/* Footer */}
			<footer className="border-t border-gray-100 py-6">
				<div className="max-w-4xl mx-auto px-6 text-center text-sm text-gray-500">
					<Link to="/" className="hover:text-gray-700">
						&larr; Back to Home
					</Link>
				</div>
			</footer>
		</div>
	);
}

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
			{children}
		</div>
	);
}
