import { StudyMaterial } from "../types/types";
import { mockQuestions } from "./mock-question";

export const mockStudyMaterials: StudyMaterial[] = mockQuestions.slice(0, 5).map((question, index) => ({
    id: index + 1,
    questionId: question.id,
    title: `Study Material for ${question.question.substring(0, 30)}...`,
    imageLink: question.imageLink,
    content: `This is the study material content for the question: "${question.question}". It provides detailed explanations and examples related to the topic.`,
}));
