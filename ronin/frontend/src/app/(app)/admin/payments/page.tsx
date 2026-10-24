'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, RefreshCw } from 'lucide-react';

interface Payment {
  id: number;
  paymentId: string;
  bookingNumber: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments/admin');
      setPayments(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-500/10 text-yellow-500',
      COMPLETED: 'bg-green-500/10 text-green-500',
      FAILED: 'bg-red-500/10 text-red-500',
      REFUNDED: 'bg-blue-500/10 text-blue-500',
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
          <h1 className="text-3xl font-bold">Payment History</h1>
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Payments
          </Button>
        </div>

        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-6 hover:border-[#6B46C1] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-[#6B46C1]/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      Payment #{payment.paymentId}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Booking #{payment.bookingNumber}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="text-xl font-bold">{payment.amount} KGS</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{payment.method}</Badge>
                    {getStatusBadge(payment.status)}
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
