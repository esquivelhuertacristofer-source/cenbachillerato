export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#011C40] font-['Epilogue']">
      {/* Sidebar skeleton */}
      <aside className="hidden md:flex w-[260px] flex-shrink-0 flex-col gap-4 p-6 border-r border-white/[0.06]">
        <div className="animate-pulse h-8 w-32 rounded-lg bg-white/[0.07]" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse h-10 rounded-xl bg-white/[0.05]" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 md:ml-0 p-4 sm:p-8 md:p-12 space-y-10">
        {/* HUD bar */}
        <div className="animate-pulse h-14 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />

        {/* Welcome */}
        <div className="space-y-3">
          <div className="animate-pulse h-6 w-48 rounded-lg bg-white/[0.07]" />
          <div className="animate-pulse h-10 w-80 rounded-xl bg-white/[0.07]" />
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse h-32 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
          ))}
        </div>

        {/* Table area */}
        <div className="animate-pulse h-64 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
      </main>
    </div>
  );
}
