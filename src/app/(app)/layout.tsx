'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Megaphone,
  Package,
  BarChart3,
  MessageSquare,
  Settings,
  Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
  { label: 'ダッシュボード', icon: LayoutDashboard, href: '/dashboard' },
  { label: '構築AI',        icon: Sparkles,         href: '/agents/build' },
  { label: '集客AI',        icon: Megaphone,        href: '/agents/marketing' },
  { label: '在庫AI',        icon: Package,          href: '/agents/inventory' },
  { label: '分析AI',        icon: BarChart3,        href: '/agents/analytics' },
  { label: 'AIチャット',    icon: MessageSquare,    href: '/chat' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className="flex flex-col border-r bg-white"
        style={{ width: 240, minWidth: 240 }}
      >
        {/* Logo */}
        <div className="flex items-center px-6 py-5">
          <span
            className="text-xl"
            style={{ color: '#1e3a8a', fontWeight: 600 }}
          >
            EC Agent
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-900 rounded-full" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <Separator className="mx-3 my-2" style={{ width: 'calc(100% - 24px)' }} />

        {/* Settings */}
        <div className="px-3 pb-1">
          <Link
            href="/settings"
            className={`relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === '/settings'
                ? 'bg-blue-50 text-blue-900 font-medium'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {pathname === '/settings' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-900 rounded-full" />
            )}
            <Settings className="w-4 h-4 shrink-0" />
            ストア設定
          </Link>
        </div>

        {/* Powered by AI */}
        <p className="px-6 pb-4 text-xs text-slate-400">Powered by AI</p>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center justify-end border-b bg-white px-6 gap-3 shrink-0"
          style={{ height: 64 }}
        >
          <button className="text-slate-500 hover:text-slate-700">
            <Bell size={20} />
          </button>

          <Avatar className="h-9 w-9 bg-blue-100">
            <AvatarFallback className="text-sm font-medium text-blue-900 bg-blue-100">
              や
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-auto bg-slate-50 p-8 min-h-screen">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
