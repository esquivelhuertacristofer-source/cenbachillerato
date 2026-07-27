import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + React hydration.
      // 'unsafe-eval' SOLO en dev: Turbopack/HMR lo requieren. React nunca usa eval() en producción.
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      // Inline styles (React) + Font Awesome CSS from CDN
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      // Font Awesome web fonts
      "font-src 'self' https://cdnjs.cloudflare.com",
      // Images: local + data URIs + blob (avatar previews) + miniaturas YouTube
      "img-src 'self' data: blob: https://i.ytimg.com https://img.youtube.com",
      // Supabase REST + Realtime (WSS)
      "connect-src 'self' https://xmcfuwdanlciqdxqtslv.supabase.co wss://xmcfuwdanlciqdxqtslv.supabase.co",
      // Video de actividades: los 211 mp4 generados (TTS+Remotion) se sirven
      // desde el bucket público de R2, y `VideoConPreguntasActivity` los monta
      // en un <video src> nativo (no iframe) cuando la url termina en .mp4.
      // Sin este `media-src`, CSP cae a `default-src 'self'` y el navegador
      // bloquea los 211 videos aunque el objeto exista y responda 200 en R2.
      "media-src 'self' https://pub-94a8196c0c59456a89cf72193424c9d1.r2.dev",
      // Embeds de video YouTube (modo privacy-nocookie) — pestaña Destacados de Laboratorios
      "frame-src https://www.youtube-nocookie.com https://www.youtube.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactCompiler: true,
  // El optimizador /_next/image no corre en Cloudflare Workers (OpenNext) sin un
  // loader dedicado, así que ahí las imágenes de next/image salían rotas. Nuestras
  // imágenes ya vienen pre-optimizadas a WebP ~800px, por lo que las servimos
  // directo desde /public (igual que un <img> plano, que sí cargaba).
  images: { unoptimized: true },
  experimental: {
    // Cachea el RSC payload en el cliente por 30s en navegaciones dinámicas
    // (default es 0s desde Next 15). Navegar ida/vuelta entre páginas del hub
    // dentro de esa ventana reutiliza el payload en vez de volver a invocar
    // el Worker — reduce el conteo de requests/día en el plan Free.
    staleTimes: { dynamic: 30 },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
