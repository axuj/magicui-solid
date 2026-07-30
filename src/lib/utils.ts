import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  // eslint-disable-next-line tailwindcss/no-custom-classname
  return twMerge(clsx(inputs))
}

export { cn }
