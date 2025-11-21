type Question = {   
  id: string 
  quizId: string 
  imageLink: string
  image?: File | null 
  description: string 
  question: string 
  options: Option[]
}