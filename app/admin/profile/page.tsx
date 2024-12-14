// app/admin/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Lock,
  Key,
  Shield,
  Save,
  RefreshCw
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    browser: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",title: "Error",
        description: "Failed to load profile"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      updateUser(updatedProfile);

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile"
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords don't match"
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/profile/password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) throw new Error('Failed to change password');

      toast({
        title: "Success",
        description: "Password changed successfully"
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change password"
      });
    } finally {
      setSaving(false);
    }
  };

  const handle2FAToggle = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/profile/2fa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !profile?.twoFactorEnabled
        })
      });

      if (!response.ok) throw new Error('Failed to toggle 2FA');

      setProfile(prev => prev ? {
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      } : null);

      toast({
        title: "Success",
        description: `Two-factor authentication ${profile?.twoFactorEnabled ? 'disabled' : 'enabled'} successfully`
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to toggle two-factor authentication"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={profile?.name || ''}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev,
                  name: e.target.value
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={profile?.email || ''}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev,
                  email: e.target.value
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Language
              </label>
              <select
                value={profile?.preferences.language || 'en'}
                onChange={(e) => setProfile(prev => prev ? {
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    language: e.target.value
                  }
                } : null)}
                className="mt-1 block w-full rounded-md border-gray-300"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <Button
              onClick={handleProfileUpdate}
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
          <div className="space-y-6">
            {/* Password Change */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">
                Change Password
              </h3>
              <div>
                <label className="block text-sm text-gray-500">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300"
                />
              </div>
              <Button
                onClick={handlePasswordChange}
                disabled={saving}
                className="w-full"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile?.twoFactorEnabled
                      ? 'Two-factor authentication is enabled'
                      : 'Enable two-factor authentication for added security'
                    }
                  </p>
                </div>
                <Button
                  variant={profile?.twoFactorEnabled ? 'destructive' : 'outline'}
                  onClick={handle2FAToggle}
                  disabled={saving}
                >
                  {profile?.twoFactorEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Notification Preferences
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700">
                      Email Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile?.notifications.email || false}
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        email: e.target.checked
                      }
                    } : null)}
                    className="rounded border-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700">
                      Browser Notifications
                    </label>
                    <p className="text-sm text-gray-500">
                      Receive browser push notifications
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile?.notifications.browser || false}
                    onChange={(e) => setProfile(prev => prev ? {
                      ...prev,
                      notifications: {
                        ...prev.notifications,
                        browser: e.target.checked
                      }
                    } : null)}
                    className="rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}