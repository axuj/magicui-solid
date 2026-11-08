import { createIsDark } from '@/demos/shared/theme'
import { Floating3DParticles } from '@/registry/magicui/floating-3d-particles'

export function Floating3DParticlesDemo2() {
  const isDark = createIsDark()
  const color = () => (isDark() ? '#c4b5fd' : '#6d28d9')

  return (
    <div class="
      relative h-125 w-full overflow-hidden rounded-lg border bg-background
    "
    >
      <Floating3DParticles
        color={color()}
        depth={0.8}
        opacity={0.55}
        quantity={1000}
      />
    </div>
  )
}
