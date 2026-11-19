import { List, Moon, Sun, X } from '@phosphor-icons/react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { SearchDialog } from './SearchDialog'
import { PaperDefs } from './paper/PaperDefs'

const navigation = [
  { label: 'Writing', to: '/blog/' },
  { label: 'Topics', to: '/topics/' },
  { label: 'Projects', to: '/projects/' },
  { label: 'About', to: '/about/' },
  { label: 'Hire me', to: '/hiring/' },
]

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PaperDefs />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="site-header">
      <div className="page-frame header-inner">
        <Link to="/" className="wordmark" aria-label="SayBackend home">
          <svg className="wordmark-icon" aria-hidden="true">
            <use href="#pp-square" />
          </svg>
          <span>SayBackend</span>
        </Link>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
        <nav
          id="site-navigation"
          className={open ? 'main-nav main-nav-open' : 'main-nav'}
          aria-label="Primary navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={pathname.startsWith(item.to) ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
          <SearchDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const saved =
      localStorage.getItem('saybackend-theme') || localStorage.getItem('theme')
    const followsSystem = !saved || saved === 'auto'
    const apply = (enabled: boolean) => {
      document.documentElement.classList.toggle('dark', enabled)
      setDark(enabled)
      document.dispatchEvent(new CustomEvent('theme-changed'))
    }

    if (saved === 'dark' || saved === 'light') {
      localStorage.setItem('saybackend-theme', saved)
    }
    apply(saved === 'dark' || (followsSystem && media.matches))

    const handleSystemTheme = (event: MediaQueryListEvent) => {
      if (
        !localStorage.getItem('saybackend-theme') &&
        (!localStorage.getItem('theme') ||
          localStorage.getItem('theme') === 'auto')
      ) {
        apply(event.matches)
      }
    }
    media.addEventListener('change', handleSystemTheme)
    return () => media.removeEventListener('change', handleSystemTheme)
  }, [])

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('saybackend-theme', next ? 'dark' : 'light')
    setDark(next)
    document.dispatchEvent(new CustomEvent('theme-changed'))
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Use light theme' : 'Use dark theme'}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-frame footer-inner">
        <div>
          <span>© {new Date().getFullYear()} SayBackend</span>
          <a href="/guides/">Guides</a>
          <a href="/rss.xml">RSS</a>
          <a href="/llms.txt">LLMs</a>
          <a href="/sitemap-index.xml">Sitemap</a>
          <a href="https://happyformatter.com">Tools</a>
          <a href="https://kamran.sh">Portfolio</a>
          <a href="mailto:hello@kamran.sh">Email</a>
        </div>
        <span className="hand footer-sign">— Kamran</span>
      </div>
    </footer>
  )
}
