import { AuroraText } from '@/registry/magicui/aurora-text'

export function AuroraTextDemo() {
  return (
    <h1 class="
      text-4xl font-bold tracking-tighter
      md:text-5xl
      lg:text-7xl
    "
    >
      Ship
      {' '}
      <AuroraText>beautiful</AuroraText>
    </h1>
  )
}
