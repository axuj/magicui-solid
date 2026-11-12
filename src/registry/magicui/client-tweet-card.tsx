import type { JSX } from '@solidjs/web'
import { isServer } from '@solidjs/web'

import { createEffect, createMemo, createSignal, For, omit, Show } from 'solid-js'

import { cn } from '@/lib/utils'

/* ---------- types (mirrors react-tweet) ---------- */

type Indices = [number, number]

interface HashtagEntity {
  indices: Indices
  text: string
}

interface UserMentionEntity {
  id_str: string
  indices: Indices
  name: string
  screen_name: string
}

interface MediaEntity {
  display_url: string
  expanded_url: string
  indices: Indices
  url: string
}

interface UrlEntity {
  display_url: string
  expanded_url: string
  indices: Indices
  url: string
}

interface SymbolEntity {
  indices: Indices
  text: string
}

interface TweetEntities {
  hashtags: HashtagEntity[]
  urls: UrlEntity[]
  user_mentions: UserMentionEntity[]
  symbols: SymbolEntity[]
  media?: MediaEntity[]
}

interface HighlightedBadge {
  url: string
}

interface UserHighlightedLabel {
  description?: string
  badge?: HighlightedBadge
  url?: { url: string, url_type: 'DeepLink' }
  user_label_type: 'BusinessLabel'
  user_label_display_type: 'Badge'
}

interface TweetUser {
  id_str: string
  name: string
  profile_image_url_https: string
  profile_image_shape: 'Circle' | 'Square' | 'Hexagon'
  screen_name: string
  verified: boolean
  verified_type?: 'Business' | 'Government'
  is_blue_verified: boolean
  highlighted_label?: UserHighlightedLabel
}

interface RGB {
  red: number
  green: number
  blue: number
}

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Size {
  h: number
  w: number
  resize: string
}

interface VideoInfo {
  aspect_ratio: [number, number]
  variants: {
    bitrate?: number
    content_type: 'video/mp4' | 'application/x-mpegURL'
    url: string
  }[]
}

interface MediaBase {
  display_url: string
  expanded_url: string
  ext_media_availability: {
    status: string
  }
  ext_media_color: {
    palette: {
      percentage: number
      rgb: RGB
    }[]
  }
  indices: Indices
  media_url_https: string
  original_info: {
    height: number
    width: number
    focus_rects: Rect[]
  }
  sizes: {
    large: Size
    medium: Size
    small: Size
    thumb: Size
  }
  url: string
}

interface MediaPhoto extends MediaBase {
  type: 'photo'
  ext_alt_text?: string
}

interface MediaAnimatedGif extends MediaBase {
  type: 'animated_gif'
  video_info: VideoInfo
}

interface MediaVideo extends MediaBase {
  type: 'video'
  video_info: VideoInfo
}

type MediaDetails = MediaPhoto | MediaAnimatedGif | MediaVideo

interface TweetPhoto {
  backgroundColor: RGB
  cropCandidates: Rect[]
  expandedUrl: string
  url: string
  width: number
  height: number
}

interface TweetVideo {
  aspectRatio: [number, number]
  contentType: string
  durationMs: number
  mediaAvailability: {
    status: string
  }
  poster: string
  variants: {
    type: string
    src: string
  }[]
  videoId: {
    type: string
    id: string
  }
  viewCount: number
}

interface TweetEditControl {
  edit_tweet_ids: string[]
  editable_until_msecs: string
  is_edit_eligible: boolean
  edits_remaining: string
}

interface TweetBase {
  lang: string
  created_at: string
  display_text_range: Indices
  entities?: TweetEntities
  id_str: string
  text: string
  user: TweetUser
  edit_control: TweetEditControl
  isEdited: boolean
  isStaleEdit: boolean
  note_tweet?: {
    id: string
  }
}

export interface Tweet extends TweetBase {
  __typename: 'Tweet'
  favorite_count: number
  mediaDetails?: MediaDetails[]
  photos?: TweetPhoto[]
  video?: TweetVideo
  conversation_count: number
  news_action_type: 'conversation'
  quoted_tweet?: QuotedTweet
  in_reply_to_screen_name?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id_str?: string
  parent?: TweetParent
  possibly_sensitive?: boolean
  card?: {
    binding_values?: {
      thumbnail_image_large?: {
        image_value?: {
          url?: string
        }
      }
    }
  }
}

