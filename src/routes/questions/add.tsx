import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/questions/add"!</div>
}
