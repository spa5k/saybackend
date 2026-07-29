import type { ReactNode } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { Giscus } from '@/components/Giscus'
import { Picture } from '@/components/mdx/AstroAssets'
import Callout from '@/components/mdx/Callout'
import GitHubRepoCard from '@/components/mdx/GitHubRepoCard'
import InteractiveDiagram from '@/components/react/InteractiveDiagram'
import {
  HappyContextHero,
  IntegrationsMatrix,
  RequestLifecycleRail,
  SamplingDecisionPanel,
  SamplingTrap,
  WideEventBuilderSimulator,
  WideEventsBeforeAfter,
  WideEventValueCards,
} from '@/components/react/blog/happycontext/HappyContextBlocks'
import {
  HookPhaseExplorer,
  PgStrictPlayground,
} from '@/components/react/blog/pgstrict/PgStrictBlocks'
import { BenchmarkChart } from '@/components/react/charts/BenchmarkChart'
import ComparisonChart from '@/components/react/charts/ComparisonChart'
import PerformanceBarChart from '@/components/react/charts/PerformanceBarChart'
import PerformanceScatterChart from '@/components/react/charts/PerformanceScatterChart'
import RadarChart from '@/components/react/charts/RadarChart'
import { ChartBarMultiple } from '@/components/react/charts/SampleCharts/ChartInteractive'
import { ChartSimple } from '@/components/react/charts/SampleCharts/ChartSimple'
import { ShadcnPerformanceChart } from '@/components/react/charts/ShadcnPerformanceChart'
import { ShadcnThroughputChart } from '@/components/react/charts/ShadcnThroughputChart'
import {
  MultiMetricRadarChart,
  PerformanceStorageScatterChart,
} from '@/components/react/charts/UUIDAdvancedCharts'
import {
  PerformanceComparisonChart,
  StorageComparisonChart,
} from '@/components/react/charts/UUIDBenchmarkCharts'
import AnalysisTable from '@/components/react/tables/AnalysisTable'
import ComprehensivePerformanceTable from '@/components/react/tables/ComprehensivePerformanceTable'
import DecisionMatrixTable from '@/components/react/tables/DecisionMatrixTable'
import FeatureComparisonTable from '@/components/react/tables/FeatureComparisonTable'
import PerformanceRankingTable from '@/components/react/tables/PerformanceRankingTable'
import PerformanceTable from '@/components/react/tables/PerformanceTable'
import analysisData from '@/content/blog/07-uuidv7-postgres/data/analysis-data.json'
import decisionData from '@/content/blog/07-uuidv7-postgres/data/decision-matrix.json'
import featureData from '@/content/blog/07-uuidv7-postgres/data/feature-comparison.json'
import rankingData from '@/content/blog/07-uuidv7-postgres/data/ranking-data.json'
import performanceData from '@/data/performance_summary.json'
import { seo } from '@/lib/site'
import galleryCss from './internal-components.css?url'

const diagram = `flowchart LR
  Request["Incoming request"] --> Parse["Parse query"]
  Parse --> Guard{"Strict mode?"}
  Guard -->|safe| Execute["Execute query"]
  Guard -->|unsafe| Reject["Reject with hint"]`

const groups = [
  { href: '#mdx', label: 'MDX primitives' },
  { href: '#article-specific', label: 'Article-specific' },
  { href: '#charts', label: 'Charts' },
  { href: '#tables', label: 'Tables' },
] as const

export const Route = createFileRoute('/internal/components')({
  head: () => {
    const metadata = seo({
      title: 'Internal Component Gallery',
      description: 'Internal visual inventory of SayBackend blog components.',
      path: '/internal/components',
      noindex: true,
    })
    return {
      ...metadata,
      links: [...metadata.links, { rel: 'stylesheet', href: galleryCss }],
    }
  },
  component: ComponentGallery,
})

function ComponentPreview({
  children,
  kind,
  name,
}: {
  children: ReactNode
  kind: 'interactive' | 'static'
  name: string
}) {
  return (
    <article className="component-preview">
      <header className="component-preview-header">
        <div>
          <p>{kind}</p>
          <h3>{name}</h3>
        </div>
        <span>Workbench</span>
      </header>
      <section
        aria-label={`${name} workbench`}
        className="component-preview-surface"
      >
        <div className="component-preview-canvas">{children}</div>
      </section>
    </article>
  )
}

