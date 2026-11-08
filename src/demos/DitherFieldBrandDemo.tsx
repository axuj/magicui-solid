import { DitherField } from '@/registry/magicui/dither-field'

const sodium = ['#78350f', '#f59e0b', '#fef3c7'] as const
const glacier = ['#164e63', '#06b6d4', '#cffafe'] as const

export function DitherFieldBrandDemo() {
  return (
    <div class="
      grid w-full grid-cols-2 gap-3
      md:gap-4
    "
    >
      <DitherField
        pattern="glow"
        color={sodium}
        class="
          flex h-56 items-end rounded-xl border bg-[#140b02] p-4 text-amber-50
          select-none
          md:h-80 md:p-6
        "
      >
        <p class="text-sm font-medium">Sodium</p>
      </DitherField>
      <DitherField
        pattern="aurora"
        color={glacier}
        intensity={1.1}
        class="
          flex h-56 items-end rounded-xl border bg-[#020f14] p-4 text-cyan-50
          select-none
          md:h-80 md:p-6
        "
      >
        <p class="text-sm font-medium">Glacier</p>
      </DitherField>
    </div>
  )
}
