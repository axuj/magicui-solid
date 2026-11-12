import type { PolymorphicProps } from '@kobalte/core/polymorphic'

import type { ValidComponent } from '@solidjs/web'
import * as TextFieldPrimitive from '@kobalte/core/text-field'

import { cva } from 'class-variance-authority'
import { omit } from 'solid-js'

import { cn } from '@/lib/utils'

type TextFieldRootProps<T extends ValidComponent = 'div'>
  = TextFieldPrimitive.TextFieldRootProps<T> & {
    class?: string | undefined
  }

function TextField<T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldRootProps<T>>,
) {
  const others = omit(props, 'class') as Record<string, unknown>
  return <TextFieldPrimitive.Root class={cn('flex flex-col gap-1', props.class)} {...others} />
}

type TextFieldInputProps<T extends ValidComponent = 'input'>
  = TextFieldPrimitive.TextFieldInputProps<T> & {
    class?: string | undefined
    type?:
      | 'button'
      | 'checkbox'
      | 'color'
      | 'date'
      | 'datetime-local'
      | 'email'
      | 'file'
      | 'hidden'
      | 'image'
      | 'month'
      | 'number'
      | 'password'
      | 'radio'
      | 'range'
      | 'reset'
      | 'search'
      | 'submit'
      | 'tel'
      | 'text'
      | 'time'
      | 'url'
      | 'week'
  }

function TextFieldInput<T extends ValidComponent = 'input'>(
  props: PolymorphicProps<T, TextFieldInputProps<T>>,
) {
  const others = omit(props, 'type', 'class') as Record<string, unknown>
  return (
    <TextFieldPrimitive.Input
      type={props.type ?? 'text'}
      class={cn(
        `
          flex h-10 w-full rounded-md border border-input bg-transparent px-3
          py-2 text-sm ring-offset-background
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2 focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
          data-invalid:border-destructive data-invalid:text-destructive
        `,
        props.class,
      )}
      {...others}
    />
  )
}

type TextFieldTextAreaProps<T extends ValidComponent = 'textarea'>
  = TextFieldPrimitive.TextFieldTextAreaProps<T> & { class?: string | undefined }

function TextFieldTextArea<T extends ValidComponent = 'textarea'>(
  props: PolymorphicProps<T, TextFieldTextAreaProps<T>>,
) {
  const others = omit(props, 'class') as Record<string, unknown>
  return (
    <TextFieldPrimitive.TextArea
      class={cn(
        `
          flex min-h-20 w-full rounded-md border border-input bg-background px-3
          py-2 text-sm ring-offset-background
          placeholder:text-muted-foreground
          focus-visible:ring-2 focus-visible:ring-ring
          focus-visible:ring-offset-2 focus-visible:outline-none
          disabled:cursor-not-allowed disabled:opacity-50
        `,
        props.class,
      )}
      {...others}
    />
  )
}

const labelVariants = cva(
  `
    text-sm leading-none font-medium
    peer-disabled:cursor-not-allowed peer-disabled:opacity-70
  `,
  {
    variants: {
      variant: {
        label: 'data-invalid:text-destructive',
        description: 'font-normal text-muted-foreground',
        error: 'text-xs text-destructive',
      },
    },
    defaultVariants: {
      variant: 'label',
    },
  },
)

type TextFieldLabelProps<T extends ValidComponent = 'label'>
  = TextFieldPrimitive.TextFieldLabelProps<T> & { class?: string | undefined }

function TextFieldLabel<T extends ValidComponent = 'label'>(
  props: PolymorphicProps<T, TextFieldLabelProps<T>>,
) {
  const others = omit(props, 'class') as Record<string, unknown>
  return <TextFieldPrimitive.Label class={cn(labelVariants(), props.class)} {...others} />
}

type TextFieldDescriptionProps
  = TextFieldPrimitive.TextFieldDescriptionProps & {
    class?: string | undefined
  }

function TextFieldDescription<T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldDescriptionProps>,
) {
  const others = omit(props, 'class') as Record<string, unknown>
  return (
    <TextFieldPrimitive.Description
      class={cn(labelVariants({ variant: 'description' }), props.class)}
      {...others}
    />
  )
}

type TextFieldErrorMessageProps<T extends ValidComponent = 'div'>
  = TextFieldPrimitive.TextFieldErrorMessageProps<T> & {
    class?: string | undefined
  }

function TextFieldErrorMessage<T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, TextFieldErrorMessageProps<T>>,
) {
  const others = omit(props, 'class') as Record<string, unknown>
  return (
    <TextFieldPrimitive.ErrorMessage
      class={cn(labelVariants({ variant: 'error' }), props.class)}
      {...others}
    />
  )
}

export {
  TextField,
  TextFieldDescription,
  TextFieldErrorMessage,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
}
