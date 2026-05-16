import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-28 rounded-md" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </div>

      {/* Brief actions */}
      <div className="border border-amber-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
        <Skeleton className="h-4 w-80" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
              <div className="bg-slate-50 rounded p-2 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="space-y-1.5 mt-1">
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-7 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Area chart */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Chart body with Y-axis ticks and line */}
        <div className="flex gap-4 h-60">
          <div className="flex flex-col justify-between pb-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-3 w-14" />
            ))}
          </div>
          <div className="flex-1 relative">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Bottom: product table + pie chart */}
      <div className="grid grid-cols-3 gap-4">
        {/* Product table (col-span-2) */}
        <div className="col-span-2 bg-white border rounded-xl p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-0">
            <div className="flex gap-4 pb-2 border-b">
              <Skeleton className="h-3 flex-grow" />
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                <Skeleton className="h-3 flex-grow" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-20" />
                <div className="flex flex-col items-end gap-1.5 w-20">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-1.5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart (col-span-1) */}
        <div className="col-span-1 bg-white border rounded-xl p-6 space-y-4">
          <Skeleton className="h-5 w-16" />
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <Skeleton className="w-40 h-40 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-2.5 h-2.5 rounded-sm" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
