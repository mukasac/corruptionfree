// app/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronRight, Building, Users, Award, AlertTriangle, Search, X } from 'lucide-react';
import { useSearch } from '@/hooks/useApi';
import { useStats } from '@/hooks/useApi';

export default function Home() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);
  const { results: searchResults, loading: isSearching } = useSearch(searchQuery);
  const { data: statsData, loading: isLoading, error } = useStats();

  const calculateAverageRating = (ratings: any[]) => {
    if (!ratings?.length) return 0;
    return (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 p-4 rounded-lg">
          Failed to load data. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading || !statsData?.stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Exposing Corruption in Kenya
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Join thousands of citizens in rating and exposing corruption through transparent, evidence-based reporting.
            </p>

            {/* Search Box */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <input
                type="text"
                placeholder="Search for officials or institutions..."
                className="block w-full pl-10 pr-10 py-4 rounded-lg bg-white text-slate-900 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length >= 2);
                }}
              />
            </div>

            {/* Search Results */}
            {showResults && searchResults && (
              <div className="absolute left-0 right-0 max-w-3xl mx-auto px-4 z-50">
                <div className="bg-white rounded-lg shadow-xl text-slate-900 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">Searching...</div>
                  ) : searchResults.nominees?.length === 0 && searchResults.institutions?.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No results found</div>
                  ) : (
                    <>
                      {searchResults.nominees?.length > 0 && (
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-700 mb-3">Officials</h3>
                          <div className="space-y-2">
                            {searchResults.nominees.map(nominee => (
                              <Link
                                key={nominee.id}
                                href={`/nominees/${nominee.id}`}
                                className="block p-3 hover:bg-gray-50 rounded border border-gray-100"
                              >
                                <div className="font-medium">{nominee.name}</div>
                                <div className="text-sm text-gray-600">
                                  {nominee.position?.name} at {nominee.institution?.name}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                      {searchResults.institutions?.length > 0 && (
                        <div className="p-4 border-t">
                          <h3 className="font-semibold text-gray-700 mb-3">Institutions</h3>
                          <div className="space-y-2">
                            {searchResults.institutions.map(institution => (
                              <Link
                                key={institution.id}
                                href={`/institutions/${institution.id}`}
                                className="block p-3 hover:bg-gray-50 rounded border border-gray-100"
                              >
                                <div className="font-medium">{institution.name}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Report Button */}
            <Link 
              href="/submit" 
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 w-fit"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Corruption
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">
                {statsData.stats.nomineeCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Corrupt Officials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">
                {statsData.stats.institutionCount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">
                {statsData.stats.totalRatings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">
                {(statsData.stats.nomineeCount + statsData.stats.institutionCount).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Entities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Report Card */}
          <Card className="hover:shadow-lg transition bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <AlertTriangle className="w-12 h-12 text-red-600" />
              <CardTitle>Report Corruption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Submit evidence-based reports about corrupt officials and institutions.
              </p>
              <Link href="/submit" className="text-slate-900 font-medium flex items-center group">
                Start Reporting
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </Link>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Award className="w-12 h-12 text-purple-600" />
              <CardTitle>Corruption Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View the most corrupt officials and institutions ranked by evidence.
              </p>
              <Link href="/leaderboard" className="text-slate-900 font-medium flex items-center group">
                View Rankings
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </Link>
            </CardContent>
          </Card>

          {/* Browse Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600" />
              <CardTitle>Browse Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore detailed corruption metrics for officials and institutions.
              </p>
              <div className="flex gap-4">
                <Link href="/nominees" className="text-slate-900 font-medium flex items-center group">
                  Officials
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/institutions" className="text-slate-900 font-medium flex items-center group">
                  Institutions
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Rated Section */}
      {statsData && (
        <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Top Nominees */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Officials</h2>
                <Link href="/leaderboard?tab=officials" className="text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {statsData.topNominees?.map((nominee) => (
                  <Link 
                    key={nominee.id}
                    href={`/nominees/${nominee.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{nominee.name}</h3>
                        <p className="text-sm text-gray-600">
                          {nominee.position?.name} at {nominee.institution?.name}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {calculateAverageRating(nominee.rating)}/5
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Institutions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Institutions</h2>
                <Link href="/leaderboard?tab=institutions" className="text-blue-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {statsData.topInstitutions?.map((institution) => (
                  <Link 
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
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}