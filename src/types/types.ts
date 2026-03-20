type User = {
	id: string;
	name: string;
	email: string;
	schoolId: number | null;
	schoolName: string | null;
	gender: boolean | null;
	grade: string | null;
	bio: string | null;
	image: string | null;
	createdAt: Date;
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

type Option = {
	questionId: number;
	text: string;
	isCorrect: boolean;
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

type PretestSubmissionItem = {
	question_id: number;
	answered_option_id: number;
};

type QuizAnswerItem = {
	question_id: number;
	answered_option_id: number;
};

type School = {
	id: number;
	name: string;
	createdAt: Date;
	updatedAt: Date;
};

type Session = {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
	createdAt: Date;
	updatedAt: Date;
};
