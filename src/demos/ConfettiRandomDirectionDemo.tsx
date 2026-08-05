import { ConfettiButton } from '@/registry/magicui/confetti'

export function ConfettiRandomDirectionDemo() {
  return (
    <div class="relative">
      <ConfettiButton
        options={{
          get angle() {
            return Math.random() * 360
          },
        }}
      >
        Random Confetti
      </ConfettiButton>
    </div>
  )
}
