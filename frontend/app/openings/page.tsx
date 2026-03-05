
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Briefcase, Clock, Eye, Search, Building2, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

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

export default function OpeningsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchOpenings();
  }, [page, experienceLevel, location]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Job Openings</h1>
            <p className="text-gray-600">
              Discover opportunities and connect with referrers
            </p>
          </div>
          {user && (user.role === 'referrer' || user.role === 'admin') && (
            <Button onClick={() => router.push('/openings/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Post Opening
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {total} opening{total !== 1 ? 's' : ''} found
              </p>
              <Button onClick={handleSearch}>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>

        {/* Job Listings */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
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
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No job openings found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openings.map((opening) => (
                <Card
                  key={opening.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/openings/${opening.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {opening.company.logo_url ? (
                          <img
                            src={opening.company.logo_url}
                            alt={opening.company.name}
                            className="w-10 h-10 rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{opening.job_title}</CardTitle>
                          <CardDescription>{opening.company.name}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {opening.description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {opening.experience_level && (
                        <Badge variant="secondary">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {opening.experience_level}
                        </Badge>
                      )}
                      {opening.location && (
                        <Badge variant="secondary">
                          <MapPin className="h-3 w-3 mr-1" />
                          {opening.location}
                        </Badge>
                      )}
                    </div>
                    {opening.tech_stack && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {opening.tech_stack.split(',').slice(0, 3).map((tech, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tech.trim()}
                          </Badge>
                        ))}
                        {opening.tech_stack.split(',').length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{opening.tech_stack.split(',').length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {opening.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(opening.created_at)}
                      </span>
                    </div>
                    {opening.salary && (
                      <span className="font-semibold text-green-600">{opening.salary}</span>
                    )}
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
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
