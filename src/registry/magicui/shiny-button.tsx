import type { JSX } from '@solidjs/web'
import { animate } from 'motion'
import { omit, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface ShinyButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  class?: string
  children?: JSX.Element
}

export function ShinyButton(props: ShinyButtonProps) {
  const rest = omit(props, 'class', 'children')

  let buttonRef: HTMLButtonElement | undefined

  const pressSpring = {
    type: 'spring',
    stiffness: 200,
    damping: 5,
    mass: 0.5,
  } as const

  onSettled(() => {
    if (!buttonRef)
      return

    const animation = animate(
      buttonRef,
      {
        '--x': ['100%', '-100%'],
        'scale': [0.8, 1],
      },
      {
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 1,
        type: 'spring',
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: pressSpring,
      },
    )

    return () => animation.stop()
  })

  const animateScale = (scale: number) => {
    if (!buttonRef)
      return
    animate(buttonRef, { scale }, pressSpring)
  }

  return (
    <button
      ref={buttonRef}
      class={cn(
        `
          relative cursor-pointer rounded-lg border px-6 py-2 font-medium
          backdrop-blur-xl transition-shadow duration-300 ease-in-out
          hover:shadow-sm
          dark:bg-[radial-gradient(circle_at_50%_0%,var(--primary)/10%_0%,transparent_60%)]
          dark:hover:shadow-[0_0_20px_var(--primary)/10%]
        `,
        props.class,
      )}
      onPointerDown={() => animateScale(0.95)}
      onPointerUp={() => animateScale(1)}
      onPointerLeave={() => animateScale(1)}
      onPointerCancel={() => animateScale(1)}
      {...rest}
    >
      <span
        class="
          relative block size-full text-sm tracking-wide text-[rgb(0,0,0,65%)]
          uppercase
          dark:font-light dark:text-[rgb(255,255,255,90%)]
        "
        style={{
          'mask-image': 'linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))',
        }}
      >
        {props.children}
      </span>
      <span
        style={{
          'mask': 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          '-webkit-mask': 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
          'background-image': 'linear-gradient(-75deg,var(--primary)/10% calc(var(--x)+20%),var(--primary)/50% calc(var(--x)+25%),var(--primary)/10% calc(var(--x)+100%))',
        }}
        class="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </button>
  )
}
