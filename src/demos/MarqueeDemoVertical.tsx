import { For } from 'solid-js'

import { Marquee } from '@/registry/magicui/marquee'

const reviews = [
  { name: 'Jack', username: '@jack', body: 'I\'ve never seen anything like this before. It\'s amazing. I love it.', img: 'https://avatar.vercel.sh/jack' },
  { name: 'Jill', username: '@jill', body: 'I don\'t know what to say. I\'m speechless. This is amazing.', img: 'https://avatar.vercel.sh/jill' },
  { name: 'John', username: '@john', body: 'I\'m at a loss for words. This is amazing. I love it.', img: 'https://avatar.vercel.sh/john' },
  { name: 'Jane', username: '@jane', body: 'I\'m at a loss for words. This is amazing. I love it.', img: 'https://avatar.vercel.sh/jane' },
  { name: 'Jenny', username: '@jenny', body: 'I\'m at a loss for words. This is amazing. I love it.', img: 'https://avatar.vercel.sh/jenny' },
  { name: 'James', username: '@james', body: 'I\'m at a loss for words. This is amazing. I love it.', img: 'https://avatar.vercel.sh/james' },
]

const firstRow = reviews.slice(0, reviews.length / 2)
const secondRow = reviews.slice(reviews.length / 2)

function ReviewCard(props: { img: string, name: string, username: string, body: string }) {
  return (
    <figure
      class="
        relative h-full w-fit cursor-pointer overflow-hidden rounded-xl border
        border-gray-950/10 bg-gray-950/1 p-4
        hover:bg-gray-950/5
        sm:w-36
        dark:border-gray-50/10 dark:bg-gray-50/10
        dark:hover:bg-gray-50/15
      "
    >
      <div class="flex flex-row items-center gap-2">
        <img class="rounded-full" width="32" height="32" alt="" src={props.img} />
        <div class="flex flex-col">
          <figcaption class="
            text-sm font-medium
            dark:text-white
          "
          >
            {props.name}
          </figcaption>
          <p class="
            text-xs font-medium
            dark:text-white/40
          "
          >
            {props.username}
          </p>
        </div>
      </div>
      <blockquote class="mt-2 text-sm">{props.body}</blockquote>
    </figure>
  )
}

export function MarqueeDemoVertical() {
  return (
    <div class="
      relative flex h-125 w-full flex-row items-center justify-center
      overflow-hidden
    "
    >
      <Marquee pauseOnHover vertical class="[--duration:20s]">
        <For each={firstRow}>{review => <ReviewCard {...review} />}</For>
      </Marquee>
      <Marquee reverse pauseOnHover vertical class="[--duration:20s]">
        <For each={secondRow}>{review => <ReviewCard {...review} />}</For>
      </Marquee>
      <div class="
        pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-linear-to-b
        from-background
      "
      />
      <div class="
        pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t
        from-background
      "
      />
    </div>
  )
}
