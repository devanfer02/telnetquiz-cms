import { Card, CardContent } from "@/components/ui/card"
import { LayoutDashboard } from "lucide-react"

export default function AboutDashboard() {
  return (
    <Card className="py-4 mt-5">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={28} className="text-telnet-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            TelNetQuiz Content Management System Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-3xl ">
          Welcome to <strong>TelNetQuiz Panel</strong> — the central hub for managing all quiz content, 
          chapters, and user submissions. Monitor user's activity, update materials, 
          and ensure a seamless learning experience for vocational students.
        </p>
      </CardContent>
    </Card>
  )
}
