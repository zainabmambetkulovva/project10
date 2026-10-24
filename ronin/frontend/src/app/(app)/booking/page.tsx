'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Computer, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [computers, setComputers] = useState([]);
  const [selectedComputer, setSelectedComputer] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTariff, setSelectedTariff] = useState(null);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Book a Computer</h1>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s ? 'bg-[#6B46C1] text-white' : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 4 && <div className="w-8 h-0.5 bg-gray-700"></div>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {computers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Computer className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Loading computers...</p>
              </div>
            ) : (
              computers.map((computer) => (
                <Card
                  key={computer.id}
                  onClick={() => setSelectedComputer(computer)}
                  className={`cursor-pointer transition-all ${
                    selectedComputer?.id === computer.id
                      ? 'border-[#6B46C1] ring-2 ring-[#6B46C1]/20 bg-[#2A274A]/50'
                      : 'hover:border-[#6B46C1]/50 bg-[#2A274A]/30'
                  }`}
                >
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Computer #{computer.number}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>{computer.category?.name}</p>
                      <p>{computer.specifications}</p>
                      <p className="text-green-500">Available</p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        <div className="mt-6">
          {selectedComputer && (
            <Button
              onClick={() => setStep(step + 1)}
              className="w-full md:w-auto"
            >
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
