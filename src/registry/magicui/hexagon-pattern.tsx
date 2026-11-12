import type { JSX } from '@solidjs/web'
import { createMemo, createUniqueId, For, omit, Show } from 'solid-js'

import { cn } from '@/lib/utils'

export interface HexagonPatternProps
  extends Omit<JSX.SvgSVGAttributes<SVGSVGElement>, 'direction'> {
  /**
   * The radius of each hexagon (center to vertex).
   * @default 40
   */
  radius?: number
  /**
   * Spacing in pixels between adjacent hexagons.
   * The tile grows by this amount while the visual radius stays fixed,
   * so the gap is evenly distributed on all sides of each hexagon.
   * @default 0
   */
  gap?: number
  /**
   * Offset applied to the pattern origin on the x-axis.
   * @default -1
   */
  x?: number
  /**
   * Offset applied to the pattern origin on the y-axis.
   * @default -1
   */
  y?: number
  /**
   * Controls the orientation of the hexagons.
   * - `"horizontal"` — flat-top hexagons tiled in a horizontal honeycomb grid.
   * - `"vertical"` — pointy-top hexagons tiled in a vertical honeycomb grid.
   * @default "horizontal"
   */
  direction?: 'horizontal' | 'vertical'
  /**
   * SVG stroke-dasharray applied to each hexagon outline.
   * @default "0"
   */
  strokeDasharray?: string
  /**
   * Array of [col, row] coordinates for hexagons that should be highlighted
   * (filled) on top of the repeating pattern — mirrors the `squares` prop of
   * GridPattern.
   */
  hexagons?: Array<[col: number, row: number]>
}

type HexPoint = readonly [number, number]

function hexVertexList(
  cx: number,
  cy: number,
  r: number,
  direction: 'horizontal' | 'vertical',
): HexPoint[] {
  const startAngle = direction === 'horizontal' ? 0 : 30
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((startAngle + i * 60) * Math.PI) / 180
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)] as const
  })
}

function hexPoints(
  cx: number,
  cy: number,
  r: number,
  direction: 'horizontal' | 'vertical',
): string {
  return hexVertexList(cx, cy, r, direction)
    .map(([px, py]) => `${px},${py}`)
    .join(' ')
}

function edgeLexKey(a: HexPoint, b: HexPoint): string {
  const [p, q]
    = a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? [a, b] : [b, a]
  return `${p[0].toFixed(6)},${p[1].toFixed(6)}|${q[0].toFixed(6)},${q[1].toFixed(6)}`
}

function collectUniqueHexEdges(
  centers: [number, number][],
  r: number,
  direction: 'horizontal' | 'vertical',
): [HexPoint, HexPoint][] {
  const seen = new Set<string>()
  const edges: [HexPoint, HexPoint][] = []
  for (const [cx, cy] of centers) {
    const verts = hexVertexList(cx, cy, r, direction)
    for (let i = 0; i < 6; i++) {
      const a = verts[i]
      const b = verts[(i + 1) % 6]
      const key = edgeLexKey(a, b)
      if (!seen.has(key)) {
        seen.add(key)
        edges.push([a, b])
      }
    }
  }
  return edges
}

function isSolidStrokeDasharray(strokeDasharray: string): boolean {
  const t = strokeDasharray.trim()
  return t === '' || t === 'none' || t === '0'
}

function getHexSpacing(
  r: number,
  direction: 'horizontal' | 'vertical',
  gap: number,
): {
  colStep: number
  rowStep: number
  tileW: number
  tileH: number
} {
  const sqrt3 = Math.sqrt(3)

  // `gap` should match the visible edge-to-edge spacing, so we add it along
  // the shared-edge normal instead of directly on the raw x/y axes.
  if (direction === 'horizontal') {
    const colStep = (3 * r) / 2 + (sqrt3 * gap) / 2
    const rowStep = sqrt3 * r + gap

    return {
      colStep,
      rowStep,
      tileW: colStep * 2,
      tileH: rowStep,
    }
  }

  const colStep = sqrt3 * r + gap
  const rowStep = (3 * r) / 2 + (sqrt3 * gap) / 2

  return {
    colStep,
    rowStep,
    tileW: colStep,
    tileH: rowStep * 2,
  }
}

