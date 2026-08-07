import antfu, { parserPlain } from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { flat as mdxFlat } from 'eslint-plugin-mdx'

const disableStyleForMdx = {
  'style/indent': 'off',
  'style/jsx-closing-tag-location': 'off',
  'style/jsx-closing-bracket-location': 'off',
  'style/jsx-one-expression-per-line': 'off',
  'style/no-trailing-spaces': 'off',
  'style/no-multiple-empty-lines': 'off',
  'style/eol-last': 'off',
  'style/comma-dangle': 'off',
  'style/comma-spacing': 'off',
  'style/quotes': 'off',
  'style/semi': 'off',
}

export default antfu({
  solid: true,
  astro: true,
  typescript: true,
  ignores: ['dist/', '.astro/', '.agent/', 'plugins/prettier-plugin-cloudflare-docs/', '**/__generated__/**'],
  a11y: true,

  formatters: {
    css: true,
    // astro: 'prettier',
  },
}, {
  files: ['**/*.astro'],
  name: 'custom/astro-style',
  rules: {
    'style/no-multiple-empty-lines': ['error', { max: 1 }],
    'style/no-trailing-spaces': 'error',
    'style/indent': ['error', 2],
  },
}, {
  files: ['**/*.md'],
  languageOptions: { parser: parserPlain },
  name: 'custom/markdown-formatter',
  rules: {
    'style/no-trailing-spaces': 'off',
    'style/no-multiple-empty-lines': 'off',
    'style/eol-last': 'off',
  },
}, {
  ...mdxFlat,
  files: ['**/*.mdx'],
  rules: {
    'format/prettier': ['error', {
      parser: 'mdx-cloudflare-docs',
      plugins: ['./plugins/prettier-plugin-cloudflare-docs/index.mjs'],
      mdxPreserveElements: 'Fragment,PackageManagerTabs',
      singleQuote: true,
      semi: false,
      trailingComma: 'all',
      printWidth: 120,
    }],
    'mdx/remark': 'off',
    'no-unused-expressions': 'off',
    'no-undef': 'off',
    ...disableStyleForMdx,
  },
}, betterTailwindcss.configs.recommended, {
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/styles/global.css',
      rootFontSize: 16,
    },
  },
  rules: {
    'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^not-content$', '^tab-trigger$', '^sl-', '^md:sl-', '^dialog-frame$', '^search-container$', '^text-3d-flip-char$'] }],
  },
})
