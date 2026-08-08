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

const neonGradientCardAnimation = {
  animation: {
    'background-position-spin': 'background-position-spin 3000ms infinite alternate',
  },
  keyframes: {
    'background-position-spin': {
      '0%': { 'background-position': 'top center' },
      '100%': { 'background-position': 'bottom center' },
    },
  },
}

const warpBeamAnimation = {
  animation: {
    'warp-beam': 'warp-beam var(--beam-duration) linear infinite',
  },
  keyframes: {
    'warp-beam': {
      from: { transform: 'translateX(-50%) translateY(100cqmax)' },
      to: { transform: 'translateX(-50%) translateY(-100%)' },
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

const rainbowAnimation = {
  animation: {
    rainbow: 'rainbow var(--speed, 2s) infinite linear',
  },
  keyframes: {
    rainbow: {
      '0%': { 'background-position': '0%' },
      '100%': { 'background-position': '200%' },
    },
  },
}

const shimmerButtonAnimation = {
  animation: {
    'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
    'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
  },
  keyframes: {
    'shimmer-slide': {
      to: { transform: 'translate(calc(100cqw - 100%), 0)' },
    },
    'spin-around': {
      '0%': { transform: 'translateZ(0) rotate(0)' },
      '15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
      '65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
      '100%': { transform: 'translateZ(0) rotate(360deg)' },
    },
  },
}

const ripplingAnimation = {
  animation: {
    rippling: 'rippling var(--duration) ease-out',
  },
  keyframes: {
    rippling: {
      '0%': { opacity: '1' },
      '100%': { transform: 'scale(2)', opacity: '0' },
    },
  },
}

const pulsatingAnimation = {
  animation: {
    'pulse': 'pulse var(--duration) ease-out infinite',
    'pulse-ripple': 'pulse-ripple var(--duration) cubic-bezier(0.16, 1, 0.3, 1) infinite',
  },
  keyframes: {
    'pulse': {
      '0%, 100%': {
        'box-shadow': '0 0 0 0 var(--pulse-color, oklch(from var(--bg) l c h / 0.5))',
      },
      '50%': {
        'box-shadow': '0 0 0 var(--distance) var(--pulse-color, oklch(from var(--bg) l c h / 0.5))',
      },
    },
    'pulse-ripple': {
      '0%': {
        'box-shadow': '0 0 0 0 oklch(from var(--pulse-color, var(--bg)) l c h / 1)',
      },
      '100%': {
        'box-shadow': '0 0 0 var(--distance) oklch(from var(--pulse-color, var(--bg)) l c h / 0)',
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

const rippleAnimation = {
  animation: {
    ripple: 'ripple var(--duration, 2s) ease calc(var(--i, 0) * 0.2s) infinite',
  },
  keyframes: {
    ripple: {
      '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
      '50%': { transform: 'translate(-50%, -50%) scale(0.9)' },
    },
  },
}

const accordionAnimation = {
  animation: {
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',
  },
  keyframes: {
    'accordion-down': {
      from: { height: '0' },
      to: { height: 'var(--kb-accordion-content-height)' },
    },
    'accordion-up': {
      from: { height: 'var(--kb-accordion-content-height)' },
      to: { height: '0' },
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
      dependencies: ['lucide-solid'],
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
    uiItem({
      name: 'text-reveal',
      title: 'Text Reveal',
      description: 'Fade in text as you scroll down the page.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'dia-text-reveal',
      title: 'Dia Text Reveal',
      description: 'A horizontal color band sweeps across text with a gradient shine, then settles on your theme foreground color.',
      dependencies: ['motion'],
      registryDependencies: [dep('create-in-view')],
    }),
    uiItem({
      name: 'hyper-text',
      title: 'Hyper Text',
      description: 'A text animation that scrambles letters before revealing the final text.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'word-rotate',
      title: 'Word Rotate',
      description: 'A vertical rotation of words',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'scroll-based-velocity',
      title: 'Scroll Based Velocity',
      description: 'Scrolling text whose speed changes based on scroll speed',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'sparkles-text',
      title: 'Sparkles Text',
      description: 'A dynamic text that generates continuous sparkles with smooth transitions, perfect for highlighting text with animated stars.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'morphing-text',
      title: 'Morphing Text',
      description: 'A dynamic text morphing component for Magic UI.',
    }),
    uiItem({
      name: 'spinning-text',
      title: 'Spinning Text',
      description: 'The Spinning Text component animates text in a circular motion with customizable speed, direction, color, and transitions for dynamic and engaging effects.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'highlighter',
      title: 'Text Highlighter',
      description: 'A text highlighter that mimics the effect of a human-drawn marker stroke.',
      dependencies: ['motion', 'rough-notation'],
      registryDependencies: [dep('create-in-view')],
    }),
    uiItem({
      name: 'text-3d-flip',
      title: 'Text 3D Flip',
      description: 'A text effect that flips each letter in 3D with a staggered animation on hover.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'safari',
      title: 'Safari',
      description: 'A safari browser mockup to showcase your website.',
    }),
    uiItem({
      name: 'iphone',
      title: 'iPhone',
      description: 'A mockup of the iPhone',
    }),
    uiItem({
      name: 'android',
      title: 'Android',
      description: 'A mockup of an Android device.',
    }),
    uiItem({
      name: 'rainbow-button',
      title: 'Rainbow Button',
      description: 'An animated button with a rainbow effect.',
      dependencies: ['class-variance-authority'],
      cssVars: {
        light: {
          'color-1': 'oklch(66.2% 0.225 25.9)',
          'color-2': 'oklch(60.4% 0.26 302)',
          'color-3': 'oklch(69.6% 0.165 251)',
          'color-4': 'oklch(80.2% 0.134 225)',
          'color-5': 'oklch(90.7% 0.231 133)',
        },
        dark: {
          'color-1': 'oklch(66.2% 0.225 25.9)',
          'color-2': 'oklch(60.4% 0.26 302)',
          'color-3': 'oklch(69.6% 0.165 251)',
          'color-4': 'oklch(80.2% 0.134 225)',
          'color-5': 'oklch(90.7% 0.231 133)',
        },
      },
      tailwind: { config: { theme: { extend: rainbowAnimation } } },
    }),
    uiItem({
      name: 'shimmer-button',
      title: 'Shimmer Button',
      description: 'A button with a shimmering light which travels around the perimeter.',
      tailwind: { config: { theme: { extend: shimmerButtonAnimation } } },
    }),
    uiItem({
      name: 'ripple-button',
      title: 'Ripple Button',
      description: 'An animated button with ripple useful for user engagement.',
      tailwind: { config: { theme: { extend: ripplingAnimation } } },
    }),
    uiItem({
      name: 'flickering-grid',
      title: 'Flickering Grid',
      description: 'A flickering grid background made with SVGs, fully customizable using Tailwind CSS.',
    }),
    uiItem({
      name: 'animated-grid-pattern',
      title: 'Animated Grid Pattern',
      description: 'A animated background grid pattern made with SVGs, fully customizable using Tailwind CSS.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'retro-grid',
      title: 'Retro Grid',
      description: 'An animated scrolling retro grid effect',
    }),
    uiItem({
      name: 'ripple',
      title: 'Ripple',
      description: 'An animated ripple effect typically used behind elements to emphasize them.',
      tailwind: { config: { theme: { extend: rippleAnimation } } },
    }),
    uiItem({
      name: 'dot-pattern',
      title: 'Dot Pattern',
      description: 'A background dot pattern made with SVGs, fully customizable using Tailwind CSS.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'grid-pattern',
      title: 'Grid Pattern',
      description: 'A background grid pattern made with SVGs, fully customizable using Tailwind CSS.',
    }),
    uiItem({
      name: 'hexagon-pattern',
      title: 'Hexagon Pattern',
      description: 'A background hexagon pattern made with SVGs, fully customizable using Tailwind CSS.',
    }),
    uiItem({
      name: 'striped-pattern',
      title: 'Striped Pattern',
      description: 'A background striped pattern made with SVGs, fully customizable using Tailwind CSS.',
    }),
    uiItem({
      name: 'interactive-grid-pattern',
      title: 'Interactive Grid Pattern',
      description: 'A interactive background grid pattern made with SVGs, fully customizable using Tailwind CSS.',
    }),
    uiItem({
      name: 'light-rays',
      title: 'Light Rays',
      description: 'A component with animated light rays which shine down from above.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'noise-texture',
      title: 'Noise Texture',
      description: 'An SVG fractal noise layer using feTurbulence for subtle texture overlays.',
    }),
    uiItem({
      name: 'shiny-button',
      title: 'Shiny Button',
      description: 'A shiny button component with dynamic styles in the dark mode or light mode.',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'file-tree',
      title: 'File Tree',
      description: 'A component used to showcase the folder and file structure of a directory.',
      dependencies: ['@kobalte/core', 'lucide-solid'],
      registryDependencies: ['https://www.solid-ui.com/r/button.json'],
      tailwind: { config: { theme: { extend: accordionAnimation } } },
    }),
    uiItem({
      name: 'code-comparison',
      title: 'Code Comparison',
      description: 'A component which compares two code snippets.',
      dependencies: ['shiki', '@shikijs/transformers', 'lucide-solid'],
    }),
    uiItem({
      name: 'scroll-progress',
      title: 'Scroll Progress',
      description: 'Animated Scroll Progress for your pages',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'neon-gradient-card',
      title: 'Neon Gradient Card',
      description: 'A beautiful neon card effect.',
      tailwind: { config: { theme: { extend: neonGradientCardAnimation } } },
    }),
    uiItem({
      name: 'comic-text',
      title: 'Comic Text',
      description: 'Comic text animation',
      dependencies: ['motion'],
    }),
    uiItem({
      name: 'kinetic-text',
      title: 'Kinetic Text',
      description: 'A text component that animates font weight of characters on hover.',
    }),
    uiItem({
      name: 'cool-mode',
      title: 'Cool Mode',
      description: 'Cool mode effect for buttons, links, and other DOMs',
    }),
    uiItem({
      name: 'pixel-image',
      title: 'Pixel Image',
      description: 'A component that displays your image with a pixelated effect, enhancing the visual appeal of any image in your website.',
    }),
    uiItem({
      name: 'pulsating-button',
      title: 'Pulsating Button',
      description: 'An animated pulsating button useful for capturing attention of users.',
      tailwind: { config: { theme: { extend: pulsatingAnimation } } },
    }),
    uiItem({
      name: 'warp-background',
      title: 'Warp Background',
      description: 'A card with a time warping background effect.',
      tailwind: { config: { theme: { extend: warpBeamAnimation } } },
    }),
    uiItem({
      name: 'interactive-hover-button',
      title: 'Interactive Hover Button',
      description: 'A visually engaging button component that responds to hover with dynamic transitions, adapting smoothly between light and dark modes for enhanced user interactivity.',
      dependencies: ['lucide-solid'],
    }),
    uiItem({
      name: 'animated-circular-progress-bar',
      title: 'Animated Circular Progress Bar',
      description: 'Animated Circular Progress Bar is a component that displays a circular gauge with a percentage value.',
    }),
    uiItem({
      name: 'backlight',
      title: 'Backlight',
      description: 'A backlight glow effect for videos, images, and SVGs.',
    }),
    uiItem({
      name: 'glyph-matrix',
      title: 'Glyph Matrix',
      description: 'An animated grid of subtly shifting glyphs with fade effect and theme support.',
    }),
  ],
}

export const registry: Registry = registrySchema.parse(data)
