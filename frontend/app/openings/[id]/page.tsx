
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Briefcase, Clock, Eye, Building2, ExternalLink, Calendar, DollarSign, ArrowLeft, Users } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Company {
  id: number;
  name: string;
  logo_url?: string;
  website?: string;
}

interface PostedByUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface JobOpening {
  id: number;
  job_title: string;
  company: Company;
  posted_by_user?: PostedByUser;
  job_url?: string;
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

export default function OpeningDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [opening, setOpening] = useState<JobOpening | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [resume, setResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOpening();
    }
  }, [params.id]);

  const fetchOpening = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ opening: JobOpening }>(`/openings/${params.id}`);
      setOpening(response.data.opening);
    } catch (error) {
      console.error('Failed to fetch opening:', error);
      toast.error('Failed to load job opening');
      router.push('/openings');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReferral = async () => {
    if (!user) {
      toast.error('Please log in to request a referral');
      router.push('/auth/login');
      return;
    }

    if (!resume.trim()) {
      toast.error('Please provide your resume or LinkedIn profile');
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(`/openings/${params.id}/request-referral`, {
        resume,
        cover_letter: coverLetter,
      });
      toast.success('Referral request submitted successfully!');
      setShowReferralDialog(false);
      setResume('');
      setCoverLetter('');
      fetchOpening(); // Refresh to update referral count
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit referral request');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!opening) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/openings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Openings
        </Button>

        {/* Main Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {opening.company.logo_url ? (
                  <img
                    src={opening.company.logo_url}
                    alt={opening.company.name}
                    className="w-16 h-16 rounded"
                  />
                ) : (
                  <div className="w-16 h-16 rounded bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-3xl">{opening.job_title}</CardTitle>
                  <CardDescription className="text-lg">{opening.company.name}</CardDescription>
                </div>
              </div>
              <Badge variant={opening.status === 'active' ? 'default' : 'secondary'}>
                {opening.status}
              </Badge>
            </div>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {opening.experience_level && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="capitalize">{opening.experience_level}</span>
                </div>
              )}
              {opening.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">{opening.location}</span>
                </div>
              )}
              {opening.salary && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <span>{opening.salary}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{opening.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{opening.referral_count} referral{opening.referral_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{opening.description}</p>
              </div>

              <Separator />

              {/* Tech Stack */}
              {opening.tech_stack && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {opening.tech_stack.split(',').map((tech, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Posted on:</span>{' '}
                  {formatDate(opening.created_at)}
                </div>
                {opening.expires_at && (
                  <div>
                    <span className="font-semibold">Expires on:</span>{' '}
                    {formatDate(opening.expires_at)}
                  </div>
                )}
                {opening.posted_by_user && (
                  <div>
                    <span className="font-semibold">Posted by:</span>{' '}
                    {opening.posted_by_user.first_name} {opening.posted_by_user.last_name}
                  </div>
                )}
                {opening.company.website && (
                  <div>
                    <span className="font-semibold">Company website:</span>{' '}
                    <a
                      href={opening.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowReferralDialog(true)}
                  disabled={opening.status !== 'active'}
                >
                  Request Referral
                </Button>
                {opening.job_url && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.open(opening.job_url, '_blank')}
                  >
                    View Job Posting
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Request Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Referral</DialogTitle>
            <DialogDescription>
              Submit your information to request a referral for this position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="resume">Resume / LinkedIn Profile *</Label>
              <Textarea
                id="resume"
                placeholder="Paste your resume text or LinkedIn profile URL..."
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                rows={6}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Why are you interested in this position?"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReferralDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestReferral} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
