import { TypingAnimation } from '@/registry/magicui/typing-animation'

export function TypingAnimationDemo7() {
  return (
    <div class="flex-1 space-y-8">
      <div>
        <p class="mb-2 text-sm text-muted-foreground">
          With blinking cursor (default) - watch during pause
        </p>
        <TypingAnimation
          words={['Type', 'Pause', 'Delete']}
          blinkCursor={true}
          pauseDelay={2000}
          loop
          class="text-4xl font-bold"
        >
          Blinking cursor
        </TypingAnimation>
      </div>
      <div>
        <p class="mb-2 text-sm text-muted-foreground">
          Without blinking cursor - static during pause
        </p>
        <TypingAnimation
          words={['Type', 'Pause', 'Delete']}
          blinkCursor={false}
          pauseDelay={2000}
          loop
          class="text-4xl font-bold"
        >
          Static cursor
        </TypingAnimation>
      </div>
    </div>
  )
}
