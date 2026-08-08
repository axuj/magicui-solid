import type { JSX } from 'solid-js'
import { createUniqueId, mergeProps } from 'solid-js'

interface BacklightProps {
  children?: JSX.Element
  class?: string
  blur?: number
}

export function Backlight(props: BacklightProps) {
  const merged = mergeProps({ blur: 20 }, props)
  const id = createUniqueId()

  return (
    <div class={merged.class}>
      <svg width="0" height="0" aria-hidden="true">
        <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={merged.blur}
            result="blurred"
          />
          <feColorMatrix type="saturate" in="blurred" values="4" />
          <feComposite in="SourceGraphic" operator="over" />
        </filter>
      </svg>

      <div style={{ filter: `url(#${id})` }}>{merged.children}</div>
    </div>
  )
}
