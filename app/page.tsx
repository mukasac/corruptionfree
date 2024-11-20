// app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronRight, Building, Users, Award, BarChart3, AlertTriangle, TrendingUp } from 'lucide-react';

interface Rating {
  score: number;
  ratingCategory: {
    name: string;
    weight: number;
  };
}

interface Nominee {
  id: number;
  name: string;
  position: {
    name: string;
  };
  institution: {
    name: string;
  };
  rating: Rating[];
}

interface Institution {
  id: number;
  name: string;
  rating: Rating[];
}

export default function Home() {
  const [topNominees, setTopNominees] = useState<Nominee[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const stats = [
    { label: "Corrupt Officials", value: "2,547" },
    { label: "Institutions", value: "312" },
    { label: "Total Ratings", value: "15,832" },
    { label: "Active Users", value: "8,945" }
  ];

  useEffect(() => {
    const fetchTopRated = async () => {
      try {
        const [nomineesRes, institutionsRes] = await Promise.all([
          fetch('/api/nominees?limit=5&sort=rating'),
          fetch('/api/institutions?limit=5&sort=rating')
        ]);
        
        const nominees = await nomineesRes.json();
        const institutions = await institutionsRes.json();
        
        setTopNominees(nominees.data);
        setTopInstitutions(institutions.data);
      } catch (error) {
        console.error('Error fetching top rated:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopRated();
  }, []);

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings.length) return 0;
    return (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Exposing Corruption in Kenya
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Join thousands of citizens in rating and exposing corruption through transparent, evidence-based reporting.
            </p>
            <div className="flex gap-4">
              <a href="/nominate" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                Rate Official
              </a>
              <a href="/rate-institution" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Rate Institution
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Top Nominees */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Officials</h2>
              <a href="/nominees" className="text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                topNominees.map((nominee) => (
                  <a 
                    key={nominee.id}
                    href={`/nominees/${nominee.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{nominee.name}</h3>
                        <p className="text-sm text-gray-600">
                          {nominee.position.name} at {nominee.institution.name}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {calculateAverageRating(nominee.rating)}/5
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Top Institutions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Institutions</h2>
              <a href="/institutions" className="text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                topInstitutions.map((institution) => (
                  <a 
                    key={institution.id}
                    href={`/institutions/${institution.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{institution.name}</h3>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {calculateAverageRating(institution.rating)}/5
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <AlertTriangle className="w-12 h-12 text-red-600" />
              <CardTitle>Report Corruption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Submit evidence-based reports about corrupt officials and institutions.</p>
              <a href="/nominate" className="text-slate-900 font-medium flex items-center group">
                Start Reporting
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600" />
              <CardTitle>Browse Nominees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Explore detailed corruption metrics and evidence for rated officials.</p>
              <a href="/nominees" className="text-slate-900 font-medium flex items-center group">
                View Officials
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Building className="w-12 h-12 text-green-600" />
              <CardTitle>Rate Institutions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Evaluate government institutions and track their corruption levels.</p>
              <a href="/institutions" className="text-slate-900 font-medium flex items-center group">
                View Institutions
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Award className="w-12 h-12 text-purple-600" />
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">See the most corrupt officials and institutions ranked by evidence.</p>
              <a href="/leaderboard" className="text-slate-900 font-medium flex items-center group">
                View Rankings
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <BarChart3 className="w-12 h-12 text-yellow-600" />
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Analyze corruption trends and patterns across Kenya.</p>
              <a href="/stats" className="text-slate-900 font-medium flex items-center group">
                View Stats
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-orange-600" />
              <CardTitle>Trending Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Stay updated with the latest corruption cases and ratings.</p>
              <a href="/trending" className="text-slate-900 font-medium flex items-center group">
                View Trending
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}