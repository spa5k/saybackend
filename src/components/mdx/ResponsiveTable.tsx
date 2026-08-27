import type { ComponentProps } from 'react'

export default function ResponsiveTable(props: ComponentProps<'table'>) {
  return (
    <div className="mdx-table-scroll">
      <table {...props} />
    </div>
  )
}
