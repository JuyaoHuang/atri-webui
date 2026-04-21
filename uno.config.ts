import { defineConfig, presetAttributify, presetTypography, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetTypography()],
  theme: {
    colors: {
      primary: '#646cff',
      secondary: '#535bf2'
    }
  }
})
