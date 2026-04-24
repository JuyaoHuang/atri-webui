<script setup lang="ts">
interface Props {
  duration?: number
  easingEnter?: string
  easingLeave?: string
  opacityClosed?: number
  opacityOpened?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 250,
  easingEnter: 'ease-in-out',
  easingLeave: 'ease-in-out',
  opacityClosed: 0,
  opacityOpened: 1,
})

const closed = '0px'

interface InitialStyle {
  height: string
  width: string
  position: string
  visibility: string
  overflow: string
  paddingTop: string
  paddingBottom: string
  borderTopWidth: string
  borderBottomWidth: string
  marginTop: string
  marginBottom: string
}

function getElementStyle(element: HTMLElement): InitialStyle {
  return {
    height: element.style.height,
    width: element.style.width,
    position: element.style.position,
    visibility: element.style.visibility,
    overflow: element.style.overflow,
    paddingTop: element.style.paddingTop,
    paddingBottom: element.style.paddingBottom,
    borderTopWidth: element.style.borderTopWidth,
    borderBottomWidth: element.style.borderBottomWidth,
    marginTop: element.style.marginTop,
    marginBottom: element.style.marginBottom,
  }
}

let animation: Animation | null = null
let lastElement: HTMLElement | null = null

function prepareElement(element: HTMLElement, initialStyle: InitialStyle) {
  const { width } = getComputedStyle(element)
  element.style.width = width
  element.style.position = 'absolute'
  element.style.visibility = 'hidden'
  element.style.height = ''
  const { height } = getComputedStyle(element)
  element.style.width = initialStyle.width
  element.style.position = initialStyle.position
  element.style.visibility = initialStyle.visibility
  element.style.height = closed
  element.style.overflow = 'hidden'
  return initialStyle.height && initialStyle.height !== closed
    ? initialStyle.height
    : height
}

function animateTransition(
  element: HTMLElement,
  initialStyle: InitialStyle,
  done: () => void,
  keyframes: any,
  options?: any,
) {
  lastElement = element
  animation = element.animate(keyframes, options)
  element.style.height = initialStyle.height
  animation.onfinish = () => {
    element.style.overflow = initialStyle.overflow
    done()
  }
}

function getEnterKeyframes(height: string, initialStyle: InitialStyle) {
  return [
    {
      height: closed,
      opacity: props.opacityClosed,
      paddingTop: closed,
      paddingBottom: closed,
      borderTopWidth: closed,
      borderBottomWidth: closed,
      marginTop: closed,
      marginBottom: closed,
    },
    {
      height,
      opacity: props.opacityOpened,
      paddingTop: initialStyle.paddingTop,
      paddingBottom: initialStyle.paddingBottom,
      borderTopWidth: initialStyle.borderTopWidth,
      borderBottomWidth: initialStyle.borderBottomWidth,
      marginTop: initialStyle.marginTop,
      marginBottom: initialStyle.marginBottom,
    },
  ]
}

function cancelAnimation(element: HTMLElement, overflow: string, done: () => void) {
  if (element !== lastElement)
    return false
  if (!animation)
    return false
  if (animation.playState !== 'running')
    return false
  animation.onfinish = () => {
    element.style.overflow = overflow
    done()
  }
  animation.reverse()
  return true
}

function enterTransition(element: Element, done: () => void) {
  const htmlElement = element as HTMLElement
  const initialStyle = getElementStyle(htmlElement)
  if (cancelAnimation(htmlElement, initialStyle.overflow, done))
    return
  const height = prepareElement(htmlElement, initialStyle)
  const keyframes = getEnterKeyframes(height, initialStyle)
  const options = { duration: props.duration, easing: props.easingEnter }
  animateTransition(htmlElement, initialStyle, done, keyframes, options)
}

function leaveTransition(element: Element, done: () => void) {
  const htmlElement = element as HTMLElement
  const initialStyle = getElementStyle(htmlElement)
  if (cancelAnimation(htmlElement, initialStyle.overflow, done))
    return
  const { height } = getComputedStyle(htmlElement)
  htmlElement.style.height = height
  htmlElement.style.overflow = 'hidden'
  const keyframes = getEnterKeyframes(height, initialStyle).reverse()
  const options = { duration: props.duration, easing: props.easingLeave }
  animateTransition(htmlElement, initialStyle, done, keyframes, options)
}
</script>

<template>
  <Transition :css="false" @enter="enterTransition" @leave="leaveTransition">
    <slot />
  </Transition>
</template>
