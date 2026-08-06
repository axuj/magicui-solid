import { TypingAnimation } from '@/registry/magicui/typing-animation'

export function TypingAnimationDemo8() {
  return (
    <div class="flex-1 space-y-8">
      <div>
        <p class="mb-2 text-sm text-muted-foreground">
          Line cursor (default)
        </p>
        <TypingAnimation
          words={['Line cursor']}
          cursorStyle="line"
          loop
          class="text-4xl font-bold"
        />
      </div>
      <div>
        <p class="mb-2 text-sm text-muted-foreground">
          Block cursor (VSCode style)
        </p>
        <TypingAnimation
          words={['Block cursor']}
          cursorStyle="block"
          loop
          class="text-4xl font-bold"
        />
      </div>
      <div>
        <p class="mb-2 text-sm text-muted-foreground">Underscore cursor</p>
        <TypingAnimation
          words={['Underscore cursor']}
          cursorStyle="underscore"
          loop
          class="text-4xl font-bold"
        />
      </div>
    </div>
  )
}
