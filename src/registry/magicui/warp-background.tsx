import type { JSX } from 'solid-js'
import { createMemo, For, mergeProps, splitProps } from 'solid-js'

import { cn } from '@/lib/utils'

interface WarpBackgroundProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children?: JSX.Element
  perspective?: number
  beamsPerSide?: number
  beamSize?: number
  beamDelayMax?: number
  beamDelayMin?: number
  beamDuration?: number
  gridColor?: string
}

interface BeamProps {
  width: string | number
  x: string | number
  delay: number
  duration: number
}

function Beam(props: BeamProps) {
  const hue = Math.floor(Math.random() * 360)
  const ar = Math.floor(Math.random() * 10) + 1

  return (
    <div
      class="
        absolute top-0 left-(--x) aspect-[1/var(--aspect-ratio)] w-(--width)
        animate-warp-beam [background:var(--background)]
      "
      style={{
        '--x': `${props.x}`,
        '--width': `${props.width}`,
        '--aspect-ratio': `${ar}`,
        '--background': `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
        '--beam-duration': `${props.duration}s`,
        'animation-delay': `${props.delay}s`,
        'animation-fill-mode': 'backwards',
      }}
    />
  )
}

interface BeamGroupProps {
  positionClass: string
  beams: () => { x: number, delay: number }[]
  beamSize: number
  beamDuration: number
}

function BeamGroup(props: BeamGroupProps) {
  return (
    <div class={`
      ${props.positionClass}
      bg-size-[var(--beam-size)_var(--beam-size)]
      [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)]
      transform-3d
    `}
    >
      <For each={props.beams()}>
        {beam => (
          <Beam
            width={`${props.beamSize}%`}
            x={`${beam.x * props.beamSize}%`}
            delay={beam.delay}
            duration={props.beamDuration}
          />
        )}
      </For>
    </div>
  )
}

export function WarpBackground(props: WarpBackgroundProps) {
  const merged = mergeProps(
    {
      perspective: 100,
      beamsPerSide: 3,
      beamSize: 5,
      beamDelayMax: 3,
      beamDelayMin: 0,
      beamDuration: 3,
      gridColor: 'var(--border)',
    },
    props,
  )
  const [local, rest] = splitProps(merged, [
    'children',
    'class',
    'perspective',
    'beamsPerSide',
    'beamSize',
    'beamDelayMax',
    'beamDelayMin',
    'beamDuration',
    'gridColor',
  ])

  const generateBeams = () => {
    const cellsPerSide = Math.floor(100 / local.beamSize)
    const step = cellsPerSide / local.beamsPerSide
    const beams: { x: number, delay: number }[] = []

    for (let i = 0; i < local.beamsPerSide; i++) {
      const x = Math.floor(i * step)
      const delay = Math.random() * (local.beamDelayMax - local.beamDelayMin) + local.beamDelayMin
      beams.push({ x, delay })
    }
    return beams
  }

  const topBeams = createMemo(() => generateBeams())
  const rightBeams = createMemo(() => generateBeams())
  const bottomBeams = createMemo(() => generateBeams())
  const leftBeams = createMemo(() => generateBeams())

  const beamGroups = [
    { positionClass: '@container absolute z-20 h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)]', beams: topBeams },
    { positionClass: '@container absolute top-full h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)]', beams: bottomBeams },
    { positionClass: '@container absolute top-0 left-0 h-[100cqmax] w-[100cqh] origin-[0%_0%] transform-[rotate(90deg)_rotateX(-90deg)]', beams: leftBeams },
    { positionClass: '@container absolute top-0 right-0 h-[100cqmax] w-[100cqh] origin-[100%_0%] transform-[rotate(-90deg)_rotateX(-90deg)]', beams: rightBeams },
  ]

  return (
    <div class={cn('relative rounded-sm border p-20', local.class)} {...rest}>
      <div
        style={{
          '--perspective': `${local.perspective}px`,
          '--grid-color': local.gridColor,
          '--beam-size': `${local.beamSize}%`,
        }}
        class="
          @container-size pointer-events-none absolute top-0 left-0 size-full
          overflow-hidden [clipPath:inset(0)] perspective-(--perspective)
          transform-3d
        "
      >
        <For each={beamGroups}>
          {group => (
            <BeamGroup
              positionClass={group.positionClass}
              beams={group.beams}
              beamSize={local.beamSize}
              beamDuration={local.beamDuration}
            />
          )}
        </For>
      </div>
      <div class="relative">{local.children}</div>
    </div>
  )
}
