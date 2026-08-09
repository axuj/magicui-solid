import { For } from 'solid-js'
import { ProgressiveBlur } from '@/registry/magicui/progressive-blur'

export function ProgressiveBlurDemo() {
  return (
    <div class="relative w-full rounded-xl border">
      <div class="relative h-100 overflow-hidden">
        <div class="size-full overflow-auto">
          <div class="flex flex-col gap-2 p-4">
            <For each={Array.from({ length: 20 }, (_, index) => index)}>
              {item => (
                <div class="
                  flex h-20 w-full items-center justify-center rounded-xl border
                  bg-card
                "
                >
                  {item}
                </div>
              )}
            </For>
          </div>
        </div>
        <ProgressiveBlur position="bottom" height="40%" />
      </div>
    </div>
  )
}
