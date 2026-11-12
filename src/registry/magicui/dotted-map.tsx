import type { JSX } from '@solidjs/web'
import { createMemo, For, omit, Show } from 'solid-js'

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
  const rest = omit(props, 'width', 'height', 'mapSamples', 'markers', 'dotColor', 'markerColor', 'dotRadius', 'stagger', 'pulse', 'renderMarkerOverlay', 'class', 'style')
  const dotColor = () => props.dotColor ?? 'currentColor'
  const dotRadius = () => props.dotRadius ?? 0.2
  const markerColor = () => props.markerColor ?? '#FF6900'
  const markers = () => props.markers ?? []

  const mapData = createMemo(() =>
    createMap({
      width: (props.width ?? 150),
      height: (props.height ?? 75),
      mapSamples: (props.mapSamples ?? 5000),
    }),
  )
  const processedMarkers = createMemo<MapMarker<M>[]>(
    () => mapData().addMarkers(markers()),
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

  // Derive the offsets in a memo. A <For> callback is an owner, not a
  // tracking scope, so reading stagger() there freezes the first value.
  const staggeredPoints = createMemo(() => {
    const { xStep, yToRowIndex } = stagger()
    const enabled = props.stagger ?? true
    return mapData().points.map((point) => {
      const rowIndex = yToRowIndex.get(point.y) ?? 0
      const offsetX = enabled && rowIndex % 2 === 1 ? xStep / 2 : 0
      return { point, offsetX }
    })
  })

  const staggeredMarkers = createMemo(() => {
    const { xStep, yToRowIndex } = stagger()
    const enabled = props.stagger ?? true
    return processedMarkers().map((marker, index) => {
      const rowIndex = yToRowIndex.get(marker.y) ?? 0
      const offsetX = enabled && rowIndex % 2 === 1 ? xStep / 2 : 0
      return { marker, offsetX, index }
    })
  })

  return (
    <svg
      viewBox={`0 0 ${(props.width ?? 150)} ${(props.height ?? 75)}`}
      class={cn(`
        text-gray-500
        dark:text-gray-500
      `, props.class)}
      style={{ width: '100%', height: '100%', ...(props.style as JSX.CSSProperties) }}
      {...rest}
    >
      <For each={staggeredPoints()}>
        {({ point, offsetX }) => (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius()}
            fill={dotColor()}
          />
        )}
      </For>

      <For each={staggeredMarkers()}>
        {({ marker, offsetX, index }) => {
          const x = marker.x + offsetX
          const y = marker.y
          const r = marker.size ?? dotRadius()
          const shouldPulse = (props.pulse ?? false)
            ? marker.pulse !== false
            : marker.pulse === true
          const pulseTo = r * 2.8

          return (
            <g>
              <circle cx={x} cy={y} r={r} fill={markerColor()} />

              <Show when={shouldPulse}>
                <g pointer-events="none">
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={markerColor()}
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
                    stroke={markerColor()}
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

              {props.renderMarkerOverlay?.({
                marker: { ...marker, x, y },
                index,
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
