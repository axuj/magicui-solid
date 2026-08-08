import { createSignal, onCleanup, onMount } from 'solid-js'

import { GlyphMatrix } from '@/registry/magicui/glyph-matrix'

export function GlyphMatrixDemo() {
  // Start neutral so the first frame is visible in both themes, then adopt
  // the resolved theme color once it's known.
  const [color, setColor] = createSignal('#6B7280')

  onMount(() => {
    const root = document.documentElement
    const update = () => {
      const theme = root.dataset.theme
      if (!theme)
        return
      setColor(theme === 'dark' ? '#ffffff' : '#000000')
    }
    update()

    const observer = new MutationObserver(update)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    onCleanup(() => observer.disconnect())
  })

  return (
    <div class="
      relative h-100 w-full overflow-hidden rounded-lg border border-border
      bg-background
    "
    >
      <GlyphMatrix
        glyphs="01·•+*/\\<>="
        cellSize={14}
        mutationRate={0.04}
        interval={90}
        fadeBottom={0.6}
        color={color()}
      />
    </div>
  )
}
