'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Computer, CheckCircle, AlertCircle } from 'lucide-react';

interface Computer {
  id: number;
  number: number;
  category: { name: string };
  specifications: string;
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'OFFLINE';
}

export default function ManagerComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    try {
      const response = await api.get('/computers');
      setComputers(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch computers', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      AVAILABLE: 'bg-green-500/10 text-green-500',
      BOOKED: 'bg-[#6B46C1]/10 text-[#6B46C1]',
      MAINTENANCE: 'bg-yellow-500/10 text-yellow-500',
      OFFLINE: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Computer Status</h1>
          <div className="text-gray-400">
            Total: {computers.length} computers
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {computers.map((computer) => (
            <Card key={computer.id} className="p-4 hover:border-[#6B46C1] transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-[#6B46C1]/10 flex items-center justify-center mb-3">
                  <Computer className="w-6 h-6 text-[#6B46C1]" />
                </div>
                <h3 className="font-semibold text-lg mb-1">PC #{computer.number}</h3>
                <p className="text-sm text-gray-400 mb-2">{computer.category.name}</p>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{computer.specifications}</p>
                {getStatusBadge(computer.status)}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
