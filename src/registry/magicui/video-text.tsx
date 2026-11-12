import type { JSX, ValidComponent } from '@solidjs/web'
import { Dynamic } from '@solidjs/web'

import { children, createMemo } from 'solid-js'

import { cn } from '@/lib/utils'

export interface VideoTextProps {
  /**
   * The video source URL
   */
  src: string
  /**
   * Additional className for the container
   */
  class?: string
  /**
   * Whether to autoplay the video
   */
  autoPlay?: boolean
  /**
   * Whether to mute the video
   */
  muted?: boolean
  /**
   * Whether to loop the video
   */
  loop?: boolean
  /**
   * Whether to preload the video
   */
  preload?: 'auto' | 'metadata' | 'none'
  /**
   * The content to display (will have the video "inside" it)
   */
  children: JSX.Element
  /**
   * Font size for the text mask (in viewport width units)
   * @default 20
   */
  fontSize?: string | number
  /**
   * Font weight for the text mask
   * @default "bold"
   */
  fontWeight?: string | number
  /**
   * Text anchor for the text mask
   * @default "middle"
   */
  textAnchor?: string
  /**
   * Dominant baseline for the text mask
   * @default "middle"
   */
  dominantBaseline?: string
  /**
   * Font family for the text mask
   * @default "sans-serif"
   */
  fontFamily?: string
  /**
   * The element type to render for the text
   * @default "div"
   */
  as?: ValidComponent
}

export function VideoText(props: VideoTextProps) {
  const as = () => props.as ?? 'div'
  const autoPlay = () => props.autoPlay ?? true
  const dominantBaseline = () => props.dominantBaseline ?? 'middle'
  const fontFamily = () => props.fontFamily ?? 'sans-serif'
  const fontSize = () => props.fontSize ?? 20
  const fontWeight = () => props.fontWeight ?? 'bold'
  const textAnchor = () => props.textAnchor ?? 'middle'
  const resolvedChildren = children(() => props.children)
  const content = createMemo(() => {
    const resolved = resolvedChildren()
    return typeof resolved === 'string' ? resolved : ''
  })

  const dataUrlMask = createMemo(() => {
    const responsiveFontSize = typeof fontSize() === 'number' ? `${fontSize()}vw` : fontSize()
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' font-size='${responsiveFontSize}' font-weight='${fontWeight()}' text-anchor='${textAnchor()}' dominant-baseline='${dominantBaseline()}' font-family='${fontFamily()}'>${content()}</text></svg>`
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  })

  const maskStyle = (): JSX.CSSProperties => ({
    'mask-image': dataUrlMask(),
    '-webkit-mask-image': dataUrlMask(),
    'mask-size': 'contain',
    '-webkit-mask-size': 'contain',
    'mask-repeat': 'no-repeat',
    '-webkit-mask-repeat': 'no-repeat',
    'mask-position': 'center',
    '-webkit-mask-position': 'center',
  })

  return (
    <Dynamic component={as()} class={cn('relative size-full', (props.class ?? ''))}>
      {/* Create a container that masks the video to only show within text */}
      <div
        class="absolute inset-0 flex items-center justify-center"
        style={maskStyle()}
      >
        <video
          class="size-full object-cover"
          autoplay={autoPlay()}
          muted={(props.muted ?? true)}
          loop={(props.loop ?? true)}
          preload={(props.preload ?? 'auto' as const)}
          playsinline
        >
          <source src={props.src} />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Add a backup text element for SEO/accessibility */}
      <span class="sr-only">{content()}</span>
    </Dynamic>
  )
}
