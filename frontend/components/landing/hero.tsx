import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Users } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-card">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-20 text-center lg:pb-32 lg:pt-28">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-primary" />
          </span>
          Connecting talent with opportunity
        </div>

        {/* Headline */}
        <h1 className="font-[family-name:var(--font-heading)] text-pretty text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Unlock Referrals.
          <br className="hidden sm:block" />
          <span className="text-primary">Get Hired Faster.</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          Skip the resume black hole. Connect directly with employees at top
          tech companies who can refer you, or earn rewards by helping great
          candidates land their dream jobs.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/auth/signup" className="gap-2">
              <Briefcase className="size-4" />
              I Want a Referral
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
            <Link href="/auth/signup" className="gap-2">
              <Users className="size-4" />
              I Can Refer People
            </Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid w-full max-w-3xl grid-cols-3 gap-6 border-t border-border/60 pt-10">
          {[
            { value: "5,000+", label: "Referral Requests" },
            { value: "200+", label: "Partner Companies" },
            { value: "78%", label: "Success Rate" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
