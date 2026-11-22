import { List, Moon, Sun, X } from '@phosphor-icons/react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { SearchDialog } from './SearchDialog'
import { FooterArt, footerKindOf } from './paper/FooterArt'
import { PaperDefs } from './paper/PaperDefs'
import { sceneOf, slugOfPath } from './paper/scenes'

const leftNavigation = [
  { label: 'Writing', to: '/blog/' },
  { label: 'Topics', to: '/topics/' },
  { label: 'Projects', to: '/projects/' },
]

const auditUrl = (place: string) =>
  `https://kamran.sh/audit?utm_source=saybackend&utm_medium=${place}&utm_campaign=audit`

type NavItem = { label: string; to?: string; href?: string }

const rightNavigation: NavItem[] = [
  { label: 'LLM audit', href: auditUrl('header') },
  { label: 'About', to: '/about/' },
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

function NavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return items.map((item) =>
    item.href ? (
      <a key={item.label} href={item.href}>
        {item.label}
      </a>
    ) : (
      <Link
        key={item.label}
        to={item.to}
        className={item.to && pathname.startsWith(item.to) ? 'active' : ''}
      >
        {item.label}
      </Link>
    ),
  )
}

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => setOpen(false), [pathname])

  // After the first scroll, the bar gets a paper backing and the name folds
  // into the S mark.
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header
      className={scrolled || open ? 'site-header is-scrolled' : 'site-header'}
    >
      <div className="header-inner">
        <nav className="main-nav" aria-label="Primary navigation">
          <NavLinks items={leftNavigation} pathname={pathname} />
        </nav>
        <Link to="/" className="wordmark" aria-label="SayBackend home">
          <svg className="wordmark-icon" aria-hidden="true">
            <use href="#pp-mark" />
          </svg>
          <span>SayBackend</span>
        </Link>
        <div className="main-nav main-nav-end">
          <NavLinks items={rightNavigation} pathname={pathname} />
          <SearchDialog />
          <ThemeToggle />
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={18} /> : <List size={18} />}
          </button>
        </div>
      </div>
      {open ? (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          <NavLinks
            items={[...leftNavigation, ...rightNavigation]}
            pathname={pathname}
          />
        </nav>
      ) : null}
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const scene = sceneOf(slugOfPath(pathname))
  const kind = footerKindOf(pathname)
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a href="/" className="footer-brand">
          <svg className="wordmark-icon" aria-hidden="true">
            <use href="#pp-mark" />
          </svg>
          SayBackend
        </a>
        <nav aria-label="Footer navigation">
          <a href="/blog/">Writing</a>
          <a href="/topics/">Topics</a>
          <a href="/projects/">Projects</a>
          <a href="/about/">About</a>
          <a href="/guides/">Guides</a>
          <a href="/rss.xml">RSS</a>
          <a href="/hiring/">Work with me</a>
          <a href="mailto:hello@kamran.sh">Email</a>
        </nav>
      </div>
      <p className="footer-audit">
        I audit LLM serving cost and speed.{' '}
        <a href={auditUrl('footer')}>See the audit</a>.
      </p>
      <FooterArt kind={kind} scene={scene} />
      <div className="footer-note">
        <small>
          © {new Date().getFullYear()} SayBackend ·{' '}
          <a href="https://happyformatter.com">Tools</a> ·{' '}
          <a href="https://kamran.sh">Portfolio</a> ·{' '}
          <a href="/llms.txt">LLMs</a> ·{' '}
          <a href="/sitemap-index.xml">Sitemap</a>
        </small>
        {kind === 'flow' && !scene ? null : (
          <span className="hand footer-sign">— Kamran</span>
        )}
      </div>
    </footer>
  )
}
