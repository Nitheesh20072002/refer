"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const data = [
  { month: "Jan", referrals: 120, conversions: 42 },
  { month: "Feb", referrals: 180, conversions: 68 },
  { month: "Mar", referrals: 240, conversions: 95 },
  { month: "Apr", referrals: 210, conversions: 82 },
  { month: "May", referrals: 310, conversions: 128 },
  { month: "Jun", referrals: 380, conversions: 156 },
  { month: "Jul", referrals: 420, conversions: 182 },
]

export function ReferralChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-card-foreground">
            Referral Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Referrals vs conversions over time
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Referrals
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-2" />
            <span className="text-xs font-medium text-muted-foreground">
              Conversions
            </span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="referralGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.19 255)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="oklch(0.55 0.19 255)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="conversionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.65 0.15 200)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="oklch(0.65 0.15 200)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.90 0.015 250)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 250)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(1 0 0)",
                border: "1px solid oklch(0.90 0.015 250)",
                borderRadius: "0.5rem",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Area
              type="monotone"
              dataKey="referrals"
              stroke="oklch(0.55 0.19 255)"
              strokeWidth={2}
              fill="url(#referralGrad)"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="oklch(0.65 0.15 200)"
              strokeWidth={2}
              fill="url(#conversionGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
