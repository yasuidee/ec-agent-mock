'use client';

import { BarChart3, PieChart, CalendarDays } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS = [
  { value: 'sales',    label: '売上分析',   Icon: BarChart3   },
  { value: 'business', label: '経営分析',   Icon: PieChart    },
  { value: 'weekly',   label: '週次レポート', Icon: CalendarDays },
];

interface AnalyticsTabStripProps {
  value: string;
  onValueChange: (v: string) => void;
}

export function AnalyticsTabStrip({ value, onValueChange }: AnalyticsTabStripProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="bg-white border border-slate-200 rounded-xl p-1 flex gap-1 h-auto w-full">
        {TABS.map(({ value: v, label, Icon }) => (
          <TabsTrigger
            key={v}
            value={v}
            className="flex items-center gap-2 px-4 py-4 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 data-[state=active]:bg-blue-900 data-[state=active]:text-white data-[state=active]:shadow-sm hover:text-slate-700 hover:bg-slate-50 data-[state=active]:hover:bg-blue-900 data-[state=active]:hover:text-white flex-1 justify-center"
          >
            <Icon className="w-4 h-4" />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
