"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

const referrers = [
  {
    name: "Alex Rivera",
    email: "alex.r@email.com",
    avatar: "Alex",
    referrals: 142,
    conversions: 89,
    revenue: "$12,480",
    tier: "Gold",
    progress: 89,
  },
  {
    name: "Jordan Kim",
    email: "jordan.k@email.com",
    avatar: "Jordan",
    referrals: 118,
    conversions: 71,
    revenue: "$9,920",
    tier: "Gold",
    progress: 76,
  },
  {
    name: "Morgan Lee",
    email: "morgan.l@email.com",
    avatar: "Morgan",
    referrals: 96,
    conversions: 58,
    revenue: "$8,120",
    tier: "Silver",
    progress: 65,
  },
  {
    name: "Casey Park",
    email: "casey.p@email.com",
    avatar: "Casey",
    referrals: 84,
    conversions: 45,
    revenue: "$6,300",
    tier: "Silver",
    progress: 54,
  },
  {
    name: "Taylor Ng",
    email: "taylor.n@email.com",
    avatar: "Taylor",
    referrals: 67,
    conversions: 34,
    revenue: "$4,760",
    tier: "Bronze",
    progress: 42,
  },
  {
    name: "Jamie Cruz",
    email: "jamie.c@email.com",
    avatar: "Jamie",
    referrals: 52,
    conversions: 28,
    revenue: "$3,920",
    tier: "Bronze",
    progress: 35,
  },
]

function getTierStyles(tier: string) {
  switch (tier) {
    case "Gold":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "Silver":
      return "border-slate-200 bg-slate-50 text-slate-600"
    case "Bronze":
      return "border-orange-200 bg-orange-50 text-orange-700"
    default:
      return ""
  }
}

export function ReferrerCards() {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-foreground">
            Top Referrers
          </h2>
          <p className="text-sm text-muted-foreground">
            Your highest performing referral partners this month
          </p>
        </div>
        <button
          onClick={() => router.push('/referrers')}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          View All
          <ArrowUpRight className="size-4" />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {referrers.map((referrer) => (
          <div
            key={referrer.name}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-11 border-2 border-primary/10">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${referrer.avatar}`}
                    alt={referrer.name}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {referrer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-card-foreground">
                    {referrer.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {referrer.email}
                  </p>
                </div>
              </div>
              <button
                className="text-muted-foreground/60 transition-colors hover:text-foreground"
                aria-label={`More options for ${referrer.name}`}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  Referrals
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
                  {referrer.referrals}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  Converted
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
                  {referrer.conversions}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  Revenue
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
                  {referrer.revenue}
                </p>
              </div>
            </div>

            {/* Progress & Tier */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Goal Progress
                  </span>
                  <span className="text-xs font-medium text-card-foreground">
                    {referrer.progress}%
                  </span>
                </div>
                <Progress value={referrer.progress} className="h-1.5" />
              </div>
              <Badge
                variant="outline"
                className={getTierStyles(referrer.tier)}
              >
                {referrer.tier}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
