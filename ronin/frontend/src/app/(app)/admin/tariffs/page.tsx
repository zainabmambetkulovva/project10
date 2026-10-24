'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';

interface Tariff {
  id: number;
  name: string;
  pricePerHour: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export default function AdminTariffsPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTariffs();
  }, []);

  const fetchTariffs = async () => {
    try {
      const response = await api.get('/tariffs');
      setTariffs(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tariffs', error);
    } finally {
      setLoading(false);
    }
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Tariffs</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Tariff
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tariffs.map((tariff) => (
            <Card key={tariff.id} className="p-6 hover:border-[#6B46C1] transition-colors relative group">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{tariff.name}</h3>
                {tariff.isActive ? (
                  <span className="text-xs text-green-500">Active</span>
                ) : (
                  <span className="text-xs text-gray-500">Inactive</span>
                )}
              </div>
              <div className="text-3xl font-bold mb-2">{tariff.pricePerHour} KGS/hour</div>
              <p className="text-sm text-gray-400 mb-4">{tariff.description}</p>
              <ul className="space-y-2 mb-4">
                {tariff.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-[#6B46C1]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" className="w-full">
                Edit Tariff
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
