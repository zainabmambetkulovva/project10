import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatPrice(amount: number): string {
  return `${amount} KGS`;
}

export function generateRandomColor() {
  const colors = [
    'from-[#6B46C1] to-[#4C35A6]',
    'from-[#06B6D4] to-[#0891B2]',
    'from-[#F59E0B] to-[#D97706]',
    'from-[#10B981] to-[#059669]',
    'from-[#EF4444] to-[#DC2626]',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
