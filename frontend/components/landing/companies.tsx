const companies = [
  { name: "Google", initial: "G" },
  { name: "Microsoft", initial: "M" },
  { name: "Amazon", initial: "A" },
  { name: "Meta", initial: "M" },
  { name: "Apple", initial: "A" },
  { name: "Netflix", initial: "N" },
  { name: "Salesforce", initial: "S" },
  { name: "Adobe", initial: "A" },
]

export function Companies() {
  return (
    <section id="companies" className="border-y border-border/60 bg-card py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Referrers from top companies
        </p>

        {/* Logo row - scrolling marquee */}
        <div className="relative mt-10 overflow-hidden">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-card to-transparent" />

          <div className="flex animate-marquee items-center gap-14">
            {[...companies, ...companies].map((company, i) => (
              <div
                key={`${company.name}-${i}`}
                className="flex shrink-0 items-center gap-3 text-muted-foreground/50 transition-colors hover:text-muted-foreground/80"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/8">
                  <span className="font-[family-name:var(--font-heading)] text-sm font-bold text-primary">
                    {company.initial}
                  </span>
                </div>
                <span className="whitespace-nowrap font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/40 bg-background/50 p-6 sm:flex-row sm:gap-6">
          <div className="flex -space-x-2">
            {[
              "bg-primary",
              "bg-chart-2",
              "bg-chart-3",
              "bg-chart-4",
            ].map((color, i) => (
              <div
                key={i}
                className={`flex size-10 items-center justify-center rounded-full border-2 border-card text-xs font-bold text-primary-foreground ${color}`}
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-foreground">
              Join 5,000+ job seekers already getting referred
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Trusted by professionals across 200+ companies
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
