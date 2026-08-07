import { AnimatedGradientText } from '@/registry/magicui/animated-gradient-text'

export function AnimatedGradientTextDemo2() {
  return (
    <AnimatedGradientText
      speed={2}
      colorFrom="#4ade80"
      colorTo="#06b6d4"
      class="text-4xl font-semibold tracking-tight"
    >
      Fast Gradient
    </AnimatedGradientText>
  )
}
