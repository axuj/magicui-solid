import type { JSX } from '@solidjs/web'
import { Pause, Play } from '@lucide/solid'
import { createEffect, createSignal, onSettled, Show } from 'solid-js'

import { Button } from '@/components/ui/button'

interface Icon {
  x: number
  y: number
  z: number
  scale: number
  opacity: number
  id: number
}

interface TargetRotation {
  x: number
  y: number
  startX: number
  startY: number
  distance: number
  startTime: number
  duration: number
}

interface IconCloudProps {
  icons?: JSX.Element[]
  images?: string[]
  showControl?: boolean
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function IconCloud(props: IconCloudProps) {
  let canvas: HTMLCanvasElement | undefined
  const [iconPositions, setIconPositions] = createSignal<Icon[]>([])
  const [isDragging, setIsDragging] = createSignal(false)
  const [isPaused, setIsPaused] = createSignal(false)
  const [lastMousePos, setLastMousePos] = createSignal({ x: 0, y: 0 })
  const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 })
  const [targetRotation, setTargetRotation] = createSignal<TargetRotation | null>(null)
  let animationFrame = 0
  let rotation = { x: 0, y: 0 }
  let iconCanvases: HTMLCanvasElement[] = []
  let imagesLoaded: boolean[] = []
  let hasContent = false
  const showControl = () => props.showControl ?? true
  // Icons must be created on the render path. Creating them in an effect is
  // forbidden, and creating them earlier leaves unhydrated nodes. Render into
  // a hidden host and read the nodes back from the DOM.
  const [iconHost, setIconHost] = createSignal<HTMLDivElement>()

  // Pause animation if user prefers reduced motion
  onSettled(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mediaQuery.matches)
      setIsPaused(true)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPaused(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  })

  // Create icon canvases once when icons/images change
  createEffect(
    () => ({ iconHost: iconHost(), images: props.images }),
    ({ iconHost, images: imagesValue }) => {
      const host = iconHost
      const images = imagesValue
      const nodes = host ? Array.from(host.children) : []
      hasContent = Boolean(nodes.length || images)
      if (!nodes.length && !images)
        return

      const items: (string | Element)[] = images ?? nodes
      imagesLoaded = Array.from<boolean>({ length: items.length }).fill(false)

      const newIconCanvases = items.map((item, index) => {
        const offscreen = document.createElement('canvas')
        offscreen.width = 40
        offscreen.height = 40
        const offCtx = offscreen.getContext('2d')

        if (offCtx) {
          if (images) {
            // Handle image URLs directly
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = items[index] as string
            img.onload = () => {
              offCtx.clearRect(0, 0, offscreen.width, offscreen.height)

              // Create circular clipping path
              offCtx.beginPath()
              offCtx.arc(20, 20, 20, 0, Math.PI * 2)
              offCtx.closePath()
              offCtx.clip()

              // Draw the image
              offCtx.drawImage(img, 0, 0, 40, 40)

              imagesLoaded[index] = true
            }
          }
          else {
            // Handle SVG icons: the nodes come straight out of the hidden host
            const svgNode = items[index] as Node
            const svgString = new XMLSerializer().serializeToString(svgNode)
            const img = new Image()
            img.src = `data:image/svg+xml;base64,${btoa(svgString)}`
            img.onload = () => {
              offCtx.scale(0.4, 0.4)
              offCtx.clearRect(0, 0, offscreen.width, offscreen.height)
              offCtx.drawImage(img, 0, 0)
              imagesLoaded[index] = true
            }
          }
        }
        return offscreen
      })

      iconCanvases = newIconCanvases
    },
  )

  // Generate initial icon positions on a sphere
  createEffect(
    () => ({ iconHost: iconHost(), images: props.images }),
    ({ iconHost, images }) => {
      const host = iconHost
      const items = images ?? (host ? Array.from(host.children) : [])
      const newIcons: Icon[] = []
      const numIcons = items.length || 20

      // Fibonacci sphere parameters
      const offset = 2 / numIcons
      const increment = Math.PI * (3 - Math.sqrt(5))

      for (let i = 0; i < numIcons; i++) {
        const y = i * offset - 1 + offset / 2
        const r = Math.sqrt(1 - y * y)
        const phi = i * increment

        const x = Math.cos(phi) * r
        const z = Math.sin(phi) * r

        newIcons.push({
          x: x * 100,
          y: y * 100,
          z: z * 100,
          scale: 1,
          opacity: 1,
          id: i,
        })
      }
      setIconPositions(newIcons)
    },
  )

  // Handle mouse events
  const handleMouseDown = (e: MouseEvent) => {
    const rect = canvas?.getBoundingClientRect()
    if (!rect || !canvas)
      return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    iconPositions().forEach((icon) => {
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)

      const rotatedX = icon.x * cosY - icon.z * sinY
      const rotatedZ = icon.x * sinY + icon.z * cosY
      const rotatedY = icon.y * cosX + rotatedZ * sinX

      const screenX = canvas.width / 2 + rotatedX
      const screenY = canvas.height / 2 + rotatedY

      const scale = (rotatedZ + 200) / 300
      const radius = 20 * scale
      const dx = x - screenX
      const dy = y - screenY

      if (dx * dx + dy * dy < radius * radius) {
        const targetX = -Math.atan2(
          icon.y,
          Math.sqrt(icon.x * icon.x + icon.z * icon.z),
        )
        const targetY = Math.atan2(icon.x, icon.z)

        const currentX = rotation.x
        const currentY = rotation.y
        const distance = Math.sqrt(
          (targetX - currentX) ** 2 + (targetY - currentY) ** 2,
        )

        const duration = Math.min(2000, Math.max(800, distance * 1000))

        setTargetRotation({
          x: targetX,
          y: targetY,
          startX: currentX,
          startY: currentY,
          distance,
          startTime: performance.now(),
          duration,
        })
      }
    })

    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setMousePos({ x, y })
    }

    if (isDragging()) {
      const deltaX = e.clientX - lastMousePos().x
      const deltaY = e.clientY - lastMousePos().y

      rotation = {
        x: rotation.x + deltaY * 0.002,
        y: rotation.y + deltaX * 0.002,
      }

      setLastMousePos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Animation and rendering
  createEffect(
    () => ({ isPaused: isPaused() }),
    ({ isPaused }) => {
      const canvasEl = canvas
      const ctx = canvasEl?.getContext('2d')
      if (!canvasEl || !ctx)
        return

      const paused = isPaused

      const animate = () => {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)

        const centerX = canvasEl.width / 2
        const centerY = canvasEl.height / 2
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
        const dx = mousePos().x - centerX
        const dy = mousePos().y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const speed = 0.003 + (distance / maxDistance) * 0.01

        const target = targetRotation()
        if (target) {
          const elapsed = performance.now() - target.startTime
          const progress = Math.min(1, elapsed / target.duration)
          const easedProgress = easeOutCubic(progress)

          rotation = {
            x: target.startX + (target.x - target.startX) * easedProgress,
            y: target.startY + (target.y - target.startY) * easedProgress,
          }

          if (progress >= 1) {
            setTargetRotation(null)
          }
        }
        else if (!isDragging() && !paused) {
          rotation = {
            x: rotation.x + (dy / canvasEl.height) * speed,
            y: rotation.y + (dx / canvasEl.width) * speed,
          }
        }

        iconPositions().forEach((icon, index) => {
          const cosX = Math.cos(rotation.x)
          const sinX = Math.sin(rotation.x)
          const cosY = Math.cos(rotation.y)
          const sinY = Math.sin(rotation.y)

          const rotatedX = icon.x * cosY - icon.z * sinY
          const rotatedZ = icon.x * sinY + icon.z * cosY
          const rotatedY = icon.y * cosX + rotatedZ * sinX

          const scale = (rotatedZ + 200) / 300
          const opacity = Math.max(0.2, Math.min(1, (rotatedZ + 150) / 200))

          ctx.save()
          ctx.translate(
            canvasEl.width / 2 + rotatedX,
            canvasEl.height / 2 + rotatedY,
          )
          ctx.scale(scale, scale)
          ctx.globalAlpha = opacity

          if (hasContent) {
            // Only try to render icons/images if they exist
            if (iconCanvases[index] && imagesLoaded[index]) {
              ctx.drawImage(iconCanvases[index], -20, -20, 40, 40)
            }
          }
          else {
            // Show numbered circles if no icons/images are provided
            ctx.beginPath()
            ctx.arc(0, 0, 20, 0, Math.PI * 2)
            ctx.fillStyle = '#4444ff'
            ctx.fill()
            ctx.fillStyle = 'white'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.font = '16px Arial'
            ctx.fillText(`${icon.id + 1}`, 0, 0)
          }

          ctx.restore()
        })

        const hasPendingAssets = hasContent && !imagesLoaded.every(loaded => loaded)
        const shouldContinue = !paused || isDragging() || targetRotation() !== null || hasPendingAssets
        if (shouldContinue)
          animationFrame = requestAnimationFrame(animate)
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    },
  )

  return (
    <div class="relative inline-block">
      {/* Icons are painted into an offscreen canvas, but they still have to
          render: emitting them here keeps hydration keys aligned and puts their
          owner on the render path rather than inside a computation. */}
      <div ref={setIconHost} style={{ display: 'none' }} aria-hidden="true">
        {props.icons}
      </div>
      <canvas
        ref={canvas}
        width={400}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        class="rounded-lg"
        aria-label="Interactive 3D Icon Cloud"
        role="img"
      />
      <Show when={showControl()}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsPaused(p => !p)}
          aria-label={isPaused() ? 'Play Animation' : 'Pause Animation'}
          class="absolute top-2 right-2"
        >
          <Show when={isPaused()} fallback={<Pause size={16} />}>
            <Play size={16} />
          </Show>
        </Button>
      </Show>
    </div>
  )
}
