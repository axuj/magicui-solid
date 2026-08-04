import { For, Show } from 'solid-js'
import { cn } from '@/lib/utils'

interface Avatar {
  imageUrl: string
  profileUrl: string
}

interface AvatarCirclesProps {
  class?: string
  numPeople?: number
  avatarUrls: Avatar[]
}

export function AvatarCircles(props: AvatarCirclesProps) {
  return (
    <div class={cn(`
      z-10 flex -space-x-4
      rtl:space-x-reverse
    `, props.class)}
    >
      <For each={props.avatarUrls}>
        {(avatar, index) => (
          <a href={avatar.profileUrl} target="_blank" rel="noopener noreferrer">
            <img
              class="
                size-10 rounded-full border-2 border-white
                dark:border-gray-800
              "
              src={avatar.imageUrl}
              width={40}
              height={40}
              alt={`Avatar ${index() + 1}`}
            />
          </a>
        )}
      </For>
      <Show when={(props.numPeople ?? 0) > 0}>
        <a
          class="
            flex size-10 items-center justify-center rounded-full border-2
            border-white bg-black text-center text-xs font-medium text-white
            hover:bg-gray-600
            dark:border-gray-800 dark:bg-white dark:text-black
          "
          href=""
        >
          +
          {props.numPeople}
        </a>
      </Show>
    </div>
  )
}
