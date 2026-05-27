export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#011C40] font-['Epilogue']">
      <aside className="hidden md:flex w-[260px] flex-shrink-0 flex-col gap-4 p-6 border-r border-white/[0.06]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse h-10 rounded-xl bg-white/[0.05]" />
        ))}
      </aside>
      <main className="flex-1 p-4 sm:p-8 md:p-12 space-y-8">
        <div className="animate-pulse h-8 w-48 rounded-lg bg-white/[0.07]" />
        <div className="animate-pulse h-12 rounded-xl bg-white/[0.05] border border-white/[0.06]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-40 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
          ))}
        </div>
      </main>
    </div>
  );
}
