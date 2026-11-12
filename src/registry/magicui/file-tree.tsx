import type { JSX } from '@solidjs/web'
import type { Accessor } from 'solid-js'

import * as AccordionPrimitive from '@kobalte/core/accordion'
import { File as FileIcon, Folder as FolderIcon, FolderOpen as FolderOpenIcon } from '@lucide/solid'
import { createContext, createEffect, createSignal, For, omit, useContext } from 'solid-js'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TreeViewElement {
  id: string
  name: string
  type?: 'file' | 'folder'
  isSelectable?: boolean
  children?: TreeViewElement[]
}

export type TreeSortMode
  = | 'default'
    | 'none'
    | ((a: TreeViewElement, b: TreeViewElement) => number)

interface TreeContextProps {
  selectedId: Accessor<string | undefined>
  expandedItems: Accessor<string[] | undefined>
  indicator: () => boolean
  handleExpand: (id: string) => void
  selectItem: (id: string) => void
  setExpandedItems: (items: string[]) => void
  openIcon?: () => JSX.Element
  closeIcon?: () => JSX.Element
  direction: () => 'rtl' | 'ltr'
}

const TreeContext = createContext<TreeContextProps>()

function useTree() {
  const context = useContext(TreeContext)
  if (!context) {
    throw new Error('useTree must be used within a TreeProvider')
  }
  return context
}

function isFolderElement(element: TreeViewElement) {
  if (element.type) {
    return element.type === 'folder'
  }

  return Array.isArray(element.children)
}

function mergeExpandedItems(currentItems: string[] | undefined, nextItems: string[]) {
  return [...new Set([...(currentItems ?? []), ...nextItems])]
}

const treeCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
})

function defaultTreeComparator(a: TreeViewElement, b: TreeViewElement) {
  const aIsFolder = isFolderElement(a)
  const bIsFolder = isFolderElement(b)

  if (aIsFolder !== bIsFolder) {
    return aIsFolder ? -1 : 1
  }

  return treeCollator.compare(a.name, b.name)
}

function getTreeComparator(sort: TreeSortMode) {
  if (sort === 'none') {
    return undefined
  }

  if (sort === 'default') {
    return defaultTreeComparator
  }

  return sort
}

function sortTreeElements(elements: TreeViewElement[], sort: TreeSortMode): TreeViewElement[] {
  const comparator = getTreeComparator(sort)

  const nextElements = elements.map((element) => {
    if (!Array.isArray(element.children)) {
      return element
    }

    return {
      ...element,
      children: sortTreeElements(element.children, sort),
    }
  })

  if (!comparator) {
    return nextElements
  }

  return [...nextElements].sort(comparator)
}

function renderTreeElements(elements: TreeViewElement[], sort: TreeSortMode): JSX.Element {
  return (
    <For each={sortTreeElements(elements, sort)}>
      {(element) => {
        if (isFolderElement(element)) {
          return (
            <Folder
              value={element.id}
              element={element.name}
              isSelectable={element.isSelectable}
            >
              {Array.isArray(element.children)
                ? renderTreeElements(element.children, sort)
                : null}
            </Folder>
          )
        }

        return (
          <File value={element.id} isSelectable={element.isSelectable}>
            <span>{element.name}</span>
          </File>
        )
      }}
    </For>
  )
}

