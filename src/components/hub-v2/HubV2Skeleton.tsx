"use client";

export default function HubV2Skeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#011126",
        padding: "60px 48px",
        display: "flex",
        flexDirection: "column",
        gap: "48px",
      }}
    >
      {/* Hero skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div
          className="animate-pulse"
          style={{ width: 100, height: 14, borderRadius: 8, background: "rgba(255,255,255,0.07)" }}
        />
        <div
          className="animate-pulse"
          style={{ width: 260, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.07)" }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{ width: 130, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.07)" }}
            />
          ))}
        </div>
      </div>

      {/* Section label */}
      <div
        className="animate-pulse"
        style={{ width: 200, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.07)" }}
      />

      {/* Card grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              minHeight: 350,
              borderRadius: "2.5rem",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
