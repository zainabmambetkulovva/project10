'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Booking {
  id: number;
  bookingNumber: string;
  computerNumber: number;
  user: { firstName: string; lastName: string };
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
}

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/manager');
      setBookings(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      ACTIVE: 'bg-green-500/10 text-green-500',
      COMPLETED: 'bg-gray-500/10 text-gray-500',
      CANCELLED: 'bg-red-500/10 text-red-500',
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
          <h1 className="text-3xl font-bold">Manage Bookings</h1>
          <span className="text-gray-400">{bookings.length} total bookings</span>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6 hover:border-[#6B46C1] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-[#6B46C1]/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      Booking #{booking.bookingNumber}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>Computer #{booking.computerNumber}</p>
                      <p>{booking.user.firstName} {booking.user.lastName}</p>
                      <p>{new Date(booking.startTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(booking.status)}
                  <span className="text-xl font-bold">{booking.totalAmount} KGS</span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <XCircle className="w-4 h-4 mr-1" />
                      Cancel
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
