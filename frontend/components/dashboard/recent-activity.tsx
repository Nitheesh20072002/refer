import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, CheckCircle2, Gift, TrendingUp } from "lucide-react"

const activities = [
  {
    type: "referral",
    icon: UserPlus,
    title: "New referral from Alex Rivera",
    description: "john.doe@email.com signed up via referral link",
    time: "2 min ago",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    type: "conversion",
    icon: CheckCircle2,
    title: "Conversion completed",
    description: "Referral by Jordan Kim converted to paid plan",
    time: "18 min ago",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    type: "reward",
    icon: Gift,
    title: "Reward distributed",
    description: "$50 bonus sent to Morgan Lee",
    time: "1 hr ago",
    iconBg: "bg-amber-50 text-amber-600",
  },
  {
    type: "milestone",
    icon: TrendingUp,
    title: "Milestone reached",
    description: "Casey Park hit 80 referrals - Silver tier unlocked",
    time: "3 hr ago",
    iconBg: "bg-primary/10 text-primary",
  },
]

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
        Recent Activity
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Latest updates from your referral network
      </p>

      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/40"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${activity.iconBg}`}
            >
              <activity.icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-card-foreground">
                {activity.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {activity.description}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
