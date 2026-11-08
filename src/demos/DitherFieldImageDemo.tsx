import { DitherField } from '@/registry/magicui/dither-field'

const ramp = ['#7c2d12', '#fb923c', '#fff7ed'] as const

export function DitherFieldImageDemo() {
  return (
    <DitherField
      src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
      color={ramp}
      dotSize={2}
      intensity={0.8}
      class="
        h-72 w-full rounded-lg border bg-black
        md:h-125
      "
    />
  )
}
