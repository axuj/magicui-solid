import { resolve } from 'node:path'
import { env } from 'node:process'
import solid from '@astrojs/solid-js'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import starlightThemeBlack from 'starlight-theme-black'
import demoTypesPlugin from './plugins/vite-plugin-demo'

export default defineConfig({
  site: env.SITE_URL ?? 'http://localhost:4321',
  base: (env.BASE_PATH ?? '/').replace(/\/?$/, '/'),
  integrations: [
    solid(),
    starlight({
      title: 'MagicUI Solid',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/axuj/magicui-solid' },
      ],
      customCss: ['./src/styles/global.css'],
      components: {
        Head: './src/components/starlight/Head.astro',
        Search: './src/components/starlight/Search.astro',
      },
      plugins: [starlightThemeBlack({})],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { slug: 'docs', label: 'Introduction' },
            { slug: 'docs/installation' },
          ],
        },
        {
          label: 'Components',
          items: [
            { slug: 'docs/components/marquee' },
            { slug: 'docs/components/terminal' },
            { slug: 'docs/components/hero-video-dialog' },
            { slug: 'docs/components/bento-grid' },
            { slug: 'docs/components/animated-list' },
            { slug: 'docs/components/dock' },
            { slug: 'docs/components/globe' },
            { slug: 'docs/components/tweet-card' },
            { slug: 'docs/components/orbiting-circles' },
            { slug: 'docs/components/avatar-circles' },
            { slug: 'docs/components/lens' },
            { slug: 'docs/components/icon-cloud' },
            { slug: 'docs/components/pointer' },
            { slug: 'docs/components/smooth-cursor' },
            { slug: 'docs/components/dotted-map' },
          ],
        },
        {
          label: 'Special Effects',
          items: [
            { slug: 'docs/components/animated-beam' },
            { slug: 'docs/components/border-beam' },
            { slug: 'docs/components/shine-border' },
            { slug: 'docs/components/magic-card' },
            { slug: 'docs/components/glare-hover' },
            { slug: 'docs/components/meteors' },
            { slug: 'docs/components/confetti' },
            { slug: 'docs/components/particles' },
            { slug: 'docs/components/animated-theme-toggler' },
          ],
        },
        {
          label: 'Animations',
          items: [
            { slug: 'docs/components/blur-fade' },
          ],
        },
        {
          label: 'Text Animations',
          items: [
            { slug: 'docs/components/text-animate' },
            { slug: 'docs/components/typing-animation' },
            { slug: 'docs/components/line-shadow-text' },
            { slug: 'docs/components/aurora-text' },
            { slug: 'docs/components/video-text' },
            { slug: 'docs/components/number-ticker' },
            { slug: 'docs/components/animated-shiny-text' },
            { slug: 'docs/components/animated-gradient-text' },
            { slug: 'docs/components/text-reveal' },
            { slug: 'docs/components/dia-text-reveal' },
            { slug: 'docs/components/hyper-text' },
            { slug: 'docs/components/word-rotate' },
            { slug: 'docs/components/scroll-based-velocity' },
            { slug: 'docs/components/sparkles-text' },
            { slug: 'docs/components/morphing-text' },
            { slug: 'docs/components/spinning-text' },
            { slug: 'docs/components/highlighter' },
            { slug: 'docs/components/text-3d-flip' },
          ],
        },
        {
          label: 'Device Mocks',
          items: [
            { slug: 'docs/components/safari' },
            { slug: 'docs/components/iphone' },
            { slug: 'docs/components/android' },
          ],
        },
        {
          label: 'Buttons',
          items: [
            { slug: 'docs/components/rainbow-button' },
            { slug: 'docs/components/shimmer-button' },
            { slug: 'docs/components/ripple-button' },
          ],
        },

        {
          label: 'Backgrounds',
          items: [
            { slug: 'docs/components/flickering-grid' },
            { slug: 'docs/components/animated-grid-pattern' },
            { slug: 'docs/components/retro-grid' },
            { slug: 'docs/components/ripple' },
            { slug: 'docs/components/dot-pattern' },
            { slug: 'docs/components/grid-pattern' },
            { slug: 'docs/components/hexagon-pattern' },
            { slug: 'docs/components/striped-pattern' },
            { slug: 'docs/components/interactive-grid-pattern' },
            { slug: 'docs/components/light-rays' },
            { slug: 'docs/components/noise-texture' },
          ],
        },
        {
          label: 'Community',
          items: [
            { slug: 'docs/components/shiny-button' },
            { slug: 'docs/components/file-tree' },
            { slug: 'docs/components/code-comparison' },
            { slug: 'docs/components/scroll-progress' },
            { slug: 'docs/components/neon-gradient-card' },
            { slug: 'docs/components/comic-text' },
            { slug: 'docs/components/kinetic-text' },
            { slug: 'docs/components/cool-mode' },
            { slug: 'docs/components/pixel-image' },
            { slug: 'docs/components/pulsating-button' },
            { slug: 'docs/components/warp-background' },
            { slug: 'docs/components/interactive-hover-button' },
            { slug: 'docs/components/animated-circular-progress-bar' },
            { slug: 'docs/components/backlight' },
            { slug: 'docs/components/glyph-matrix' },
          ],
        },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: { '@': resolve('./src'), '~': resolve('./src') },
    },
    plugins: [tailwindcss(), demoTypesPlugin()],
  },
})
