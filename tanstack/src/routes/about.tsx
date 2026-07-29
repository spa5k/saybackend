import { createFileRoute } from '@tanstack/react-router'

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
              'http://kamran.sh/',
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

function About() {
  return (
    <section className="page-frame profile-page">
      <header className="page-heading">
        <p className="eyebrow">About the author</p>
        <h1>Kamran Tahir</h1>
        <p>
          I build scalable backend systems, event-driven pipelines, and
          pragmatic infrastructure on AWS.
        </p>
      </header>
      <div className="profile-intro">
        <img src="/images/pfp.png" alt="Kamran Tahir" />
        <div>
          <p>
            I’m a Senior Software Engineer focused on reliable systems, clean
            interfaces, and steady delivery. SayBackend is where I document the
            decisions, failures, and patterns worth carrying forward.
          </p>
          <div className="profile-actions">
            <a href={`mailto:${SITE.email}`}>Email</a>
            <a href="http://kamran.sh/" target="_blank" rel="noreferrer">
              Resume
            </a>
            <a
              href="https://linkedin.com/in/kamrantahir2"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="profile-columns">
        <section>
          <p className="eyebrow">Focus</p>
          <h2>Systems that stay understandable.</h2>
          <ul>
            <li>AWS serverless and microservices</li>
            <li>Node.js, TypeScript, and Go</li>
            <li>PostgreSQL and data pipelines</li>
            <li>Performance, reliability, and observability</li>
          </ul>
        </section>
        <section>
          <p className="eyebrow">Recent work</p>
          <h2>Product and platform delivery.</h2>
          <ul>
            <li>Zeller — POS integrations across Go, Node, and AWS</li>
            <li>Shiba Inu — analytics at 100k+ events per minute</li>
            <li>GoKwik — payments, microservices, and test modernization</li>
          </ul>
        </section>
      </div>
    </section>
  )
}
