// app/admin/components/StatsDashboard.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Users, Building2, Star, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  overview: {
    nominees: {
      total: number;
      pending: number;
      verified: number;
    };
    institutions: {
      total: number;
      active: number;
      underInvestigation: number;
    };
    ratings: {
      total: number;
      pending: number;
      lastWeek: number;
    };
    users: {
      total: number;
      active: number;
    };
  };
  ratingTrends: Array<{
    date: string;
    nominees: number;
    institutions: number;
  }>;
}

export function StatsDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Nominees</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.nominees.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.overview.nominees.pending} pending approval
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.institutions.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.overview.institutions.active} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ratings</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.ratings.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.overview.ratings.lastWeek} this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                stats?.overview.nominees.pending +
                stats?.overview.ratings.pending
              ).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Items needing review
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.ratingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="nominees" 
                  stroke="#2563eb" 
                  name="Nominee Ratings" 
                />
                <Line 
                  type="monotone" 
                  dataKey="institutions" 
                  stroke="#7c3aed" 
                  name="Institution Ratings" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}