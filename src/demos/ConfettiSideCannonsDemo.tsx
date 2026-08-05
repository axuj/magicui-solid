import confetti from 'canvas-confetti'

import { Button } from '@/components/ui/button'

export function ConfettiSideCannonsDemo() {
  const handleClick = () => {
    const end = Date.now() + 3 * 1000
    const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1']

    const frame = () => {
      if (Date.now() > end)
        return

      void confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      })
      void confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      })

      requestAnimationFrame(frame)
    }

    frame()
  }

  return (
    <div class="relative">
      <Button onClick={handleClick}>Trigger Side Cannons</Button>
    </div>
  )
}
