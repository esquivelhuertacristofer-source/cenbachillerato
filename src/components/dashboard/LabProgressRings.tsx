'use client';

function ProgressRing({
  progress,
  color,
  size = 56,
  strokeWidth = 5,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-slate-200"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#0B2545]">
        {progress}%
      </span>
    </div>
  );
}

// 4 dimensiones MCCEMS — pueden recibirse como props o usar defaults
export interface AreaProgreso {
  name: string;
  description: string;
  progress: number;
  color: string;
}

const DEFAULT_AREAS: AreaProgreso[] = [
  { name: 'Saberes', description: 'Contenidos curriculares MCCEMS', progress: 0, color: '#D4A574' },
  { name: 'Metacognición', description: 'Aprender a aprender', progress: 0, color: '#1E40AF' },
  { name: 'Capacidades de la transversalidad', description: 'Competencias transversales', progress: 0, color: '#7DD3FC' },
  { name: 'Vinculación con lo personal y social', description: 'Contexto y aplicación', progress: 0, color: '#0B2545' },
];

export default function LabProgressRings({ areas = DEFAULT_AREAS }: { areas?: AreaProgreso[] }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">
        Dimensiones MCCEMS
      </h3>
      <div className="space-y-6">
        {areas.map((area) => (
          <div key={area.name} className="flex items-center gap-4 group">
            <div className="flex-1">
              <p className="text-sm font-black text-[#0B2545] group-hover:text-[#1E40AF] transition-colors leading-tight">
                {area.name}
              </p>
              <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-tight mt-0.5">
                {area.description}
              </p>
            </div>
            <ProgressRing progress={area.progress} color={area.color} />
          </div>
        ))}
      </div>
    </div>
  );
}
