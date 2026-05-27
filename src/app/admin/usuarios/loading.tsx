export default function Loading() {
  return (
    <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 64px" }}>
      <div className="mb-8 space-y-2">
        <div className="animate-pulse h-4 w-24 rounded bg-gray-200" />
        <div className="animate-pulse h-8 w-36 rounded-lg bg-gray-200" />
      </div>
      <div className="animate-pulse h-12 rounded-xl bg-gray-100 border border-gray-200 mb-6" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse h-14 rounded-xl bg-gray-100 border border-gray-200" />
        ))}
      </div>
    </main>
  );
}
