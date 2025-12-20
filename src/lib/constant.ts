import {
	BookMarked,
	BookOpen,
	Brain,
	FileQuestionIcon,
	LayoutDashboard,
	Upload,
	Users,
} from "lucide-react";

export const sidebarItems = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Chapters",
		url: "/chapters",
		icon: BookMarked,
	},
	{
		title: "Quiz",
		url: "/quiz",
		icon: Brain,
	},
	{
		title: "Study Materials",
		url: "/study-materials",
		icon: BookOpen,
	},
	{
		title: "Questions",
		url: "/questions",
		icon: FileQuestionIcon,
	},
	{
		title: "Submissions",
		url: "/submissions",
		icon: Upload,
	},
	{
		title: "Users",
		url: "/users",
		icon: Users,
	},
];

export const dashboardItems = sidebarItems
	.filter((item) => item.title !== "Dashboard")
	.map((item) => ({
		...item,
		counter: 20,
	}));

export const QUERY_KEYS = {
	CHAPTERS: "chapter-list",
	QUIZZES: "quiz-list",
	QUESTIONS: "question-list",
	STUDY_MATERIALS: "study-material-list",
};
