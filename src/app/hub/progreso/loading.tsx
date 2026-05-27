export default function Loading() {
  return (
    <div className="min-h-screen bg-[#011126] p-6 md:p-10 space-y-8">
      <div className="animate-pulse h-8 w-48 rounded-lg bg-white/[0.07]" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-28 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse h-16 rounded-xl bg-white/[0.05] border border-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
