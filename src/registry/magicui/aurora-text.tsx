import type { JSX } from 'solid-js'
import { mergeProps } from 'solid-js'

interface AuroraTextProps {
  children: JSX.Element
  class?: string
  colors?: string[]
  speed?: number
}

export function AuroraText(props: AuroraTextProps) {
  const merged = mergeProps(
    { class: '', colors: ['#FF0080', '#7928CA', '#0070F3', '#38bdf8'], speed: 1 },
    props,
  )
  const gradientStyle = (): JSX.CSSProperties => ({
    'background-image': `linear-gradient(135deg, ${merged.colors.join(', ')}, ${merged.colors[0]})`,
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    'animation-duration': `${10 / merged.speed}s`,
  })

  return (
    <span class={`
      relative inline-block
      ${merged.class}
    `}
    >
      <span class="sr-only">{merged.children}</span>
      <span
        class="
          relative animate-aurora bg-size-[200%_auto] bg-clip-text
          text-transparent
        "
        style={gradientStyle()}
        aria-hidden="true"
      >
        {merged.children}
      </span>
    </span>
  )
}
