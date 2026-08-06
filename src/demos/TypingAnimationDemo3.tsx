import { TypingAnimation } from '@/registry/magicui/typing-animation'

export function TypingAnimationDemo3() {
  return (
    <TypingAnimation
      words={['Fast typing', 'Slow delete']}
      typeSpeed={50}
      deleteSpeed={150}
      pauseDelay={2000}
      loop
    />
  )
}
