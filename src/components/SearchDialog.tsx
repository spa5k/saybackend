import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { SearchBox } from './SearchBox'

export function SearchDialog() {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  // The search box, and so the index download, mounts on the first open.
  const [opened, setOpened] = useState(false)

  const open = useCallback(() => {
    if (!dialog.current) return
    setOpened(true)
    dialog.current.showModal()
    requestAnimationFrame(() => input.current?.focus())
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
              <p className="eyebrow">Search the posts</p>
              <p>Press / or ⌘K from anywhere.</p>
            </div>
            <button type="button" aria-label="Close search" onClick={close}>
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {opened ? <SearchBox inputRef={input} onNavigate={close} /> : null}
        </div>
      </dialog>
    </>
  )
}
