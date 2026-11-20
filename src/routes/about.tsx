import { createFileRoute } from '@tanstack/react-router'
import { PageHero } from '@/components/paper/PageHero'
import { career } from '@/components/paper/scenes'

import { PAGE_META, SITE, breadcrumb, seo } from '@/lib/site'

export const Route = createFileRoute('/about')({
  head: () =>
    seo({
      ...PAGE_META.about,
      path: '/about',
      schema: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Person',
            '@id': `${SITE.origin}/#author`,
            name: 'Kamran Tahir',
            jobTitle: 'Senior Software Engineer',
            description:
              'Senior Software Engineer specializing in backend systems, AWS serverless architecture, PostgreSQL, and DevOps with 6+ years of experience',
            image: `${SITE.origin}/images/pfp.png`,
            url: `${SITE.origin}/about/`,
            sameAs: [
              'https://github.com/spa5k',
              'https://linkedin.com/in/kamrantahir2',
              'https://kamran.sh/',
            ],
            email: SITE.email,
            knowsLanguage: ['en'],
            worksFor: { '@id': `${SITE.origin}/#organization` },
            hasOccupation: [
              {
                '@type': 'Occupation',
                name: 'Senior Software Engineer',
                skills: [
                  'Backend Engineering',
                  'AWS Serverless',
                  'PostgreSQL',
                  'Kubernetes',
                  'DevOps',
                ],
              },
            ],
            knowsAbout: [
              'Backend Development',
              'AWS Serverless',
              'PostgreSQL',
              'Kubernetes',
              'Docker',
              'Go Programming',
              'Node.js',
              'TypeScript',
              'Microservices',
              'DevOps',
            ],
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/' },
          ]),
        ],
      },
    }),
  component: About,
})

const places = [
  { name: 'GoKwik', work: 'payments', mark: 'var(--m-sand)' },
  { name: 'Shiba Inu', work: 'analytics', mark: 'var(--m-sage)' },
  { name: 'Zeller', work: 'POS integrations', mark: 'var(--m-blue)' },
  { name: 'Trelium', work: 'AI agents', mark: 'var(--m-lilac)' },
]

const focus = [
  { text: 'Go, TypeScript and Node.js', mark: 'var(--m-lilac)' },
  { text: 'PostgreSQL and data pipelines', mark: 'var(--m-blue)' },
  { text: 'AWS serverless and microservices', mark: 'var(--m-amber)' },
  { text: 'Performance, reliability and observability', mark: 'var(--m-sage)' },
]

function About() {
  return (
    <>
      <PageHero
        motif={{ name: 'lanes' }}
        scene={career}
        eyebrow="About"
        title="Kamran Tahir"
        meta={<>I build backend systems.</>}
      />
      <section className="page-frame me-page">
        <div className="me-top">
          <div>
            <p className="me-lead">
              I am a senior software engineer. I care about systems that stay
              understandable. SayBackend is where I write down the decisions,
              failures and patterns worth keeping.
            </p>
            <div className="me-links">
              <a href={`mailto:${SITE.email}`}>Email</a>
              <a href="https://kamran.sh/" target="_blank" rel="noopener">
                Resume
              </a>
              <a
                href="https://linkedin.com/in/kamrantahir2"
                target="_blank"
                rel="noopener"
              >
                LinkedIn
              </a>
              <a href="https://github.com/spa5k" target="_blank" rel="noopener">
                GitHub
              </a>
            </div>
          </div>
          <figure className="me-photo">
            <img
              src="/images/pfp.png"
              alt="Kamran Tahir"
              width={1024}
              height={1536}
              decoding="async"
            />
            <figcaption className="hand">that is me</figcaption>
          </figure>
        </div>

        <p className="eyebrow">Where I worked</p>
        <ol className="me-places">
          <svg
            aria-hidden="true"
            preserveAspectRatio="none"
            viewBox="0 0 100 10"
          >
            <path d="M0 5.4C22 4.6 60 6 100 4.8" />
          </svg>
          {places.map((place, index) => (
            <li
              key={place.name}
              style={{ animationDelay: `${300 + index * 260}ms` }}
            >
              <span
                className="mark-square"
                style={{ background: place.mark }}
              />
              <strong>{place.name}</strong>
              <small>{place.work}</small>
            </li>
          ))}
        </ol>

        <p className="eyebrow">What I work on</p>
        <ul className="me-rows">
          {focus.map((item, index) => (
            <li key={item.text} style={{ animationDelay: `${index * 90}ms` }}>
              <span className="mark-square" style={{ background: item.mark }} />
              {item.text}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
