export type Platform = 'hub' | 'bachillerato'

export interface PlatformConfig {
  key:     Platform
  label:   string
  dominio: string
}

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  hub: {
    key:     'hub',
    label:   'CEN — Nueva Escuela Mexicana',
    dominio: 'cen.com.mx',
  },
  bachillerato: {
    key:     'bachillerato',
    label:   'CEN Bachillerato',
    dominio: 'cenbachillerato.com.mx',
  },
}
