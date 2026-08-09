import { ChevronRight } from 'lucide-solid'

import { TechStack } from '@/components/tech-stack'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RainbowButton } from '@/registry/magicui/rainbow-button.tsx'

interface HeroProps {
  announcementHref?: string
  announcementTitle?: string
}

export function Hero(props: HeroProps) {
  const announcementHref = () => props.announcementHref ?? '/docs/'
  const announcementTitle = () => props.announcementTitle ?? 'MagicUI Solid'

  return (
    <section id="hero">
      <div class="
        relative h-full overflow-hidden py-5
        md:py-14
      "
      >
        <div class="z-10 flex flex-col">
          <div class="
            mt-10 grid grid-cols-1
            md:mt-20
          "
          >
            <div class="
              flex flex-col items-start gap-6 px-7 pb-8 text-center
              md:items-center md:px-10
            "
            >
              <a
                href={announcementHref()}
                class={cn(
                  buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                  }),
                  'rounded-full',
                )}
              >
                <span aria-hidden="true">🎉</span>
                <Separator class="mx-2 h-4" orientation="vertical" />
                Introducing
                {' '}
                {announcementTitle()}
                <ChevronRight class="ml-1 size-4 text-muted-foreground" />
              </a>
              <div class="
                relative flex flex-col gap-4
                md:items-center
                lg:flex-row
              "
              >
                <h1
                  class={cn(
                    `
                      text-black
                      dark:text-white
                    `,
                    `
                      relative mx-0 max-w-174 pt-5
                      md:mx-auto md:px-4 md:py-2
                    `,
                    `
                      text-left font-semibold tracking-tighter text-balance
                      md:text-center
                    `,
                    `
                      text-5xl
                      sm:text-7xl
                      md:text-7xl
                      lg:text-7xl
                    `,
                  )}
                >
                  UI library for Design Engineers
                </h1>
              </div>

              <p class="
                max-w-xl text-left text-base tracking-tight text-balance
                text-primary
                md:text-center md:text-lg
              "
              >
                75+ free and open-source animated components and effects built
                with
                {' '}
                <b class="
                  font-[550]
                  dark:font-[580]
                "
                >
                  SolidJS
                </b>
                ,
                {' '}
                <b class="
                  font-[550]
                  dark:font-[580]
                "
                >
                  Typescript
                </b>
                ,
                {' '}
                <b class="
                  font-[550]
                  dark:font-[580]
                "
                >
                  Tailwind CSS
                </b>
                , and
                {' '}
                <b class="
                  font-[550]
                  dark:font-[580]
                "
                >
                  Motion
                </b>
                .
                <br />
                Perfect companion for
                {' '}
                <b class="
                  font-[550]
                  dark:font-[580]
                "
                >
                  shadcn/ui
                </b>
                .
              </p>

              <div class="
                flex w-full flex-col gap-4 gap-y-2
                md:mx-auto md:max-w-xs md:flex-row md:justify-center
              "
              >
                <RainbowButton
                  as="a"
                  href="/docs/components/"
                  variant="default"
                  size="lg"
                  class="w-full gap-2"
                >
                  Browse Components
                  <ChevronRight class="
                    ml-1 size-4 shrink-0 transition-all duration-300 ease-out
                    group-hover:translate-x-1
                  "
                  />
                </RainbowButton>
                <RainbowButton
                  as="a"
                  href="/docs/"
                  variant="outline"
                  size="lg"
                  class="w-full gap-2"
                >
                  Read the Docs
                  <ChevronRight class="
                    ml-1 size-4 shrink-0 transition-all duration-300 ease-out
                    group-hover:translate-x-1
                  "
                  />
                </RainbowButton>
              </div>
            </div>
          </div>

          <div class="
            relative mx-auto flex w-full max-w-56 items-center justify-center
          "
          >
            <TechStack
              class="mx-auto flex w-full items-center justify-between"
              technologies={[
                'solidjs',
                'typescript',
                'tailwindcss',
                'motion',
                'shadcn',
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
