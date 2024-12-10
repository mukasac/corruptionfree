// app/rate-institution/page.tsx
"use client";

import { useState, useEffect } from "react";
import { RatingCategory } from "@/types/interfaces";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PlusCircle, AlertTriangle } from "lucide-react";

interface Rating {
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence: string;
}

interface NewInstitution {
  name: string;
  description?: string;
  evidence: string;
}

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [institutionDescription, setInstitutionDescription] = useState<string>("");
  const [institutionEvidence, setInstitutionEvidence] = useState<string>("");
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newInstitution, setNewInstitution] = useState<NewInstitution>({
    name: '',
    description: '',
    evidence: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesRes = await fetch("/api/ratingcategories/");
        
        if (!categoriesRes.ok) {
          throw new Error('Failed to fetch rating categories');
        }

        const result = await categoriesRes.json();
        
        if (result.success) {
          setCategories(result.data);
        } else {
          throw new Error(result.error || 'Failed to load categories');
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load rating categories. Please refresh the page.");
      }
    }

    fetchData();
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstitution.name.trim() || !newInstitution.evidence.trim()) {
      setError("Institution name and evidence are required");
      return;
    }

    try {
      const response = await fetch('/api/institutions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInstitution.name,
          description: newInstitution.description,
          evidence: newInstitution.evidence
        }),
      });
      
      const result = await response.json();

      if (response.ok && result.success) {
        setInstitutionName(result.data.name);
        setInstitutionDescription(result.data.description || '');
        setInstitutionEvidence(newInstitution.evidence);
        setShowNewInstitution(false);
        setNewInstitution({ name: '', description: '', evidence: '' });
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to add institution');
      }
    } catch (error) {
      console.error('Error adding institution:', error);
      setError(error instanceof Error ? error.message : 'Failed to add institution. Please try again.');
    }
  };

  const handleRate = (categoryId: number, score: number) => {
    setRatings(prev => {
      const existing = prev.find(r => r.ratingCategoryId === categoryId);
      if (existing) {
        return prev.map(r =>
          r.ratingCategoryId === categoryId 
            ? { 
                ...r, 
                score,
                severity: Math.floor(Math.random() * 5) + 1, // We could add UI for this
                evidence: institutionEvidence 
              } 
            : r
        );
      }
      return [
        ...prev,
        { 
          ratingCategoryId: categoryId, 
          score, 
          severity: Math.floor(Math.random() * 5) + 1,
          evidence: institutionEvidence 
        }
      ];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!institutionName.trim()) {
      setError("Institution name is required");
      return;
    }

    if (!institutionEvidence.trim()) {
      setError("Evidence is required");
      return;
    }

    if (ratings.length === 0) {
      setError("Please provide at least one rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        institutionData: {
          name: institutionName.trim(),
          description: institutionDescription.trim(),
          evidence: institutionEvidence.trim(),
        },
        ratings: ratings.map(rating => ({
          userId: 1, // This should come from authentication
          ...rating,
          evidence: institutionEvidence.trim()
        })),
      };

      const response = await fetch("/api/institutions/rate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit institution rating');
      }

      router.push("/institutions");
    } catch (error) {
      console.error("Error submitting institution:", error);
      setError(error instanceof Error ? error.message : "Failed to submit institution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-gray-900 font-bold mb-8">
        Rate Institution
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>

          {/* Quick Add Institution */}
          {!showNewInstitution ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Name:
                  <input
                    type="text"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter institution name"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewInstitution(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New
                </button>
              </div>
              
              <label className="block text-sm font-medium text-gray-700">
                Description:
                <textarea
                  value={institutionDescription}
                  onChange={(e) => setInstitutionDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter institution description (optional)"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">Add New Institution</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newInstitution.description}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, description: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
                <textarea
                  placeholder="Evidence"
                  value={newInstitution.evidence}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, evidence: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Institution
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInstitution(false);
                    setNewInstitution({ name: '', description: '', evidence: '' });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Evidence Field */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Evidence
              <textarea
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                value={institutionEvidence}
                onChange={(e) => setInstitutionEvidence(e.target.value)}
                placeholder="Provide detailed evidence of corruption..."
              />
            </label>
          </div>
        </Card>

        {/* Rating Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Rate Corruption Metrics</h2>
          <p className="text-gray-600">
            Rate each metric from 1 (Minor) to 5 (Extreme) based on evidence.
            <span className="text-red-600 ml-1">*At least one rating is required</span>
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <Card key={category.id} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg font-medium">{category.name}</h3>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>

                {category.examples?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Examples:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {category.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleRate(category.id, score)}
                      className={`
                        px-4 py-2 rounded transition-colors
                        ${ratings.find(r => 
                          r.ratingCategoryId === category.id && 
                          r.score === score
                        )
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"}
                      `}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full py-4 rounded-md font-medium text-white
            ${isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"}
          `}
        >
          {isSubmitting ? "Submitting..." : "Submit Institution Rating"}
        </button>
      </form>
    </div>
  );
}