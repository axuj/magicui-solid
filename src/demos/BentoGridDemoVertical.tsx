import type { Component } from 'solid-js'

import { Bell, Calendar, FileText, Globe, Search } from '@lucide/solid'
import { For } from 'solid-js'

import { BentoCard, BentoGrid } from '@/registry/magicui/bento-grid'

interface Feature {
  Icon: Component<{ class?: string }>
  name: string
  description: string
  href: string
  cta: string
  background: Component
  class: string
}

const features: Feature[] = [
  {
    Icon: FileText,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: import.meta.env.BASE_URL,
    cta: 'Learn more',
    class: 'lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3',
    background: () => <img alt="" class="absolute -top-20 -right-20 opacity-60" />,
  },
  {
    Icon: Search,
    name: 'Full text search',
    description: 'Search through all your files in one place.',
    href: import.meta.env.BASE_URL,
    cta: 'Learn more',
    class: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3',
    background: () => <img alt="" class="absolute -top-20 -right-20 opacity-60" />,
  },
  {
    Icon: Globe,
    name: 'Multilingual',
    description: 'Supports 100+ languages and counting.',
    href: import.meta.env.BASE_URL,
    cta: 'Learn more',
    class: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
    background: () => <img alt="" class="absolute -top-20 -right-20 opacity-60" />,
  },
  {
    Icon: Calendar,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    href: import.meta.env.BASE_URL,
    cta: 'Learn more',
    class: 'lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2',
    background: () => <img alt="" class="absolute -top-20 -right-20 opacity-60" />,
  },
  {
    Icon: Bell,
    name: 'Notifications',
    description: 'Get notified when someone shares a file or mentions you in a comment.',
    href: import.meta.env.BASE_URL,
    cta: 'Learn more',
    class: 'lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4',
    background: () => <img alt="" class="absolute -top-20 -right-20 opacity-60" />,
  },
]

export function BentoGridDemoVertical() {
  return (
    <BentoGrid class="lg:grid-rows-3">
      <For each={features}>
        {feature => <BentoCard {...feature} />}
      </For>
    </BentoGrid>
  )
}
