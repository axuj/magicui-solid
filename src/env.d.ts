/// <reference types="astro/client" />

declare module 'virtual:starlight/pagefind-config' {
  export const pagefindUserConfig: Partial<
    Extract<import('@astrojs/starlight/types').StarlightConfig['pagefind'], object>
  >
}

declare module 'starlight-theme-black/styles/layers'
declare module 'starlight-theme-black/styles/theme'
declare module 'starlight-theme-black/styles/base'
