import { headers } from 'next/headers'
import { PLATFORMS } from './platform'
import type { Platform, PlatformConfig } from './platform'

const PLATFORM_MAP: Record<string, Platform> = {
  'cen.com.mx':               'hub',
  'www.cen.com.mx':           'hub',
  'cenbachillerato.com.mx':   'bachillerato',
  'www.cenbachillerato.com.mx': 'bachillerato',
}

export async function getPlatform(override?: Platform): Promise<PlatformConfig> {
  if (override === 'hub' || override === 'bachillerato') {
    return PLATFORMS[override]
  }
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const hostname = host.split(':')[0] ?? ''
  const key: Platform = PLATFORM_MAP[hostname] ?? 'bachillerato'
  return PLATFORMS[key]
}
