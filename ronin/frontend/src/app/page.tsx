import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1E1B4B] to-[#0F0F23] text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="animate-fade-in-up space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] bg-clip-text text-transparent">
              RONIN
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
              Премиум компьютерный клуб в Бишкеке. Играть лучше с нами!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button className="bg-[#6B46C1] hover:bg-[#5B36B1] text-lg px-8" size="lg">
              <Link href="/ru/booking">Забронировать</Link>
            </Button>
            <Button variant="outline" className="text-lg px-8 border-[#6B46C1] hover:bg-[#6B46C1]/10" size="lg">
              <Link href="/ru/computers">Компьютеры</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#2A274A]/50 p-8 rounded-2xl border border-[#6B46C1]/20 hover:border-[#6B46C1]/50 transition-all duration-300 animate-fade-in-up">
            <div className="h-12 w-12 bg-[#6B46C1]/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6B46C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Быстрые компьютеры</h3>
            <p className="text-gray-400">Новейшие процессоры и видеокарты для максимальной производительности.</p>
          </div>
          <div className="bg-[#2A274A]/50 p-8 rounded-2xl border border-[#06B6D4]/20 hover:border-[#06B6D4]/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-12 w-12 bg-[#06B6D4]/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Комфортная обстановка</h3>
            <p className="text-gray-400">Эргономичные кресла, шумоизоляция и идеальные условия для игры.</p>
          </div>
          <div className="bg-[#2A274A]/50 p-8 rounded-2xl border border-[#F59E0B]/20 hover:border-[#F59E0B]/50 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="h-12 w-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F59E0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Гибкие тарифы</h3>
            <p className="text-gray-400">Разные тарифы на любой вкус. Оплата по минутам или почасовая.</p>
          </div>
        </div>
      </section>

      {/* Computers Count Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#6B46C1] to-[#4C35A6] rounded-3xl p-12 text-center animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4">96 компьютеров</h2>
          <p className="text-xl text-[#E0E7FF]/80 mb-8">В 4 категориях: Comfort, Standard, Premium и RONIN Rooms</p>
          <Button variant="secondary" size="lg">
            <Link href="/ru/computers">Посмотреть все</Link>
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-[#2A274A]/50 p-8 rounded-2xl border border-[#6B46C1]/20">
          <h2 className="text-3xl font-bold mb-6 text-center">Контакты</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6B46C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Бишкек, Кыргызстан</span>
            </div>
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6B46C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+996 (555) 123-45-67</span>
            </div>
            <div className="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#6B46C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@ronin.kg</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
