import type { JSX } from 'solid-js'
import { RefreshCw } from 'lucide-solid'
import { createSignal, Show } from 'solid-js'

export interface PreviewPanelProps {
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
        class="
          absolute top-4 right-4 z-50 inline-flex items-center rounded-lg px-3
          py-1 transition-colors
          hover:bg-foreground/10
        "
        aria-label="重新播放"
      >
        <RefreshCw class="size-4" />
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
