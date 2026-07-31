import { Link, createFileRoute } from '@tanstack/react-router'

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
            name: 'Hire Kamran Tahir',
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
              'Senior Software Engineer open to backend, full-stack, and frontend roles.',
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
            { name: 'Hire Me', path: '/hiring/' },
          ]),
        ],
      },
    }),
  component: Hiring,
})

const roleFocus = [
  'Senior Software Engineer',
  'Backend Engineer',
  'Full-Stack Engineer',
  'Frontend Engineer',
]

const strengths = [
  'AWS architecture and serverless systems',
  'Distributed APIs and microservices',
  'Data pipelines and event-driven workflows',
  'Modern frontend and product collaboration',
]

function Hiring() {
  return (
    <section className="page-frame hiring-page">
      <header className="page-heading">
        <p className="eyebrow hiring-status">Available for the right team</p>
        <h1>Let’s build reliable products together.</h1>
        <p>
          I’m actively interviewing for software engineering roles across
          backend, full-stack, frontend, and platform teams.
        </p>
      </header>
      <div className="hiring-profile">
        <img
          src="/images/pfp.png"
          alt="Kamran Tahir"
          width={1024}
          height={1536}
          decoding="async"
        />
        <div>
          <h2>Senior engineer, product-minded delivery.</h2>
          <p>
            I build reliable systems across product and platform layers, with
            strong experience in AWS architectures, distributed services,
            data-heavy workflows, and pragmatic delivery.
          </p>
          <div className="profile-actions">
            <a href={`mailto:${SITE.email}`}>Start a conversation</a>
            <a href="https://kamran.sh/" target="_blank" rel="noreferrer">
              View resume
            </a>
            <Link to="/projects">Projects</Link>
          </div>
        </div>
      </div>
      <div className="hiring-columns">
        <section>
          <p className="eyebrow">Role focus</p>
          <ul>
            {roleFocus.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </section>
        <section>
          <p className="eyebrow">Technical scope</p>
          <ul>
            {strengths.map((strength) => (
              <li key={strength}>{strength}</li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  )
}
