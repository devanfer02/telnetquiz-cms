import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/chapters/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  return <div>Hello "/chapters/{id}"!</div>
}
