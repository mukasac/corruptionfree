// app/admin/admin-layout-client.tsx
'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Building2,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayoutClient = ({ children }: AdminLayoutProps) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const navigationItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutGrid
    },
    {
      href: '/admin/nominees',
      label: 'Nominees',
      icon: Users
    },
    {
      href: '/admin/institutions',
      label: 'Institutions',
      icon: Building2
    },
    {
      href: '/admin/approvals',
      label: 'Pending Approvals',
      icon: AlertTriangle
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold text-gray-900">
              <Link href="/admin">Corruption Awards Admin</Link>
            </div>

            {/* Admin Profile */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Moderator'}
                </div>
              </div>
              <button
                onClick={async () => {
                  await logout();
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 shrink-0">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayoutClient;