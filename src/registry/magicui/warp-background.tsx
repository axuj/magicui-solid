import type { JSX } from '@solidjs/web'
import { createMemo, For, omit } from 'solid-js'

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
  const rest = omit(props, 'children', 'class', 'perspective', 'beamsPerSide', 'beamSize', 'beamDelayMax', 'beamDelayMin', 'beamDuration', 'gridColor')
  const beamDelayMax = () => props.beamDelayMax ?? 3
  const beamDelayMin = () => props.beamDelayMin ?? 0
  const beamsPerSide = () => props.beamsPerSide ?? 3
  const gridColor = () => props.gridColor ?? 'var(--border)'

  const generateBeams = () => {
    const cellsPerSide = Math.floor(100 / (props.beamSize ?? 5))
    const step = cellsPerSide / beamsPerSide()
    const beams: { x: number, delay: number }[] = []

    for (let i = 0; i < beamsPerSide(); i++) {
      const x = Math.floor(i * step)
      const delay = Math.random() * (beamDelayMax() - beamDelayMin()) + beamDelayMin()
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
    <div class={cn('relative rounded-sm border p-20', props.class)} {...rest}>
      <div
        style={{
          '--perspective': `${(props.perspective ?? 100)}px`,
          '--grid-color': gridColor(),
          '--beam-size': `${(props.beamSize ?? 5)}%`,
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
              beamSize={(props.beamSize ?? 5)}
              beamDuration={(props.beamDuration ?? 3)}
            />
          )}
        </For>
      </div>
      <div class="relative">{props.children}</div>
    </div>
  )
}
