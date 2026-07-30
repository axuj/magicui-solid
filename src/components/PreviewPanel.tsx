import type { JSX } from 'solid-js'
import { createSignal, Show } from 'solid-js'

interface PreviewPanelProps {
  children: JSX.Element
  align?: 'center' | 'start' | 'end'
}

export function PreviewPanel(props: PreviewPanelProps) {
  const [showPreview, setShowPreview] = createSignal(true)

  function handleReplay() {
    setShowPreview(false)
    requestAnimationFrame(() => setShowPreview(true))
  }

  return (
    <div class="relative flex flex-1 flex-col">
      <button
        type="button"
        onClick={handleReplay}
        class="absolute  top-4 right-4 z-50 inline-flex items-center rounded-lg px-3 py-1 transition-colors hover:bg-foreground/10"
        aria-label="重新播放"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      </button>
      <Show when={showPreview()}>
        <div
          class="flex w-full flex-1 justify-center p-10"
          classList={{
            'items-center': (props.align ?? 'center') === 'center',
            'items-start': props.align === 'start',
            'items-end': props.align === 'end',
          }}
        >
          {props.children}
        </div>
      </Show>
    </div>
  )
}
