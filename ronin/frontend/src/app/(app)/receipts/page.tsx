'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, QrCode, Download, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Receipt {
  id: number;
  receiptNumber: string;
  bookingNumber: number;
  computerNumber: number;
  category: string;
  tariff: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts/user');
      setReceipts(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch receipts', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-24 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B46C1]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">My Receipts</h1>
          <span className="text-gray-400">{receipts.length} receipts</span>
        </div>

        {receipts.length === 0 ? (
          <Card className="text-center py-16 bg-[#2A274A]/30">
            <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-4">No receipts yet</p>
            <Link href="/app/booking">
              <Button>Book a computer</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="p-6 hover:border-[#6B46C1] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-[#6B46C1]" />
                    <div>
                      <h3 className="font-semibold">#{receipt.receiptNumber}</h3>
                      <p className="text-sm text-gray-400">{receipt.tariff} - PC #{receipt.computerNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{receipt.amount} KGS</p>
                    <p className="text-sm text-gray-400">{receipt.status}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <QrCode className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-400">Scan to verify</span>
                </div>
                <div className="mt-4 flex items-center justify-end">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
