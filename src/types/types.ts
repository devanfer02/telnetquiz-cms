type User = {
	id: string;
	name: string;
	email: string;
	createdAt: Date;
};

type AverageScoreChapter = {
	chapter: string;
	averageScore: number;
};

type Chapter = {
	id: number;
	title: string;
	description: string;
	mascotId: number;
	createdAt: Date;
	updatedAt: Date;
};

type Quiz = {
	id: number;
	title: string;
	difficulty: "easy" | "medium" | "hard";
	numberOfQuestions: number;
	level: number;
	chapter?: Chapter | null;
	chapterId?: number | null;
	chapterTitle?: string;
	createdAt: Date;
	updatedAt: Date;
};

type Question = {
	id: number;
	quizId: number | null;
	chapterId: number | null;
	materialId: number | null;
	imageLink: string | null;
	image?: File | null;
	type: string | null;
	description: string;
	question: string;
	options?: Option[];
};

type Option = {
	questionId: number;
	text: string;
	isCorrect: boolean;
};

type Submission = {
	id: number;
	userName: string;
	chapterId: string;
	quizId: string;
	score: number;
	startedAt: string;
	completedAt: string;
};

type StudyMaterial = {
	id: number;
	title: string;
	imageLink: string | null;
	content: string;
	createdAt: Date;
	updatedAt: Date;
};
