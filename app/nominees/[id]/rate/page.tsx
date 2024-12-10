"use client";

import { useState, useEffect } from "react";
import { RatingCategory, PaginatedResponse } from "@/types/interfaces";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Rating {
  ratingCategoryId: number;
  score: number;
  evidence: string;
}

export default function RateNomineePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [nomineeName, setNomineeName] = useState<string>("");
  const [evidence, setEvidence] = useState<string>("");
  const [nomineeId, setNomineeId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { id } = await params;
        const parsedId = parseInt(id, 10);
        setNomineeId(parsedId);

        const [categoriesRes, nomineeRes] = await Promise.all([
          fetch("/api/ratingcategories"),
          fetch(`/api/nominees/${parsedId}`)
        ]);

        if (!categoriesRes.ok || !nomineeRes.ok) {
          throw new Error("Failed to fetch required data");
        }

        const categoriesData: PaginatedResponse<RatingCategory> = await categoriesRes.json();
        const nomineeData = await nomineeRes.json();

        setCategories(categoriesData.data);
        setNomineeName(nomineeData.name);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params]);

  const handleRate = (categoryId: number, score: number) => {
    setRatings(prev => {
      const existing = prev.find(r => r.ratingCategoryId === categoryId);
      if (existing) {
        return prev.map(r =>
          r.ratingCategoryId === categoryId ? { ...r, score } : r
        );
      }
      return [...prev, { ratingCategoryId: categoryId, score, evidence }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidence.trim()) {
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
      const response = await fetch(`/api/nominees/${nomineeId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratings: ratings.map(rating => ({
            userId: 1, // Replace with actual user ID
            ...rating,
            evidence,
            severity: Math.floor(Math.random() * 5) + 1, // TODO: Add severity selection
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit ratings");
      }

      router.push(`/nominees/${nomineeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit ratings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        Rate {nomineeName}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Evidence Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Evidence</h2>
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            required
            className="w-full h-32 p-3 border rounded-md"
            placeholder="Provide detailed evidence supporting your ratings..."
          />
        </Card>

        {/* Rating Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Rate Corruption Metrics</h2>
          <p className="text-gray-600">
            Rate each metric from 1 (Minor) to 5 (Extreme) based on evidence.
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

                {category.examples.length > 0 && (
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
          {isSubmitting ? "Submitting..." : "Submit Ratings"}
        </button>
      </form>
    </div>
  );
}