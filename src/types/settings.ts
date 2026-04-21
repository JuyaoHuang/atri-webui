export interface BackgroundConfig {
  type: 'image' | 'color'
  value: string // base64 image or color hex
  opacity: number // 0-100
}

export interface Settings {
  background: BackgroundConfig
}