interface TweetParent extends TweetBase {
  reply_count: number
  retweet_count: number
  favorite_count: number
}

interface QuotedTweet extends TweetBase {
  reply_count: number
  retweet_count: number
  favorite_count: number
  mediaDetails?: MediaDetails[]
  self_thread: {
    id_str: string
  }
}

/* ---------- twitter api error ---------- */

export class TwitterApiError extends Error {
  status: number
  data: unknown

  constructor({
    message,
    status,
    data,
  }: {
    message: string
    status: number
    data: unknown
  }) {
    super(message)
    this.name = 'TwitterApiError'
    this.status = status
    this.data = data
  }
}

/* ---------- enrich helpers ---------- */

function getTweetUrl(tweet: TweetBase) {
  return `https://x.com/${tweet.user.screen_name}/status/${tweet.id_str}`
}

function getUserUrl(usernameOrTweet: string | TweetBase) {
  return `https://x.com/${
    typeof usernameOrTweet === 'string'
      ? usernameOrTweet
      : usernameOrTweet.user.screen_name
  }`
}

function getLikeUrl(tweet: TweetBase) {
  return `https://x.com/intent/like?tweet_id=${tweet.id_str}`
}

function getReplyUrl(tweet: TweetBase) {
  return `https://x.com/intent/tweet?in_reply_to=${tweet.id_str}`
}

function getFollowUrl(tweet: TweetBase) {
  return `https://x.com/intent/follow?screen_name=${tweet.user.screen_name}`
}

function getHashtagUrl(hashtag: HashtagEntity) {
  return `https://x.com/hashtag/${hashtag.text}`
}

function getSymbolUrl(symbol: SymbolEntity) {
  return `https://x.com/search?q=%24${symbol.text}`
}

function getInReplyToUrl(tweet: Tweet) {
  return `https://x.com/${tweet.in_reply_to_screen_name}/status/${tweet.in_reply_to_status_id_str}`
}

interface TextEntity {
  indices: Indices
  type: 'text'
}

type TweetEntity
  = | HashtagEntity
    | UserMentionEntity
    | UrlEntity
    | MediaEntity
    | SymbolEntity

type EntityWithType
  = | TextEntity
    | (HashtagEntity & { type: 'hashtag' })
    | (UserMentionEntity & { type: 'mention' })
    | (UrlEntity & { type: 'url' })
    | (MediaEntity & { type: 'media' })
    | (SymbolEntity & { type: 'symbol' })

type Entity = {
  text: string
} & (
  | TextEntity
  | (HashtagEntity & { type: 'hashtag', href: string })
  | (UserMentionEntity & { type: 'mention', href: string })
  | (UrlEntity & { type: 'url', href: string })
  | (MediaEntity & { type: 'media', href: string })
  | (SymbolEntity & { type: 'symbol', href: string })
)

function getEntities(tweet: TweetBase): Entity[] {
  const textMap = Array.from(tweet.text)
  const result: EntityWithType[] = [
    { indices: tweet.display_text_range, type: 'text' },
  ]

  const { entities } = tweet
  if (entities) {
    addEntities(result, 'hashtag', entities.hashtags)
    addEntities(result, 'mention', entities.user_mentions)
    addEntities(result, 'url', entities.urls)
    addEntities(result, 'symbol', entities.symbols)
    addEntities(result, 'media', entities.media)
  }
  fixRange(tweet, result)

  return result.map((entity) => {
    const text = textMap.slice(entity.indices[0], entity.indices[1]).join('')
    switch (entity.type) {
      case 'hashtag':
        return Object.assign(entity, { href: getHashtagUrl(entity), text })
      case 'mention':
        return Object.assign(entity, {
          href: getUserUrl(entity.screen_name),
          text,
        })
      case 'url':
      case 'media':
        return Object.assign(entity, {
          href: entity.expanded_url,
          text: entity.display_url,
        })
      case 'symbol':
        return Object.assign(entity, { href: getSymbolUrl(entity), text })
      default:
        return Object.assign(entity, { text })
    }
  })
}

