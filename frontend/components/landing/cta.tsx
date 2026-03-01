import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="bg-card py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-sidebar px-8 py-16 text-center sm:px-16 lg:py-24">
          {/* Subtle pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          <div className="relative">
            <h2 className="font-[family-name:var(--font-heading)] text-pretty text-3xl font-bold tracking-tight text-sidebar-foreground sm:text-4xl lg:text-5xl">
              Ready to skip the queue?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-sidebar-foreground/70">
              Join thousands of job seekers and referrers already on the
              platform. Create your free account and start connecting today.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-12 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <Link href="/auth/signup" className="gap-2">
                  Get Started Free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-sidebar-border bg-transparent px-8 text-base text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                asChild
              >
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>

            <p className="mt-5 text-sm text-sidebar-foreground/50">
              No credit card required. Free forever for job seekers.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
