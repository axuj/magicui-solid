import type { JSX } from '@solidjs/web'

import type { Component } from 'solid-js'

import { ArrowRight } from '@lucide/solid'
import { Dynamic } from '@solidjs/web'

import { omit } from 'solid-js'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BentoGridProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  class?: string
}

interface BentoCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  name: string
  class: string
  background: Component
  Icon: Component<{ class?: string }>
  description: string
  href: string
  cta: string
}

export function BentoGrid(props: BentoGridProps) {
  const rest = omit(props, 'children', 'class')
  return (
    <div
      class={cn(
        'grid w-full auto-rows-88 grid-cols-3 gap-4',
        props.class,
      )}
      {...rest}
    >
      {props.children}
    </div>
  )
}

export function BentoCard(props: BentoCardProps) {
  const rest = omit(props, 'name', 'class', 'background', 'Icon', 'description', 'href', 'cta')
  return (
    <div
      class={cn(`
        group relative col-span-3 flex transform-gpu flex-col justify-between
        overflow-hidden rounded-xl bg-background
        [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]
        dark:bg-background dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]
        dark:[border:1px_solid_rgba(255,255,255,.1)]
      `, props.class)}
      {...rest}
    >
      <div><Dynamic component={props.background} /></div>
      <div class="p-4">
        <div class="
          pointer-events-none z-10 flex transform-gpu flex-col gap-1
          transition-all duration-300
          lg:group-hover:-translate-y-10
        "
        >
          <Dynamic
            component={props.Icon}
            class="
              size-12 origin-left transform-gpu text-neutral-700 transition-all
              duration-300 ease-in-out
              group-hover:scale-75
            "
          />
          <h3 class="
            text-xl font-semibold text-neutral-700
            dark:text-neutral-300
          "
          >
            {props.name}
          </h3>
          <p class="max-w-lg text-neutral-400">{props.description}</p>
        </div>

        <div
          class="
            pointer-events-none flex w-full translate-y-0 transform-gpu flex-row
            items-center transition-all duration-300
            group-hover:translate-y-0 group-hover:opacity-100
            lg:hidden
          "
        >
          <Button
            as="a"
            href={props.href}
            variant="link"
            size="sm"
            class="pointer-events-auto p-0"
          >
            {props.cta}
            <ArrowRight class="
              ms-2 size-4
              rtl:rotate-180
            "
            />
          </Button>
        </div>
      </div>

      <div
        class="
          pointer-events-none absolute bottom-0 hidden w-full translate-y-10
          transform-gpu flex-row items-center p-4 opacity-0 transition-all
          duration-300
          group-hover:translate-y-0 group-hover:opacity-100
          lg:flex
        "
      >
        <Button
          as="a"
          href={props.href}
          variant="link"
          size="sm"
          class="pointer-events-auto p-0"
        >
          {props.cta}
          <ArrowRight class="
            ms-2 size-4
            rtl:rotate-180
          "
          />
        </Button>
      </div>

      <div class="
        pointer-events-none absolute inset-0 transform-gpu transition-all
        duration-300
        group-hover:bg-black/3
        group-hover:dark:bg-neutral-800/10
      "
      />
    </div>
  )
}
