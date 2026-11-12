import type { ThemeRegistration } from '@shikijs/types'
import type { JSX } from '@solidjs/web'

import { File } from '@lucide/solid'
import { createEffect, createMemo, createSignal, onSettled } from 'solid-js'

import { cn } from '@/lib/utils'

interface CodeComparisonProps {
  beforeCode: string
  afterCode: string
  language: string
  filename: string
  lightTheme: ThemeRegistration
  darkTheme: ThemeRegistration
  highlightColor?: string
}

export function CodeComparison(props: CodeComparisonProps) {
  const highlightColor = () => props.highlightColor ?? '#ff3333'
  const [theme, setTheme] = createSignal<'light' | 'dark'>('light')
  const [highlightedBefore, setHighlightedBefore] = createSignal('')
  const [highlightedAfter, setHighlightedAfter] = createSignal('')
  const [hasLeftFocus, setHasLeftFocus] = createSignal(false)
  const [hasRightFocus, setHasRightFocus] = createSignal(false)

  onSettled(() => {
    if (typeof document === 'undefined')
      return

    const root = document.documentElement
    const updateTheme = () => {
      setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light')
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  })

  const selectedTheme = createMemo(() =>
    theme() === 'dark' ? props.darkTheme : props.lightTheme,
  )

  createEffect(() => [highlightedBefore(), highlightedAfter()], ([highlightedBefore, highlightedAfter]) => {
    if (highlightedBefore || highlightedAfter) {
      setHasLeftFocus(highlightedBefore.includes('class="line focused"'))
      setHasRightFocus(highlightedAfter.includes('class="line focused"'))
    }
  })

  createEffect(() => [selectedTheme(), props.beforeCode, props.afterCode, props.language], ([theme, beforeCode, afterCode, language]) => {
    let cancelled = false

    async function highlightCode() {
      try {
        const { codeToHtml } = await import('shiki')
        const { transformerNotationHighlight, transformerNotationDiff, transformerNotationFocus } = await import('@shikijs/transformers')

        const before = await codeToHtml(beforeCode, {
          lang: language,
          theme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: 'v3' }),
            transformerNotationDiff({ matchAlgorithm: 'v3' }),
            transformerNotationFocus({ matchAlgorithm: 'v3' }),
          ],
        })
        const after = await codeToHtml(afterCode, {
          lang: language,
          theme,
          transformers: [
            transformerNotationHighlight({ matchAlgorithm: 'v3' }),
            transformerNotationDiff({ matchAlgorithm: 'v3' }),
            transformerNotationFocus({ matchAlgorithm: 'v3' }),
          ],
        })
        if (cancelled)
          return
        setHighlightedBefore(before)
        setHighlightedAfter(after)
      }
      catch (error) {
        console.error('Error highlighting code:', error)
        if (cancelled)
          return
        setHighlightedBefore(`<pre>${beforeCode}</pre>`)
        setHighlightedAfter(`<pre>${afterCode}</pre>`)
      }
    }
    highlightCode()

    // The effect callback has no owner: return the cleanup instead of
    // calling onCleanup, which would never run.
    return () => {
      cancelled = true
    }
  })

  const renderCode = (code: string, highlighted: string): JSX.Element => {
    if (highlighted) {
      return (
        <div
          style={{ '--highlight-color': highlightColor() }}
          class={cn(
            'size-full overflow-auto bg-background font-mono text-xs',
            '[&>pre]:h-full [&>pre]:w-screen! [&>pre]:py-2',
            '[&>pre>code]:inline-block! [&>pre>code]:w-full!',
            `
              [&>pre>code>span]:inline-block! [&>pre>code>span]:w-full
              [&>pre>code>span]:px-4 [&>pre>code>span]:py-0.5
            `,
            `
              [&>pre>code>.highlighted]:inline-block
              [&>pre>code>.highlighted]:w-full
              [&>pre>code>.highlighted]:bg-(--highlight-color)!
            `,
            `
              group-hover/left:[&>pre>code>:not(.focused)]:opacity-100!
              group-hover/left:[&>pre>code>:not(.focused)]:blur-none!
            `,
            `
              group-hover/right:[&>pre>code>:not(.focused)]:opacity-100!
              group-hover/right:[&>pre>code>:not(.focused)]:blur-none!
            `,
            `
              [&>pre>code>.add]:bg-[rgba(16,185,129,.16)]
              [&>pre>code>.remove]:bg-[rgba(244,63,94,.16)]
            `,
            `
              group-hover/left:[&>pre>code>:not(.focused)]:transition-all
              group-hover/left:[&>pre>code>:not(.focused)]:duration-300
            `,
            `
              group-hover/right:[&>pre>code>:not(.focused)]:transition-all
              group-hover/right:[&>pre>code>:not(.focused)]:duration-300
            `,
          )}
          // eslint-disable-next-line solid/no-innerhtml
          innerHTML={highlighted}
        />
      )
    }
    else {
      return (
        <pre class="
          h-full overflow-auto bg-background p-4 font-mono text-xs break-all
          text-foreground
        "
        >
          {code}
        </pre>
      )
    }
  }

  return (
    <div class="mx-auto w-full max-w-5xl">
      <div class="
        group relative w-full overflow-hidden rounded-md border border-border
      "
      >
        <div class="
          relative grid
          md:grid-cols-2
        "
        >
          <div
            class={cn(
              `
                leftside group/left border-primary/20
                md:border-r
              `,
              hasLeftFocus()
              && `
                [&>div>pre>code>:not(.focused)]:opacity-50!
                [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!
              `,
              `
                [&>div>pre>code>:not(.focused)]:transition-all
                [&>div>pre>code>:not(.focused)]:duration-300
              `,
            )}
          >
            <div class="
              flex items-center border-b border-primary/20 bg-accent p-2 text-sm
              text-foreground
            "
            >
              <File class="mr-2 size-4" />
              {props.filename}
              <span class="
                ml-auto hidden
                md:block
              "
              >
                before
              </span>
            </div>
            {renderCode(props.beforeCode, highlightedBefore())}
          </div>
          <div
            class={cn(
              `
                rightside group/right border-t border-primary/20
                md:border-t-0
              `,
              hasRightFocus()
              && `
                [&>div>pre>code>:not(.focused)]:opacity-50!
                [&>div>pre>code>:not(.focused)]:blur-[0.095rem]!
              `,
              `
                [&>div>pre>code>:not(.focused)]:transition-all
                [&>div>pre>code>:not(.focused)]:duration-300
              `,
            )}
          >
            <div class="
              flex items-center border-b border-primary/20 bg-accent p-2 text-sm
              text-foreground
            "
            >
              <File class="mr-2 size-4" />
              {props.filename}
              <span class="
                ml-auto hidden
                md:block
              "
              >
                after
              </span>
            </div>
            {renderCode(props.afterCode, highlightedAfter())}
          </div>
        </div>
        <div class="
          absolute top-1/2 left-1/2 hidden size-8 -translate-1/2 items-center
          justify-center rounded-md border border-primary/20 bg-accent text-xs
          text-foreground
          md:flex
        "
        >
          VS
        </div>
      </div>
    </div>
  )
}
