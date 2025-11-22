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
