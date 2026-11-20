import { Link, createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/paper/PageHero'
import { meet } from '@/components/paper/scenes'

import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'

export const Route = createFileRoute('/hiring')({
  head: () =>
    seo({
      ...PAGE_META.hiring,
      path: '/hiring',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebPage',
            name: 'Work with Kamran Tahir',
            description: PAGE_META.hiring.description,
            url: `${SITE.origin}/hiring/`,
            isPartOf: {
              '@type': 'WebSite',
              '@id': `${SITE.origin}/#website`,
            },
            mainEntity: { '@id': `${SITE.origin}/#author` },
          },
          {
            '@type': 'Person',
            '@id': `${SITE.origin}/#author`,
            name: 'Kamran Tahir',
            jobTitle: 'Senior Software Engineer',
            description:
              'Senior Software Engineer, happy to discuss scalable systems and architectural challenges.',
            image: `${SITE.origin}/images/pfp.png`,
            url: `${SITE.origin}/hiring/`,
            email: SITE.email,
            sameAs: [
              'https://github.com/spa5k',
              'https://linkedin.com/in/kamrantahir2',
              'https://kamran.sh/',
            ],
            knowsAbout: [
              'Backend Development',
              'Frontend Development',
              'Full-Stack Engineering',
              'AWS',
              'Microservices',
              'Data Pipelines',
              'AI Systems',
              'PostgreSQL',
              'TypeScript',
              'Go',
            ],
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Work with me', path: '/hiring/' },
          ]),
        ],
      },
    }),
  component: Hiring,
})

const areas = [
  {
    text: 'Distributed APIs and microservices',
    tag: 'backend',
    mark: 'var(--m-lilac)',
  },
  {
    text: 'Data pipelines and event-driven workflows',
    tag: 'data',
    mark: 'var(--m-blue)',
  },
  { text: 'AI agent platforms', tag: 'agents', mark: 'var(--m-amber)' },
  {
    text: 'Modern frontend with product teams',
    tag: 'web',
    mark: 'var(--m-sage)',
  },
]

function Hiring() {
  return (
    <>
      <PageHero
        motif={{ name: 'layers' }}
        scene={meet}
        eyebrow="Work with me"
        title="Let’s build reliable products together."
        meta={
          <>
            I am glad to talk about scalable systems and hard architecture
            problems.
          </>
        }
      />
      <section className="page-frame me-page">
        <p className="eyebrow">Where I can help</p>
        <ul className="me-rows">
          {areas.map((area, index) => (
            <li key={area.text} style={{ animationDelay: `${index * 90}ms` }}>
              <span className="mark-square" style={{ background: area.mark }} />
              {area.text}
              <small>{area.tag}</small>
            </li>
          ))}
        </ul>

        <div className="me-contact">
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <svg aria-hidden="true" viewBox="0 0 70 30">
            <path d="M66 22C44 26 22 20 6 10" />
            <path d="M16 6L5 9l5 11" />
          </svg>
          <span className="hand">the fastest way</span>
        </div>
        <div className="me-links">
          <a href="https://cal.com/kamrantahir" target="_blank" rel="noopener">
            Book a call
          </a>
          <a href="https://kamran.sh/" target="_blank" rel="noopener">
            Resume
          </a>
          <Link to="/projects/">Projects</Link>
        </div>
      </section>
    </>
  )
}
