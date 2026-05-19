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
  Bot,
  MessageCircle,
  Wallet,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const navItems = [
  { label: 'ダッシュボード', icon: LayoutDashboard, href: '/dashboard' },
  { label: '構築AI',         icon: Sparkles,        href: '/agents/build' },
  { label: '集客AI',         icon: Megaphone,       href: '/agents/marketing' },
  { label: '在庫AI',         icon: Package,         href: '/agents/inventory' },
  { label: '顧客対応AI',     icon: MessageCircle,   href: '/agents/customer' },
  { label: '分析AI',         icon: BarChart3,       href: '/agents/analytics' },
  { label: '入金・手数料',   icon: Wallet,          href: '/cashflow' },
  { label: 'AIチャット',     icon: Bot,             href: '/chat' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isChat = pathname === '/chat';

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
        className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 ${
          active
            ? 'bg-blue-900 text-white font-semibold'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon
          size={16}
          className={`shrink-0 ${active ? 'text-white' : 'text-slate-400'}`}
        />
        <span className="truncate min-w-0">{label}</span>
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

      {/* ─── Sidebar ─── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 flex flex-col bg-slate-900 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 240, minWidth: 240 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="raxel"
              className="h-12 w-auto object-contain"
            />
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 pt-2 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-2 pt-1">
          <NavLink href="/settings" icon={Settings} label="ストア設定" />
        </div>

        {/* User card */}
        <div className="mx-3 mb-4 mt-1">
          <div className="bg-slate-800 rounded-xl px-3 py-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">Y</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">Yasu Ide</p>
              <p className="text-[11px] text-slate-400 truncate">Neworld Corp.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {isChat ? (
          /* Chat page: full height, no header, no padding */
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {children}
          </div>
        ) : (
          <>
            {/* Regular header */}
            <header
              className="flex items-center border-b bg-white px-4 md:px-6 shrink-0"
              style={{ height: 64 }}
            >
              <button
                className="md:hidden text-slate-500 hover:text-slate-700 p-1 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
            </header>
            {/* Regular page body */}
            <main className="flex-1 overflow-auto bg-slate-50 p-8 min-h-0">
              {children}
            </main>
          </>
        )}
      </div>

      <Toaster />
    </div>
  );
}
