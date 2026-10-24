'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Play, Pause, XCircle } from 'lucide-react';

interface Session {
  id: number;
  bookingNumber: string;
  computerNumber: number;
  user: { firstName: string; lastName: string };
  startTime: string;
  status: 'ACTIVE' | 'PAUSED' | 'FINISHED';
  durationMinutes: number;
  balance: number;
}

export default function ManagerSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions/manager');
      setSessions(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500/10 text-green-500',
      PAUSED: 'bg-yellow-500/10 text-yellow-500',
      FINISHED: 'bg-gray-500/10 text-gray-500',
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
          <h1 className="text-3xl font-bold">Active Sessions</h1>
          <span className="text-gray-400">{sessions.length} active sessions</span>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6 hover:border-[#6B46C1] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-[#6B46C1]/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-6 h-6 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Session #{session.bookingNumber}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Computer #{session.computerNumber}</p>
                      <p>{session.user.firstName} {session.user.lastName}</p>
                      <p>Duration: {session.durationMinutes} min</p>
                      <p>Balance: {session.balance} KGS</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(session.status)}
                  <div className="flex space-x-2">
                    {session.status === 'ACTIVE' && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    )}
                    {session.status === 'PAUSED' && (
                      <Button variant="outline" size="sm" className="text-xs">
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" className="text-xs">
                      <XCircle className="w-4 h-4 mr-1" />
                      End
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
