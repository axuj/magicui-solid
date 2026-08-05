import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from 'canvas-confetti'
import type { JSX } from 'solid-js'
import confetti from 'canvas-confetti'
import { onCleanup, onMount, splitProps } from 'solid-js'

import { Button } from '@/components/ui/button'

export interface ConfettiRef {
  fire: (options?: ConfettiOptions) => Promise<void> | void
}

interface ConfettiProps extends Omit<JSX.CanvasHTMLAttributes<HTMLCanvasElement>, 'children' | 'class' | 'ref'> {
  options?: ConfettiOptions
  globalOptions?: ConfettiGlobalOptions
  manualstart?: boolean
  children?: JSX.Element
  class?: string
  ref?: (api: ConfettiRef) => void
}

export function Confetti(props: ConfettiProps) {
  const [local, rest] = splitProps(props, ['options', 'globalOptions', 'manualstart', 'children', 'class', 'ref'])

  let canvasNode: HTMLCanvasElement | undefined
  let instance: ConfettiInstance | null = null

  const fire = async (opts: ConfettiOptions = {}) => {
    try {
      await instance?.({
        ...local.options,
        ...opts,
      })
    }
    catch (error) {
      console.error('Confetti error:', error)
    }
  }

  const api: ConfettiRef = { fire }

  onMount(() => {
    props.ref?.(api)
    if (canvasNode && !instance) {
      instance = confetti.create(canvasNode, {
        resize: true,
        useWorker: true,
        ...local.globalOptions,
      })
    }
    if (!local.manualstart)
      void fire()
  })

  onCleanup(() => {
    instance?.reset()
    instance = null
  })

  return (
    <>
      <canvas ref={canvasNode} class={local.class} {...rest} />
      {props.children}
    </>
  )
}

export interface ConfettiButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick' | 'type'> {
  options?: ConfettiOptions & ConfettiGlobalOptions & { canvas?: HTMLCanvasElement }
  children?: JSX.Element
  class?: string
  onClick?: (event: MouseEvent) => void
}

export function ConfettiButton(props: ConfettiButtonProps) {
  const [local, rest] = splitProps(props, ['children', 'options', 'onClick'])

  const handleClick = async (event: MouseEvent) => {
    try {
      local.onClick?.(event)
      if (event.defaultPrevented)
        return

      const target = event.currentTarget
      if (target && 'getBoundingClientRect' in target) {
        const rect = (target as HTMLElement).getBoundingClientRect()
        const origin = {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        }

        await confetti({
          zIndex: 9999,
          ...local.options,
          origin,
        })
      }
    }
    catch (error) {
      console.error('Confetti button error:', error)
    }
  }

  return (
    <Button type="button" onClick={handleClick} {...rest}>
      {props.children}
    </Button>
  )
}
