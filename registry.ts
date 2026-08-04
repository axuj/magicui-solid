// Registry 事实源（TS）。
// 改完跑 `nub run registry`：生成 registry.json 并重建 public/r/*.json。
// 约定：
// - theme item 只放 cssVars（颜色 + radius，key 不带 `--` 前缀）
// - 组件动画（animation + keyframes）放组件自己 item 的 tailwind.config.theme.extend，按需注入
// - 组件文件 target 用 @components/magicui/xxx.tsx，安装时落在 <components>/magicui/

import type { Registry, RegistryItem } from 'shadcn/schema'
import { registrySchema } from 'shadcn/schema'

const dep = (name: string) => `@magicui-solid/${name}`
const target = (name: string) => `@components/magicui/${name}.tsx`

// ui 组件 item 构造器：type/files/target 及 theme 依赖由 name 推导，无需重复书写。
// UiItemOpts 直接从官方 z.infer 的 RegistryItem 派生（交集吸收 union 成员，避开 Extract 对大 union 的不可靠匹配）
type UiItem = RegistryItem & { type: 'registry:ui' }
type UiItemOpts
  = & Omit<UiItem, 'type' | 'files'>
    & Required<Pick<UiItem, 'title' | 'description'>>

function uiItem(opts: UiItemOpts): RegistryItem {
  const { name, registryDependencies, ...rest } = opts
  return {
    ...rest,
    name,
    type: 'registry:ui' as const,
    registryDependencies: registryDependencies ?? [dep('theme')],
    files: [{ path: `src/registry/magicui/${name}.tsx`, type: 'registry:ui' as const, target: target(name) }],
  }
}

// token 名单点定义：键名只写一次，light/dark 值成对相邻（避免两块重复结构）
const TOKENS = {
  'background': { light: 'oklch(1 0 0)', dark: 'oklch(0.145 0 0)' },
  'foreground': { light: 'oklch(0.145 0 0)', dark: 'oklch(0.985 0 0)' },
  'card': { light: 'oklch(1 0 0)', dark: 'oklch(0.205 0 0)' },
  'card-foreground': { light: 'oklch(0.145 0 0)', dark: 'oklch(0.985 0 0)' },
  'popover': { light: 'oklch(1 0 0)', dark: 'oklch(0.205 0 0)' },
  'popover-foreground': { light: 'oklch(0.145 0 0)', dark: 'oklch(0.985 0 0)' },
  'primary': { light: 'oklch(0.205 0 0)', dark: 'oklch(0.922 0 0)' },
  'primary-foreground': { light: 'oklch(0.985 0 0)', dark: 'oklch(0.205 0 0)' },
  'secondary': { light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)' },
  'secondary-foreground': { light: 'oklch(0.205 0 0)', dark: 'oklch(0.985 0 0)' },
  'muted': { light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)' },
  'muted-foreground': { light: 'oklch(0.556 0 0)', dark: 'oklch(0.708 0 0)' },
  'accent': { light: 'oklch(0.97 0 0)', dark: 'oklch(0.269 0 0)' },
  'accent-foreground': { light: 'oklch(0.205 0 0)', dark: 'oklch(0.985 0 0)' },
  'destructive': { light: 'oklch(0.577 0.245 27.325)', dark: 'oklch(0.704 0.191 22.216)' },
  'destructive-foreground': { light: 'oklch(0.985 0 0)', dark: 'oklch(0.985 0 0)' },
  'border': { light: 'oklch(0.922 0 0)', dark: 'oklch(1 0 0 / 10%)' },
  'input': { light: 'oklch(0.922 0 0)', dark: 'oklch(1 0 0 / 15%)' },
  'ring': { light: 'oklch(0.708 0 0)', dark: 'oklch(0.556 0 0)' },
} as const

type Token = keyof typeof TOKENS
type ThemeVars = Record<Token, string>

function pick(mode: 'light' | 'dark'): ThemeVars {
  return Object.fromEntries(Object.entries(TOKENS).map(([key, value]) => [key, value[mode]])) as ThemeVars
}

const theme = {
  name: 'theme',
  type: 'registry:style',
  title: 'Theme',
  description: 'MagicUI Solid base theme. Injects all CSS variables (light/dark) and Tailwind v4 theme mappings into your app.css automatically.',
  registryDependencies: [dep('utils')],
  cssVars: {
    light: { ...pick('light'), radius: '0.625rem' },
    dark: pick('dark'),
  },
}

