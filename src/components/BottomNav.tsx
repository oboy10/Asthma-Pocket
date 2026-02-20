'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/Icons';

const tabs = [
  { href: '/', label: 'Today', Icon: Icons.Sun },
  { href: '/history', label: 'History', Icon: Icons.Calendar },
  { href: '/insights', label: 'Insights', Icon: Icons.Chart },
  { href: '/settings', label: 'Settings', Icon: Icons.Options },
];

export default function BottomNav() {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden bg-white border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-xs gap-1 transition-colors ${
                active ? 'text-blue-500 font-semibold' : 'text-slate-400'
              }`}
            >
              <tab.Icon className="w-6 h-6" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
