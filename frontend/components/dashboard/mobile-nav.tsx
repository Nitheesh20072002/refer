
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LayoutDashboard, Users, Link2, BarChart3, Gift } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Referrers", icon: Users, href: "/referrers" },
  { label: "Campaigns", icon: Link2, href: "/campaigns" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Rewards", icon: Gift, href: "/rewards" },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button - Enhanced Visibility */}
      <Button
        variant="default"
        size="icon"
        className="fixed top-4 left-4 z-50 h-12 w-12 rounded-xl shadow-lg bg-primary hover:bg-primary/90 border-2 border-primary-foreground/10"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Menu className="h-6 w-6 text-primary-foreground" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <nav
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-sidebar transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4 pt-20">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Link2 className="size-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-lg font-bold text-sidebar-foreground">
              ReferLoop
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {mainNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="size-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </div>
  )
}
