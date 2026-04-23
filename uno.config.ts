import { colorToString } from '@unocss/preset-mini/utils'
import { defineConfig, presetAttributify, presetIcons, presetTypography, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss'
import { parseColor } from 'unocss/preset-mini'

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetTypography(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [
    transformerDirectives({
      applyVariable: ['--at-apply'],
    }),
    transformerVariantGroup(),
  ],
  rules: [
    [/^bg-dotted-\[(.*)\]$/, ([, color], { theme }) => {
      const parsedColor = parseColor(color, theme)

      return {
        'background-image': `radial-gradient(circle at 1px 1px, ${colorToString(parsedColor?.cssColor ?? parsedColor?.color ?? color, 'var(--un-background-opacity)')} 1px, transparent 0)`,
        '--un-background-opacity': parsedColor?.cssColor?.alpha ?? parsedColor?.alpha ?? 1,
      }
    }],
  ],
  theme: {
    colors: {
      primary: {
        50: '#f5f8ff',
        100: '#e8efff',
        200: '#d6e3ff',
        300: '#b8d0ff',
        400: '#8db5ff',
        500: '#5f95ff',
        600: '#4477f5',
        700: '#355fd8',
        800: '#2f4daa',
        900: '#2c4385',
        950: '#1d2a52',
      },
      secondary: {
        500: '#7d88ff',
      },
    },
    fontFamily: {
      quicksand: '"Quicksand Variable", "Quicksand", "DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
  },
})
