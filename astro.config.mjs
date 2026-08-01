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
          ],
        },
        {
          label: 'Special Effects',
          items: [
            { slug: 'docs/components/animated-beam' },
          ],
        },
      ],
    }),
  ],
  vite: {
    resolve: {
      alias: { '@': resolve('./src') },
      noExternal: ['lucide-solid'],
    },
    plugins: [tailwindcss(), demoTypesPlugin()],
  },
})
