'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-auth-kit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, CreditCard, Activity, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ManagerDashboard() {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.getAuth();

  const [stats, setStats] = useState({
    totalBookings: 0,
    activeSessions: 0,
    totalRevenue: 0,
    computersAvailable: 0,
  });

  useEffect(() => {
    if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
      router.push('/app');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <span className="text-sm text-gray-400">Welcome, {user?.firstName} {user?.lastName}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Bookings</p>
                <h3 className="text-3xl font-bold">{stats.totalBookings}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#6B46C1] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Sessions</p>
                <h3 className="text-3xl font-bold text-green-500">{stats.activeSessions}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
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
              <div className="w-12 h-12 rounded-lg bg-[#06B6D4] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
          <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Computers</p>
                <h3 className="text-3xl font-bold">{stats.computersAvailable}</h3>
              </div>
              <div className="w-12 h-12 rounded-lg bg-[#F59E0B] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/manager/bookings">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Manage Bookings</h3>
                  <p className="text-sm text-gray-400">View and manage reservations</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
          <Link href="/manager/sessions">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Active Sessions</h3>
                  <p className="text-sm text-gray-400">Monitor current sessions</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
          <Link href="/manager/computers">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Computer Status</h3>
                  <p className="text-sm text-gray-400">Manage computer availability</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
