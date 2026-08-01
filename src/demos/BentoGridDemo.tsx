import type { Component, JSX } from 'solid-js'
import { Bell, CalendarDays, ChevronLeft, ChevronRight, FileText, Share2 } from 'lucide-solid'
import { For } from 'solid-js'

import { AnimatedBeamMultipleOutputsDemo } from '@/demos/AnimatedBeamMultipleOutputsDemo'
import { cn } from '@/lib/utils'
import { AnimatedList, AnimatedListItem } from '@/registry/magicui/animated-list'
import { BentoCard, BentoGrid } from '@/registry/magicui/bento-grid'
import { Marquee } from '@/registry/magicui/marquee'

const files = [
  {
    name: 'bitcoin.pdf',
    body: 'Bitcoin is a cryptocurrency invented in 2008 by an unknown person or group of people using the name Satoshi Nakamoto.',
  },
  {
    name: 'finances.xlsx',
    body: 'A spreadsheet or worksheet is a file made of rows and columns that help sort data, arrange data easily, and calculate numerical data.',
  },
  {
    name: 'logo.svg',
    body: 'Scalable Vector Graphics is an Extensible Markup Language-based vector image format for two-dimensional graphics with support for interactivity and animation.',
  },
  {
    name: 'keys.gpg',
    body: 'GPG keys are used to encrypt and decrypt email, files, directories, and whole disk partitions and to authenticate messages.',
  },
  {
    name: 'seed.txt',
    body: 'A seed phrase, seed recovery phrase or backup seed phrase is a list of words which store all the information needed to recover Bitcoin funds on-chain.',
  },
]

interface NotificationItem {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

const notifications: NotificationItem[] = [
  { name: 'Payment received', description: 'Magic UI', time: '15m ago', icon: '💸', color: '#00C9A7' },
  { name: 'User signed up', description: 'Magic UI', time: '10m ago', icon: '👤', color: '#FFB800' },
  { name: 'New message', description: 'Magic UI', time: '5m ago', icon: '💬', color: '#FF3D71' },
  { name: 'New event', description: 'Magic UI', time: '2m ago', icon: '🗞️', color: '#1E86FF' },
]
const notificationItems: NotificationItem[] = []
for (let i = 0; i < 10; i++)
  notificationItems.push(...notifications)

function Notification(props: { name: string, description: string, icon: string, color: string, time: string }) {
  return (
    <figure
      class="
        relative mx-auto min-h-fit w-full max-w-100 transform-gpu cursor-pointer
        overflow-hidden rounded-2xl bg-white p-4
        [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]
        transition-all duration-200 ease-in-out
        hover:scale-[103%]
        dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]
        dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]
      "
    >
      <div class="flex flex-row items-center gap-3">
        <div
          class="flex size-10 items-center justify-center rounded-2xl"
          style={{ 'background-color': props.color }}
        >
          <span class="text-lg">{props.icon}</span>
        </div>
        <div class="flex flex-col overflow-hidden">
          <figcaption class="
            flex flex-row items-center text-lg font-medium whitespace-pre
            dark:text-white
          "
          >
            <span class="
              text-sm
              sm:text-lg
            "
            >
              {props.name}
            </span>
            <span class="mx-1">·</span>
            <span class="text-xs text-gray-500">{props.time}</span>
          </figcaption>
          <p class="
            text-sm font-normal
            dark:text-white/60
          "
          >
            {props.description}
          </p>
        </div>
      </div>
    </figure>
  )
}

