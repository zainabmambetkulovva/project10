'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-auth-kit';
import { Card } from '@/components/ui/card';
import { Activity, Users, CreditCard, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.getAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingRefunds: 0,
  });

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/manager');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <span className="text-sm text-red-400">System Administrator</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Users</p>
                <h3 className="text-3xl font-bold">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#6B46C1] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Bookings</p>
                <h3 className="text-3xl font-bold">{stats.totalBookings}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#06B6D4] flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Revenue</p>
                <h3 className="text-3xl font-bold">{stats.totalRevenue} KGS</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending Refunds</p>
                <h3 className="text-3xl font-bold text-yellow-500">{stats.pendingRefunds}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-yellow-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">System Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/users">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Manage Users</h3>
              <p className="text-sm text-gray-400">Block, unblock, or delete accounts</p>
            </Card>
          </Link>
          <Link href="/admin/computers">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Manage Computers</h3>
              <p className="text-sm text-gray-400">Add, edit or archive computers</p>
            </Card>
          </Link>
          <Link href="/admin/tariffs">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Manage Tariffs</h3>
              <p className="text-sm text-gray-400">Create or modify tariff plans</p>
            </Card>
          </Link>
          <Link href="/admin/characters">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Manage Characters</h3>
              <p className="text-sm text-gray-400">Add or edit game characters</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
