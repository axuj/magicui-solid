import type { JSX } from '@solidjs/web'
import { scroll, transform } from 'motion'
import { createMemo, createSignal, For, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

export interface TextRevealProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: string
}

export function TextReveal(props: TextRevealProps) {
  const words = createMemo(() => {
    if (typeof props.children !== 'string') {
      throw new TypeError('TextReveal: children must be a string')
    }
    return props.children.split(' ')
  })

  let sectionRef: HTMLDivElement | undefined
  const [scrollYProgress, setScrollYProgress] = createSignal(0)

  onSettled(() => {
    if (!sectionRef)
      return
    const stop = scroll((progress: number) => setScrollYProgress(progress), { target: sectionRef })
    return (stop)
  })

  return (
    <div ref={sectionRef} class={cn('relative z-0 h-[200vh]', props.class)}>
      <div class="
        sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent
        px-4 py-20
      "
      >
        <span class="
          flex flex-wrap p-5 text-2xl font-bold text-black/20
          md:p-8 md:text-3xl
          lg:p-10 lg:text-4xl
          xl:text-5xl
          dark:text-white/20
        "
        >
          <For each={words()}>
            {(word, i) => {
              const start = () => i() / words().length
              const end = () => start() + 1 / words().length
              return <Word progress={scrollYProgress()} range={[start(), end()]}>{word}</Word>
            }}
          </For>
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: string
  progress: number
  range: [number, number]
}

function Word(props: WordProps) {
  const opacity = () => {
    const [start, end] = props.range
    return transform(props.progress, [start, end], [0, 1])
  }

  return (
    <span class="
      relative mx-1
      lg:mx-1.5
    "
    >
      <span class="absolute opacity-30">{props.children}</span>
      <span
        class="
          text-black
          dark:text-white
        "
        style={{ opacity: opacity() }}
      >
        {props.children}
      </span>
    </span>
  )
}
