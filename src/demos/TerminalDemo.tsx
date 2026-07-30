import { AnimatedSpan, Terminal, TypingAnimation } from '@/registry/magicui/terminal'

export function TerminalDemo() {
  return (
    <Terminal>
      <TypingAnimation>&gt; pnpm dlx shadcn@latest init</TypingAnimation>
      <AnimatedSpan class="text-green-500">✔ Preflight checks.</AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Verifying framework. Found Next.js.
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Validating Tailwind CSS.
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Validating import alias.
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Writing components.json.
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">✔ Checking registry.</AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Updating tailwind.config.ts
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Updating app/globals.css
      </AnimatedSpan>
      <AnimatedSpan class="text-green-500">
        ✔ Installing dependencies.
      </AnimatedSpan>
      <AnimatedSpan class="text-blue-500">
        <span>ℹ Updated 1 file:</span>
        <span class="pl-2">- lib/u1tils.ts</span>
      </AnimatedSpan>
      <TypingAnimation class="text-muted-foreground">
        Success! Project initialization completed.
      </TypingAnimation>
      <TypingAnimation class="text-muted-foreground">
        You may now add components.
      </TypingAnimation>
    </Terminal>
  )
}
