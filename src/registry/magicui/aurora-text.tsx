import type { JSX } from '@solidjs/web'

interface AuroraTextProps {
  children: JSX.Element
  class?: string
  colors?: string[]
  speed?: number
}

export function AuroraText(props: AuroraTextProps) {
  const colors = () => props.colors ?? ['#FF0080', '#7928CA', '#0070F3', '#38bdf8']
  const speed = () => props.speed ?? 1
  const gradientStyle = (): JSX.CSSProperties => ({
    'background-image': `linear-gradient(135deg, ${colors().join(', ')}, ${colors()[0]})`,
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    'animation-duration': `${10 / speed()}s`,
  })

  return (
    <span class={['relative inline-block', props.class]}>
      <span class="sr-only">{props.children}</span>
      <span
        class="
          relative animate-aurora bg-size-[200%_auto] bg-clip-text
          text-transparent
        "
        style={gradientStyle()}
        aria-hidden="true"
      >
        {props.children}
      </span>
    </span>
  )
}
