"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Link2,
  BarChart3,
  Gift,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useSidebarState } from "./sidebar-context"
import { useAuth } from "@/lib/auth-context"

const mainNav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Referrers", icon: Users, active: false },
  { label: "Campaigns", icon: Link2, active: false },
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Rewards", icon: Gift, active: false },
]

const bottomNav = [
  { label: "Settings", icon: Settings },
  { label: "Help Center", icon: HelpCircle },
]

export function DashboardSidebar() {
  const { collapsed, toggle } = useSidebarState()
  const { logout } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Link2 className="size-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-[family-name:var(--font-heading)] text-lg font-bold tracking-tight text-sidebar-foreground">
            ReferLoop
          </span>
        )}
      </div>

      {/* Main navigation */}
      <nav className="mt-4 flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <li key={item.label}>
              <button
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  item.active
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom navigation */}
      <div className="px-3 pb-4">
        <div className="mb-2 border-t border-sidebar-border" />
        <ul className="flex flex-col gap-1">
          {bottomNav.map((item) => (
            <li key={item.label}>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                <item.icon className="size-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <LogOut className="size-5 shrink-0" />
              {!collapsed && <span>Log Out</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Collapse button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-20 z-40 flex size-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 shadow-sm transition-colors hover:text-sidebar-foreground"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>
    </aside>
  )
}
