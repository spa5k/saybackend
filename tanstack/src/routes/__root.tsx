import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { NotFoundPage } from '@/components/NotFoundPage'
import { SiteShell } from '@/components/SiteShell'
import { NOT_FOUND_META, PAGE_META, SITE } from '@/lib/site'
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
    ],
    scripts: [
      {
        children: `(()=>{try{const saved=localStorage.getItem("saybackend-theme")||localStorage.getItem("theme");const followsSystem=!saved||saved==="auto";const dark=saved==="dark"||(followsSystem&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",dark)}catch{}})();`,
      },
      {
        children: `(()=>{window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag("js",new Date());gtag("config","G-5XS7E70997");const load=()=>{const script=document.createElement("script");script.async=true;script.src="https://www.googletagmanager.com/gtag/js?id=G-5XS7E70997";document.head.append(script)};if(document.readyState==="complete")load();else addEventListener("load",load,{once:true})})();`,
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
      <title>{`${NOT_FOUND_META.title} | ${SITE.title}`}</title>
      <meta name="description" content={NOT_FOUND_META.description} />
      <meta name="robots" content="noindex,follow" />
      <link
        rel="canonical"
        href={new URL(`${NOT_FOUND_META.path}/`, SITE.origin).href}
      />
      <NotFoundPage />
    </>
  )
}
