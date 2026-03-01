import { Users, Link2, TrendingUp, DollarSign } from "lucide-react"

const stats = [
  {
    label: "Total Referrers",
    value: "1,284",
    change: "+12.5%",
    positive: true,
    icon: Users,
    description: "vs last month",
  },
  {
    label: "Active Campaigns",
    value: "24",
    change: "+3",
    positive: true,
    icon: Link2,
    description: "new this week",
  },
  {
    label: "Conversion Rate",
    value: "18.2%",
    change: "+2.1%",
    positive: true,
    icon: TrendingUp,
    description: "vs last month",
  },
  {
    label: "Revenue Generated",
    value: "$48,290",
    change: "+8.7%",
    positive: true,
    icon: DollarSign,
    description: "vs last month",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <stat.icon className="size-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-card-foreground">
              {stat.value}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600">
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
