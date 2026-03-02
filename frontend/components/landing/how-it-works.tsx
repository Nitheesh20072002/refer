import { FileText, UserCheck, Trophy } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Submit a Referral Request",
    description:
      "Create your profile, pick a company and role you are targeting, and submit a referral request. It takes less than 2 minutes.",
  },
  {
    step: "02",
    icon: UserCheck,
    title: "Get Matched with a Referrer",
    description:
      "An employee at that company reviews your profile and, if it is a fit, submits an internal referral on your behalf.",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Land the Interview",
    description:
      "Your resume goes straight to the hiring manager. Referrers earn rewards for every successful referral they make.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-heading)] text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three simple steps to your next offer
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Whether you are looking for a referral or want to help others get
            hired, the process is straightforward.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="group relative rounded-2xl border border-border/60 bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Step number */}
              <span className="font-[family-name:var(--font-heading)] text-5xl font-bold text-primary/10 transition-colors group-hover:text-primary/20">
                {item.step}
              </span>

              {/* Icon */}
              <div className="mt-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-6" />
              </div>

              {/* Content */}
              <h3 className="mt-5 font-[family-name:var(--font-heading)] text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
