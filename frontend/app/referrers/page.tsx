
"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Building2, Award, Users, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { SidebarProvider, useSidebarState } from "@/components/dashboard/sidebar-context"
import { Combobox } from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
import { useCompanyOptions } from "@/lib/hooks/use-company-options"

interface Company {
  id: number
  name: string
  domain: string
  website?: string
}

interface Referrer {
  id: number
  first_name: string
  last_name: string
  company_id: number
  tech_stack: string
  linkedin?: string
  github?: string
  reward_points: number
  Company?: Company
}

function ReferrersContent() {
  const [referrers, setReferrers] = useState<Referrer[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [techStackFilter, setTechStackFilter] = useState("")
  const { collapsed } = useSidebarState()
  const companyOptionsData = useCompanyOptions(companies, true)
  const companyOptions = companyOptionsData.map(opt => ({
    ...opt,
    icon: opt.isAllOption
      ? <Users className="h-3.5 w-3.5 text-muted-foreground" />
      : <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
  }))

  useEffect(() => {
    loadCompanies()
    loadReferrers()
  }, [])

  useEffect(() => {
    loadReferrers()
  }, [searchTerm, selectedCompany, techStackFilter])

  const getApiUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    // Remove trailing /api if present to avoid double /api
    return baseUrl.replace(/\/api\/?$/, '')
  }

  const loadCompanies = async () => {
    try {
      const url = `${getApiUrl()}/api/companies`
      console.log("Fetching companies from:", url) // Debug log
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Loaded companies:", data) // Debug log
      setCompanies(data || [])
    } catch (error) {
      console.error("Failed to load companies:", error)
      setCompanies([])
    }
  }

  const loadReferrers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedCompany) params.append("company_id", selectedCompany)
      if (techStackFilter) params.append("tech_stack", techStackFilter)

      const url = `${getApiUrl()}/api/referrers?${params.toString()}`
      console.log("Fetching referrers from:", url) // Debug log
      const response = await fetch(url)
      const data = await response.json()
      setReferrers(data)
    } catch (error) {
      console.error("Failed to load referrers:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCompany("")
    setTechStackFilter("")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      <DashboardSidebar />
      <MobileNav />
      
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "md:ml-[72px]" : "md:ml-64"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  Find Referrers
                </h1>
                <p className="text-muted-foreground">
                  Connect with {referrers.length}+ professionals ready to help you land your dream job
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Referrers</p>
                      <p className="text-2xl font-bold">{referrers.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Companies</p>
                      <p className="text-2xl font-bold">{companies.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Award className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 shadow-lg border-2 hover:border-primary/20 transition-colors">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Filter className="h-4 w-4 text-primary" />
                </div>
                Search & Filters
              </CardTitle>
              <CardDescription>
                Find the perfect referrer by name, company, or technology stack
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* General Search */}
                <div className="space-y-2">
                  <Label htmlFor="search" className="text-sm font-semibold">Search</Label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by name or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Company Filter */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold">Company</Label>
                  <Combobox
                    options={companyOptions}
                    value={selectedCompany}
                    onValueChange={setSelectedCompany}
                    placeholder={companies.length === 0 ? "Loading..." : "Select company..."}
                    searchPlaceholder="Search companies..."
                    emptyText={companies.length === 0 ? "Loading..." : "No companies found."}
                  />
                </div>

                {/* Tech Stack Filter */}
                <div className="space-y-2">
                  <Label htmlFor="tech" className="text-sm font-semibold">Tech Stack</Label>
                  <div className="relative">
                    <Input
                      id="tech"
                      type="text"
                      placeholder="e.g., React, Python, Go..."
                      value={techStackFilter}
                      onChange={(e) => setTechStackFilter(e.target.value)}
                      className="border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filters & Clear Button */}
              {(searchTerm || selectedCompany || techStackFilter) && (
                <div className="mt-6 flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {searchTerm}
                      </Badge>
                    )}
                    {selectedCompany && selectedCompany !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Company
                      </Badge>
                    )}
                    {techStackFilter && (
                      <Badge variant="secondary" className="gap-1">
                        Tech: {techStackFilter}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-primary/10">
                    Clear all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm font-medium">
                {loading ? "Searching..." : `${referrers.length} referrer${referrers.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </div>

          {/* Referrers Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary/50 to-blue-500/50"></div>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : referrers.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed">
              <div className="max-w-md mx-auto">
                <div className="mb-6 inline-flex p-4 bg-muted rounded-full">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No referrers found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to find more referrers
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {referrers.map((referrer, index) => (
                <Card
                  key={referrer.id}
                  className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden relative bg-gradient-to-br from-card to-card/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Top gradient accent */}
                  <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-indigo-500"></div>
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {/* Enhanced Avatar */}
                        <div className="relative">
                          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {referrer.first_name[0]}{referrer.last_name[0]}
                          </div>
                          {referrer.reward_points > 0 && (
                            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg border-2 border-card">
                              <Award className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl group-hover:text-primary transition-colors mb-1.5 font-bold">
                            {`${referrer.first_name} ${referrer.last_name}`}
                          </CardTitle>
                          {referrer.Company && (
                            <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10 w-fit">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-semibold text-primary">{referrer.Company.name}</span>
                            </div>
                          )}
                          {referrer.reward_points > 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              {referrer.reward_points} points earned
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 pt-0">
                    {/* Tech Stack */}
                    {referrer.tech_stack && (
                      <div className="space-y-2 p-3 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-xs">💻</span>
                          </div>
                          Skills & Technologies
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          {referrer.tech_stack.split(',').slice(0, 6).map((tech, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs font-medium hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all cursor-default shadow-sm"
                            >
                              {tech.trim()}
                            </Badge>
                          ))}
                          {referrer.tech_stack.split(',').length > 6 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                              +{referrer.tech_stack.split(',').length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Social Links - Enhanced */}
                    {(referrer.linkedin || referrer.github) && (
                      <div className="flex gap-2">
                        {referrer.linkedin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm hover:shadow-md"
                            onClick={() => window.open(referrer.linkedin, '_blank')}
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          </Button>
                        )}
                        {referrer.github && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-gray-900 hover:text-white hover:border-gray-900 dark:hover:bg-white dark:hover:text-gray-900 transition-all shadow-sm hover:shadow-md"
                            onClick={() => window.open(referrer.github, '_blank')}
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Connect Button - Enhanced */}
                    <Button className="w-full group-hover:shadow-xl transition-all bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white font-semibold" size="lg">
                      <Users className="h-4 w-4 mr-2" />
                      Request Referral
                      <span className="ml-auto text-xs opacity-75">→</span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function ReferrersPage() {
  return (
    <SidebarProvider>
      <ReferrersContent />
    </SidebarProvider>
  )
}
