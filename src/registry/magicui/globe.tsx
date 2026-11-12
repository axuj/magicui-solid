import type { COBEOptions } from 'cobe'
import createGlobe from 'cobe'
import { onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

const MOVEMENT_DAMPING = 1400

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 },
    { location: [19.076, 72.8777], size: 0.1 },
    { location: [23.8103, 90.4125], size: 0.05 },
    { location: [30.0444, 31.2357], size: 0.07 },
    { location: [39.9042, 116.4074], size: 0.08 },
    { location: [-23.5505, -46.6333], size: 0.1 },
    { location: [19.4326, -99.1332], size: 0.1 },
    { location: [40.7128, -74.006], size: 0.1 },
    { location: [34.6937, 135.5022], size: 0.05 },
    { location: [41.0082, 28.9784], size: 0.06 },
  ],
}

const SPRING_MASS = 1
const SPRING_DAMPING = 30
const SPRING_STIFFNESS = 100
const FRAME_STEP = 1 / 60

interface SpringState {
  value: number
  velocity: number
}

function stepSpring(state: SpringState, target: number) {
  const acceleration
    = (-SPRING_STIFFNESS * (state.value - target) - SPRING_DAMPING * state.velocity) / SPRING_MASS
  state.velocity += acceleration * FRAME_STEP
  state.value += state.velocity * FRAME_STEP
}

interface GlobeProps {
  class?: string
  config?: COBEOptions
}

export function Globe(props: GlobeProps) {
  let canvasRef: HTMLCanvasElement | undefined
  let phi = 0
  let width = 0
  let pointerInteracting: number | null = null

  const spring: SpringState = { value: 0, velocity: 0 }
  let springTarget = 0

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting = value
    if (canvasRef) {
      canvasRef.style.cursor = value !== null ? 'grabbing' : 'grab'
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting !== null) {
      const delta = clientX - pointerInteracting
      springTarget += delta / MOVEMENT_DAMPING
    }
  }

  // Create the cobe instance once after mount; recompute width on resize.
  onSettled(() => {
    const canvas = canvasRef
    if (!canvas)
      return

    const onResize = () => {
      width = canvas.offsetWidth
    }

    window.addEventListener('resize', onResize)
    onResize()

    const globe = createGlobe(canvas, {
      ...(props.config ?? GLOBE_CONFIG),
      width: width * 2,
      height: width * 2,
      onRender: (state) => {
        if (!pointerInteracting)
          phi += 0.005
        stepSpring(spring, springTarget)
        state.phi = phi + spring.value
        state.width = width * 2
        state.height = width * 2
      },
    })

    const timer = setTimeout(() => {
      canvas.style.opacity = '1'
    }, 0)

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
    }
  })

  return (
    <div
      class={cn(
        'absolute inset-0 mx-auto aspect-square w-full max-w-150',
        props.class,
      )}
    >
      <canvas
        ref={canvasRef}
        class={cn(
          `
            size-full opacity-0 transition-opacity duration-500
            contain-[layout_paint_size]
          `,
        )}
        onPointerDown={(e) => {
          pointerInteracting = e.clientX
          updatePointerInteraction(e.clientX)
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={e => updateMovement(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0])
            updateMovement(e.touches[0].clientX)
        }}
      />
    </div>
  )
}
