// app/admin/components/NomineeDetailModal.tsx
import React, { useState } from 'react';
import { 
  X, Save, AlertTriangle, Star, 
  CheckCircle, XCircle, MessageSquare 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface NomineeDetailProps {
  nominee: any; // Replace with proper type
  onClose: () => void;
  onUpdate: (data: any) => Promise<void>;
}

export default function NomineeDetailModal({ 
  nominee, 
  onClose, 
  onUpdate 
}: NomineeDetailProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: nominee.name,
    title: nominee.title || '',
    status: nominee.status,
    evidence: nominee.evidence || '',
    positionId: nominee.position.id,
    institutionId: nominee.institution.id,
    districtId: nominee.district.id
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error('Error updating nominee:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center overflow-auto py-8">
      <div className="bg-white rounded-lg w-[900px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{nominee.name}</h2>
            <p className="text-sm text-gray-500">
              {nominee.position.name} at {nominee.institution.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="details" className="p-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="ratings">
                Ratings ({nominee.rating.length})
              </TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        title: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        status: e.target.value
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="VERIFIED">Verified</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="UNDER_INVESTIGATION">Under Investigation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position
                    </label>
                    <select
                      value={formData.positionId}
                      onChange={e => setFormData(prev => ({
                        ...prev,
                        positionId: parseInt(e.target.value)
                      }))}
                      className="mt-1 block w-full rounded-md border-gray-300"
                    >
                      {/* Map through positions */}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Evidence
                  </label>
                  <textarea
                    value={formData.evidence}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      evidence: e.target.value
                    }))}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="ratings" className="mt-6">
              <div className="space-y-4">
                {nominee.rating.map((rating: any) => (
                  <Card key={rating.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{rating.ratingCategory.icon}</div>
                        <div>
                          <h4 className="font-medium">{rating.ratingCategory.name}</h4>
                          <div className="text-sm text-gray-500">
                            by {rating.user.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-amber-500">
                        {rating.score}/5
                      </div>
                    </div>
                    {rating.evidence && (
                      <p className="mt-2 text-gray-600">{rating.evidence}</p>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="mt-6">
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-gray-900">
                  Submitted Evidence
                </h3>
                <p className="whitespace-pre-wrap text-gray-600">
                  {nominee.evidence}
                </p>
                
                {/* Documents/Attachments would go here */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Supporting Documents
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {nominee.documents?.map((doc: string, index: number) => (
                      <div 
                        key={index}
                        className="border rounded p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          📄
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm">{doc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                {/* Example history items */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status updated to Verified</p>
                    <p className="text-xs text-gray-500">
                      By Admin on {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Add more history items */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}