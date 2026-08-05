import { SmoothCursor } from '@/registry/magicui/smooth-cursor'

export function SmoothCursorDemo() {
  return (
    <>
      <span class="
        hidden
        md:block
      "
      >
        Move your mouse around
      </span>
      <span class="
        block
        md:hidden
      "
      >
        SmoothCursor is disabled on touch devices
      </span>
      <SmoothCursor />
    </>
  )
}
