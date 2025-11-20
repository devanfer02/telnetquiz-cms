import { mockChapters } from "./mock-chapter";

function getRandomChapter(chapters: Chapter[]) {
  return chapters[Math.floor(Math.random() * chapters.length)];
}

const baseQuizzes: Quiz[] = [
  { id: 301, title: "TCP vs UDP", difficulty: "medium", numberOfQuestions: 15 },
  { id: 302, title: "OSI Model Fundamentals", difficulty: "easy", numberOfQuestions: 10 },
  { id: 303, title: "Subnetting Basics", difficulty: "hard", numberOfQuestions: 20 },
  { id: 304, title: "DHCP & DNS Concepts", difficulty: "medium", numberOfQuestions: 12 },
  { id: 305, title: "HTTP vs HTTPS", difficulty: "easy", numberOfQuestions: 8 },
  { id: 306, title: "Firewall & Security", difficulty: "hard", numberOfQuestions: 18 },
  { id: 307, title: "NAT & Port Forwarding", difficulty: "medium", numberOfQuestions: 14 },
  { id: 308, title: "VLAN & Trunking", difficulty: "medium", numberOfQuestions: 16 },
  { id: 309, title: "Routing Protocols (RIP, OSPF)", difficulty: "hard", numberOfQuestions: 22 },
  { id: 310, title: "Wireless Networking Basics", difficulty: "easy", numberOfQuestions: 9 },
];

export const mockQuizzes: Quiz[] = baseQuizzes.map((quiz) => {
  const chapter = getRandomChapter(mockChapters);

  return {
    ...quiz,
    chapterId: chapter.id,
    chapterName: chapter.title,
  };
});
