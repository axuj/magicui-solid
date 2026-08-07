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
    registryDependencies: registryDependencies
      ? Array.from(new Set([dep('theme'), ...registryDependencies]))
      : [dep('theme')],
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

const shineBorderAnimation = {
  animation: {
    shine: 'shine var(--duration) infinite linear',
  },
  keyframes: {
    shine: {
      '0%': { 'background-position': '0% 0%' },
      '50%': { 'background-position': '100% 100%' },
      '100%': { 'background-position': '0% 0%' },
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

const meteorsAnimation = {
  animation: {
    meteor: 'meteor 5s linear infinite',
  },
  keyframes: {
    meteor: {
      '0%': {
        transform: 'rotate(var(--angle)) translateX(0)',
        opacity: '1',
      },
      '70%': { opacity: '1' },
      '100%': {
        transform: 'rotate(var(--angle)) translateX(-500px)',
        opacity: '0',
      },
    },
  },
}

const lineShadowAnimation = {
  animation: {
    'line-shadow': 'line-shadow 15s linear infinite',
  },
  keyframes: {
    'line-shadow': {
      '0%': { 'background-position': '0 0' },
      '100%': { 'background-position': '100% -100%' },
    },
  },
}

const blinkCursorAnimation = {
  animation: {
    'blink-cursor': 'blink-cursor 1.2s step-end infinite',
  },
  keyframes: {
    'blink-cursor': {
      '0%, 49%': { opacity: '1' },
      '50%, 100%': { opacity: '0' },
    },
  },
}

const shinyTextAnimation = {
  animation: {
    'shiny-text': 'shiny-text 8s infinite',
  },
  keyframes: {
    'shiny-text': {
      '0%, 90%, 100%': { 'background-position': 'calc(-100% - var(--shiny-width)) 0' },
      '30%, 60%': { 'background-position': 'calc(100% + var(--shiny-width)) 0' },
    },
  },
}

const gradientAnimation = {
  animation: {
    gradient: 'gradient 8s linear infinite',
  },
  keyframes: {
    gradient: {
      to: { 'background-position': 'var(--bg-size, 300%) 0' },
    },
  },
}

const auroraAnimation = {
  animation: {
    aurora: 'aurora 8s ease-in-out infinite alternate',
  },
  keyframes: {
    aurora: {
      '0%': {
        'background-position': '0% 50%',
        'transform': 'rotate(-5deg) scale(0.9)',
      },
      '25%': {
        'background-position': '50% 100%',
        'transform': 'rotate(5deg) scale(1.1)',
      },
      '50%': {
        'background-position': '100% 50%',
        'transform': 'rotate(-3deg) scale(0.95)',
      },
      '75%': {
        'background-position': '50% 0%',
        'transform': 'rotate(3deg) scale(1.05)',
      },
      '100%': {
        'background-position': '0% 50%',
        'transform': 'rotate(-5deg) scale(0.9)',
      },
    },
  },
}

const themeToggleViewTransitionCss = {
  '::view-transition-old(root), ::view-transition-new(root)': {
    'animation': 'none',
    'mix-blend-mode': 'normal',
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
    {
      name: 'create-in-view',
      type: 'registry:lib',
      title: 'Create In View',
      description: 'Reactive wrapper around motion\'s inView. Returns a signal that is true while the target is inside the viewport, with built-in once support.',
      dependencies: ['motion', 'solid-js'],
      files: [{ path: 'src/lib/create-in-view.ts', type: 'registry:lib' }],
    },
    theme,
    uiItem({
      name: 'terminal',
      title: 'Terminal',
      description: 'An implementation of the MacOS terminal. Useful for showcasing a command line interface.',
      dependencies: ['motion'],
      registryDependencies: [dep('create-in-view')],
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
      registryDependencies: ['https://www.solid-ui.com/r/button.json'],
    }),
    uiItem({
      name: 'animated-list',
      title: 'Animated List',
      description: 'An animated list component that reveals items one by one with a spring entrance animation.',
      dependencies: ['motion'],
      registryDependencies: [dep('flip')],
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
    uiItem({
      name: 'lens',
      title: 'Lens',
      description: 'An interactive component that enables zooming into images, videos and other elements.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'icon-cloud',
      title: 'Icon Cloud',
      description: 'An interactive 3D tag cloud component.',
      registryDependencies: ['https://www.solid-ui.com/r/button.json'],
    }),
    uiItem({
      name: 'pointer',
      title: 'Pointer',
      description: 'A custom pointer component that displays an animated cursor when hovering over an element.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'smooth-cursor',
      title: 'Smooth Cursor',
      description: 'A customizable, physics-based smooth cursor animation component.',
      dependencies: ['@solid-primitives/spring'],
    }),
    uiItem({
      name: 'dotted-map',
      title: 'Dotted Map',
      description: 'A component with a dotted map.',
      dependencies: ['svg-dotted-map'],
    }),
    uiItem({
      name: 'border-beam',
      title: 'Border Beam',
      description: 'An animated beam of light which travels along the border of its container.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'shine-border',
      title: 'Shine Border',
      description: 'Shine border is an animated background border effect.',
      tailwind: { config: { theme: { extend: shineBorderAnimation } } },
    }),
    uiItem({
      name: 'magic-card',
      title: 'Magic Card',
      description: 'A spotlight effect that follows your mouse cursor and highlights borders on hover.',
      dependencies: ['motion', '@solid-primitives/spring'],
    }),
    uiItem({
      name: 'glare-hover',
      title: 'Glare Hover',
      description: 'A diagonal glare on hover using a ::before gradient and CSS variables (angle, size, duration, color).',
    }),
    uiItem({
      name: 'meteors',
      title: 'Meteors',
      description: 'A meteor shower effect.',
      tailwind: { config: { theme: { extend: meteorsAnimation } } },
    }),
    uiItem({
      name: 'confetti',
      title: 'Confetti',
      description: 'Confetti animations are best used to delight your users when something special happens',
      dependencies: ['canvas-confetti', '@types/canvas-confetti'],
      registryDependencies: ['https://www.solid-ui.com/r/button.json'],
    }),
    uiItem({
      name: 'particles',
      title: 'Particles',
      description: 'Particles are a fun way to add some visual flair to your website. They can be used to create a sense of depth, movement, and interactivity.',
    }),
    uiItem({
      name: 'animated-theme-toggler',
      title: 'Theme Toggler',
      description: 'Theme toggle with View Transitions and animated clip-path masks (circle, polygons, star), optional viewport-centered origin.',
      dependencies: ['lucide-solid'],
      css: themeToggleViewTransitionCss,
    }),
    uiItem({
      name: 'blur-fade',
      title: 'Blur Fade',
      description: 'Blur fade in and out animation. Used to smoothly fade in and out content.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'text-animate',
      title: 'Text Animate',
      description: 'Animate text word by word with a variety of animation variants.',
      dependencies: ['motion'],
      registryDependencies: [dep('create-in-view')],
    }),
    uiItem({
      name: 'typing-animation',
      title: 'Typing Animation',
      description: 'Characters appearing in typed animation',
      dependencies: ['motion'],
      registryDependencies: [dep('create-in-view')],
      tailwind: { config: { theme: { extend: blinkCursorAnimation } } },
    }),
    uiItem({
      name: 'line-shadow-text',
      title: 'Line Shadow Text',
      description: 'A text component with a moving line shadow.',
      dependencies: ['motion'],
      tailwind: { config: { theme: { extend: lineShadowAnimation } } },
    }),
    uiItem({
      name: 'aurora-text',
      title: 'Aurora Text',
      description: 'A beautiful aurora text effect.',
      tailwind: { config: { theme: { extend: auroraAnimation } } },
    }),
    uiItem({
      name: 'video-text',
      title: 'Video Text',
      description: 'A component that displays text with a video playing in the background.',
    }),
    uiItem({
      name: 'number-ticker',
      title: 'Number Ticker',
      description: 'Animate numbers to count up or down to a target number.',
      dependencies: ['motion'],
      registryDependencies: [dep('create-in-view')],
    }),
    uiItem({
      name: 'animated-shiny-text',
      title: 'Animated Shiny Text',
      description: 'A light glare effect which pans across text making it appear as if it is shimmering.',
      tailwind: { config: { theme: { extend: shinyTextAnimation } } },
    }),
    uiItem({
      name: 'animated-gradient-text',
      title: 'Animated Gradient Text',
      description: 'An animated gradient background which transitions between colors for text.',
      tailwind: { config: { theme: { extend: gradientAnimation } } },
    }),
  ],
}

export const registry: Registry = registrySchema.parse(data)
