const pagefindScript = '/pagefind/pagefind-ui.js'
const pagefindStylesheet = '/pagefind/pagefind-ui.css'

let pagefindPromise: Promise<void> | undefined

function loadStylesheet() {
  const existing = document.querySelector<HTMLLinkElement>(
    `link[href="${pagefindStylesheet}"]`,
  )
  if (existing) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = pagefindStylesheet
    link.addEventListener('load', () => resolve(), { once: true })
    link.addEventListener(
      'error',
      () => reject(new Error('Unable to load search styles.')),
      { once: true },
    )
    document.head.append(link)
  })
}

function loadScript() {
  if (window.PagefindUI) return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${pagefindScript}"]`,
    )
    const script = existing ?? document.createElement('script')

    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Unable to load search.')),
      { once: true },
    )

    if (!existing) {
      script.src = pagefindScript
      script.defer = true
      document.head.append(script)
    }
  })
}

async function loadPagefind() {
  pagefindPromise ??= Promise.all([loadStylesheet(), loadScript()]).then(
    () => undefined,
  )
  await pagefindPromise
}

export async function mountPagefind(container: HTMLDivElement) {
  if (container.dataset.ready) return

  container.setAttribute('aria-busy', 'true')
  try {
    await loadPagefind()
    if (!window.PagefindUI) throw new Error('Search did not initialize.')

    new window.PagefindUI({
      element: container,
      showSubResults: true,
      showImages: false,
    })
    container.dataset.ready = 'true'
  } finally {
    container.removeAttribute('aria-busy')
  }
}
