// app/admin/components/PendingSubmissions.tsx
'use client'

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
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Table } from '@/components/ui/table';

interface PendingSubmission {
  nominees: {
    data: Nominee[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  ratings: {
    data: Rating[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  comments: {
    data: Comment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface Nominee {
  id: number;
  name: string;
  title: string;
  institution: {
    name: string;
  };
  position: {
    name: string;
  };
  createdAt: string;
  evidence: string;
}

interface Rating {
  id: number;
  score: number;
  evidence: string;
  nominee: {
    name: string;
  };
  user: {
    name: string;
  };
  ratingCategory: {
    name: string;
  };
  createdAt: string;
}

interface Comment {
  id: number;
  content: string;
  nominee: {
    name: string;
  };
  user: {
    name: string;
  };
  createdAt: string;
}

export default function PendingSubmissions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('nominees');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<PendingSubmission | null>(null);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/admin/submissions/pending?page=${currentPage}&limit=${pageSize}&type=${activeTab}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        }
      );

      if (!res.ok) throw new Error('Failed to fetch submissions');

      const data = await res.json();
      setSubmissions(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch submissions';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, [currentPage, activeTab]);

  const handleApprove = async (type: string, id: number) => {
    try {
      setProcessing(prev => ({ ...prev, [`${type}-${id}`]: true }));
      const res = await fetch(`/api/admin/${type}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to approve ${type}`);
      }

      toast({
        title: "Success",
        description: `Successfully approved ${type.slice(0, -1)}`,
      });
      
      await fetchPendingSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to approve ${type}`;
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setProcessing(prev => ({ ...prev, [`${type}-${id}`]: false }));
    }
  };

  const handleReject = async (type: string, id: number) => {
    try {
      setProcessing(prev => ({ ...prev, [`${type}-${id}`]: true }));
      const res = await fetch(`/api/admin/${type}/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || `Failed to reject ${type}`);
      }

      toast({
        title: "Success",
        description: `Successfully rejected ${type.slice(0, -1)}`,
      });

      await fetchPendingSubmissions();
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to reject ${type}`;
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setProcessing(prev => ({ ...prev, [`${type}-${id}`]: false }));
    }
  };

  const renderTable = (data: any[], columns: any[]) => {
    return (
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <Table>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white border-b hover:bg-gray-50"
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {column.cell ? column.cell(item) : item[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const renderActions = (type: string, id: number) => (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleApprove(type, id)}
        disabled={processing[`${type}-${id}`]}
        className="flex items-center gap-1"
      >
        {processing[`${type}-${id}`] ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReject(type, id)}
        disabled={processing[`${type}-${id}`]}
        className="flex items-center gap-1"
      >
        {processing[`${type}-${id}`] ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        Reject
      </Button>
    </div>
  );

  if (!submissions) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No pending submissions found</AlertDescription>
      </Alert>
    );
  }

  const tabs = [
    {
      value: "nominees",
      label: `Nominees (${submissions.nominees.total})`,
      columns: [
        { accessor: 'name', header: 'Name' },
        { accessor: 'institution.name', header: 'Institution' },
        { accessor: 'position.name', header: 'Position' },
        { 
          accessor: 'evidence', 
          header: 'Evidence',
          cell: (item: Nominee) => (
            <div className="max-w-xs truncate">{item.evidence}</div>
          )
        },
        {
          accessor: 'createdAt',
          header: 'Submitted',
          cell: (item: Nominee) => format(new Date(item.createdAt), 'PPp')
        },
        {
          accessor: 'actions',
          header: 'Actions',
          cell: (item: Nominee) => renderActions('nominees', item.id)
        }
      ]
    },
    {
      value: "ratings",
      label: `Ratings (${submissions.ratings.total})`,
      columns: [
        { accessor: 'nominee.name', header: 'Nominee' },
        { accessor: 'ratingCategory.name', header: 'Category' },
        {
          accessor: 'score',
          header: 'Score',
          cell: (item: Rating) => (
            <Badge variant={item.score >= 4 ? 'destructive' : 'default'}>
              {item.score}
            </Badge>
          )
        },
        { accessor: 'user.name', header: 'Submitted By' },
        {
          accessor: 'evidence',
          header: 'Evidence',
          cell: (item: Rating) => (
            <div className="max-w-xs truncate">{item.evidence}</div>
          )
        },
        {
          accessor: 'createdAt',
          header: 'Submitted',
          cell: (item: Rating) => format(new Date(item.createdAt), 'PPp')
        },
        {
          accessor: 'actions',
          header: 'Actions',
          cell: (item: Rating) => renderActions('ratings', item.id)
        }
      ]
    },
    {
      value: "comments",
      label: `Comments (${submissions.comments.total})`,
      columns: [
        { accessor: 'nominee.name', header: 'Nominee' },
        {
          accessor: 'content',
          header: 'Comment',
          cell: (item: Comment) => (
            <div className="max-w-xs truncate">{item.content}</div>
          )
        },
        { accessor: 'user.name', header: 'Submitted By' },
        {
          accessor: 'createdAt',
          header: 'Submitted',
          cell: (item: Comment) => format(new Date(item.createdAt), 'PPp')
        },
        {
          accessor: 'actions',
          header: 'Actions',
          cell: (item: Comment) => renderActions('comments', item.id)
        }
      ]
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <Card>
            <CardHeader>
              <CardTitle>Pending {tab.value.charAt(0).toUpperCase() + tab.value.slice(1)}</CardTitle>
              <CardDescription>
                Review and approve new {tab.value} submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTable(
                submissions[tab.value as keyof PendingSubmission].data,
                tab.columns
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}