function ComponentGallery() {
  return (
    <main className="component-gallery page-frame" data-pagefind-ignore="all">
      <header className="component-gallery-intro">
        <div className="component-gallery-intro-copy">
          <p className="eyebrow">Internal · component inventory</p>
          <h1>The component workbench.</h1>
          <p>
            One canonical view of every component as it ships in SayBackend
            articles.
          </p>
          <nav aria-label="Component groups">
            {groups.map((group) => (
              <a href={group.href} key={group.href}>
                {group.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="component-gallery-group" id="mdx">
        <div className="component-gallery-heading">
          <p className="eyebrow">01</p>
          <h2>MDX primitives</h2>
        </div>
        <ComponentPreview name="Callout" kind="static">
          <div className="component-gallery-stack">
            <Callout type="default" title="Editorial note">
              Default callouts keep supporting context close to the article.
            </Callout>
            <Callout type="info" title="Useful context">
              Info callouts highlight implementation details worth noticing.
            </Callout>
            <Callout type="warning" title="Production caveat">
              Warning callouts flag trade-offs that can change a decision.
            </Callout>
          </div>
        </ComponentPreview>
        <ComponentPreview name="GitHubRepoCard" kind="static">
          <GitHubRepoCard
            repo="spa5k/pg_strict"
            title="pg_strict"
            description="A PostgreSQL extension experiment for safer query execution."
          />
        </ComponentPreview>
        <ComponentPreview name="Picture / Image" kind="static">
          <Picture
            src="/images/blog.png"
            alt="SayBackend blog artwork"
            width={1200}
            height={630}
          />
        </ComponentPreview>
      </section>

      <section className="component-gallery-group" id="article-specific">
        <div className="component-gallery-heading">
          <p className="eyebrow">02</p>
          <h2>Article-specific components</h2>
        </div>
        <ComponentPreview name="InteractiveDiagram" kind="interactive">
          <InteractiveDiagram code={diagram} title="Query safety flow" />
        </ComponentPreview>
        <ComponentPreview name="HappyContextHero" kind="static">
          <HappyContextHero />
        </ComponentPreview>
        <ComponentPreview name="WideEventValueCards" kind="static">
          <WideEventValueCards />
        </ComponentPreview>
        <ComponentPreview name="WideEventsBeforeAfter" kind="interactive">
          <WideEventsBeforeAfter />
        </ComponentPreview>
        <ComponentPreview name="WideEventBuilderSimulator" kind="interactive">
          <WideEventBuilderSimulator />
        </ComponentPreview>
        <ComponentPreview name="IntegrationsMatrix" kind="static">
          <IntegrationsMatrix />
        </ComponentPreview>
        <ComponentPreview name="RequestLifecycleRail" kind="static">
          <RequestLifecycleRail />
        </ComponentPreview>
        <ComponentPreview name="SamplingTrap" kind="interactive">
          <SamplingTrap />
        </ComponentPreview>
        <ComponentPreview name="SamplingDecisionPanel" kind="static">
          <SamplingDecisionPanel />
        </ComponentPreview>
        <ComponentPreview name="PgStrictPlayground" kind="interactive">
          <PgStrictPlayground />
        </ComponentPreview>
        <ComponentPreview name="HookPhaseExplorer" kind="interactive">
          <HookPhaseExplorer />
        </ComponentPreview>
        <ComponentPreview name="Giscus" kind="interactive">
          <Giscus term="internal-component-gallery-preview" />
        </ComponentPreview>
      </section>

      <section className="component-gallery-group" id="charts">
        <div className="component-gallery-heading">
          <p className="eyebrow">03</p>
          <h2>Charts</h2>
        </div>
        <div className="component-gallery-grid">
          <ComponentPreview name="BenchmarkChart" kind="interactive">
            <BenchmarkChart />
          </ComponentPreview>
          <ComponentPreview name="ComparisonChart" kind="interactive">
            <ComparisonChart type="side-by-side" />
          </ComponentPreview>
          <ComponentPreview name="PerformanceBarChart" kind="interactive">
            <PerformanceBarChart />
          </ComponentPreview>
          <ComponentPreview name="PerformanceScatterChart" kind="interactive">
            <PerformanceScatterChart />
          </ComponentPreview>
          <ComponentPreview name="RadarChart" kind="interactive">
            <RadarChart />
          </ComponentPreview>
          <ComponentPreview name="ShadcnPerformanceChart" kind="interactive">
            <ShadcnPerformanceChart />
          </ComponentPreview>
          <ComponentPreview name="ShadcnThroughputChart" kind="interactive">
            <ShadcnThroughputChart />
          </ComponentPreview>
          <ComponentPreview
            name="PerformanceComparisonChart"
            kind="interactive"
          >
            <PerformanceComparisonChart />
          </ComponentPreview>
          <ComponentPreview name="StorageComparisonChart" kind="interactive">
            <StorageComparisonChart />
          </ComponentPreview>
          <ComponentPreview
            name="PerformanceStorageScatterChart"
            kind="interactive"
          >
            <PerformanceStorageScatterChart />
          </ComponentPreview>
          <ComponentPreview name="MultiMetricRadarChart" kind="interactive">
            <MultiMetricRadarChart
              selectedImplementations={[
                'UUIDv4',
                'Native uuidv7()',
                'ULID',
                'TypeID',
              ]}
            />
          </ComponentPreview>
          <ComponentPreview name="ChartBarMultiple" kind="interactive">
            <ChartBarMultiple />
          </ComponentPreview>
          <ComponentPreview name="ChartSimple" kind="interactive">
            <ChartSimple />
          </ComponentPreview>
        </div>
      </section>

      <section className="component-gallery-group" id="tables">
        <div className="component-gallery-heading">
          <p className="eyebrow">04</p>
          <h2>Tables</h2>
        </div>
        <ComponentPreview name="AnalysisTable" kind="static">
          <AnalysisTable
            title={analysisData.postgresql_18_native.title}
            data={analysisData.postgresql_18_native}
          />
        </ComponentPreview>
        <ComponentPreview name="PerformanceTable" kind="static">
          <PerformanceTable data={performanceData.performance_summary} />
        </ComponentPreview>
        <ComponentPreview name="PerformanceRankingTable" kind="static">
          <PerformanceRankingTable data={rankingData.performance_rankings} />
        </ComponentPreview>
        <ComponentPreview name="FeatureComparisonTable" kind="static">
          <FeatureComparisonTable data={featureData.feature_comparison} />
        </ComponentPreview>
        <ComponentPreview name="ComprehensivePerformanceTable" kind="static">
          <ComprehensivePerformanceTable
            data={performanceData.performance_summary}
          />
        </ComponentPreview>
        <ComponentPreview name="DecisionMatrixTable" kind="static">
          <DecisionMatrixTable data={decisionData.decision_matrix} />
        </ComponentPreview>
      </section>
    </main>
  )
}
