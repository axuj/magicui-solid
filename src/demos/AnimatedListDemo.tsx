import { For } from 'solid-js'

import { cn } from '@/lib/utils'
import { AnimatedList, AnimatedListItem } from '@/registry/magicui/animated-list'

interface Item {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

const notifications: Item[] = [
  { name: 'Payment received', description: 'Magic UI', time: '15m ago', icon: '💸', color: '#00C9A7' },
  { name: 'User signed up', description: 'Magic UI', time: '10m ago', icon: '👤', color: '#FFB800' },
  { name: 'New message', description: 'Magic UI', time: '5m ago', icon: '💬', color: '#FF3D71' },
  { name: 'New event', description: 'Magic UI', time: '2m ago', icon: '🗞️', color: '#1E86FF' },
]

const notificationItems: Item[] = []
for (let i = 0; i < 10; i++)
  notificationItems.push(...notifications)

function Notification(props: Item) {
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

export function AnimatedListDemo(props: { class?: string }) {
  return (
    <div
      class={cn(`relative flex h-125 w-full flex-col overflow-hidden p-2`, props.class)}
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
