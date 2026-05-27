export default function Loading() {
  return (
    <div className="min-h-screen bg-[#011126] p-6 md:p-10 space-y-8">
      <div className="animate-pulse h-6 w-32 rounded bg-white/[0.07]" />
      <div className="animate-pulse h-10 w-72 rounded-xl bg-white/[0.07]" />
      <div className="animate-pulse h-4 w-56 rounded bg-white/[0.05]" />
      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse h-20 rounded-2xl bg-white/[0.05] border border-white/[0.06]" />
        ))}
      </div>
    </div>
  );
}
