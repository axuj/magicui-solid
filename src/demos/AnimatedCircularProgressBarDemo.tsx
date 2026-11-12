import { createSignal, onSettled } from 'solid-js'

import { AnimatedCircularProgressBar } from '@/registry/magicui/animated-circular-progress-bar'

function waitForPaint() {
  return new Promise<void>(resolve =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  )
}

const bump = (prev: number) => (prev === 100 ? 0 : prev + 10)

export function AnimatedCircularProgressBarDemo() {
  const [value, setValue] = createSignal(0)

  onSettled(() => {
    const ac = new AbortController()

    waitForPaint().then(() => {
      if (ac.signal.aborted)
        return
      setValue(bump)
      const timer = setInterval(setValue, 2000, bump)
      ac.signal.addEventListener('abort', () => clearInterval(timer))
    })

    return () => ac.abort()
  })

  return (
    <AnimatedCircularProgressBar
      value={value()}
      gaugePrimaryColor="rgb(79 70 229)"
      gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
    />
  )
}
