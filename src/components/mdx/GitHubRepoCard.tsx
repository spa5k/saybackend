import { GithubLogo } from '@phosphor-icons/react'

export default function GitHubRepoCard({
  repo,
  title,
  description,
  showReleases = true,
}: {
  repo: string
  title?: string
  description?: string
  showReleases?: boolean
}) {
  const repoUrl = `https://github.com/${repo}`
  return (
    <aside className="repo-card" aria-label="GitHub repository">
      <GithubLogo size={22} aria-hidden />
      <div>
        <span className="eyebrow">Open source</span>
        <h3>{title ?? repo}</h3>
        {description ? <p>{description}</p> : null}
        <div className="repo-actions">
          <a href={repoUrl} target="_blank" rel="noreferrer">
            View repository
          </a>
          {showReleases ? (
            <a href={`${repoUrl}/releases`} target="_blank" rel="noreferrer">
              Releases
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
