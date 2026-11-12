import antfu, { parserPlain } from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { flat as mdxFlat } from 'eslint-plugin-mdx'
import solidV2 from 'eslint-plugin-solid/configs/v2'

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
  // antfu 9.x pins eslint-plugin-solid ^0.14 via peer and registers that old
  // instance itself. Use the plugin's official Solid 2 config below instead.
  solid: false,
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
    'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^not-content$', '^tab-trigger$', '^sl-', '^md:sl-', '^dialog-frame$', '^search-container$', '^text-3d-flip-char$', '^leftside$', '^rightside$', '^rtl$', '^ltr$'] }],
  },
}, {
  // Official Solid 2 preset: sets settings.solid.version = 2 and enables the
  // 2.0-only rules (removed-api, no-single-arg-create-effect,
  // no-write-in-pure-computation, ...). Two overrides keep the TypeScript
  // behaviour the old antfu solid config had.
  ...solidV2,
  name: 'solid/v2',
  files: ['**/*.{ts,tsx}'],
  rules: {
    ...solidV2.rules,
    'solid/jsx-no-undef': ['error', { typescriptEnabled: true }],
    'solid/no-unknown-namespaces': 'off',
  },
})
