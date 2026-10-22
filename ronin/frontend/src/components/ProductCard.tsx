'use client';

import { Computer, CheckCircle, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: number;
  number: number;
  category: {
    name: string;
    nameKy?: string;
    nameEn?: string;
  };
  specifications?: string;
  equipment?: string;
  imageUrl?: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

export function ProductCard({ id, number, category, specifications, equipment, imageUrl, status }: ProductCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_USE':
        return <Wrench className="w-4 h-4 text-red-500" />;
      case 'MAINTENANCE':
        return <Wrench className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available';
      case 'IN_USE':
        return 'In use';
      case 'MAINTENANCE':
        return 'Maintenance';
      default:
        return '';
    }
  };

  return (
    <Card className="group relative overflow-hidden rounded-2xl bg-[#2A274A]/50 border border-[#6B46C1]/20 hover:border-[#6B46C1]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#6B46C1]/10">
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={imageUrl || '/placeholder-computer.jpg'}
          alt={`Computer ${number}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div className={cn(
          'flex items-center space-x-1 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-md',
          status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
          status === 'IN_USE' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        )}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#6B46C1]/20 flex items-center justify-center">
              <Computer className="w-5 h-5 text-[#6B46C1]" />
            </div>
            <span className="font-bold text-lg">Computer #{number}</span>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded bg-[#6B46C1]/10 text-[#6B46C1]">
            {category.name}
          </span>
        </div>

        {/* Specifications */}
        {specifications && (
          <div className="mb-3 text-sm text-gray-400 line-clamp-1">
            {specifications}
          </div>
        )}

        {/* Equipment */}
        {equipment && (
          <div className="mb-4 text-xs text-gray-500 line-clamp-1">
            {equipment}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-4 border-t border-[#6B46C1]/20">
          <div>
            <span className="text-xs text-gray-500 block">Starting from</span>
            <span className="text-xl font-bold text-[#6B46C1]">{formatPrice(status === 'AVAILABLE' ? 120 : 0)}</span>
          </div>
          <Button asChild size="sm" className="bg-[#6B46C1] hover:bg-[#5B36B1]">
            <Link href={`/computers/${id}`}>
              Details
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
