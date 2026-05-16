export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Loading indicator */}
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <span className="w-3.5 h-3.5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        データを取得中...
      </div>

      {/* Page header */}
      <div className="space-y-2 animate-pulse">
        <div className="h-7 w-28 bg-slate-200 rounded-md" />
        <div className="h-4 w-64 bg-slate-200 rounded-md" />
      </div>

      {/* Brief card */}
      <div className="bg-white border border-amber-100 rounded-xl p-5 space-y-3 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-20 bg-slate-100 rounded-lg" />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-4 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-14 bg-slate-200 rounded" />
              <div className="w-4 h-4 bg-slate-200 rounded" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded" />
            <div className="h-3 w-10 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="bg-white border rounded-xl p-6 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-3 w-16 bg-slate-200 rounded" />
        </div>
        <div className="h-48 bg-slate-100 rounded-lg" />
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl p-6 space-y-3 animate-pulse">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-8 bg-slate-100 rounded border-b" />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-slate-50 rounded border-b flex items-center gap-4 px-2">
            <div className="h-3 flex-1 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
