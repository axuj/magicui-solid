import type { JSX, ValidComponent } from 'solid-js'
import { children, createMemo, mergeProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
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
  const merged = mergeProps(
    {
      class: '',
      autoPlay: true,
      muted: true,
      loop: true,
      preload: 'auto' as const,
      fontSize: 20,
      fontWeight: 'bold',
      textAnchor: 'middle',
      dominantBaseline: 'middle',
      fontFamily: 'sans-serif',
      as: 'div',
    },
    props,
  )
  const resolvedChildren = children(() => merged.children)
  const content = createMemo(() => {
    const resolved = resolvedChildren()
    return typeof resolved === 'string' ? resolved : ''
  })

  const svgMask = createMemo(() => {
    const responsiveFontSize = typeof merged.fontSize === 'number' ? `${merged.fontSize}vw` : merged.fontSize
    return `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' font-size='${responsiveFontSize}' font-weight='${merged.fontWeight}' text-anchor='${merged.textAnchor}' dominant-baseline='${merged.dominantBaseline}' font-family='${merged.fontFamily}'>${content()}</text></svg>`
  })
  const dataUrlMask = createMemo(() => `url("data:image/svg+xml,${encodeURIComponent(svgMask())}")`)

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
    <Dynamic component={merged.as} class={cn('relative size-full', merged.class)}>
      {/* Create a container that masks the video to only show within text */}
      <div
        class="absolute inset-0 flex items-center justify-center"
        style={maskStyle()}
      >
        <video
          class="size-full object-cover"
          autoplay={merged.autoPlay}
          muted={merged.muted}
          loop={merged.loop}
          preload={merged.preload}
          playsinline
        >
          <source src={merged.src} />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Add a backup text element for SEO/accessibility */}
      <span class="sr-only">{content()}</span>
    </Dynamic>
  )
}
