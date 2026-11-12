import type { JSX } from '@solidjs/web'
import { createUniqueId } from 'solid-js'

interface BacklightProps {
  children?: JSX.Element
  class?: string
  blur?: number
}

export function Backlight(props: BacklightProps) {
  const blur = () => props.blur ?? 20
  const id = createUniqueId()

  return (
    <div class={props.class}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur()}
            result="blurred"
          />
          <feColorMatrix type="saturate" in="blurred" values="4" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </svg>

      <div style={{ filter: `url(#${id})` }}>{props.children}</div>
    </div>
  )
}
