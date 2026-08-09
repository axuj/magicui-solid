import { IconCloud } from '@/registry/magicui/icon-cloud'

const slugs = [
  'typescript',
  'javascript',
  'dart',
  'openjdk',
  'react',
  'flutter',
  'android',
  'html5',
  'css',
  'nodedotjs',
  'express',
  'nextdotjs',
  'prisma',
  'cloudflare',
  'postgresql',
  'firebase',
  'nginx',
  'vercel',
  'testinglibrary',
  'jest',
  'cypress',
  'docker',
  'git',
  'jira',
  'github',
  'gitlab',
  'vite',
  'androidstudio',
  'sonar',
  'figma',
]

export function IconCloudDemo() {
  const images = slugs.map(slug => `https://cdn.simpleicons.org/${slug}/${slug}`)

  return (
    <div class="
      relative flex size-full items-center justify-center overflow-hidden
    "
    >
      <IconCloud images={images} />
    </div>
  )
}
