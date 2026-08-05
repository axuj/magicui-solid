import { createSignal, onCleanup, onMount } from 'solid-js'

import { Particles } from '@/registry/magicui/particles'

export function ParticlesDemo() {
  const [color, setColor] = createSignal('#ffffff')

  onMount(() => {
    const root = document.documentElement
    const update = () => {
      setColor(root.dataset.theme === 'dark' ? '#ffffff' : '#000000')
    }
    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    onCleanup(() => observer.disconnect())
  })

  return (
    <div class="
      relative flex h-125 w-full flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <span class="
        pointer-events-none z-10 text-center text-8xl leading-none font-semibold
        whitespace-pre-wrap
      "
      >
        Particles
      </span>
      <Particles
        class="absolute inset-0 z-0"
        quantity={100}
        ease={80}
        color={color()}
        refresh
      />
    </div>
  )
}
