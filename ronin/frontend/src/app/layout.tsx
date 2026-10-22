import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { ThemeProvider } from '@/components/theme-provider';
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../i18n';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'RONIN - Gaming Club in Bishkek',
  description: 'Premium computer club in Bishkek, Kyrgyzstan. Play better with us!',
  keywords: 'gaming club, computer club, bishkek, ronin, cyber club',
  authors: [{ name: 'RONIN' }],
  openGraph: {
    title: 'RONIN - Gaming Club',
    description: 'Premium computer club in Bishkek, Kyrgyzstan',
    images: ['/og-image.png'],
    type: 'website',
    locale: 'ru_RU',
  },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(params.locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={params.locale} suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0F0F23] text-white min-h-screen flex flex-col`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <BottomNav />
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
