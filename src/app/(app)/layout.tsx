'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Megaphone,
  Package,
  BarChart3,
  MessageSquare,
  Wallet,
  Settings,
  Bell,
  Menu,
  X,
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
  { label: '入金・手数料管理', icon: Wallet,          href: '/cashflow' },
];

const allNavItems = [
  ...navItems,
  { label: 'ストア設定', icon: Settings, href: '/settings' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentLabel =
    allNavItems.find(({ href }) => pathname === href || pathname.startsWith(href + '/'))
      ?.label ?? '';

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
          active
            ? 'bg-blue-50 text-blue-900 font-medium'
            : 'text-slate-600 hover:bg-slate-50 hover:translate-x-1'
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-900 rounded-full" />
        )}
        <Icon
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            active ? '' : 'group-hover:scale-110'
          }`}
        />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col border-r bg-white transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 240, minWidth: 240 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0">
          <span className="text-xl font-semibold" style={{ color: '#1e3a8a' }}>
            EC Agent
          </span>
          <button
            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <Separator className="mx-3 my-2" style={{ width: 'calc(100% - 24px)' }} />

        {/* Settings */}
        <div className="px-3 pb-1">
          <NavLink href="/settings" icon={Settings} label="ストア設定" />
        </div>

        {/* Powered by AI */}
        <p className="px-6 pb-4 text-xs text-slate-400">Powered by AI</p>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between border-b bg-white px-4 md:px-6 gap-3 shrink-0"
          style={{ height: 64 }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700 p-1 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            {currentLabel && (
              <span className="text-sm font-medium text-slate-600">{currentLabel}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="text-slate-500 hover:text-slate-700 transition-colors">
              <Bell size={20} />
            </button>
            <Avatar className="h-9 w-9 bg-blue-100">
              <AvatarFallback className="text-sm font-medium text-blue-900 bg-blue-100">
                や
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-auto bg-slate-50 p-8 min-h-0">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
