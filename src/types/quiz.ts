type Quiz = {
  id: number
  chapterId?: number
  chapterName?: string 
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  numberOfQuestions: number
}
