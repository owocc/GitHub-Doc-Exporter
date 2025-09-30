/**
 * @type {import('tailwindcss').Config}
 *
 * NOTE: This file is for reference and to provide IDE autocompletion.
 * Because this project uses the Tailwind CDN, the configuration object below
 * must be copied into the `tailwind.config` script tag in `index.html`.
 */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Shared colors
        error: 'hsl(var(--color-error) / <alpha-value>)',
        'on-error': 'hsl(var(--color-on-error) / <alpha-value>)',

        // Light & Dark specific colors
        primary: 'hsl(var(--color-primary) / <alpha-value>)',
        'on-primary': 'hsl(var(--color-on-primary) / <alpha-value>)',
        'primary-container': 'hsl(var(--color-primary-container) / <alpha-value>)',
        'on-primary-container': 'hsl(var(--color-on-primary-container) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        'on-surface': 'hsl(var(--color-on-surface) / <alpha-value>)',
        'surface-variant': 'hsl(var(--color-surface-variant) / <alpha-value>)',
        'on-surface-variant': 'hsl(var(--color-on-surface-variant) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        'on-background': 'hsl(var(--color-on-background) / <alpha-value>)',
        outline: 'hsl(var(--color-outline) / <alpha-value>)',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.on-surface'),
            '--tw-prose-headings': theme('colors.on-surface'),
            '--tw-prose-lead': theme('colors.on-surface-variant'),
            '--tw-prose-links': theme('colors.primary'),
            '--tw-prose-bold': theme('colors.on-surface'),
            '--tw-prose-counters': theme('colors.on-surface-variant'),
            '--tw-prose-bullets': theme('colors.outline'),
            '--tw-prose-hr': theme('colors.outline'),
            '--tw-prose-quotes': theme('colors.on-surface'),
            '--tw-prose-quote-borders': theme('colors.outline'),
            '--tw-prose-captions': theme('colors.on-surface-variant'),
            '--tw-prose-code': theme('colors.primary'),
            '--tw-prose-pre-code': theme('colors.on-surface-variant'),
            '--tw-prose-pre-bg': theme('colors.surface-variant'),
            '--tw-prose-th-borders': theme('colors.outline'),
            '--tw-prose-td-borders': theme('colors.outline'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
