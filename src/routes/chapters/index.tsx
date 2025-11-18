import Greeting from '@/components/dashboard/greeting'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chapters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Greeting/>

    </>
  )
}
