// app/admin/moderation/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Eye,
  MessageSquare,
  Star,
  User,
  Flag,
  FileText,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface PendingSubmission {
  id: number;
  type: 'NOMINEE' | 'RATING' | 'COMMENT';
  content: any;
  evidence?: string;
  user: {
    name: string;
    email: string;
  };
  target: {
    id: number;
    name: string;
    type: 'NOMINEE' | 'INSTITUTION';
  };
  category?: {
    name: string;
    weight: number;
  };
  score?: number;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';
}

interface ModerationStats {
  pending: {
    nominees: number;
    ratings: number;
    comments: number;
  };
  today: {
    approved: number;
    rejected: number;
    flagged: number;
  };
}

export default function ModerationPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    type: 'ALL',
    status: 'PENDING',
    search: ''
  });
  const [showDetail, setShowDetail] = useState<PendingSubmission | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchData();
  }, [activeTab, filters, refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [submissionsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/moderation/submissions?${new URLSearchParams({
          tab: activeTab,
          ...filters
        })}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }),
        fetch('/api/admin/moderation/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
      ]);

      if (!submissionsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch moderation data');
      }

      const [submissionsData, statsData] = await Promise.all([
        submissionsRes.json(),
        statsRes.json()
      ]);

      setSubmissions(submissionsData.data);
      setStats(statsData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch moderation data"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: number, action: 'APPROVE' | 'REJECT' | 'FLAG') => {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));

      const response = await fetch(`/api/admin/moderation/submissions/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          moderatorId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to moderate submission');
      }

      toast({
        title: "Success",
        description: `Successfully ${action.toLowerCase()}ed submission`
      });

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to moderate submission"
      });
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleBatchModerate = async (action: 'APPROVE' | 'REJECT' | 'FLAG') => {
    try {
      setProcessing(prev => ({ ...prev, batch: true }));

      const response = await fetch('/api/admin/moderation/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          moderatorId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process batch moderation');
      }

      toast({
        title: "Success",
        description: `Successfully ${action.toLowerCase()}ed ${selectedIds.length} submissions`
      });

      setSelectedIds([]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process batch moderation"
      });
    } finally {
      setProcessing(prev => ({ ...prev, batch: false }));
    }
  };

  const DetailView = ({ submission }: { submission: PendingSubmission }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-semibold">Review Submission</h3>
            <p className="text-sm text-gray-500">
              Submitted by {submission.user.name} on{' '}
              {format(new Date(submission.createdAt), 'PPp')}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetail(null)}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Target Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Target Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium">{submission.target.name}</p>
                  <Badge variant="outline">
                    {submission.target.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.type === 'RATING' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span className="text-2xl font-bold">{submission.score}/5</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Category</p>
                    <p>{submission.category?.name}</p>
                  </div>
                  {submission.evidence && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Evidence</p>
                      <p className="text-gray-600">{submission.evidence}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose max-w-none">
                  <p>{submission.content}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleModerate(submission.id, 'FLAG')}
              disabled={processing[submission.id]}
              className="text-yellow-600"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag for Review
            </Button>
            <Button
              variant="outline"
              onClick={() => handleModerate(submission.id, 'REJECT')}
              disabled={processing[submission.id]}
              className="text-red-600"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleModerate(submission.id, 'APPROVE')}
              disabled={processing[submission.id]}
              className="text-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Nominees</CardTitle>
            <CardDescription>
              Awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending.nominees || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Ratings</CardTitle>
            <CardDescription>
              Awaiting verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending.ratings || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Comments</CardTitle>
            <CardDescription>
              Awaiting approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pending.comments || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Actions</CardTitle>
            <CardDescription>
              Moderation activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Approved</span>
                <span className="font-medium">
                  {stats?.today.approved || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Rejected</span>
                <span className="font-medium">
                  {stats?.today.rejected || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600">Flagged</span>
                <span className="font-medium">
                  {stats?.today.flagged || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Submissions</CardTitle>
            <Button
              variant="outline"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          <CardDescription>
            Review and moderate user submissions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                All ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="nominees">
                Nominees ({stats?.pending.nominees || 0})
              </TabsTrigger>
              <TabsTrigger value="ratings">
                Ratings ({stats?.pending.ratings || 0})
              </TabsTrigger>
              <TabsTrigger value="comments">
                Comments ({stats?.pending.comments || 0})
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* Batch Actions */}
              {selectedIds.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedIds.length} items selected
                  </span>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleBatchModerate('APPROVE')}
                      disabled={processing.batch}
                      className="text-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBatchModerate('REJECT')}
                      disabled={processing.batch}
                      className="text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Selected
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleBatchModerate('FLAG')}
                      disabled={processing.batch}
                      className="text-yellow-600"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag Selected
                    </Button>
                  </div>
                </div>
        )}

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === submissions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(submissions.map(s => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Content</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Submitted By</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, submission.id]);
                        } else {
                          setSelectedIds(
                            selectedIds.filter(id => id !== submission.id)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        submission.type === 'RATING' ? 'default' :
                        submission.type === 'COMMENT' ? 'secondary' :
                        'outline'
                      }
                    >
                      {submission.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-xs truncate">
                      {submission.type === 'RATING' ? (
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">
                            {submission.score}/5
                          </span>
                          {submission.category && (
                            <span className="text-gray-500">
                              - {submission.category.name}
                            </span>
                          )}
                        </div>
                      ) : submission.type === 'COMMENT' ? (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span>{submission.content}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{submission.content}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {submission.target.name}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {submission.target.type}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">
                        {submission.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(submission.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetail(submission)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModerate(submission.id, 'APPROVE')}
                        disabled={processing[submission.id]}
                        className="text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModerate(submission.id, 'REJECT')}
                        disabled={processing[submission.id]}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleModerate(submission.id, 'FLAG')}
                        disabled={processing[submission.id]}
                        className="text-yellow-600"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {submissions.length === 0 && !loading && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              All caught up!
            </h3>
            <p className="text-gray-500 mt-2">
              No pending submissions to review at the moment.
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        )}
      </div>
    </Tabs>
  </CardContent>
</Card>

{/* Detail Modal */}
{showDetail && <DetailView submission={showDetail} />}
</div>
);
}