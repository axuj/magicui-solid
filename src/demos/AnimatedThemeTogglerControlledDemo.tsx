import { createSignal, onSettled } from 'solid-js'

import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler'

export function AnimatedThemeTogglerControlledDemo() {
  const [theme, setTheme] = createSignal<'light' | 'dark'>('dark')

  onSettled(() => {
    const root = document.documentElement
    const update = () => {
      setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light')
    }
    update()

    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })

    return () => observer.disconnect()
  })

  return (
    <div class="flex justify-center p-6">
      <AnimatedThemeToggler
        theme={theme()}
        onThemeChange={(t) => {
          document.documentElement.dataset.theme = t
          localStorage.setItem('starlight-theme', t)
          setTheme(t)
        }}
      />
    </div>
  )
}
