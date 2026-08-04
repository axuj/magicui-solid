import { Home, Mail, Pencil } from 'lucide-solid'
import { buttonVariants } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Icons } from '@/demos/shared/icons'
import { cn } from '@/lib/utils'
import { Dock, DockIcon } from '@/registry/magicui/dock'

export function DockDemo() {
  return (
    <div class="flex flex-col items-center justify-center">
      <span class="
        pointer-events-none bg-linear-to-b from-black to-gray-300/80
        bg-clip-text text-center text-8xl! leading-none font-semibold
        whitespace-pre-wrap text-transparent
        dark:from-white dark:to-slate-900/10
      "
      >
        Dock
      </span>
      <Dock direction="middle">
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="Home">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Home class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="Blog">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Pencil class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Blog</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <div class="mx-1 h-full w-px bg-border" />
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="GitHub">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Icons.gitHub class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>GitHub</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="LinkedIn">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Icons.linkedin class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>LinkedIn</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="X">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Icons.x class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>X</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger aria-label="Send Email">
              <span
                class={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-12 rounded-full',
                )}
              >
                <Mail class="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send Email</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>
    </div>
  )
}
