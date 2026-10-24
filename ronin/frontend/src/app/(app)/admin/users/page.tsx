'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Lock, Unlock, Trash2, Search } from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'USER' | 'MANAGER' | 'ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500/10 text-green-500',
      BLOCKED: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      USER: 'bg-gray-500/10 text-gray-500',
      MANAGER: 'bg-[#6B46C1]/10 text-[#6B46C1]',
      ADMIN: 'bg-red-500/10 text-red-500',
    };
    return <Badge className={colors[role as keyof typeof colors]}>{role}</Badge>;
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
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#2A274A] border border-[#6B46C1]/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6 hover:border-[#6B46C1] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#6B46C1]/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.phone}</p>
                    <p className="text-xs text-gray-500 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      {user.status === 'ACTIVE' ? (
                        <Lock className="w-4 h-4 mr-1" />
                      ) : (
                        <Unlock className="w-4 h-4 mr-1" />
                      )}
                      {user.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                    </Button>
                    <Button variant="destructive" size="sm" className="text-xs">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
