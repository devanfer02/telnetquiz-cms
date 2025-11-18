import {
  ColumnDef
} from "@tanstack/react-table"

import { submissions } from "@/data/mock-data"
import { SortableHeader } from "../../../components/global/sortable-header"
import { Submission } from "@/types/submission"
import TanstackTable from "@/components/global/ts-table"

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "userName",
    header: ({ column }) => <SortableHeader column={column} title="User's Name" />,
  },
  {
    accessorKey: "chapterId",
    header: ({ column }) => <SortableHeader column={column} title="Chapter ID" />,
  },
  {
    accessorKey: "quizId",
    header: ({ column }) => <SortableHeader column={column} title="Quiz ID" />,
  },
  {
    accessorKey: "score",
    header: ({ column }) => <SortableHeader column={column} title="Score" />,
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => <SortableHeader column={column} title="Started At" />,
  },
  {
    accessorKey: "completedAt",
    header: ({ column }) => <SortableHeader column={column} title="Completed At" />,
  },
]

export default function RecentSubmission() {
  return <TanstackTable
    rows={submissions}
    columns={columns}
    title="Recent Submissions"
    fallbackMessage="No Submission Yet"
  />
}
