import { PixelImage } from '@/registry/magicui/pixel-image'

export function PixelImageDemo() {
  return (
    <PixelImage
      src="/pixel-image-demo.jpg"
      customGrid={{ rows: 4, cols: 6 }}
      grayscaleAnimation
    />
  )
}