function addEntities(
  result: EntityWithType[],
  type: EntityWithType['type'],
  entities?: TweetEntity[],
) {
  if (!entities?.length)
    return

  for (const entity of entities) {
    for (const [i, item] of result.entries()) {
      if (
        item.indices[0] > entity.indices[0]
        || item.indices[1] < entity.indices[1]
      ) {
        continue
      }

      const items = [{ ...entity, type }] as EntityWithType[]

      if (item.indices[0] < entity.indices[0]) {
        items.unshift({
          indices: [item.indices[0], entity.indices[0]],
          type: 'text',
        })
      }
      if (item.indices[1] > entity.indices[1]) {
        items.push({
          indices: [entity.indices[1], item.indices[1]],
          type: 'text',
        })
      }

      result.splice(i, 1, ...items)
      break // Break out of the loop to avoid iterating over the new items
    }
  }
}

/**
 * Update display_text_range to work w/ Array.from
 * Array.from is unicode aware, unlike string.slice()
 */
function fixRange(tweet: TweetBase, entities: EntityWithType[]) {
  const media = tweet.entities?.media
  if (media?.length && media[0].indices[0] < tweet.display_text_range[1]) {
    tweet.display_text_range[1] = media[0].indices[0]
  }
  const lastEntity = entities.at(-1)
  if (lastEntity && lastEntity.indices[1] > tweet.display_text_range[1]) {
    lastEntity.indices[1] = tweet.display_text_range[1]
  }
}

type EnrichedTweet = Omit<Tweet, 'entities' | 'quoted_tweet'> & {
  url: string
  user: {
    url: string
    follow_url: string
  }
  like_url: string
  reply_url: string
  in_reply_to_url?: string
  entities: Entity[]
  quoted_tweet?: EnrichedQuotedTweet
}

type EnrichedQuotedTweet = Omit<QuotedTweet, 'entities'> & {
  url: string
  entities: Entity[]
}

function enrichTweet(tweet: Tweet): EnrichedTweet {
  return {
    ...tweet,
    url: getTweetUrl(tweet),
    user: {
      ...tweet.user,
      url: getUserUrl(tweet),
      follow_url: getFollowUrl(tweet),
    },
    like_url: getLikeUrl(tweet),
    reply_url: getReplyUrl(tweet),
    in_reply_to_url: tweet.in_reply_to_screen_name
      ? getInReplyToUrl(tweet)
      : undefined,
    entities: getEntities(tweet),
    quoted_tweet: tweet.quoted_tweet
      ? {
          ...tweet.quoted_tweet,
          url: getTweetUrl(tweet.quoted_tweet),
          entities: getEntities(tweet.quoted_tweet),
        }
      : undefined,
  }
}

function withSafeEntities<T extends { entities?: Tweet['entities'] }>(tweet: T): T & { entities: Tweet['entities'] } {
  return {
    ...tweet,
    entities: {
      ...tweet.entities,
      hashtags: tweet.entities?.hashtags ?? [],
      urls: tweet.entities?.urls ?? [],
      symbols: tweet.entities?.symbols ?? [],
      user_mentions: tweet.entities?.user_mentions ?? [],
    },
  }
}

/* ---------- icons ---------- */

interface TwitterIconProps {
  class?: string
  [key: string]: unknown
}

function Twitter(props: TwitterIconProps) {
  const rest = omit(props, 'class')
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      stroke-width="0"
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      class={props.class}
      {...rest}
    >
      <g>
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" />
      </g>
    </svg>
  )
}

function Verified(props: TwitterIconProps) {
  const rest = omit(props, 'class')
  return (
    <svg
      aria-label="Verified Account"
      viewBox="0 0 24 24"
      class={props.class}
      {...rest}
    >
      <g fill="currentColor">
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
      </g>
    </svg>
  )
}

/* ---------- helpers ---------- */

export function truncate(str: string | null, length: number) {
  if (!str || str.length <= length)
    return str
  return `${str.slice(0, length - 3)}...`
}

function Skeleton(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const rest = omit(props, 'class')
  return <div class={cn('rounded-md bg-primary/10', props.class)} {...rest} />
}

