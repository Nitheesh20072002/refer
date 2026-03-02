import {
  Search,
  ShieldCheck,
  Zap,
  DollarSign,
  BarChart3,
  Clock,
} from "lucide-react"

const seekerFeatures = [
  {
    icon: Search,
    title: "Targeted Requests",
    description:
      "Pick the exact company and role you want. Your request goes directly to verified employees.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Referrers",
    description:
      "Every referrer is verified through their work email so you know they actually work there.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description:
      "Most referral requests are reviewed within 48 hours. No more waiting weeks for a response.",
  },
]

const referrerFeatures = [
  {
    icon: DollarSign,
    title: "Earn Rewards",
    description:
      "Get paid for every successful referral. Stack earnings across multiple referral requests.",
  },
  {
    icon: BarChart3,
    title: "Track Your Impact",
    description:
      "See real-time stats on your referrals, acceptance rates, and total earnings from your dashboard.",
  },
  {
    icon: Clock,
    title: "Refer on Your Schedule",
    description:
      "Browse open requests when you have time. Accept only the candidates you believe in.",
  },
]

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/50 p-6 transition-all duration-300 hover:border-primary/20 hover:bg-background">
      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
          {title}
        </h3>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <>
      {/* For Job Seekers */}
      <section id="for-seekers" className="bg-card py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              For Job Seekers
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get your foot in the door
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Stop applying into the void. A referral gets your resume seen by
              the right people, fast.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seekerFeatures.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* For Referrers */}
      <section id="for-referrers" className="bg-background py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              For Referrers
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Help great people get hired
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
              Use your position to make a difference and earn rewards while you
              are at it.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {referrerFeatures.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