function AnimatedListDemo(props: { class?: string }) {
  return (
    <div
      class={cn(
        'relative flex h-125 w-full flex-col overflow-hidden p-2',
        props.class,
      )}
    >
      <AnimatedList>
        <For each={notificationItems}>
          {item => (
            <AnimatedListItem>
              <Notification {...item} />
            </AnimatedListItem>
          )}
        </For>
      </AnimatedList>

      <div class="
        pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t
        from-background
      "
      />
    </div>
  )
}

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function CalendarMock() {
  return (
    <div class="w-70 rounded-md border bg-popover p-3">
      <div class="flex items-center justify-between px-1">
        <ChevronLeft class="size-4 text-muted-foreground/50" />
        <div class="text-sm font-medium">May 2022</div>
        <ChevronRight class="size-4 text-muted-foreground/50" />
      </div>
      <div class="
        mt-2 grid grid-cols-7 text-center text-xs text-muted-foreground
      "
      >
        <For each={weekdays}>
          {day => <div class="flex h-8 items-center justify-center font-medium">{day}</div>}
        </For>
      </div>
      <div class="grid grid-cols-7 text-center text-sm">
        <For each={Array.from({ length: 31 }, (_, i) => i + 1)}>
          {day => (
            <div
              class={cn(
                'flex size-8 items-center justify-center rounded-md',
                day === 11
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {day}
            </div>
          )}
        </For>
      </div>
    </div>
  )
}

interface Feature {
  Icon: Component<{ class?: string }>
  name: string
  description: string
  href: string
  cta: string
  background: JSX.Element
  class: string
}

const features: Feature[] = [
  {
    Icon: FileText,
    name: 'Save your files',
    description: 'We automatically save your files as you type.',
    href: '/',
    cta: 'Learn more',
    class: 'col-span-3 lg:col-span-1',
    background: (
      <Marquee
        pauseOnHover
        class="
          absolute top-10
          mask-[linear-gradient(to_top,transparent_40%,#000_100%)]
          [--duration:20s]
        "
      >
        <For each={files}>
          {f => (
            <figure
              class="
                relative w-32 transform-gpu cursor-pointer overflow-hidden
                rounded-xl border border-gray-950/10 bg-gray-950/1 p-4
                blur-[1px] transition-all duration-300 ease-out
                hover:bg-gray-950/5 hover:blur-none
                dark:border-gray-50/10 dark:bg-gray-50/10
                dark:hover:bg-gray-50/15
              "
            >
              <div class="flex flex-row items-center gap-2">
                <div class="flex flex-col">
                  <figcaption class="
                    text-sm font-medium
                    dark:text-white
                  "
                  >
                    {f.name}
                  </figcaption>
                </div>
              </div>
              <blockquote class="mt-2 text-xs">{f.body}</blockquote>
            </figure>
          )}
        </For>
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: 'Notifications',
    description: 'Get notified when something happens.',
    href: '/',
    cta: 'Learn more',
    class: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedListDemo class="
        absolute top-4 right-2 h-75 w-full scale-75 border-none
        mask-[linear-gradient(to_top,transparent_10%,#000_100%)] transition-all
        duration-300 ease-out
        group-hover:scale-90
      "
      />
    ),
  },
  {
    Icon: Share2,
    name: 'Integrations',
    description: 'Supports 100+ integrations and counting.',
    href: '/',
    cta: 'Learn more',
    class: 'col-span-3 lg:col-span-2',
    background: (
      <AnimatedBeamMultipleOutputsDemo class="
        absolute top-4 right-2 h-75 border-none
        mask-[linear-gradient(to_top,transparent_10%,#000_100%)] transition-all
        duration-300 ease-out
        group-hover:scale-105
      "
      />
    ),
  },
  {
    Icon: CalendarDays,
    name: 'Calendar',
    description: 'Use the calendar to filter your files by date.',
    href: '/',
    cta: 'Learn more',
    class: 'col-span-3 lg:col-span-1',
    background: (
      <div class="
        absolute top-10 right-0 origin-top scale-75 rounded-md
        mask-[linear-gradient(to_top,transparent_40%,#000_100%)] transition-all
        duration-300 ease-out
        group-hover:scale-90
      "
      >
        <CalendarMock />
      </div>
    ),
  },
]

export function BentoGridDemo() {
  return (
    <BentoGrid>
      <For each={features}>
        {feature => <BentoCard {...feature} />}
      </For>
    </BentoGrid>
  )
}
