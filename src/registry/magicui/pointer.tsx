import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { createEffect, createMemo, createSignal, omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

export function Pointer(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class', 'style', 'children')

  const [x, setX] = createSignal(0)
  const [y, setY] = createSignal(0)
  const [isActive, setIsActive] = createSignal(false)
  const [pointerEl, setPointerEl] = createSignal<HTMLDivElement>()

  let containerEl: HTMLDivElement | undefined

  onSettled(() => {
    const parentElement = containerEl?.parentElement ?? null
    if (!parentElement)
      return

    const handleMouseMove = (e: MouseEvent) => {
      setX(e.clientX)
      setY(e.clientY)
      setIsActive(true)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      setX(e.clientX)
      setY(e.clientY)
      setIsActive(true)
    }

    const handleMouseLeave = () => {
      setIsActive(false)
    }

    parentElement.style.cursor = 'none'
    parentElement.addEventListener('mousemove', handleMouseMove)
    parentElement.addEventListener('mouseenter', handleMouseEnter)
    parentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      parentElement.style.cursor = ''
      parentElement.removeEventListener('mousemove', handleMouseMove)
      parentElement.removeEventListener('mouseenter', handleMouseEnter)
      parentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  })

  createEffect(
    () => ({
      pointerEl: pointerEl(),
      isActive: isActive(),
    }),
    ({ pointerEl, isActive }) => {
      const el = pointerEl
      if (!el)
        return

      if (isActive) {
        const anim = animate(
          el,
          { scale: [0, 1], opacity: [0, 1] },
          { duration: 0.3 },
        )
        return () => anim.stop()
      }
      else {
        const anim = animate(
          el,
          { scale: 0, opacity: 0 },
          { duration: 0.3 },
        )
        return () => anim.stop()
      }
    },
  )

  const pointerPositionStyle = createMemo<JSX.CSSProperties>(() => ({
    top: `${y()}px`,
    left: `${x()}px`,
    ...(typeof props.style === 'object' ? props.style : {}),
  }))

  return (
    <>
      <div ref={containerEl} />
      <div
        class="pointer-events-none fixed z-50"
        style={pointerPositionStyle()}
        {...rest}
      >
        <div style={{ transform: 'translate(-50%, -50%)' }}>
          <div ref={setPointerEl} style={{ opacity: 0, transform: 'scale(0)' }}>
            {props.children || (
              <svg
                stroke="currentColor"
                fill="currentColor"
                stroke-width="1"
                viewBox="0 0 16 16"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                class={cn('rotate-[-70deg] stroke-white text-black', props.class)}
              >
                <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
