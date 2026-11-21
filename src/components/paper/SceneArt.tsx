import { useEffect, useRef } from 'react'

import { LINES } from './Figure'
import type { Scene } from './scenes'

/**
 * Draws a scene and keeps it moving. The server renders the first frame, so
 * the drawing is there before any script runs. After that only the `d` of
 * each path changes. The drawing moves only while it is on screen, and it
 * stays still for a reader who turns motion off. It follows the pointer.
 */
export function SceneArt({
  scene,
  className,
}: {
  scene: Scene
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const paths = [...svg.querySelectorAll('path')]
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let pointer: number | null = null
    let frame = 0
    let last = 0
    let visible = false

    const draw = (time: number) =>
      scene(time, pointer).forEach((shape, index) =>
        paths[index]?.setAttribute('d', shape.d),
      )
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (now - last < 33) return
      last = now
      draw(now / 1000)
    }
    const move = (event: PointerEvent) => {
      const box = svg.getBoundingClientRect()
      pointer = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width))
      if (still) draw(0)
    }
    const leave = () => {
      pointer = null
      if (still) draw(0)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible && !still) frame = requestAnimationFrame(tick)
    })

    observer.observe(svg)
    svg.addEventListener('pointermove', move)
    svg.addEventListener('pointerleave', leave)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      svg.removeEventListener('pointermove', move)
      svg.removeEventListener('pointerleave', leave)
    }
  }, [scene])

  return (
    <svg
      ref={ref}
      className={className ? `scene ${className}` : 'scene'}
      viewBox="0 0 1000 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {scene(0, null).map((shape, index) => (
        <path
          key={index}
          className={`scene-${shape.k}`}
          style={shape.c ? { stroke: LINES[shape.c] } : undefined}
          d={shape.d}
        />
      ))}
    </svg>
  )
}
