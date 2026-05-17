import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next.js inline scripts + React hydration
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Inline styles (React) + Font Awesome CSS from CDN
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
      // Font Awesome web fonts
      "font-src 'self' https://cdnjs.cloudflare.com",
      // Images: local + data URIs + blob (avatar previews)
      "img-src 'self' data: blob:",
      // Supabase REST + Realtime (WSS)
      "connect-src 'self' https://xmcfuwdanlciqdxqtslv.supabase.co wss://xmcfuwdanlciqdxqtslv.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
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
