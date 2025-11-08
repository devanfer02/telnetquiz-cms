import { createFileRoute } from '@tanstack/react-router'
import AverageChapterBarChart from '@/components/dashboard/average-chapter-chart'
import DashboardStats from '@/components/dashboard/dashboard-stat'
import Greeting from '@/components/dashboard/greeting'
import Leaderboard from '@/components/dashboard/leaderboard'
import RecentSubmission from '@/components/dashboard/recent-submission'
import AboutDashboard from '@/components/dashboard/about-dashboard'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
})

function DashboardIndex() {
  return (
    <>
      <Greeting />
      <AboutDashboard />
      <DashboardStats />
      <RecentSubmission />
      <div className="flex flex-row gap-x-5 mb-10">
        <div className="w-3/5 flex flex-col min-h-0">
          <AverageChapterBarChart className="flex-1" />
        </div>
        <div className="w-2/5 flex flex-col min-h-0">
          <Leaderboard className="flex-1" />
        </div>
      </div>
      <div className='mb-10 w-full text-center'>
        <span className=''>Made with ❤️ by Devan F.</span>
      </div>
    </>
  )
}
