// app/admin/nominees/page.tsx
"use client";
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, AlertTriangle, CheckCircle, 
  XCircle, Edit, Trash, MoreVertical,
  Download, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';

interface Nominee {
  id: number;
  name: string;
  title?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNDER_INVESTIGATION';
  position: {
    name: string;
  };
  institution: {
    name: string;
  };
  district: {
    name: string;
  };
  rating: Array<{
    id: number;
    score: number;
    ratingCategory: {
      name: string;
      weight: number;
    };
  }>;
  evidence?: string;
  createdAt: string;
  totalRatings: number;
  averageRating?: number;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function NomineesManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    institution: '',
    district: '',
    dateRange: ''
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchNominees();
  }, [debouncedSearch, filters, pagination.page, refreshFlag]);

  const fetchNominees = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        search: debouncedSearch,
        ...filters
      });

      const response = await fetch(`/api/admin/nominees?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nominees 1');
      }
      
      const data = await response.json();

      // if (!data.success) {
      //   throw new Error(data.error || 'Failed to fetch nominees 2');
      // }

      setNominees(data.data);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch nominees 3"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = async (action: 'VERIFY' | 'REJECT' | 'INVESTIGATE') => {
    try {
      setProcessing({ batch: true });
      
      const response = await fetch('/api/admin/nominees/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer  ${Cookies.get('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          moderatorId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform batch action');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to perform batch action');
      }

      toast({
        title: "Success",
        description: `Successfully ${action.toLowerCase()}ed ${selectedIds.length} nominees`
      });

      setSelectedIds([]);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform batch action"
      });
    } finally {
      setProcessing({ batch: false });
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      setProcessing({ [id]: true });

      const response = await fetch(`/api/admin/nominees/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          moderatorId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      toast({
        title: "Success",
        description: "Successfully updated nominee status"
      });

      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status"
      });
    } finally {
      setProcessing({ [id]: false });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setProcessing({ [id]: true });

      const response = await fetch(`/api/admin/nominees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer  ${Cookies.get('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete nominee');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete nominee');
      }

      toast({
        title: "Success",
        description: "Successfully deleted nominee"
      });

      setShowDeleteConfirm(null);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete nominee"
      });
    } finally {
      setProcessing({ [id]: false });
    }
  };

  const exportData = () => {
    const data = nominees.map(nominee => ({
      'Name': nominee.name,
      'Title': nominee.title || '',
      'Position': nominee.position.name,
      'Institution': nominee.institution.name,
      'District': nominee.district.name,
      'Status': nominee.status,
      'Total Ratings': nominee.totalRatings,
      'Average Rating': nominee.averageRating?.toFixed(2) || 'N/A',
      'Created At': new Date(nominee.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nominees');
    XLSX.writeFile(wb, 'nominees-export.xlsx');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      VERIFIED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      UNDER_INVESTIGATION: "bg-orange-100 text-orange-800"
    };

    return (
      <Badge className={styles[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const DeleteConfirmationModal = ({ id }: { id: number }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this nominee? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(null)}
            disabled={processing[id]}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDelete(id)}
            disabled={processing[id]}
          >
            {processing[id] ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nominees Management</h1>
          <p className="text-gray-500">Manage and review nominee submissions</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportData}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search nominees..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select
          className="border rounded-md px-3"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="UNDER_INVESTIGATION">Under Investigation</option>
        </select>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedIds.length} nominees selected
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={processing.batch}
              onClick={() => handleBatchAction('VERIFY')}
              className="text-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Selected
            </Button>
            <Button
              variant="outline"
              disabled={processing.batch}
              onClick={() => handleBatchAction('INVESTIGATE')}
              className="text-yellow-600"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Investigate Selected
            </Button>
            <Button
              variant="outline"
              disabled={processing.batch}
              onClick={() => handleBatchAction('REJECT')}
              className="text-red-600"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      {/* Nominees Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === nominees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(nominees.map(n => n.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  District
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Ratings
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nominees.map((nominee) => (
                <tr key={nominee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(nominee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, nominee.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== nominee.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{nominee.name}</div>
                      {nominee.title && (
                        <div className="text-sm text-gray-500">{nominee.title}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {nominee.position.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {nominee.institution.name}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {nominee.district.name}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(nominee.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{nominee.totalRatings}</div>
                      {nominee.averageRating && (
                        <div className="text-gray-500">
                          Avg: {nominee.averageRating.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processing[nominee.id]}
                        onClick={() => handleStatusChange(nominee.id, 'VERIFY')}
                        className="text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={processing[nominee.id]}
                        onClick={() => handleStatusChange(nominee.id, 'REJECT')}
                        className="text-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(nominee.id, 'INVESTIGATE')}
                        className="text-yellow-600"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(nominee.id)}
                        className="text-gray-600"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
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
              Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} nominees
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <DeleteConfirmationModal id={showDeleteConfirm} />
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
}