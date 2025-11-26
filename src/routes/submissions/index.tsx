import { generateHistory } from "@/data/mock-dashboard";
import { createFileRoute } from "@tanstack/react-router";
import RecentSubmission from "../dashboard/-sections/recent-submission";

export const Route = createFileRoute("/submissions/")({
  loader: () => ({ data: generateHistory(100) }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: submissions } = Route.useLoaderData();

  return (
    <>
      <div className="mt-3 mb-5">
        <h1 className="text-3xl font-black text-telnet-primary tracking-tight">
          Submissions 
        </h1>
        <p className="text-muted-foreground">
          List submisi terbaru dari pengguna.
        </p>
      </div>
      <RecentSubmission submissions={submissions} />
    </>
  )
}
