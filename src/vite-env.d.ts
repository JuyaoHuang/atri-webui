/// <reference types="vite/client" />

declare module 'unocss/vite' {
  import type { Plugin } from 'vite'
  export default function UnoCSS(): Plugin
}