function getTileGeometry(
  r: number,
  direction: 'horizontal' | 'vertical',
  gap: number,
): {
  tileW: number
  tileH: number
  centers: [number, number][]
} {
  const { colStep, rowStep, tileW, tileH } = getHexSpacing(r, direction, gap)

  const canonical: [number, number][] = direction === 'horizontal'
    ? [
        [colStep / 2, rowStep / 2],
        [(colStep * 3) / 2, rowStep],
      ]
    : [
        [colStep / 2, rowStep / 2],
        [colStep, (rowStep * 3) / 2],
      ]

  const centers: [number, number][] = []
  for (const [cx, cy] of canonical) {
    centers.push([cx, cy])
    if (cy - r < 0)
      centers.push([cx, cy + tileH])
    if (cy + r > tileH)
      centers.push([cx, cy - tileH])
    if (cx - r < 0)
      centers.push([cx + tileW, cy])
    if (cx + r > tileW)
      centers.push([cx - tileW, cy])
    if (cy - r < 0 && cx - r < 0)
      centers.push([cx + tileW, cy + tileH])
    if (cy - r < 0 && cx + r > tileW)
      centers.push([cx - tileW, cy + tileH])
    if (cy + r > tileH && cx - r < 0)
      centers.push([cx + tileW, cy - tileH])
    if (cy + r > tileH && cx + r > tileW)
      centers.push([cx - tileW, cy - tileH])
  }

  return { tileW, tileH, centers }
}

function hexCenter(
  col: number,
  row: number,
  r: number,
  direction: 'horizontal' | 'vertical',
  gap: number,
): [number, number] {
  const { colStep, rowStep } = getHexSpacing(r, direction, gap)
  if (direction === 'horizontal') {
    const x = col * colStep + colStep / 2
    const y = row * rowStep + rowStep / 2 + (col % 2 !== 0 ? rowStep / 2 : 0)
    return [x, y]
  }
  const x = col * colStep + colStep / 2 + (row % 2 !== 0 ? colStep / 2 : 0)
  const y = row * rowStep + rowStep / 2
  return [x, y]
}

/**
 * HexagonPattern Component
 *
 * A Solid component that creates a hexagon pattern background using SVG.
 */
export function HexagonPattern(props: HexagonPatternProps) {
  const rest = omit(props, 'radius', 'gap', 'x', 'y', 'strokeDasharray', 'direction', 'hexagons', 'class')
  const id = createUniqueId()

  const geometry = createMemo(() => {
    const radius = (props.radius ?? 40)
    const direction = (props.direction ?? 'horizontal' as const)
    const gap = (props.gap ?? 0)
    const strokeDasharray = (props.strokeDasharray ?? '0')
    const { tileW, tileH, centers } = getTileGeometry(radius, direction, gap)
    const solidStroke = isSolidStrokeDasharray(strokeDasharray)
    const dashedEdges = solidStroke
      ? null
      : collectUniqueHexEdges(centers, radius, direction)
    return { tileW, tileH, centers, solidStroke, dashedEdges, radius, direction, gap, strokeDasharray }
  })

  // Derive tiles in a memo. A <For> callback is an owner, not a tracking
  // scope, so geometry() read there freezes the first value.
  type StrokeTile
    = | { kind: 'polygon', points: string }
      | { kind: 'line', x1: number, y1: number, x2: number, y2: number }
  const strokeTiles = createMemo<StrokeTile[]>(() => {
    const { centers, dashedEdges, radius, direction } = geometry()
    if (dashedEdges) {
      return dashedEdges.map(([a, b]) => ({ kind: 'line', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }))
    }
    return centers.map(([cx, cy]) => ({ kind: 'polygon', points: hexPoints(cx, cy, radius, direction) }))
  })
  const strokeDasharray = createMemo(() => geometry().strokeDasharray)

  const highlightedHexes = createMemo(() => {
    const { radius, direction, gap } = geometry()
    return (props.hexagons ?? []).map(([col, row]) => {
      const [cx, cy] = hexCenter(col, row, radius, direction, gap)
      return hexPoints(cx, cy, radius - 1, direction)
    })
  })

  return (
    <svg
      aria-hidden="true"
      class={cn(
        `
          pointer-events-none absolute inset-0 size-full fill-gray-400/30
          stroke-gray-400/30
        `,
        props.class,
      )}
      {...rest}
    >
      <defs>
        <pattern
          id={id}
          width={geometry().tileW}
          height={geometry().tileH}
          patternUnits="userSpaceOnUse"
          x={(props.x ?? -1)}
          y={(props.y ?? -1)}
        >
          <For each={strokeTiles()}>
            {tile => tile.kind === 'polygon'
              ? (
                  <polygon
                    class="fill-none"
                    points={tile.points}
                    stroke-dasharray={strokeDasharray()}
                  />
                )
              : (
                  <line
                    class="fill-none"
                    x1={tile.x1}
                    x2={tile.x2}
                    y1={tile.y1}
                    y2={tile.y2}
                    stroke-dasharray={strokeDasharray()}
                  />
                )}
          </For>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} stroke="none" />

      <Show when={props.hexagons && props.hexagons.length > 0}>
        <svg aria-hidden="true" class="overflow-visible" x={(props.x ?? -1)} y={(props.y ?? -1)}>
          <For each={highlightedHexes()}>
            {points => (
              <polygon points={points} stroke-width="0" />
            )}
          </For>
        </svg>
      </Show>
    </svg>
  )
}
