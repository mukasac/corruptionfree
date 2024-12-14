// app/admin/audit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Clock, 
  Filter, 
  Download, 
  Search,
  User,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AuditLog {
  id: number;
  action: string;
  resourceType: string;
  resourceIds: number[];
  adminId: number;
  admin: {
    name: string;
    email: string;
  };
  details?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface AuditFilters {
  action: string;
  resourceType: string;
  adminId: string;
  startDate: string;
  endDate: string;
}

export default function AuditLogs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    action: '',
    resourceType: '',
    adminId: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/admin/audit/logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      
      const data = await response.json();
      setLogs(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: Math.ceil(data.total / prev.limit)
      }));
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch audit logs"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit/logs/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to export logs');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export logs"
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'update':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'approve':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'reject':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const FilterPanel = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              action: e.target.value 
            }))}
            className="w-full rounded-md border-gray-300"
          >
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="approve">Approve</option>
            <option value="reject">Reject</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            value={filters.resourceType}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              resourceType: e.target.value 
            }))}
            className="w-full rounded-md border-gray-300"
          >
            <option value="">All Types</option>
            <option value="nominee">Nominee</option>
            <option value="institution">Institution</option>
            <option value="rating">Rating</option>
            <option value="comment">Comment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              startDate: e.target.value 
            }))}
            className="w-full rounded-md border-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              endDate: e.target.value 
            }))}
            className="w-full rounded-md border-gray-300"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setFilters({
              action: '',
              resourceType: '',
              adminId: '',
              startDate: '',
              endDate: ''
            });
          }}
        >
          Clear Filters
        </Button>
        <Button
          onClick={() => setShowFilters(false)}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track and monitor system activities</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={exportLogs}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showFilters && <FilterPanel />}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'PPpp')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {log.admin.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.admin.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium">
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {log.resourceType}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      ID: {log.resourceIds.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {log.details}
                    </div>
                    {log.metadata && (
                      <details className="mt-1">
                        <summary className="text-sm text-blue-600 cursor-pointer">
                          View Metadata
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} logs
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({
                  ...prev,
                  page: prev.page - 1
                }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => setPagination(prev => ({
                  ...prev,
                  page: prev.page + 1
                }))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}