import { useEffect, useRef } from 'react'

export function Giscus({ term }: { term?: string }) {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = container.current
    if (!root) return

    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.repo = 'spa5k/saybackend'
    script.dataset.repoId = 'R_kgDOK-1fwg'
    script.dataset.category = 'Blog'
    script.dataset.categoryId = 'DIC_kwDOK-1fws4Cf4rx'
    script.dataset.mapping = term ? 'specific' : 'pathname'
    if (term) script.dataset.term = term
    script.dataset.strict = '0'
    script.dataset.reactionsEnabled = '1'
    script.dataset.emitMetadata = '0'
    script.dataset.inputPosition = 'top'
    script.dataset.theme = document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light'
    script.dataset.lang = 'en'
    script.dataset.loading = 'lazy'
    root.append(script)

    const updateTheme = () => {
      const frame = root.querySelector<HTMLIFrameElement>('.giscus-frame')
      frame?.contentWindow?.postMessage(
        {
          giscus: {
            setConfig: {
              theme: document.documentElement.classList.contains('dark')
                ? 'dark'
                : 'light',
            },
          },
        },
        'https://giscus.app',
      )
    }

    document.addEventListener('theme-changed', updateTheme)
    return () => {
      document.removeEventListener('theme-changed', updateTheme)
      root.replaceChildren()
    }
  }, [term])

  return <div className="giscus" ref={container} />
}
