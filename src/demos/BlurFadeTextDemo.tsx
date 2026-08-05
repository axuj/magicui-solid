import { BlurFade } from '@/registry/magicui/blur-fade'

export function BlurFadeTextDemo() {
  return (
    <section id="header">
      <BlurFade delay={0.25} inView>
        <h2 class="
          text-3xl font-bold tracking-tighter
          sm:text-5xl
          xl:text-6xl/none
        "
        >
          Hello World 👋
        </h2>
      </BlurFade>
      <BlurFade delay={0.25 * 2} inView>
        <span class="
          text-xl tracking-tighter text-pretty
          sm:text-3xl
          xl:text-4xl/none
        "
        >
          Nice to meet you
        </span>
      </BlurFade>
    </section>
  )
}
