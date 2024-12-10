// app/institutions/[id]/page.tsx
"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { Institution } from "@/types/interfaces";
import Link from "next/link";

export default function InstitutionPage({
  params,
}: {
  params: { id: string };
}) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const response = await fetch(`/api/institutions/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch institution data.");
        }
        const data = await response.json();
        if (data.success) {
          setInstitution(data.data);
        } else {
          throw new Error(data.error || "Failed to fetch institution data.");
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    if (params.id) {
      fetchInstitution();
    }
  }, [params.id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-800 rounded-lg p-4">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl text-cyan-900 font-bold">
                {institution.name}
              </h1>
              {institution.avatar && (
                <img 
                  src={institution.avatar} 
                  alt={institution.name} 
                  className="w-20 h-20 rounded-full mt-2"
                />
              )}
            </div>
            <div>
              <Badge variant={institution.status === 'ACTIVE' ? "success" : "warning"}>
                {institution.status}
              </Badge>
              <div className="mt-2 text-right">
                <span className="text-2xl font-bold text-blue-600">
                  {institution.averageRating?.toFixed(2) ?? "0.00"}
                </span>
                <span className="text-gray-500">/5.0</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {institution.rating.length > 0 && (
              <div>
                <h2 className="text-xl text-gray-500 font-bold mb-4">
                  Corruption Metrics
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {institution.rating.map((rating) => (
                    <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{rating.ratingCategory.icon}</span>
                          <span className="font-medium text-gray-500">
                            {rating.ratingCategory.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-blue-600 font-bold block">
                            {rating.score.toFixed(1)}/5.0
                          </span>
                          <span className="text-sm text-gray-500">
                            Severity: {rating.severity}/5
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${(rating.score / 5) * 100}%` }}
                        />
                      </div>
                      {rating.evidence && (
                        <p className="mt-2 text-sm text-gray-600">
                          {rating.evidence}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl text-gray-500 font-bold mb-4">
                Vote Count
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {institution.totalRatings.toLocaleString()} votes
              </p>
            </div>

            {institution.comments && institution.comments.length > 0 && (
              <div>
                <h2 className="text-xl text-gray-500 font-bold mb-4">
                  Comments
                </h2>
                <div className="space-y-4">
                  {institution.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {comment.user.avatar && (
                          <img
                            src={comment.user.avatar}
                            alt={comment.user.name}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium">{comment.user.name}</span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Link
                href={`/rate-institution?id=${institution.id}`}
                className="bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition-colors"
              >
                Rate Institution
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}