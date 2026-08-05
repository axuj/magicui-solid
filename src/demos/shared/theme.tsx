import type { Accessor } from 'solid-js'
import { createEffect, createSignal, onCleanup } from 'solid-js'

export function createIsDark(): Accessor<boolean> {
  const [isDark, setIsDark] = createSignal(true)

  createEffect(() => {
    if (typeof document === 'undefined')
      return
    const root = document.documentElement
    const update = () => setIsDark(root.dataset.theme === 'dark')
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    onCleanup(() => observer.disconnect())
  })

  return isDark
}
