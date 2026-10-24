'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { FileText, QrCode, Download } from 'lucide-react';

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

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/receipts');
      setReceipts(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch receipts', error);
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
          <h1 className="text-3xl font-bold">All Receipts</h1>
          <span className="text-gray-400">{receipts.length} receipts</span>
        </div>

        <div className="space-y-4">
          {receipts.map((receipt) => (
            <Card key={receipt.id} className="p-6 hover:border-[#6B46C1] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-[#6B46C1]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#6B46C1]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">#{receipt.receiptNumber}</h3>
                    <p className="text-sm text-gray-400">
                      {receipt.tariff} - PC #{receipt.computerNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <QrCode className="w-6 h-6 text-gray-400" />
                  <div className="text-right">
                    <p className="font-bold text-lg">{receipt.amount} KGS</p>
                    <p className="text-sm text-gray-400">{receipt.status}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
