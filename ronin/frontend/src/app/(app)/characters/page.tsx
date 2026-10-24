'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';

interface Character {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  price: number;
  isFree: boolean;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [freeCharacters, setFreeCharacters] = useState<Character[]>([]);
  const [paidCharacters, setPaidCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await api.get('/characters');
      setCharacters(response.data || []);

      const free = response.data.filter((c: Character) => c.isFree);
      const paid = response.data.filter((c: Character) => !c.isFree);

      setFreeCharacters(free);
      setPaidCharacters(paid);
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
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Game Characters</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose your avatar for the gaming experience. 8 free and 5 premium characters available.
          </p>
        </div>

        {/* Free Characters */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span>Free Characters (8)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {freeCharacters.map((character) => (
              <Card key={character.id} className="p-4 hover:border-[#6B46C1] transition-colors">
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
                <Button className="w-full bg-[#6B46C1] hover:bg-[#5B36B1]">Select</Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Paid Characters */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 flex items-center space-x-2">
            <Lock className="w-6 h-6 text-[#6B46C1]" />
            <span>Premium Characters (5)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {paidCharacters.map((character) => (
              <Card key={character.id} className="p-4 hover:border-[#6B46C1] transition-colors relative">
                <div className="absolute top-3 right-3 bg-[#6B46C1] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {character.price} KGS
                </div>
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
                <Button className="w-full bg-[#6B46C1] hover:bg-[#5B36B1]">Purchase</Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
