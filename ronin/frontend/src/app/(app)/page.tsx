'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-auth-kit';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, User, History, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="bg-[#2A274A]/50 border-[#6B46C1]/20 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}

export default function AppDashboard() {
  const auth = useAuth();
  const router = useRouter();
  const user = auth.getAuth();

  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalSpend: 0,
    activeSessions: 0,
    ownedCharacters: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <span className="text-sm text-gray-400">
            Welcome, {user?.firstName} {user?.lastName}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Upcoming"
            value={stats.upcomingBookings}
            icon={Calendar}
            color="bg-[#6B46C1]"
          />
          <StatCard
            title="Total Spend"
            value={`${stats.totalSpend} KGS`}
            icon={History}
            color="bg-[#06B6D4]"
          />
          <StatCard
            title="Active Sessions"
            value={stats.activeSessions}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Characters"
            value={stats.ownedCharacters}
            icon={User}
            color="bg-[#F59E0B]"
          />
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link href="/app/booking">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Book Computer</h3>
                  <p className="text-sm text-gray-400">Reserve a gaming computer</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
          <Link href="/app/receipts">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">My Receipts</h3>
                  <p className="text-sm text-gray-400">View your payment history</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
          <Link href="/app/characters">
            <Card className="p-6 hover:border-[#6B46C1] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Characters</h3>
                  <p className="text-sm text-gray-400">Select your game character</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-[#2A274A]/50 rounded-xl p-6 border border-[#6B46C1]/20">
          <p className="text-gray-400 text-center py-8">No recent activity</p>
        </div>
      </div>
    </div>
  );
}
