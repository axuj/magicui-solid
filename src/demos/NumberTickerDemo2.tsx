import { NumberTicker } from '@/registry/magicui/number-ticker'

export function NumberTickerDemo2() {
  return (
    <NumberTicker
      value={100}
      startValue={80}
      class="
        text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black
        dark:text-white
      "
    />
  )
}
