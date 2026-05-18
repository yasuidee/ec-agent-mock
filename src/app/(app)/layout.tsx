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
  MessageCircle,
  Wallet,
  Settings,
  Bell,
  Menu,
  X,
  Search,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
  { label: 'ダッシュボード',   icon: LayoutDashboard, href: '/dashboard' },
  { label: '構築AI',           icon: Sparkles,        href: '/agents/build' },
  { label: '集客AI',           icon: Megaphone,       href: '/agents/marketing' },
  { label: '在庫AI',           icon: Package,         href: '/agents/inventory' },
  { href: '/agents/customer',  icon: MessageCircle,   label: '顧客対応AI' },
  { label: '分析AI',           icon: BarChart3,       href: '/agents/analytics' },
  { label: '入金・手数料管理', icon: Wallet,          href: '/cashflow' },
  { label: 'AIチャット',       icon: MessageSquare,   href: '/chat' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const active =
      pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
          active
            ? 'bg-blue-50 text-blue-900 font-semibold'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-900 rounded-full" />
        )}
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            active ? 'text-blue-900' : 'text-slate-400 group-hover:text-slate-600'
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
        <div className="flex items-center justify-between px-5 py-5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold tracking-tight">EC</span>
            </div>
            <span className="text-base font-semibold text-slate-900">EC Agent</span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <Separator className="mx-3 mb-2" style={{ width: 'calc(100% - 24px)' }} />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto py-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <Separator className="mx-3 mt-2" style={{ width: 'calc(100% - 24px)' }} />

        {/* Settings */}
        <div className="px-3 py-2">
          <NavLink href="/settings" icon={Settings} label="ストア設定" />
        </div>

        {/* User info */}
        <div className="px-4 py-4 flex items-center gap-3 border-t border-slate-100">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-semibold text-white bg-blue-900">Y</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">Yasu Ide</p>
            <p className="text-xs text-slate-400 truncate">Neworld Corp.</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between border-b bg-white px-4 md:px-6 gap-4 shrink-0"
          style={{ height: 64 }}
        >
          <div className="flex items-center gap-3 flex-1">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700 p-1 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search bar */}
            <div className="relative max-w-xs w-full hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="検索..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bell with red dot */}
            <button className="relative text-slate-500 hover:text-slate-700 transition-colors p-1">
              <Bell size={20} />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </button>

            <Separator orientation="vertical" className="h-6" />

            {/* User avatar */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs font-semibold text-white bg-blue-900">Y</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden md:block">やすさん</span>
            </div>
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
