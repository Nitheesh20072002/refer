"use client"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ReferrerCards } from "@/components/dashboard/referrer-cards"
import { ReferralChart } from "@/components/dashboard/referral-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { SidebarProvider, useSidebarState } from "@/components/dashboard/sidebar-context"

function DashboardContent() {
  const { collapsed } = useSidebarState()

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      {/* Main content - offset by sidebar width */}
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 256 }}
      >
        <DashboardHeader />

        <div className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Stats overview */}
            <StatsCards />

            {/* Chart + Activity */}
            <div className="grid gap-6 xl:grid-cols-5">
              <div className="xl:col-span-3">
                <ReferralChart />
              </div>
              <div className="xl:col-span-2">
                <RecentActivity />
              </div>
            </div>

            {/* Top Referrers */}
            <ReferrerCards />
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  )
}
