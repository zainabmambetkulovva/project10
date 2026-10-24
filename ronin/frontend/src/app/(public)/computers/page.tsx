'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { FilterBar } from '@/components/FilterBar';
import { Computer } from 'lucide-react';

interface Computer {
  id: number;
  number: number;
  category: {
    name: string;
  };
  specifications?: string;
  equipment?: string;
  imageUrl?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

export default function ComputersPage() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/computers', {
        params: {
          search,
          categoryId: category || undefined,
        },
      });
      setComputers(response.data.items || response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch computers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#6B46C1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading computers...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gaming Computers</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            96 high-performance computers in 4 categories. Experience the best gaming setup in Bishkek.
          </p>
        </div>

        {/* Filters */}
        <FilterBar
          onSearch={setSearch}
          onCategoryFilter={setCategory}
          categories={['Gaming', 'Workstation', 'Streaming', 'VR']}
          statuses={['AVAILABLE', 'IN_USE', 'MAINTENANCE']}
          showCategoryFilter={true}
          showStatusFilter={true}
          placeholder="Search computer by number..."
        />

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Computers Grid */}
        {computers.length === 0 ? (
          <div className="text-center py-20">
            <Computer className="w-24 h-24 mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400">No computers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {computers.map((computer) => (
              <ProductCard key={computer.id} {...computer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
