import { onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

const morphTime = 1.5
const cooldownTime = 0.5

interface MorphingTextProps {
  className?: string
  texts: string[]
}

function Texts(props: { texts: string[] }) {
  let text1: HTMLSpanElement | undefined
  let text2: HTMLSpanElement | undefined

  onSettled(() => {
    let textIndex = 0
    let morph = 0
    let cooldown = 0
    let time = new Date()

    const setStyles = (fraction: number) => {
      if (!text1 || !text2)
        return
      text2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`
      text2.style.opacity = `${fraction ** 0.4 * 100}%`

      const invertedFraction = 1 - fraction
      text1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`
      text1.style.opacity = `${invertedFraction ** 0.4 * 100}%`

      text1.textContent = props.texts[textIndex % props.texts.length]
      text2.textContent = props.texts[(textIndex + 1) % props.texts.length]
    }

    const doMorph = () => {
      morph -= cooldown
      cooldown = 0

      let fraction = morph / morphTime

      if (fraction > 1) {
        cooldown = cooldownTime
        fraction = 1
      }

      setStyles(fraction)

      if (fraction === 1) {
        textIndex++
      }
    }

    const doCooldown = () => {
      morph = 0
      if (text1 && text2) {
        text2.style.filter = 'none'
        text2.style.opacity = '100%'
        text1.style.filter = 'none'
        text1.style.opacity = '0%'
      }
    }

    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const newTime = new Date()
      const dt = (newTime.getTime() - time.getTime()) / 1000
      time = newTime

      cooldown -= dt

      if (cooldown <= 0)
        doMorph()
      else
        doCooldown()
    }

    animate()
    return () => cancelAnimationFrame(animationFrameId)
  })

  return (
    <>
      <span class="absolute inset-x-0 top-0 m-auto inline-block w-full" ref={text1} />
      <span class="absolute inset-x-0 top-0 m-auto inline-block w-full" ref={text2} />
    </>
  )
}

function SvgFilters() {
  return (
    <svg
      id="filters"
      class="fixed size-0"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="threshold">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function MorphingText(props: MorphingTextProps) {
  return (
    <div
      class={cn(
        `
          relative mx-auto h-16 w-full max-w-3xl text-center font-sans
          text-[40pt] leading-none font-bold
          filter-[url(#threshold)_blur(0.6px)]
          md:h-24
          lg:text-[6rem]
        `,
        props.className,
      )}
    >
      <Texts texts={props.texts} />
      <SvgFilters />
    </div>
  )
}
