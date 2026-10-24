'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface FilterBarProps {
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: string) => void;
  categories?: string[];
  onStatusFilter?: (status: string) => void;
  statuses?: string[];
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  placeholder?: string;
}

export default function FilterBar({
  onSearch,
  onCategoryFilter,
  categories = [],
  onStatusFilter,
  statuses = [],
  showSearch = true,
  showCategoryFilter = true,
  showStatusFilter = true,
  placeholder = 'Search...',
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (onCategoryFilter) {
      onCategoryFilter(category);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setSelectedStatus(status);
    if (onStatusFilter) {
      onStatusFilter(status);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedStatus('');
    if (onSearch) onSearch('');
    if (onCategoryFilter) onCategoryFilter('');
    if (onStatusFilter) onStatusFilter('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedStatus;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-[#2A274A]/30 rounded-xl border border-[#6B46C1]/10">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {showSearch && (
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 bg-[#1E1B4B]/50 border-[#6B46C1]/20"
            />
          </div>
        )}

        {showCategoryFilter && categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 rounded-lg bg-[#1E1B4B]/50 border border-[#6B46C1]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/50"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}

        {showStatusFilter && statuses.length > 0 && (
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="px-4 py-2 rounded-lg bg-[#1E1B4B]/50 border border-[#6B46C1]/20 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/50"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="self-start md:self-center"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
