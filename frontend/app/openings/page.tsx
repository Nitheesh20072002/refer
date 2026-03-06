
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Combobox } from '@/components/ui/combobox';
import { MapPin, Briefcase, Clock, Eye, Search, Building2, Plus, Filter, TrendingUp, Users, DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { SidebarProvider, useSidebarState } from '@/components/dashboard/sidebar-context';
import { cn } from '@/lib/utils';
import { useCompanyOptions } from '@/lib/hooks/use-company-options';

interface Company {
  id: number;
  name: string;
  logo_url?: string;
}

interface JobOpening {
  id: number;
  job_title: string;
  company: Company;
  description: string;
  tech_stack: string;
  experience_level: string;
  location: string;
  salary: string;
  status: string;
  views: number;
  referral_count: number;
  created_at: string;
  expires_at?: string;
}

interface OpeningsResponse {
  openings: JobOpening[];
  total: number;
  page: number;
  limit: number;
}

function OpeningsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { collapsed } = useSidebarState();
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const companyOptionsData = useCompanyOptions(companies, true);
  const companyOptions = companyOptionsData.map(opt => ({
    ...opt,
    icon: opt.isAllOption
      ? <Users className="h-3.5 w-3.5 text-muted-foreground" />
      : <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
  }));

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchOpenings();
  }, [page, experienceLevel, location, companyId]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get<Company[]>('/companies');
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchOpenings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (search) params.append('search', search);
      if (experienceLevel) params.append('experience_level', experienceLevel);
      if (location) params.append('location', location);
      if (companyId) params.append('company_id', companyId);

      const response = await apiClient.get<OpeningsResponse>(`/openings?${params.toString()}`);
      setOpenings(response.data.openings || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch openings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOpenings();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const clearFilters = () => {
    setSearch('');
    setExperienceLevel('');
    setLocation('');
    setCompanyId('');
  };

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
                    <Briefcase className="h-7 w-7 text-primary" />
                  </div>
                  Job Openings
                </h1>
                <p className="text-muted-foreground">
                  Discover opportunities and connect with referrers
                </p>
              </div>
              {user && user.role === 'referrer' && user.company_id && (
                <Button onClick={() => router.push('/openings/new')} className="shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Opening
                </Button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Openings</p>
                      <p className="text-2xl font-bold">{total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Active Today</p>
                      <p className="text-2xl font-bold">{openings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Companies</p>
                      <p className="text-2xl font-bold">{new Set(openings.map(o => o.company.id)).size}</p>
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
                Find the perfect job opportunity by title, experience level, or location
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="search" className="text-sm font-semibold">Search</Label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <Input
                      id="search"
                      placeholder="Search by title or description..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 border-2 focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold">Company</Label>
                  <Combobox
                    options={companyOptions}
                    value={companyId}
                    onValueChange={setCompanyId}
                    placeholder="All Companies"
                    searchPlaceholder="Search companies..."
                    emptyText="No companies found."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-semibold">Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger id="experience" className="border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location" className="border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters & Clear Button */}
              {(search || experienceLevel || location || companyId) && (
                <div className="mt-6 flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                    {search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {search}
                      </Badge>
                    )}
                    {companyId && companyId !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Company: {companies.find(c => c.id.toString() === companyId)?.name}
                      </Badge>
                    )}
                    {experienceLevel && experienceLevel !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Level: {experienceLevel}
                      </Badge>
                    )}
                    {location && location !== 'all' && (
                      <Badge variant="secondary" className="gap-1">
                        Location: {location}
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
          <div className="mb-6 flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm font-medium">
                {loading ? 'Searching...' : `${total} opening${total !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Updated just now</p>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : openings.length === 0 ? (
            <Card className="border-2 shadow-lg">
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Briefcase className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No openings found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
                  </div>
                  {(search || experienceLevel || location || companyId) && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openings.map((opening, index) => (
                  <Card
                    key={opening.id}
                    className="group hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden relative bg-gradient-to-br from-card to-card/50 cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => router.push(`/openings/${opening.id}`)}
                  >
                    {/* Top gradient accent */}
                    <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-indigo-500"></div>
                    
                    <CardHeader className="relative pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Enhanced Company Logo */}
                          <div className="relative shrink-0">
                            {opening.company.logo_url ? (
                              <img
                                src={opening.company.logo_url}
                                alt={opening.company.name}
                                className="w-12 h-12 rounded-lg object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary via-blue-500 to-indigo-500 flex items-center justify-center shadow-md">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors mb-1 font-bold line-clamp-2">
                              {opening.job_title}
                            </CardTitle>
                            <div className="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/10 w-fit">
                              <Building2 className="h-3 w-3 text-primary shrink-0" />
                              <span className="text-sm font-semibold text-primary truncate">{opening.company.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4 pt-0">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {opening.description || 'No description provided.'}
                      </p>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-2">
                        {opening.experience_level && (
                          <Badge variant="secondary" className="gap-1 hover:bg-secondary/80 transition-colors">
                            <Briefcase className="h-3 w-3" />
                            {opening.experience_level}
                          </Badge>
                        )}
                        {opening.location && (
                          <Badge variant="secondary" className="gap-1 hover:bg-secondary/80 transition-colors">
                            <MapPin className="h-3 w-3" />
                            {opening.location}
                          </Badge>
                        )}
                        {opening.salary && (
                          <Badge className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                            <DollarSign className="h-3 w-3" />
                            {opening.salary}
                          </Badge>
                        )}
                      </div>

                      {/* Tech Stack */}
                      {opening.tech_stack && (
                        <div className="space-y-2 p-3 bg-gradient-to-br from-primary/5 to-transparent rounded-lg border border-primary/10">
                          <Label className="text-xs font-bold text-foreground flex items-center gap-2">
                            <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                              <span className="text-primary text-xs">💻</span>
                            </div>
                            Tech Stack
                          </Label>
                          <div className="flex flex-wrap gap-1.5">
                            {opening.tech_stack.split(',').slice(0, 5).map((tech, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-medium hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all cursor-default shadow-sm"
                              >
                                {tech.trim()}
                              </Badge>
                            ))}
                            {opening.tech_stack.split(',').length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{opening.tech_stack.split(',').length - 5}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex justify-between text-xs text-muted-foreground pt-0 border-t">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <Eye className="h-3 w-3" />
                          {opening.views}
                        </span>
                        <span className="flex items-center gap-1 hover:text-foreground transition-colors">
                          <Clock className="h-3 w-3" />
                          {formatDate(opening.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <span>View Details</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {total > 12 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 py-2 bg-card rounded-lg border shadow-sm">
                    <span className="text-sm font-medium">
                      Page {page} of {Math.ceil(total / 12)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= Math.ceil(total / 12)}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OpeningsPage() {
  return (
    <SidebarProvider>
      <OpeningsContent />
    </SidebarProvider>
  );
}
