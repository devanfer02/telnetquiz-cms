import {
	BookOpen,
	FileQuestionIcon,
	Layers,
	LayoutDashboard,
	MessageSquareDot,
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
		icon: Layers,
	},
	{
		title: "Quiz",
		url: "/quiz",
		icon: MessageSquareDot,
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
