import { faker } from "@faker-js/faker"

export type Submission = {
  id: number
  userName: string
  chapterId: string
  quizId: string
  score: number
  startedAt: string
  completedAt: string
}

function generateSubmissions(count: number = 10): Submission[] {
  const submissions: Submission[] = []

  for (let i = 1; i <= count; i++) {
    const started = faker.date.recent({ days: 5 })
    const completed = new Date(started.getTime() + faker.number.int({ min: 5, max: 20 }) * 60_000)

    submissions.push({
      id: i,
      userName: faker.person.fullName(),
      chapterId: `CH-${faker.number.int({ min: 1, max: 10 }).toString().padStart(3, "0")}`,
      quizId: `QZ-${faker.number.int({ min: 100, max: 110 })}`,
      score: faker.number.int({ min: 60, max: 100 }),
      startedAt: started.toLocaleDateString("en-CA"),
      completedAt: completed.toLocaleDateString("en-CA"),
    })
  }

  return submissions
}

export const submissions = generateSubmissions(50)

export const averageScoreChapter = [
  {
    chapter: "CH-001",
    averageScore: 85,
  },
  {
    chapter: "CH-002",
    averageScore: 78,
  },
  {
    chapter: "CH-003",
    averageScore: 92,
  },
  {
    chapter: "CH-004",
    averageScore: 88,
  },
  {
    chapter: "CH-005",
    averageScore: 81,
  },
]

export const mockLeaderboard = [
  { rank: 1, userName: "Alice", score: 98, latestSubmitAt: "2025-11-08 09:00" },
  { rank: 2, userName: "Bob", score: 95, latestSubmitAt: "2025-11-08 09:10" },
  { rank: 3, userName: "Charlie", score: 91, latestSubmitAt: "2025-11-08 09:20" },
  { rank: 4, userName: "Diana", score: 88, latestSubmitAt: "2025-11-08 09:35" },
  { rank: 5, userName: "Ethan", score: 85, latestSubmitAt: "2025-11-08 09:50" },
  { rank: 6, userName: "Fiona", score: 84, latestSubmitAt: "2025-11-08 10:05" },
  { rank: 7, userName: "George", score: 82, latestSubmitAt: "2025-11-08 10:12" },
  { rank: 8, userName: "Hannah", score: 80, latestSubmitAt: "2025-11-08 10:25" },
  { rank: 9, userName: "Ian", score: 78, latestSubmitAt: "2025-11-08 10:30" },
  { rank: 10, userName: "Julia", score: 77, latestSubmitAt: "2025-11-08 10:45" },
]
