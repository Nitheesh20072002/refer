
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Briefcase, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { SidebarProvider, useSidebarState } from '@/components/dashboard/sidebar-context';
import { cn } from '@/lib/utils';

interface Company {
  id: number;
  name: string;
}

function NewOpeningContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { collapsed } = useSidebarState();
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [userCompany, setUserCompany] = useState<Company | null>(null);
  const [canPostOpening, setCanPostOpening] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    job_title: '',
    job_url: '',
    description: '',
    tech_stack: '',
    experience_level: '',
    location: '',
    salary: '',
    expires_at: '',
  });

  useEffect(() => {
    // Check if user is authorized
    if (!user) {
      toast.error('Please log in to post job openings');
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'referrer') {
      toast.error('Only referrers can post job openings');
      router.push('/openings');
      return;
    }

    // Fetch user's company
    fetchUserCompany();
  }, [user]);

  const fetchUserCompany = async () => {
    setLoadingCompany(true);
    try {
      console.log('Fetching user profile...');
      const profile = await apiClient.getProfile();
      console.log('Profile fetched:', profile);
      
      if (profile.company_id) {
        console.log('User has company_id:', profile.company_id);
        // Fetch all companies and find the user's company
        const response = await apiClient.get<Company[]>('/companies');
        const allCompanies = response.data || [];
        const userComp = allCompanies.find(c => c.id === profile.company_id);
        
        if (userComp) {
          console.log('Found user company:', userComp);
          setUserCompany(userComp);
          setCanPostOpening(true);
          // Auto-set the company_id for referrers
          setFormData(prev => ({ ...prev, company_id: profile.company_id!.toString() }));
        } else {
          console.log('Company not found in list');
          setCanPostOpening(false);
        }
      } else {
        console.log('User has no company_id');
        setCanPostOpening(false);
      }
    } catch (error: any) {
      console.error('Error fetching user company:', error);
      setCanPostOpening(false);
    } finally {
      setLoadingCompany(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.company_id) {
      toast.error('Please select a company');
      return;
    }

    if (!formData.job_title.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload
      const payload: any = {
        company_id: parseInt(formData.company_id),
        job_title: formData.job_title.trim(),
      };

      // Add optional fields if provided
      if (formData.job_url.trim()) payload.job_url = formData.job_url.trim();
      if (formData.description.trim()) payload.description = formData.description.trim();
      if (formData.tech_stack.trim()) payload.tech_stack = formData.tech_stack.trim();
      if (formData.experience_level) payload.experience_level = formData.experience_level;
      if (formData.location) payload.location = formData.location;
      if (formData.salary.trim()) payload.salary = formData.salary.trim();
      if (formData.expires_at) {
        // Convert to ISO 8601 format
        payload.expires_at = new Date(formData.expires_at).toISOString();
      }

      const response = await apiClient.post('/openings', payload);
      toast.success('Job opening posted successfully!');
      router.push(`/openings/${response.data.opening.id}`);
    } catch (error: any) {
      console.error('Failed to post opening:', error);
      toast.error(error.response?.data?.error || 'Failed to post job opening');
    } finally {
      setLoading(false);
    }
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
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => router.push('/openings')}
                className="mb-4 hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Openings
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Plus className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  Post a Job Opening
                </h1>
              </div>
              <p className="text-muted-foreground ml-[52px]">
                Share job opportunities with job seekers and help them find referrals
              </p>
            </div>
  
            {/* Loading State */}
            {loadingCompany ? (
              <Card className="shadow-lg border-2">
                <CardContent className="py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">Loading your company information...</p>
                  </div>
                </CardContent>
              </Card>
            ) : !canPostOpening ? (
              /* No Company Message */
              <Card className="shadow-lg border-2">
                <CardContent className="py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-amber-500/10 rounded-full">
                      <Building2 className="h-12 w-12 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Company Association Required</h3>
                      <p className="text-muted-foreground max-w-md">
                        You need to be associated with a company to post job openings.
                        Please contact your administrator to get added to a company.
                      </p>
                    </div>
                    <Button onClick={() => router.push('/openings')} variant="outline" className="mt-4">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Job Openings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Form */
            <Card className="shadow-lg border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Job Details</CardTitle>
                    <CardDescription>
                      Fill in the information about the job opening
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company - Read-only */}
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Company *
                    </Label>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border-2 border-primary/20 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{userCompany?.name}</p>
                        <p className="text-xs text-muted-foreground">Your company</p>
                      </div>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Job Title *
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      className="border-2 focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* Job URL */}
                  <div className="space-y-2">
                    <Label htmlFor="jobUrl" className="text-sm font-semibold">Job Posting URL</Label>
                    <Input
                      id="jobUrl"
                      type="url"
                      placeholder="https://company.com/careers/job-id"
                      value={formData.job_url}
                      onChange={(e) => handleChange('job_url', e.target.value)}
                      className="border-2 focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Job Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role, responsibilities, requirements, etc."
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={6}
                      className="border-2 focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-2">
                    <Label htmlFor="techStack" className="text-sm font-semibold">Tech Stack</Label>
                    <Input
                      id="techStack"
                      placeholder="e.g., React, Node.js, PostgreSQL, AWS (comma-separated)"
                      value={formData.tech_stack}
                      onChange={(e) => handleChange('tech_stack', e.target.value)}
                      className="border-2 focus:border-primary transition-colors"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate technologies with commas
                    </p>
                  </div>

                  {/* Experience Level & Location - Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel" className="text-sm font-semibold">Experience Level</Label>
                      <Select
                        value={formData.experience_level}
                        onValueChange={(value) => handleChange('experience_level', value)}
                      >
                        <SelectTrigger id="experienceLevel" className="border-2 focus:border-primary transition-colors">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid-Level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-sm font-semibold">Location</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleChange('location', value)}
                      >
                        <SelectTrigger id="location" className="border-2 focus:border-primary transition-colors">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Salary & Expiry Date - Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="salary" className="text-sm font-semibold">Salary Range</Label>
                      <Input
                        id="salary"
                        placeholder="e.g., $100k - $150k"
                        value={formData.salary}
                        onChange={(e) => handleChange('salary', e.target.value)}
                        className="border-2 focus:border-primary transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiresAt" className="text-sm font-semibold">Expires On</Label>
                      <Input
                        id="expiresAt"
                        type="date"
                        value={formData.expires_at}
                        onChange={(e) => handleChange('expires_at', e.target.value)}
                        className="border-2 focus:border-primary transition-colors"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/openings')}
                      disabled={loading}
                      className="min-w-[100px]"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="min-w-[150px] shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Posting...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Job Opening
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewOpeningPage() {
  return (
    <SidebarProvider>
      <NewOpeningContent />
    </SidebarProvider>
  );
}
