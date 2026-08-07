import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from '@/registry/magicui/scroll-based-velocity'

export function ScrollBasedVelocityDemo() {
  return (
    <div class="
      relative flex w-full flex-col items-center justify-center overflow-hidden
    "
    >
      <ScrollVelocityContainer class="
        text-4xl font-bold tracking-[-0.02em]
        md:text-7xl/20
      "
      >
        <ScrollVelocityRow baseVelocity={20} direction={1}>
          Velocity Scroll
        </ScrollVelocityRow>
        <ScrollVelocityRow baseVelocity={20} direction={-1}>
          Velocity Scroll
        </ScrollVelocityRow>
      </ScrollVelocityContainer>
      <div class="
        pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r
        from-background
      "
      />
      <div class="
        pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l
        from-background
      "
      />
    </div>
  )
}