type TreeViewProps = {
  initialSelectedId?: string
  indicator?: boolean
  elements?: TreeViewElement[]
  initialExpandedItems?: string[]
  openIcon?: JSX.Element
  closeIcon?: JSX.Element
  sort?: TreeSortMode
  class?: string
  children?: JSX.Element
  dir?: 'rtl' | 'ltr'
  onChange?: (value: string[]) => void
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'>

export function Tree(props: TreeViewProps) {
  const rest = omit(props, 'class', 'elements', 'initialSelectedId', 'initialExpandedItems', 'children', 'indicator', 'openIcon', 'closeIcon', 'sort', 'dir') as Record<string, unknown>
  const sort = () => props.sort ?? 'default' as const
  const [selectedId, setSelectedId] = createSignal<string | undefined>(
    props.initialSelectedId,
  )
  const [expandedItems, setExpandedItems] = createSignal<string[] | undefined>(
    props.initialExpandedItems,
  )

  const selectItem = (id: string) => {
    setSelectedId(id)
  }

  const handleExpand = (id: string) => {
    setExpandedItems((prev) => {
      if (prev?.includes(id)) {
        return prev.filter(item => item !== id)
      }
      return [...(prev ?? []), id]
    })
  }

  const expandSpecificTargetedElements = (
    elements?: TreeViewElement[],
    selectId?: string,
  ) => {
    if (!elements || !selectId)
      return
    const findParent = (
      currentElement: TreeViewElement,
      currentPath: string[] = [],
    ) => {
      const isSelectable = currentElement.isSelectable ?? true
      const newPath = [...currentPath, currentElement.id]
      if (currentElement.id === selectId) {
        if (isSelectable) {
          setExpandedItems(prev => mergeExpandedItems(prev, newPath))
        }
        else {
          if (newPath.includes(currentElement.id)) {
            newPath.pop()
            setExpandedItems(prev => mergeExpandedItems(prev, newPath))
          }
        }
        return
      }
      if (
        Array.isArray(currentElement.children)
        && currentElement.children.length > 0
      ) {
        currentElement.children.forEach((child) => {
          findParent(child, newPath)
        })
      }
    }
    elements.forEach((element) => {
      findParent(element)
    })
  }

  createEffect(
    () => ({ initialSelectedId: props.initialSelectedId, elements: props.elements }),
    ({ initialSelectedId, elements }) => {
      if (initialSelectedId) {
        expandSpecificTargetedElements(elements, initialSelectedId)
      }
    },
  )

  const direction = () => props.dir === 'rtl' ? 'rtl' : 'ltr'
  const treeChildren = () =>
    props.children ?? (props.elements ? renderTreeElements(props.elements, sort()) : null)

  return (
    <TreeContext
      value={{
        selectedId,
        expandedItems,
        indicator: () => (props.indicator ?? true),
        handleExpand,
        selectItem,
        setExpandedItems,
        openIcon: () => props.openIcon,
        closeIcon: () => props.closeIcon,
        direction,
      }}
    >
      <div class={cn('size-full', props.class)}>
        <div class="relative h-full overflow-auto px-2" dir={direction()}>
          <AccordionPrimitive.Root
            {...rest}
            multiple
            value={expandedItems()}
            class="flex flex-col gap-1"
            dir={direction()}
          >
            {treeChildren()}
          </AccordionPrimitive.Root>
        </div>
      </div>
    </TreeContext>
  )
}

function TreeIndicator(
  props: JSX.HTMLAttributes<HTMLDivElement>,
) {
  const { direction } = useTree()
  const rest = omit(props, 'class') as Record<string, unknown>

  return (
    <div
      dir={direction()}
      class={cn(
        `
          absolute left-1.5 h-full w-px rounded-md bg-muted py-3 duration-300
          ease-in-out
          hover:bg-slate-300
          rtl:right-1.5
        `,
        props.class,
      )}
      {...rest}
    />
  )
}

type FolderProps = {
  expandedItems?: string[]
  element: string
  isSelectable?: boolean
  isSelect?: boolean
  value: string
  class?: string
  children?: JSX.Element
} & JSX.HTMLAttributes<HTMLDivElement>

export function Folder(props: FolderProps) {
  const rest = omit(props, 'class', 'element', 'value', 'isSelectable', 'isSelect', 'children') as Record<string, unknown>
  const {
    direction,
    handleExpand,
    expandedItems,
    indicator,
    selectedId,
    selectItem,
    openIcon,
    closeIcon,
  } = useTree()
  const isSelected = () => props.isSelect ?? selectedId() === props.value

  return (
    <AccordionPrimitive.Item
      {...rest}
      value={props.value}
      class="relative h-full overflow-hidden"
    >
      <AccordionPrimitive.Trigger
        class={cn(
          'flex items-center gap-1 rounded-md text-sm',
          props.class,
          {
            'rounded-md bg-muted': isSelected() && props.isSelectable,
            'cursor-pointer': props.isSelectable,
            'cursor-not-allowed opacity-50': !props.isSelectable,
          },
        )}
        disabled={!props.isSelectable}
        onClick={() => {
          selectItem(props.value)
          handleExpand(props.value)
        }}
      >
        {expandedItems()?.includes(props.value)
          ? (openIcon?.() ?? <FolderOpenIcon class="size-4" />)
          : (closeIcon?.() ?? <FolderIcon class="size-4" />)}
        <span>{props.element}</span>
      </AccordionPrimitive.Trigger>
      <AccordionPrimitive.Content class="
        relative h-full overflow-hidden text-sm
        data-closed:animate-accordion-up
        data-expanded:animate-accordion-down
      "
      >
        {props.element && indicator() && <TreeIndicator aria-hidden="true" />}
        <AccordionPrimitive.Root
          dir={direction()}
          multiple
          class="
            ml-5 flex flex-col gap-1 py-1
            rtl:mr-5
          "
          value={expandedItems()}
        >
          {props.children}
        </AccordionPrimitive.Root>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

type FileProps = {
  value: string
  handleSelect?: (id: string) => void
  isSelectable?: boolean
  isSelect?: boolean
  fileIcon?: JSX.Element
  class?: string
  children?: JSX.Element
} & Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  onClick?: (event: MouseEvent) => void
}

export function File(props: FileProps) {
  const rest = omit(props, 'value', 'class', 'handleSelect', 'onClick', 'isSelectable', 'isSelect', 'fileIcon', 'children') as Record<string, unknown>
  const { direction, selectedId, selectItem } = useTree()
  const isSelected = () => props.isSelect ?? selectedId() === props.value
  return (
    <button
      type="button"
      disabled={!props.isSelectable}
      class={cn(
        `
          flex w-fit items-center gap-1 rounded-md pr-1 text-sm duration-200
          ease-in-out
          rtl:pr-0 rtl:pl-1
        `,
        {
          'bg-muted': isSelected() && props.isSelectable,
        },
        props.isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
        direction() === 'rtl' ? 'rtl' : 'ltr',
        props.class,
      )}
      onClick={(event) => {
        selectItem(props.value)
        props.handleSelect?.(props.value)
        props.onClick?.(event)
      }}
      {...rest}
    >
      {props.fileIcon ?? <FileIcon class="size-4" />}
      {props.children}
    </button>
  )
}

type CollapseButtonProps = {
  elements: TreeViewElement[]
  expandAll?: boolean
  class?: string
  children?: JSX.Element
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>

export function CollapseButton(props: CollapseButtonProps) {
  const rest = omit(props, 'class', 'elements', 'expandAll', 'children') as Record<string, unknown>
  const { expandedItems, setExpandedItems } = useTree()

  const expendAllTree = (elements: TreeViewElement[]): string[] => {
    const expandedElementIds: string[] = []

    const expandTree = (element: TreeViewElement) => {
      const isSelectable = element.isSelectable ?? true
      if (isSelectable && element.children && element.children.length > 0) {
        expandedElementIds.push(element.id)
        for (const child of element.children) {
          expandTree(child)
        }
      }
    }

    for (const element of elements) {
      expandTree(element)
    }

    return [...new Set(expandedElementIds)]
  }

  const closeAll = () => {
    setExpandedItems([])
  }

  createEffect(
    () => ({ expandAll: props.expandAll, elements: props.elements }),
    ({ expandAll, elements }) => {
      if (expandAll) {
        setExpandedItems(expendAllTree(elements))
      }
    },
  )

  return (
    <Button
      variant="ghost"
      class={cn('absolute right-2 bottom-1 h-8 w-fit p-1', props.class)}
      onClick={
        (expandedItems()?.length ?? 0) > 0
          ? closeAll
          : () => setExpandedItems(expendAllTree(props.elements))
      }
      {...rest}
    >
      {props.children}
      <span class="sr-only">Toggle</span>
    </Button>
  )
}
