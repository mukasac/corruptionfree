// app/admin/components/ModerationQueue.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface QueueItem {
  id: number;
  type: 'NOMINEE' | 'RATING' | 'COMMENT';
  content: any;
  submittedBy: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export function ModerationQueue() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const { data: queue, isLoading, refetch } = useQuery({
    queryKey: ['moderationQueue'],
    queryFn: async () => {
      const res = await fetch('/api/admin/moderation/queue');
      if (!res.ok) throw new Error('Failed to fetch queue');
      return res.json();
    }
  });

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/moderation/${id}/approve`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to approve item');
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/moderation/${id}/reject`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to reject item');
      refetch();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Moderation Queue</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {/* Batch Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedIds.length} items selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Handle batch approve */}}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Handle batch reject */}}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Reject Selected
              </Button>
            </div>
          </div>
        )}

        {/* Queue Items */}
        <div className="space-y-4">
          {queue?.map((item: QueueItem) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds([...selectedIds, item.id]);
                    } else {
                      setSelectedIds(selectedIds.filter(id => id !== item.id));
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Badge>
                      {item.type}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      by {item.submittedBy.name}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    {format(new Date(item.createdAt), 'PPp')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle view details */}}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(item.id)}
                  className="text-green-600"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReject(item.id)}
                  className="text-red-600"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}