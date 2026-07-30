import { untrack } from 'solid-js'
import { PreviewPanel } from '@/components/PreviewPanel'
import { demoComponentMap } from '@/demos/__generated__/demos'

interface DynamicPreviewProps {
  demo: keyof typeof demoComponentMap
  align?: 'center' | 'start' | 'end'
}

export function DynamicPreview(props: DynamicPreviewProps) {
  const Demo = demoComponentMap[untrack(() => props.demo)]
  return <PreviewPanel align={props.align}>{Demo ? <Demo /> : null}</PreviewPanel>
}
