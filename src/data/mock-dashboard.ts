import { faker } from "@faker-js/faker";
import { mockChapters } from "./mock-chapter";
import { mockQuizzes } from "./mock-quiz";

export const generateHistory = (count = 50): Submission[] => {
	const histories = [];

	for (let i = 1; i <= count; i++) {
		const chapter = faker.helpers.arrayElement(mockChapters);
		const quiz = faker.helpers.arrayElement(mockQuizzes);

		const start = faker.date.between({
			from: "2025-01-01",
			to: "2025-11-20",
		});

		const completed = faker.date.soon({
			days: 1,
			refDate: start,
		});

		histories.push({
			id: i,
			userName: faker.person.fullName(),
			chapterId: chapter.id.toString(),
			quizId: quiz.id.toString(),
			score: faker.number.int({ min: 40, max: 100 }),
			startedAt: start.toISOString().slice(0, 10),
			completedAt: completed.toISOString().slice(0, 10),
		});
	}

	return histories;
};

export const generateAverageScoreByChapter = (): AverageScoreChapter[] => {
	return mockChapters.map((chapter) => ({
		chapter: `CH-${chapter.id.toString().padStart(3, "0")}`,
		averageScore: faker.number.int({ min: 60, max: 100 }),
	}));
};

export const mockLeaderboard = [
	{ rank: 1, userName: "Alice", score: 98, latestSubmitAt: "2025-11-08 09:00" },
	{ rank: 2, userName: "Bob", score: 95, latestSubmitAt: "2025-11-08 09:10" },
	{
		rank: 3,
		userName: "Charlie",
		score: 91,
		latestSubmitAt: "2025-11-08 09:20",
	},
	{ rank: 4, userName: "Diana", score: 88, latestSubmitAt: "2025-11-08 09:35" },
	{ rank: 5, userName: "Ethan", score: 85, latestSubmitAt: "2025-11-08 09:50" },
	{ rank: 6, userName: "Fiona", score: 84, latestSubmitAt: "2025-11-08 10:05" },
	{
		rank: 7,
		userName: "George",
		score: 82,
		latestSubmitAt: "2025-11-08 10:12",
	},
	{
		rank: 8,
		userName: "Hannah",
		score: 80,
		latestSubmitAt: "2025-11-08 10:25",
	},
	{ rank: 9, userName: "Ian", score: 78, latestSubmitAt: "2025-11-08 10:30" },
	{
		rank: 10,
		userName: "Julia",
		score: 77,
		latestSubmitAt: "2025-11-08 10:45",
	},
];
