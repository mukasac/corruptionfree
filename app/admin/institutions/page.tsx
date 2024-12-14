// app/admin/institutions/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Building2, Shield, 
  Download, Upload, Edit, Trash, 
  CheckCircle, XCircle, AlertTriangle,
  FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';

interface Institution {
  id: number;
  name: string;
  type: 'GOVERNMENT' | 'PARASTATAL' | 'AGENCY' | 'CORPORATION';
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_INVESTIGATION' | 'SUSPENDED';
  description?: string;
  website?: string;
  totalRatings: number;
  averageRating?: number;
  rating: Array<{
    id: number;
    score: number;
    ratingCategory: {
      name: string;
      weight: number;
    };
  }>;
  createdAt: string;
}

interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function InstitutionsManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: ''
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState<Institution | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchInstitutions();
  }, [debouncedSearch, filters, pagination.page, refreshFlag]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        search: debouncedSearch,
        ...filters
      });

      const response = await fetch(`/api/admin/institutions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch institutions');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch institutions');
      }

      setInstitutions(data.data);
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
        description: error instanceof Error ? error.message : "Failed to fetch institutions"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = async (action: 'ACTIVATE' | 'SUSPEND' | 'INVESTIGATE') => {
    try {
      setProcessing({ batch: true });
      
      const response = await fetch('/api/admin/institutions/batch', {
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
        throw new Error('Failed to perform batch action');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to perform batch action');
      }

      toast({
        title: "Success",
        description: `Successfully ${action.toLowerCase()}d ${selectedIds.length} institutions`
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

      const response = await fetch(`/api/admin/institutions/${id}/status`, {
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
        description: "Successfully updated institution status"
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

      const response = await fetch(`/api/admin/institutions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete institution');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete institution');
      }

      toast({
        title: "Success",
        description: "Successfully deleted institution"
      });

      setShowDeleteConfirm(null);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete institution"
      });
    } finally {
      setProcessing({ [id]: false });
    }
  };

  const handleUpdate = async (id: number, data: Partial<Institution>) => {
    try {
      setProcessing({ [id]: true });

      const response = await fetch(`/api/admin/institutions/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update institution');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update institution');
      }

      toast({
        title: "Success",
        description: "Successfully updated institution"
      });

      setShowEditModal(null);
      setRefreshFlag(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update institution"
      });
    } finally {
      setProcessing({ [id]: false });
    }
  };

  const exportData = () => {
    const data = institutions.map(inst => ({
      'Name': inst.name,
      'Type': inst.type,
      'Status': inst.status,
      'Website': inst.website || '',
      'Description': inst.description || '',
      'Total Ratings': inst.totalRatings,
      'Average Rating': inst.averageRating?.toFixed(2) || 'N/A',
      'Created At': new Date(inst.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Institutions');
    XLSX.writeFile(wb, 'institutions-export.xlsx');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      UNDER_INVESTIGATION: "bg-yellow-100 text-yellow-800",
      SUSPENDED: "bg-red-100 text-red-800"
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
          Are you sure you want to delete this institution? This action cannot be undone.
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

  const EditModal = ({ institution }: { institution: Institution }) => {
    const [formData, setFormData] = useState({
      name: institution.name,
      type: institution.type,
      status: institution.status,
      website: institution.website || '',
      description: institution.description || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await handleUpdate(institution.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Edit Institution</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEditModal(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  name: e.target.value 
                }))}
                className="w-full border rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  type: e.target.value as Institution['type']
                }))}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="GOVERNMENT">Government</option>
                <option value="PARASTATAL">Parastatal</option>
                <option value="AGENCY">Agency</option>
                <option value="CORPORATION">Corporation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  status: e.target.value as Institution['status']
                }))}
                className="w-full border rounded-md p-2"
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_INVESTIGATION">Under Investigation</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  website: e.target.value 
                }))}
                className="w-full border rounded-md p-2"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
                rows={4}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(null)}
                disabled={processing[institution.id]}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing[institution.id]}
              >
                {processing[institution.id] ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions Management</h1>
          <p className="text-gray-500">Manage and monitor registered institutions</p>
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
            placeholder="Search institutions..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="border rounded-md px-3"
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="">All Types</option>
          <option value="GOVERNMENT">Government</option>
          <option value="PARASTATAL">Parastatal</option>
          <option value="AGENCY">Agency</option>
          <option value="CORPORATION">Corporation</option>
        </select>

        <select
          className="border rounded-md px-3"
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="UNDER_INVESTIGATION">Under Investigation</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedIds.length} institutions selected
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              disabled={processing.batch}
              onClick={() => handleBatchAction('ACTIVATE')}
              className="text-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate Selected
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
              onClick={() => handleBatchAction('SUSPEND')}
              className="text-red-600"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Suspend Selected
            </Button>
          </div>
        </div>
      )}

      {/* Institutions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === institutions.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(institutions.map(i => i.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Ratings
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {institutions.map((institution) => (
                <tr key={institution.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(institution.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, institution.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== institution.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {institution.name}
                      </div>
                      {institution.website && (
                        <a 
                          href={institution.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {institution.website}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline">
                      {institution.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(institution.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">
                        {institution.totalRatings} ratings
                      </div>
                      {institution.averageRating && (
                        <div className="text-gray-500">
                          Avg: {institution.averageRating.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(institution.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEditModal(institution)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(institution.id)}
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
              {pagination.total} institutions
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

      {/* Modals */}
      {showDeleteConfirm !== null && (
        <DeleteConfirmationModal id={showDeleteConfirm} />
      )}

      {showEditModal && (
        <EditModal institution={showEditModal} />
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