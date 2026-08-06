import { createIsDark } from '@/demos/shared/theme'
import { LineShadowText } from '@/registry/magicui/line-shadow-text'

export function LineShadowTextDemo() {
  const isDark = createIsDark()
  const shadowColor = () => (isDark() ? 'white' : 'black')

  return (
    <h1 class="
      text-5xl leading-none font-semibold tracking-tighter text-balance
      sm:text-6xl
      md:text-7xl
      lg:text-8xl
    "
    >
      Ship
      <LineShadowText class="italic" shadowColor={shadowColor()}>
        Fast
      </LineShadowText>
    </h1>
  )
}
