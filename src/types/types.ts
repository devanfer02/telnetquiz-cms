type User = {
	id: string;
	fullname: string;
	email: string;
	createdAt: string;
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
	chapterId: number | null;
	chapterName?: string;
	title: string;
	difficulty: "easy" | "medium" | "hard";
	numberOfQuestions: number;
	level: number;
	chapter?: Chapter | null;
};

type Question = {
	id: number;
	quizId: number | null;
	imageLink: string | null;
	image?: File | null;
	description: string;
	question: string;
	options?: Option[];
};

type QuestionSerialized = Omit<Question, "image"> & {
	image?: string | null;
};

type Option = {
	questionId: string;
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
