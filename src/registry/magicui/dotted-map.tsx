import type { JSX } from 'solid-js'
import { createMemo, For, mergeProps, Show, splitProps } from 'solid-js'
import { createMap } from 'svg-dotted-map'
import { cn } from '@/lib/utils'

export interface Marker {
  lat: number
  lng: number
  size?: number
  pulse?: boolean
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
type MapMarker<M extends Marker> = Omit<M, 'lat' | 'lng'> & {
  x: number
  y: number
}

export interface DottedMapProps<M extends Marker = Marker>
  extends JSX.SvgSVGAttributes<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  markers?: M[]
  dotColor?: string
  markerColor?: string
  dotRadius?: number
  stagger?: boolean
  pulse?: boolean

  renderMarkerOverlay?: (args: {
    marker: MapMarker<M>
    index: number
    x: number
    y: number
    r: number
  }) => JSX.Element
}

export function DottedMap<M extends Marker = Marker>(props: DottedMapProps<M>) {
  const merged = mergeProps(
    {
      width: 150,
      height: 75,
      mapSamples: 5000,
      markers: [],
      dotColor: 'currentColor',
      markerColor: '#FF6900',
      dotRadius: 0.2,
      stagger: true,
      pulse: false,
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'width',
    'height',
    'mapSamples',
    'markers',
    'dotColor',
    'markerColor',
    'dotRadius',
    'stagger',
    'pulse',
    'renderMarkerOverlay',
    'class',
    'style',
  ])

  const mapData = createMemo(() =>
    createMap({
      width: local.width,
      height: local.height,
      mapSamples: local.mapSamples,
    }),
  )
  const processedMarkers = createMemo<MapMarker<M>[]>(
    () => mapData().addMarkers(local.markers),
  )

  // Compute stagger helpers in a single, simple pass
  const stagger = createMemo(() => {
    const sorted = [...mapData().points].sort((a, b) => a.y - b.y || a.x - b.x)
    const rowMap = new Map<number, number>()
    let step = 0
    let prevY = Number.NaN
    let prevXInRow = Number.NaN

    for (const p of sorted) {
      if (p.y !== prevY) {
        // new row
        prevY = p.y
        prevXInRow = Number.NaN
        if (!rowMap.has(p.y))
          rowMap.set(p.y, rowMap.size)
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow
        if (delta > 0)
          step = step === 0 ? delta : Math.min(step, delta)
      }
      prevXInRow = p.x
    }

    return { xStep: step || 1, yToRowIndex: rowMap }
  })

  return (
    <svg
      viewBox={`0 0 ${local.width} ${local.height}`}
      class={cn(`
        text-gray-500
        dark:text-gray-500
      `, local.class)}
      style={{ width: '100%', height: '100%', ...(local.style as JSX.CSSProperties) }}
      {...rest}
    >
      <For each={mapData().points}>
        {(point) => {
          const rowIndex = stagger().yToRowIndex.get(point.y) ?? 0
          const offsetX = local.stagger && rowIndex % 2 === 1 ? stagger().xStep / 2 : 0
          return (
            <circle
              cx={point.x + offsetX}
              cy={point.y}
              r={local.dotRadius}
              fill={local.dotColor}
            />
          )
        }}
      </For>

      <For each={processedMarkers()}>
        {(marker, index) => {
          const rowIndex = stagger().yToRowIndex.get(marker.y) ?? 0
          const offsetX = local.stagger && rowIndex % 2 === 1 ? stagger().xStep / 2 : 0

          const x = marker.x + offsetX
          const y = marker.y
          const r = marker.size ?? local.dotRadius
          const shouldPulse = local.pulse
            ? marker.pulse !== false
            : marker.pulse === true
          const pulseTo = r * 2.8

          return (
            <g>
              <circle cx={x} cy={y} r={r} fill={local.markerColor} />

              <Show when={shouldPulse}>
                <g pointer-events="none">
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={local.markerColor}
                    stroke-opacity={1}
                    stroke-width={0.35}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0"
                      dur="1.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={local.markerColor}
                    stroke-opacity={0.9}
                    stroke-width={0.3}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      begin="0.7s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9;0"
                      dur="1.4s"
                      begin="0.7s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </Show>

              {local.renderMarkerOverlay?.({
                marker: { ...marker, x, y },
                index: index(),
                x,
                y,
                r,
              })}
            </g>
          )
        }}
      </For>
    </svg>
  )
}
