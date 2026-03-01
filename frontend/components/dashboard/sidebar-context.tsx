"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggle: () => setCollapsed((c) => !c) }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarState() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider")
  }
  return context
}
