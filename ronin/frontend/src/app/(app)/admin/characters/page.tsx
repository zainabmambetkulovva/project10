'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Crown, Lock } from 'lucide-react';

interface Character {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  isFree: boolean;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await api.get('/characters');
      setCharacters(response.data || []);
    } catch (error) {
      console.error('Failed to fetch characters', error);
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
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage Characters</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Character
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {characters.map((character) => (
            <Card key={character.id} className="p-4 hover:border-[#6B46C1] transition-colors relative group">
              {character.imageUrl && (
                <div className="aspect-square w-full mb-3 rounded-lg overflow-hidden">
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h3 className="font-semibold mb-2">{character.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2 mb-3">{character.description}</p>
              <div className="flex items-center justify-between">
                {character.isFree ? (
                  <span className="text-xs text-yellow-500 flex items-center">
                    <Crown className="w-3 h-3 mr-1" />
                    Free
                  </span>
                ) : (
                  <span className="text-xs text-[#6B46C1] flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    {character.price} KGS
                  </span>
                )}
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 bg-[#6B46C1]/20 hover:bg-[#6B46C1]">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
