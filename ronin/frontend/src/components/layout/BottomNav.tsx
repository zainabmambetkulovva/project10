'use client';

import { Home, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/app', icon: Home, label: 'Home' },
    { href: '/app/booking', icon: Calendar, label: 'Booking' },
    { href: '/app/receipts', icon: FileText, label: 'Receipts' },
    { href: '/app/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E1B4B]/95 backdrop-blur-lg border-t border-[#6B46C1]/20 pb-safe pt-2">
      <div className="container mx-auto">
        <div className="flex justify-around items-center max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-4 transition-all duration-200',
                  isActive ? 'text-[#6B46C1]' : 'text-gray-400 hover:text-[#6B46C1]'
                )}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
