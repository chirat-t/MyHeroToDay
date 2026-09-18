'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// เพิ่มส่วนนี้เพื่อบอก TypeScript ว่า Navbar รับค่าอะไรได้บ้าง
interface NavbarProps {
  onMenuClick: () => void;
}

const items = [
  { href: '/backoffice/home/dashboard', label: 'Dashboard' },
];

export default function Navbar({ onMenuClick }: NavbarProps) { // รับ onMenuClick เข้ามาใช้งาน
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <header className="w-full h-14 border-b border-[#1E293B] bg-gray-900 backdrop-blur-md text-[#E6E9EF] shadow-[0_2px_8px_rgba(0,0,0,0.4)] sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-14 items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* ปุ่ม Hamburger - จะโชว์เฉพาะบนมือถือ (hidden md:hidden) */}
            <button 
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="font-semibold text-base md:text-lg tracking-tight text-[#E6E9EF] select-none">
              🤴🏻 My Hero Day 🚀🎯
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {items.map((it) => {
              const active = isActive(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-[#1E293B]/70 text-[#DDE9FF] shadow-inner'
                      : 'text-[#9AA6B2] hover:text-[#E6E9EF] hover:bg-[#1E293B]/40'}
                  `}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}