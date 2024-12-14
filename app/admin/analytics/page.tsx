// app/admin/analytics/page.tsx
"use client";

import { useState, useEffect } from 'react';
import {
  LineChart, BarChart, PieChart,
  Line, Bar, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  TrendingUp, Users, Building2, AlertTriangle,
  Star, MessageSquare, ChevronUp, ChevronDown,
  Calendar, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalNominees: number;
    totalInstitutions: number;
    totalRatings: number;
    activeUsers: number;
    weeklyGrowth: {
      nominees: number;
      ratings: number;
      users: number;
    };
  };
  ratingsTrend: Array<{
    date: string;
    nominees: number;
    institutions: number;
  }>;
  categoryDistribution: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  topInstitutions: Array<{
    name: string;
    rating: number;
    totalReports: number;
  }>;
  userActivity: Array<{
    date: string;
    ratings: number;
    comments: number;
    reports: number;
  }>;
  geographicalData: Array<{
    region: string;
    reports: number;
    institutions: number;
  }>;
}

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchData();
  }, [timeRange, refreshTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch analytics data"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold mt-1">
              {value.toLocaleString()}
            </h3>
            <span className={`text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ChevronUp className="inline w-4 h-4" />
              ) : (
                <ChevronDown className="inline w-4 h-4" />
              )}
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </Card>
  );

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500">Monitor system performance and trends</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border rounded-md px-3 py-2"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          <Button
            variant="outline"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Nominees"
          value={data?.overview.totalNominees || 0}
          change={data?.overview.weeklyGrowth.nominees || 0}
          icon={Users}
        />
        <StatCard
          title="Total Institutions"
          value={data?.overview.totalInstitutions || 0}
          change={5.2}
          icon={Building2}
        />
        <StatCard
          title="Total Ratings"
          value={data?.overview.totalRatings || 0}
          change={data?.overview.weeklyGrowth.ratings || 0}
          icon={Star}
        />
        <StatCard
          title="Active Users"
          value={data?.overview.activeUsers || 0}
          change={data?.overview.weeklyGrowth.users || 0}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Trends */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Rating Trends</h3>
            <p className="text-sm text-gray-500">
              Rating submissions over time
            </p>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.ratingsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone"
                  dataKey="nominees"
                  stroke="#3b82f6"
                  name="Nominee Ratings"
                />
                <Line
                  type="monotone"
                  dataKey="institutions"
                  stroke="#8b5cf6"
                  name="Institution Ratings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

{/* Category Distribution */}
<Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Category Distribution</h3>
            <p className="text-sm text-gray-500">
              Ratings by category
            </p>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryDistribution}
                  nameKey="name"
                  dataKey="percentage"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#3b82f6"
                  label
                >
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Activity */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">User Activity</h3>
            <p className="text-sm text-gray-500">
              Daily user interactions
            </p>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ratings" fill="#3b82f6" name="Ratings" />
                <Bar dataKey="comments" fill="#8b5cf6" name="Comments" />
                <Bar dataKey="reports" fill="#ef4444" name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Geographical Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Geographical Distribution</h3>
            <p className="text-sm text-gray-500">
              Reports by region
            </p>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data?.geographicalData}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="reports" fill="#3b82f6" name="Reports" />
                <Bar dataKey="institutions" fill="#8b5cf6" name="Institutions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Institutions */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Top Rated Institutions</h3>
          <p className="text-sm text-gray-500">
            Institutions with highest corruption ratings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.topInstitutions.map((institution, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{institution.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-bold">{institution.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({institution.totalReports} reports)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Summary */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Rating Summary</h3>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-500">
                  <th className="text-left font-medium pb-4">Category</th>
                  <th className="text-right font-medium pb-4">Count</th>
                  <th className="text-right font-medium pb-4">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.categoryDistribution.map((category, index) => (
                  <tr key={index}>
                    <td className="py-3">{category.name}</td>
                    <td className="text-right">{category.count}</td>
                    <td className="text-right">{category.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold">Activity Timeline</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {data?.userActivity.slice(-5).map((activity, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {activity.ratings > activity.comments ? (
                      <Star className="w-5 h-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {activity.ratings} ratings, {activity.comments} comments
                    </p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}