export function TweetSkeleton(props: { class?: string, [key: string]: unknown }) {
  const rest = omit(props, 'class')
  return (
    <div
      class={cn(
        'flex size-full max-h-max min-w-72 flex-col gap-2 rounded-xl border p-4',
        props.class,
      )}
      {...rest}
    >
      <div class="flex flex-row gap-2">
        <Skeleton class="size-10 shrink-0 rounded-full" />
        <Skeleton class="h-10 w-full" />
      </div>
      <Skeleton class="h-20 w-full" />
    </div>
  )
}

export function TweetNotFound(props: { class?: string, [key: string]: unknown }) {
  const rest = omit(props, 'class')
  return (
    <div
      class={cn(
        `
          flex size-full flex-col items-center justify-center gap-2 rounded-lg
          border p-4
        `,
        props.class,
      )}
      {...rest}
    >
      <h3>Tweet not found</h3>
    </div>
  )
}

export function TweetHeader(props: { tweet: EnrichedTweet }) {
  return (
    <div class="flex flex-row items-start justify-between tracking-normal">
      <div class="flex items-center space-x-3">
        <a
          href={props.tweet.user.url}
          target="_blank"
          rel="noreferrer"
          class="shrink-0"
        >
          <img
            title={`Profile picture of ${props.tweet.user.name}`}
            alt={props.tweet.user.screen_name}
            height={48}
            width={48}
            src={props.tweet.user.profile_image_url_https}
            class="overflow-hidden rounded-full border border-border/50"
          />
        </a>
        <div class="flex flex-col gap-0.5">
          <a
            href={props.tweet.user.url}
            target="_blank"
            rel="noreferrer"
            class="
              flex items-center font-medium whitespace-nowrap text-foreground
              transition-opacity
              hover:opacity-80
            "
          >
            {truncate(props.tweet.user.name, 20)}
            <Show when={props.tweet.user.verified || props.tweet.user.is_blue_verified}>
              <Verified class="ml-1 inline size-4 text-blue-500" />
            </Show>
          </a>
          <div class="flex items-center space-x-1">
            <a
              href={props.tweet.user.url}
              target="_blank"
              rel="noreferrer"
              class="
                text-sm text-muted-foreground transition-colors
                hover:text-foreground
              "
            >
              @
              {truncate(props.tweet.user.screen_name, 16)}
            </a>
          </div>
        </div>
      </div>
      <a href={props.tweet.url} target="_blank" rel="noreferrer">
        <span class="sr-only">Link to tweet</span>
        <Twitter class="
          size-5 items-start text-muted-foreground transition-all ease-in-out
          hover:scale-105 hover:text-foreground
        "
        />
      </a>
    </div>
  )
}

