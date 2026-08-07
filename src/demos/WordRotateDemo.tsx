import { WordRotate } from '@/registry/magicui/word-rotate'

export function WordRotateDemo() {
  return (
    <WordRotate
      class="
        text-4xl font-bold text-black
        dark:text-white
      "
      words={['Word', 'Rotate']}
    />
  )
}
