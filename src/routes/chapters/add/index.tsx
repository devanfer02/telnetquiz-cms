import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chapters/add/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/chapters/add/"!</div>
}
