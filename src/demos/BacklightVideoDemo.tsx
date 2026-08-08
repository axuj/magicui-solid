import { Backlight } from '@/registry/magicui/backlight'

export function BacklightVideoDemo() {
  return (
    <Backlight blur={40} class="w-full">
      <video
        class="mx-auto aspect-video w-full max-w-lg rounded-xl"
        src="https://videos.pexels.com/video-files/27180348/12091515_2560_1440_50fps.mp4"
        autoplay
        muted
        loop
        playsinline
      />
    </Backlight>
  )
}