const marqueeAnimation = {
  animation: {
    'marquee': 'marquee var(--duration) infinite linear',
    'marquee-vertical': 'marquee-vertical var(--duration) linear infinite',
  },
  keyframes: {
    'marquee': {
      from: { transform: 'translateX(0)' },
      to: { transform: 'translateX(calc(-100% - var(--gap)))' },
    },
    'marquee-vertical': {
      from: { transform: 'translateY(0)' },
      to: { transform: 'translateY(calc(-100% - var(--gap)))' },
    },
  },
}

const orbitingCirclesAnimation = {
  animation: {
    orbit: 'orbit calc(var(--duration) * 1s) linear infinite',
  },
  keyframes: {
    orbit: {
      '0%': {
        transform: 'rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))',
      },
      '100%': {
        transform: 'rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))',
      },
    },
  },
}

const data = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'magicui-solid',
  homepage: 'https://magicui-solid.vercel.app',
  items: [
    {
      name: 'utils',
      type: 'registry:lib',
      title: 'Utils',
      description: 'Utility functions for magicui-solid.',
      dependencies: ['clsx', 'tailwind-merge'],
      files: [{ path: 'src/lib/utils.ts', type: 'registry:lib' }],
    },
    {
      name: 'flip',
      type: 'registry:lib',
      title: 'Flip',
      description: 'FLIP layout animation helper (First-Last-Invert-Play) with motion, matching framer-motion layout defaults.',
      dependencies: ['motion', 'solid-js'],
      files: [{ path: 'src/lib/flip.ts', type: 'registry:lib' }],
    },
    theme,
    uiItem({
      name: 'terminal',
      title: 'Terminal',
      description: 'An implementation of the MacOS terminal. Useful for showcasing a command line interface.',
      dependencies: ['@solid-primitives/intersection-observer'],
    }),
    uiItem({
      name: 'hero-video-dialog',
      title: 'Hero Video Dialog',
      description: 'A hero video dialog component that opens a video player with configurable animations.',
      dependencies: ['motion', 'lucide-solid'],
    }),
    uiItem({
      name: 'marquee',
      title: 'Marquee',
      description: 'An infinite scrolling component that can be used to display text, images, or videos.',
      tailwind: { config: { theme: { extend: marqueeAnimation } } },
    }),
    uiItem({
      name: 'dock',
      title: 'Dock',
      description: 'An implementation of the macOS dock using SolidJS + TailwindCSS + motion.',
      dependencies: ['motion', 'class-variance-authority'],
    }),
    uiItem({
      name: 'bento-grid',
      title: 'Bento Grid',
      description: 'A bento grid layout component that showcases content in a grid of cards with hover effects.',
      dependencies: ['lucide-solid'],
      registryDependencies: [dep('theme'), 'https://www.solid-ui.com/r/button.json'],
    }),
    uiItem({
      name: 'animated-list',
      title: 'Animated List',
      description: 'An animated list component that reveals items one by one with a spring entrance animation.',
      dependencies: ['motion'],
      registryDependencies: [dep('theme'), dep('flip')],
    }),
    uiItem({
      name: 'animated-beam',
      title: 'Animated Beam',
      description: 'An animated beam component that draws a gradient flow between two elements.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'globe',
      title: 'Globe',
      description: 'An autorotating, interactive, and highly performant globe made using WebGL.',
      dependencies: ['cobe@0.6.5'],
    }),
    uiItem({
      name: 'client-tweet-card',
      title: 'Client Tweet Card',
      description: 'A client-side tweet card that displays a tweet with the author\'s name, handle, and profile picture.',
    }),
    uiItem({
      name: 'orbiting-circles',
      title: 'Orbiting Circles',
      description: 'A collection of circles which move in orbit along a circular path.',
      tailwind: { config: { theme: { extend: orbitingCirclesAnimation } } },
    }),
    uiItem({
      name: 'avatar-circles',
      title: 'Avatar Circles',
      description: 'Overlapping circles of avatars.',
    }),
  ],
}

export const registry: Registry = registrySchema.parse(data)
