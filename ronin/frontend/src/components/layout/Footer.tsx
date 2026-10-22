import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#0F0F23] border-t border-[#6B46C1]/20 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6B46C1] to-[#06B6D4] rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-xl">R</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] bg-clip-text text-transparent">RONIN</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Premium computer club in Bishkek, Kyrgyzstan. Experience the ultimate gaming atmosphere with high-end hardware and comfortable environment.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'instagram', 'telegram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com/roninclub`}
                  className="w-10 h-10 rounded-full bg-[#6B46C1]/20 flex items-center justify-center hover:bg-[#6B46C1] transition-all"
                >
                  <span className="capitalize">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/computers" className="text-gray-400 hover:text-[#6B46C1] transition-colors">Computers</Link></li>
              <li><Link href="/tariffs" className="text-gray-400 hover:text-[#6B46C1] transition-colors">Tariffs</Link></li>
              <li><Link href="/characters" className="text-gray-400 hover:text-[#6B46C1] transition-colors">Characters</Link></li>
              <li><Link href="/booking" className="text-gray-400 hover:text-[#6B46C1] transition-colors">Book Now</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <span>📍</span>
                <span>Bishkek, Kyrgyzstan</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>📞</span>
                <span>+996 (555) 123-45-67</span>
              </li>
              <li className="flex items-center space-x-2">
                <span>✉️</span>
                <span>info@ronin.kg</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#6B46C1]/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 RONIN Gaming Club. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-[#6B46C1] text-sm">Privacy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-[#6B46C1] text-sm">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
