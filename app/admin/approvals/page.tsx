// app/admin/approvals/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, AlertTriangle, 
  Download, Upload, Filter, Search 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataImport from '../components/DataImport';

interface Submission {
  id: number;
  type: 'NOMINEE' | 'INSTITUTION';
  content: any;
  submittedBy: {
    name: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

export default function ApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState<'nominees' | 'institutions'>('nominees');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/approvals/pending');
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAction = async (action: 'APPROVE' | 'REJECT') => {
    try {
      const response = await fetch('/api/admin/approvals/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          reason: action === 'REJECT' ? 'Does not meet criteria' : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to process batch action');
      
      // Refresh the list
      fetchPendingSubmissions();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500">Review and manage submitted content</p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setImportType('nominees');
              setShowImport(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Nominees
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImportType('institutions');
              setShowImport(true);
            }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import Institutions
          </Button>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-50 border rounded-lg p-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedIds.length} items selected
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => handleBatchAction('APPROVE')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Selected
            </Button>
            <Button
              onClick={() => handleBatchAction('REJECT')}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(submissions.map(s => s.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.map(submission => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(submission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds([...selectedIds, submission.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== submission.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Badge>
                      {submission.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">
                        {submission.content.name}
                      </div>
                      {submission.content.description && (
                        <div className="text-sm text-gray-500">
                          {submission.content.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium">
                        {submission.submittedBy.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.submittedBy.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBatchAction('APPROVE')}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBatchAction('REJECT')}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Import Modal */}
      {showImport && (
        <DataImport
          type={importType}
          onClose={() => setShowImport(false)}
          onImportComplete={() => {
            setShowImport(false);
            fetchPendingSubmissions();
          }}
        />
      )}
    </div>
  );
}