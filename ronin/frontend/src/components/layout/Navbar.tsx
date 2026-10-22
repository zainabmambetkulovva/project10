'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useAuth } from 'react-auth-kit';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const user = auth.getAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    auth.signOut(() => {
      router.push('/login');
    });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#1E1B4B]/90 backdrop-blur-md border-b border-[#6B46C1]/20' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-[#6B46C1] to-[#06B6D4] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="font-bold text-white text-xl">R</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] bg-clip-text text-transparent">RONIN</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Home</Link>
            <Link href="/computers" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Computers</Link>
            <Link href="/tariffs" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Tariffs</Link>
            <Link href="/characters" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Characters</Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && <Link href="/admin" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Admin</Link>}
                {user.role === 'MANAGER' && <Link href="/manager" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Manager</Link>}
                <Link href="/app" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">App</Link>
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-[#6B46C1] hover:bg-[#6B46C1] hover:text-white">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Login</Link>
                <Link href="/register" className="text-sm font-medium hover:text-[#6B46C1] transition-colors">Register</Link>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-[#6B46C1]/20 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[#6B46C1]/20 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#1E1B4B] border-b border-[#6B46C1]/20 p-4 space-y-4">
            <Link href="/" className="block py-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/computers" className="block py-2" onClick={() => setIsMenuOpen(false)}>Computers</Link>
            <Link href="/tariffs" className="block py-2" onClick={() => setIsMenuOpen(false)}>Tariffs</Link>
            <Link href="/characters" className="block py-2" onClick={() => setIsMenuOpen(false)}>Characters</Link>

            {user ? (
              <>
                {user.role === 'ADMIN' && <Link href="/admin" className="block py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>}
                {user.role === 'MANAGER' && <Link href="/manager" className="block py-2" onClick={() => setIsMenuOpen(false)}>Manager</Link>}
                <Link href="/app" className="block py-2" onClick={() => setIsMenuOpen(false)}>App</Link>
                <Button onClick={handleLogout} variant="outline" className="w-full border-[#6B46C1]">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block py-2" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
