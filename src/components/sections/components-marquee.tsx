import { For } from 'solid-js'

import { Marquee } from '@/registry/magicui/marquee'

interface MarqueeItem {
  title: string
  description: string
  href: string
}

interface ComponentsMarqueeProps {
  items: MarqueeItem[]
  class?: string
}

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-lime-500',
  'bg-fuchsia-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-500',
]

interface ComponentCardProps extends MarqueeItem {
  index: number
}

function ComponentCard(props: ComponentCardProps) {
  return (
    <a
      href={props.href}
      class="
        group flex w-72 flex-col gap-3 rounded-xl border border-border bg-card
        p-4 transition-colors duration-200
        hover:border-foreground/30 hover:bg-accent
      "
    >
      <div class="flex items-center gap-3">
        <div
          class={`
            flex size-9 shrink-0 items-center justify-center rounded-lg text-sm
            font-semibold text-white
            ${AVATAR_COLORS[props.index % AVATAR_COLORS.length]}
          `}
        >
          {props.title.charAt(0).toUpperCase()}
        </div>
        <h3 class="truncate text-sm font-semibold text-foreground">
          {props.title}
        </h3>
      </div>
      <p class="line-clamp-2 text-sm text-muted-foreground">
        {props.description}
      </p>
    </a>
  )
}

function ComponentsMarquee(props: ComponentsMarqueeProps) {
  const half = () => Math.ceil(props.items.length / 2)
  const topRow = () => props.items.slice(0, half())
  const bottomRow = () => props.items.slice(half())

  return (
    <section class={props.class}>
      <Marquee repeat={4} pauseOnHover class="mb-4 [--duration:60s]">
        <For each={topRow()}>
          {(item, i) => (
            <ComponentCard
              title={item.title}
              description={item.description}
              href={item.href}
              index={i()}
            />
          )}
        </For>
      </Marquee>
      <Marquee repeat={4} pauseOnHover reverse class="[--duration:60s]">
        <For each={bottomRow()}>
          {(item, i) => (
            <ComponentCard
              title={item.title}
              description={item.description}
              href={item.href}
              index={i() + half()}
            />
          )}
        </For>
      </Marquee>
    </section>
  )
}

export { ComponentsMarquee }
