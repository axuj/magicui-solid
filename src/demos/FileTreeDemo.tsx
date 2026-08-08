import type { TreeViewElement } from '@/registry/magicui/file-tree'
import { Tree } from '@/registry/magicui/file-tree'

const ELEMENTS: TreeViewElement[] = [
  {
    id: 'src',
    type: 'folder',
    isSelectable: true,
    name: 'src',
    children: [
      {
        id: 'lib',
        type: 'folder',
        isSelectable: true,
        name: 'lib',
        children: [
          {
            id: 'utils',
            isSelectable: true,
            name: 'utils.ts',
          },
        ],
      },
      {
        id: 'app',
        type: 'folder',
        isSelectable: true,
        name: 'app',
        children: [
          {
            id: 'page',
            isSelectable: true,
            name: 'page.tsx',
          },
          {
            id: 'layout',
            isSelectable: true,
            name: 'layout.tsx',
          },
        ],
      },
      {
        id: 'components',
        type: 'folder',
        isSelectable: true,
        name: 'components',
        children: [
          {
            id: 'header',
            isSelectable: true,
            name: 'header.tsx',
          },
          {
            id: 'ui',
            type: 'folder',
            isSelectable: true,
            name: 'ui',
            children: [
              {
                id: 'button',
                isSelectable: true,
                name: 'button.tsx',
              },
            ],
          },
          {
            id: 'footer',
            isSelectable: true,
            name: 'footer.tsx',
          },
        ],
      },
    ],
  },
]

export function FileTreeDemo() {
  return (
    <div class="
      relative flex h-75 w-full max-w-sm flex-col items-center justify-center
      overflow-hidden rounded-lg border bg-background
    "
    >
      <Tree
        class="overflow-hidden rounded-md bg-background p-2"
        initialSelectedId="button"
        initialExpandedItems={['src', 'app', 'components', 'ui', 'lib']}
        elements={ELEMENTS}
      />
    </div>
  )
}
