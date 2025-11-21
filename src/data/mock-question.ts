import { baseQuizzes } from "./mock-quiz"

export function generateMockQuestions(quizzes: Quiz[]): Question[] {
  let counter = 1

  return quizzes.flatMap((quiz) => {
    const questions: Question[] = []

    for (let i = 1; i <= quiz.numberOfQuestions; i++) {
      const id = `Q${counter++}`

      questions.push({
        id,
        quizId: String(quiz.id),
        imageLink: "https://www.practicalnetworking.net/wp-content/uploads/2016/01/packtrav-osi-layers.png",
        description: `Pertanyaan terkait topik ${quiz.title}`,
        question: generateQuestionText(quiz.title, i),
        options: []
      })
    }

    return questions
  })
}
function generateQuestionText(title: string, index: number): string {
  switch (title) {
    case "TCP vs UDP":
      return index % 2 === 0
        ? "Jelaskan perbedaan utama antara TCP dan UDP."
        : "Kapan kita sebaiknya menggunakan UDP dibandingkan TCP?"

    case "OSI Model Fundamentals":
      return index % 2 === 0
        ? "Sebutkan 7 lapisan OSI Model."
        : `Apa fungsi dari layer ke-${(index % 7) + 1} pada OSI Model?`

    case "Subnetting Basics":
      return index % 2 === 0
        ? "Apa itu subnet mask?"
        : "Bagaimana cara menghitung jumlah host dalam sebuah subnet?"

    case "DHCP & DNS Concepts":
      return index % 2 === 0
        ? "Apa fungsi utama dari DHCP?"
        : "Apa perbedaan DNS A record dan CNAME record?"

    case "HTTP vs HTTPS":
      return index % 2 === 0
        ? "Apa yang membedakan HTTP dengan HTTPS?"
        : "Apa fungsi dari SSL/TLS dalam HTTPS?"

    case "Firewall & Security":
      return index % 2 === 0
        ? "Apa itu firewall?"
        : "Apa perbedaan firewall stateful dan stateless?"

    case "NAT & Port Forwarding":
      return index % 2 === 0
        ? "Apa itu NAT?"
        : "Apa fungsi port forwarding?"

    case "VLAN & Trunking":
      return index % 2 === 0
        ? "Apa itu VLAN?"
        : "Apa fungsi dari trunk port?"

    case "Routing Protocols (RIP, OSPF)":
      return index % 2 === 0
        ? "Apa perbedaan utama antara RIP dan OSPF?"
        : "Dalam situasi apa OSPF lebih disarankan dibandingkan RIP?"

    case "Wireless Networking Basics":
      return index % 2 === 0
        ? "Apa itu SSID?"
        : "Apa perbedaan 2.4GHz dan 5GHz dalam jaringan WiFi?"

    default:
      return `Pertanyaan ke-${index} tentang ${title}`
  }
}


export const mockQuestions = generateMockQuestions(baseQuizzes)

export function generateMockQuestionsByQuiz(
  questions: Question[]
): { [key: string]: Question[] } {
  return questions.reduce((acc, q) => {
    if (!acc[q.quizId]) {
      acc[q.quizId] = []
    }
    acc[q.quizId].push(q)
    return acc
  }, {} as { [key: string]: Question[] })
}

export const mockQuestionsQuiz = generateMockQuestionsByQuiz(mockQuestions)