export function TweetBody(props: { tweet: EnrichedTweet }) {
  return (
    <div class="text-[15px] leading-relaxed tracking-normal wrap-break-word">
      <For each={props.tweet.entities}>
        {(entity) => {
          switch (entity.type) {
            case 'url':
            case 'symbol':
            case 'hashtag':
            case 'mention':
              return (
                <a
                  href={entity.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="
                    text-[15px] font-normal text-muted-foreground
                    transition-colors
                    hover:text-foreground
                  "
                >
                  <span>{entity.text}</span>
                </a>
              )
            case 'text':
              return (
                <span
                  class="text-[15px] font-normal text-foreground"
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={entity.text}
                />
              )
            default:
              return null
          }
        }}
      </For>
    </div>
  )
}

export function TweetMedia(props: { tweet: EnrichedTweet }) {
  const thumbnailUrl = createMemo(() =>
    props.tweet.card?.binding_values?.thumbnail_image_large?.image_value?.url,
  )
  return (
    <Show
      when={props.tweet.video || props.tweet.photos || thumbnailUrl()}
    >
      <div class="flex flex-1 items-center justify-center">
        <Show when={props.tweet.video}>
          <video
            poster={props.tweet.video!.poster}
            autoplay
            loop
            muted
            playsinline
            class="rounded-xl border shadow-sm"
          >
            <source src={props.tweet.video!.variants[0].src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Show>
        <Show when={props.tweet.photos}>
          <div class="
            relative flex transform-gpu snap-x snap-mandatory gap-4
            overflow-x-auto
          "
          >
            <div class="
              shrink-0 snap-center
              sm:w-2
            "
            />
            <For each={props.tweet.photos ?? []}>
              {photo => (
                <img
                  src={photo.url}
                  width={photo.width}
                  height={photo.height}
                  title={`Photo by ${props.tweet.user.name}`}
                  alt={props.tweet.text}
                  class="
                    h-64 w-5/6 shrink-0 snap-center snap-always rounded-xl
                    border object-cover shadow-sm
                  "
                />
              )}
            </For>
            <div class="
              shrink-0 snap-center
              sm:w-2
            "
            />
          </div>
        </Show>
        <Show
          when={!props.tweet.video && !props.tweet.photos && thumbnailUrl()}
        >
          <img
            src={thumbnailUrl()}
            class="h-64 rounded-xl border object-cover shadow-sm"
            alt={props.tweet.text}
          />
        </Show>
      </div>
    </Show>
  )
}

/* ---------- main components ---------- */

export interface MagicTweetProps extends JSX.HTMLAttributes<HTMLDivElement> {
  tweet: Tweet
}

export function MagicTweet(props: MagicTweetProps) {
  const rest = omit(props, 'tweet', 'class')
  const safeTweet = createMemo((): Tweet => ({
    ...withSafeEntities(props.tweet),
    quoted_tweet: props.tweet.quoted_tweet
      ? withSafeEntities(props.tweet.quoted_tweet)
      : undefined,
  }))
  const enrichedTweet = createMemo(() => enrichTweet(safeTweet()))
  return (
    <div
      class={cn(
        `
          relative flex h-fit w-full max-w-lg flex-col gap-4 overflow-hidden
          rounded-xl border p-5
        `,
        props.class,
      )}
      {...rest}
    >
      <TweetHeader tweet={enrichedTweet()} />
      <TweetBody tweet={enrichedTweet()} />
      <TweetMedia tweet={enrichedTweet()} />
    </div>
  )
}

export interface TwitterComponents {
  TweetNotFound?: typeof TweetNotFound
}

export type TweetProps = {
  fallback?: JSX.Element
  components?: TwitterComponents
  fetchOptions?: RequestInit
  onError?: (error: unknown) => unknown
} & (
  | {
    id: string
    apiUrl?: string
  }
  | {
    id?: string
    apiUrl: string | undefined
  }
)

export function ClientTweetCard(props: TweetProps & { class?: string }) {
  const rest = omit(props, 'id', 'apiUrl', 'fallback', 'components', 'fetchOptions', 'onError')

  const [tweet, setTweet] = createSignal<Tweet | null | undefined>(undefined)
  const [tweetError, setTweetError] = createSignal<unknown>(undefined)
  const tweetLoading = () => tweet() === undefined && tweetError() === undefined

  // createResource was removed in 2.0. Refetch on id/apiUrl changes; data
  // stays undefined while pending and error is set on failure.
  createEffect(
    () => (isServer || !props.id ? undefined : { id: props.id, apiUrl: props.apiUrl, fetchOptions: props.fetchOptions }),
    (params) => {
      if (!params)
        return

      let cancelled = false
      const url = params.apiUrl || `https://react-tweet.vercel.app/api/tweet/${params.id}`

      fetch(url, params.fetchOptions)
        .then(async (res) => {
          if (cancelled)
            return
          const json = await res.json() as { data?: Tweet }
          if (res.ok) {
            setTweet(json.data ?? null)
            return
          }
          throw new TwitterApiError({
            message: `Failed to fetch tweet at "${url}" with "${res.status}".`,
            data: json,
            status: res.status,
          })
        })
        .catch((err) => {
          if (!cancelled)
            setTweetError(err)
        })

      return () => {
        cancelled = true
      }
    },
  )

  const NotFound = () => {
    const Component = props.components?.TweetNotFound ?? TweetNotFound
    return <Component error={props.onError ? props.onError(tweetError()) : tweetError()} />
  }

  return (
    <Show when={!isServer && !tweetLoading()} fallback={(props.fallback ?? <TweetSkeleton />)}>
      <Show when={!tweetError() && tweet()} fallback={<NotFound />}>
        <MagicTweet tweet={tweet()!} {...rest} />
      </Show>
    </Show>
  )
}
