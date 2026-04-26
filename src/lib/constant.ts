import type { LucideIcon } from "lucide-react";
import {
	Award,
	BookMarked,
	BookOpen,
	Brain,
	FileQuestionIcon,
	FileSpreadsheet,
	FolderOpen,
	LayoutDashboard,
	School,
	Smartphone,
	Upload,
	UserCog,
	Users,
} from "lucide-react";

export type SidebarLink = {
	type: "link";
	title: string;
	url: string;
	icon: LucideIcon;
};

export type SidebarGroup = {
	type: "group";
	title: string;
	icon: LucideIcon;
	items: SidebarLink[];
};

export type SidebarEntry = SidebarLink | SidebarGroup;

export const sidebarEntries: SidebarEntry[] = [
	{
		type: "link",
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		type: "group",
		title: "Content",
		icon: FolderOpen,
		items: [
			{
				type: "link",
				title: "Chapters",
				url: "/chapters",
				icon: BookMarked,
			},
			{
				type: "link",
				title: "Quiz",
				url: "/quiz",
				icon: Brain,
			},
			{
				type: "link",
				title: "Questions",
				url: "/questions",
				icon: FileQuestionIcon,
			},
			{
				type: "link",
				title: "Study Materials",
				url: "/study-materials",
				icon: BookOpen,
			},
			{
				type: "link",
				title: "Export & Import",
				url: "/export",
				icon: FileSpreadsheet,
			},
		],
	},
	{
		type: "group",
		title: "Management",
		icon: UserCog,
		items: [
			{
				type: "link",
				title: "Users",
				url: "/users",
				icon: Users,
			},
			{
				type: "link",
				title: "Submissions",
				url: "/submissions",
				icon: Upload,
			},
			{
				type: "link",
				title: "Schools",
				url: "/schools",
				icon: School,
			},
		],
	},
	{
		type: "link",
		title: "Achievements",
		url: "/achievements",
		icon: Award,
	},
	{
		type: "link",
		title: "Preview",
		url: "/preview",
		icon: Smartphone,
	},
];

export const flatSidebarItems: SidebarLink[] = sidebarEntries.flatMap(
	(entry) => (entry.type === "group" ? entry.items : [entry]),
);

export const QUERY_KEYS = {
	CHAPTERS: "chapter-list",
	QUIZZES: "quiz-list",
	QUESTIONS: "question-list",
	STUDY_MATERIALS: "study-material-list",
	USERS: "user-list",
	USER_DETAIL: "user-detail",
	USER_SESSIONS: "user-sessions",
	SUBMISSIONS: "submission-list",
	AVERAGE_SCORES: "average-scores",
	LEADERBOARD: "leaderboard",
	DASHBOARD_STATS: "dashboard-stats",
	SCHOOLS: "school-list",
	ACHIEVEMENTS: "achievement-list",
	ACHIEVEMENT_DETAIL: "achievement-detail",
	USER_ACHIEVEMENTS: "user-achievements",
};
