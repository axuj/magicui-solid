import { Highlighter } from '@/registry/magicui/highlighter'

export function HighlighterDemo() {
  return (
    <div class="text-center">
      <p class="leading-relaxed">
        The
        {' '}
        <Highlighter action="underline" color="#FF9800">
          Magic UI Highlighter
        </Highlighter>
        {' '}
        makes important
        {' '}
        <Highlighter action="highlight" color="#87CEFA">
          text stand out
        </Highlighter>
        {' '}
        effortlessly.
      </p>
    </div>
  )
}
