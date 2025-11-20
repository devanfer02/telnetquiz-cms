import { Skeleton } from "@/components/ui/skeleton"
import { useGreeting } from "@/hooks/use-greeting"

export default function Greeting() {
  const { mounted, greeting, icon } = useGreeting()

  if (!mounted) return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-7 w-7 rounded-full bg-gray-300" />
      <Skeleton className="h-5 w-80 rounded-md bg-gray-300" />
    </div>
  )

  return (
    <div className="flex items-center gap-2 text-xl text-foreground font-black">
      {icon}
      <span>{greeting}, ready to create something new?</span>
    </div>
  )
}
