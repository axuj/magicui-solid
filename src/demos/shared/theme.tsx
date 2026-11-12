import type { Accessor } from 'solid-js'

import { createSignal, onSettled } from 'solid-js'

export function createIsDark(): Accessor<boolean> {
  const [isDark, setIsDark] = createSignal(true)

  onSettled(() => {
    if (typeof document === 'undefined')
      return
    const root = document.documentElement
    const update = () => setIsDark(root.dataset.theme === 'dark')
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  })

  return isDark
}
