import { NumberTicker } from '@/registry/magicui/number-ticker'

export function NumberTickerDecimalDemo() {
  return (
    <NumberTicker
      value={5.67}
      decimalPlaces={2}
      class="
        text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black
        dark:text-white
      "
    />
  )
}
