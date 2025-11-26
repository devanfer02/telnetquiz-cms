type AverageScoreChapter = {
	chapter: string;
	averageScore: number;
};

type Chapter = {
	id: number;
	title: string;
	description: string;
	mascotId: number;
};

type Quiz = {
	id: number;
	chapterId?: number;
	chapterName?: string;
	title: string;
	difficulty: "easy" | "medium" | "hard";
	numberOfQuestions: number;
};

type Question = {
	id: string;
	quizId: string;
	imageLink: string;
	image?: File | null;
	description: string;
	question: string;
	options: Option[];
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
