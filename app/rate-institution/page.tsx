"use client";
import { useState, useEffect } from "react";
import {
  RatingCategory,
} from "@/types/interfaces";
import { useRouter } from "next/navigation";

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [ratings, setRatings] = useState<
    {
      ratingCategoryId: number;
      score: number;
      severity: number;
      evidence: string;
    }[]
  >([]);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [institutionEvidence, setInstitutionEvidence] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const categoriesRes = await fetch("/api/ratingcategories/");
      const categoriesData = await categoriesRes.json();
      setCategories(categoriesData.data);
    }

    fetchData();
  }, []);

  const handleRate = (
    categoryId: number,
    score: number,
    severity: number,
    evidence: string,
  ) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.ratingCategoryId === categoryId);
      if (existing) {
        return prev.map((r) =>
          r.ratingCategoryId === categoryId
            ? { ...r, score, severity, evidence }
            : r,
        );
      }
      return [
        ...prev,
        { ratingCategoryId: categoryId, score, severity, evidence },
      ];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      institutionData: {
        name: institutionName,
        evidence: institutionEvidence, // Replace with actual evidence
      },
      ratings: ratings.map((rating) => ({
        userId: 1, // Example user ID; replace with actual value
        ...rating,
        severity: Math.floor(Math.random() * 5) + 1, // Dummy severity value
        evidence: institutionEvidence, // Replace with actual evidence
      })),
    };

    const response = await fetch("/api/institutions/rate/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/institutions");
    } else {
      console.error("Error submitting institution:", await response.json());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-gray-700 font-bold mb-8">
        Create New Institution
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-xl text-gray-700 font-semibold mb-4">
            Basic Information
          </h2>
          <label className="block text-sm font-medium text-gray-700">
            Name:
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Evidence
            </label>
            <textarea
              required
              className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              value={institutionEvidence}
              onChange={(e) => setInstitutionEvidence(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl text-gray-700 font-semibold">
            Rate Corruption Metrics
          </h2>
          <p className="text-gray-600">
            Rate each metric from 1 (Minor) to 5 (Extreme) based on available
            evidence.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg p-4 shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg text-gray-700 font-medium">
                    {category.name}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {category.description}
                </p>
                {category.examples && category.examples.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">
                      Examples:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {category.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        handleRate(category.id, score, 2, institutionEvidence)
                      }
                      className={`px-3 py-1 text-gray-600 rounded ${
                        ratings.find(
                          (r) =>
                            r.ratingCategoryId === category.id &&
                            r.score === score,
                        )
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 px-8 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Submit Institution
        </button>
      </form>
    </div>
  );
}
