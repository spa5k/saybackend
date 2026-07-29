import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { SiteShell } from '@/components/SiteShell'
import { PAGE_META } from '@/lib/site'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: PAGE_META.home.title },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: '/favicon-96x96.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'stylesheet', href: '/pagefind/pagefind-ui.css' },
    ],
    scripts: [
      {
        children: `(()=>{try{const saved=localStorage.getItem("saybackend-theme")||localStorage.getItem("theme");const followsSystem=!saved||saved==="auto";const dark=saved==="dark"||(followsSystem&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark)}catch{}})();`,
      },
      { src: '/pagefind/pagefind-ui.js' },
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-5XS7E70997',
        async: true,
      },
      {
        children: `window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","G-5XS7E70997");`,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <>
      <title>404 — Not Found | SayBackend</title>
      <meta
        name="description"
        content="The page you are looking for does not exist."
      />
      <meta name="robots" content="noindex,follow" />
      <link rel="canonical" href="https://saybackend.com/404/" />
      <section className="page-frame simple-page not-found">
        <p className="eyebrow">404</p>
        <h1>That page wandered off.</h1>
        <p>
          The address may have changed, or the page may no longer exist. The
          archive is the best place to pick up the trail.
        </p>
        <a className="text-link" href="/blog">
          Browse the blog →
        </a>
      </section>
    </>
  )
}
