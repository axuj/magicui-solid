import { resolve } from 'node:path'
import solid from '@astrojs/solid-js'
import starlight from '@astrojs/starlight'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import starlightThemeBlack from 'starlight-theme-black'
import demoTypesPlugin from './plugins/vite-plugin-demo'

export default defineConfig({
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
