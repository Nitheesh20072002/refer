
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
}

export default function NewOpeningPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
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

    if (user.role !== 'referrer' && user.role !== 'admin') {
      toast.error('Only referrers and admins can post job openings');
      router.push('/openings');
      return;
    }

    fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const response = await apiClient.get<{ companies: Company[] }>('/companies');
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/openings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Openings
        </Button>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Post a Job Opening</CardTitle>
            <CardDescription>
              Share job opportunities with job seekers and help them find referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company */}
              <div>
                <Label htmlFor="company">Company *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => handleChange('company_id', value)}
                >
                  <SelectTrigger id="company" className="mt-2">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Title */}
              <div>
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  className="mt-2"
                  required
                />
              </div>

              {/* Job URL */}
              <div>
                <Label htmlFor="jobUrl">Job Posting URL</Label>
                <Input
                  id="jobUrl"
                  type="url"
                  placeholder="https://company.com/careers/job-id"
                  value={formData.job_url}
                  onChange={(e) => handleChange('job_url', e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, requirements, etc."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>

              {/* Tech Stack */}
              <div>
                <Label htmlFor="techStack">Tech Stack</Label>
                <Input
                  id="techStack"
                  placeholder="e.g., React, Node.js, PostgreSQL, AWS (comma-separated)"
                  value={formData.tech_stack}
                  onChange={(e) => handleChange('tech_stack', e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate technologies with commas
                </p>
              </div>

              {/* Experience Level & Location - Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={formData.experience_level}
                    onValueChange={(value) => handleChange('experience_level', value)}
                  >
                    <SelectTrigger id="experienceLevel" className="mt-2">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleChange('location', value)}
                  >
                    <SelectTrigger id="location" className="mt-2">
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
                <div>
                  <Label htmlFor="salary">Salary Range</Label>
                  <Input
                    id="salary"
                    placeholder="e.g., $100k - $150k"
                    value={formData.salary}
                    onChange={(e) => handleChange('salary', e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="expiresAt">Expires On</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => handleChange('expires_at', e.target.value)}
                    className="mt-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/openings')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Job Opening'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
