import { createFileRoute } from '@tanstack/react-router'
import AverageChapterBarChart from '@/routes/dashboard/-sections/average-chapter-chart'
import DashboardStats from '@/routes/dashboard/-sections/dashboard-stat'
import Greeting from '@/routes/dashboard/-sections/greeting'
import Leaderboard from '@/routes/dashboard/-sections/leaderboard'
import RecentSubmission from '@/routes/dashboard/-sections/recent-submission'
import AboutDashboard from '@/routes/dashboard/-sections/about-dashboard'
import Footer from '@/components/global/footer'

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
      <div className="flex flex-col lg:flex-row gap-y-5 gap-x-5 mb-10">
        <div className="lg:w-3/5 flex flex-col min-h-0">
          <AverageChapterBarChart className="flex-1" />
        </div>
        <div className="lg:w-2/5 flex flex-col min-h-0">
          <Leaderboard className="flex-1" />
        </div>
      </div>
      <Footer/>
    </>
  )
}
