import { Skeleton } from '@/components/ui/skeleton';

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Brief card */}
      <div className="border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl p-6 space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-0">
          <div className="flex gap-6 pb-2 border-b">
            <Skeleton className="h-3 flex-grow" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6 py-3 border-b last:border-0">
              <Skeleton className="h-3 flex-grow" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
