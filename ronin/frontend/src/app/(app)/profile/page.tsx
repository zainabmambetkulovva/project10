'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Phone, Key, LogOut } from 'lucide-react';
import { useAuth } from 'react-auth-kit';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.getAuth();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    locale: 'ru',
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        locale: user.locale || 'ru',
      });
    }
    setIsLoading(false);
  }, [user]);

  const handleLogout = () => {
    auth.signOut(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen pt-24">Loading...</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <Card className="p-6 mb-6 bg-[#2A274A]/50 border-[#6B46C1]/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <User className="w-5 h-5 text-[#6B46C1]" />
              <span>Personal Information</span>
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">First Name</label>
                <Input value={profile.firstName} readOnly className="bg-[#1E1B4B]/50" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Last Name</label>
                <Input value={profile.lastName} readOnly className="bg-[#1E1B4B]/50" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <Input value={profile.email} readOnly className="bg-[#1E1B4B]/50" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Phone</label>
              <Input value={profile.phone} readOnly className="bg-[#1E1B4B]/50" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#2A274A]/50 border-[#6B46C1]/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#6B46C1]" />
              <span>Account Actions</span>
            </h2>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
