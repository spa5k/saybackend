import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef } from 'react'

function mountPagefind(container: HTMLDivElement) {
  if (container.dataset.ready || !window.PagefindUI) return
  new window.PagefindUI({
    element: container,
    showSubResults: true,
    showImages: false,
  })
  container.dataset.ready = 'true'
}

export function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  const container = useRef<HTMLDivElement>(null)

  const open = useCallback(() => {
    if (!dialog.current || !container.current) return
    mountPagefind(container.current)
    dialog.current.showModal()
    window.setTimeout(() => {
      container.current
        ?.querySelector<HTMLInputElement>('.pagefind-ui__search-input')
        ?.focus()
    }, 0)
  }, [])

  const close = useCallback(() => dialog.current?.close(), [])

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const target = event.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      if (
        (!isTyping && event.key === '/') ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k')
      ) {
        event.preventDefault()
        open()
      }
    }
    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [open])

  return (
    <>
      <button
        className="search-toggle"
        type="button"
        aria-label="Search articles"
        onClick={open}
      >
        <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
      </button>
      <dialog
        className="search-dialog"
        ref={dialog}
        aria-label="Search SayBackend"
        onClick={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <div className="search-panel">
          <div className="search-panel-header">
            <div>
              <p className="eyebrow">Search the journal</p>
              <p>Press / or ⌘K from anywhere.</p>
            </div>
            <button type="button" aria-label="Close search" onClick={close}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div id="pagefind-search" ref={container} />
        </div>
      </dialog>
    </>
  )
}
