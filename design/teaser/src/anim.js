// Clips are JPEG frame folders. The renderer sets each frame by time.
window.ready = Promise.all([
  document.fonts.ready,
  ...[...document.querySelectorAll('img.clip')].map((i) => i.decode()),
])
window.setTime = async (t) => {
  document.body.classList.add('go')
  document.getAnimations().forEach((a) => {
    a.pause()
    a.currentTime = t * 1000
  })
  await Promise.all(
    [...document.querySelectorAll('img.clip')].map((img) => {
      const n = Number(img.dataset.count),
        f = Math.max(
          0,
          Math.min(
            n - 1,
            Math.floor((t - Number(img.dataset.delay || 0)) * 30),
          ),
        )
      const src = `${img.dataset.frames}/${String(f + 1).padStart(4, '0')}.jpg`
      if (img.getAttribute('src') === src) return
      img.src = src
      return img.decode()
    }),
  )
}

// Post drawings: each <svg data-scene=slug> runs the site's own scene function.
const scenes = [...document.querySelectorAll('svg[data-scene]')].map((svg) => {
  const fn = window.sceneOf(svg.dataset.scene)
  const NS = 'http://www.w3.org/2000/svg',
    MARK = (c) => `var(--m-${c})`
  const paths = fn(0, null).map((s) => {
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('class', `scene-${s.k}`)
    if (s.c) p.style.stroke = MARK(s.c)
    p.setAttribute('d', s.d)
    svg.appendChild(p)
    return p
  })
  return { fn, paths, off: Number(svg.dataset.offset || 0) }
})
const setBase = window.setTime
window.setTime = async (t) => {
  ;(window.waves || []).forEach((w) => w(t))
  scenes.forEach((s) =>
    s
      .fn(t + s.off, null)
      .forEach((shape, i) => s.paths[i].setAttribute('d', shape.d)),
  )
  await setBase(t)
}
// Live preview in a normal browser tab: ?play
if (location.search.includes('play'))
  window.ready.then(() => {
    const t0 = performance.now()
    const f = () => {
      window.setTime((performance.now() - t0) / 1000)
      requestAnimationFrame(f)
    }
    f()
  })
