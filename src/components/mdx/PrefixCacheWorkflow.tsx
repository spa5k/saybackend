import { BlockRows } from '@/components/paper/BlockRows'

type Props = {
  title?: string
  caption?: string
}

/** The four things the scheduler does with the blocks of a new request. */
export default function PrefixCacheWorkflow({ title, caption }: Props) {
  return (
    <BlockRows
      stacked
      title={title ?? 'How a new request reuses the prefix'}
      caption={caption}
      description="A new request with four blocks. Step 1: each block is hashed. Step 2: the cache map has blocks 0 to 2 and does not have block 3. Step 3: blocks 0 to 2 get one more reference and leave the free queue. Step 4: block 3 is allocated and computed, and decoding starts after it."
      rows={[
        {
          label: '1. Hash each block of the request',
          blocks: [
            { text: 'tokens 0', mark: 'sand', sub: 'h0' },
            { text: 'tokens 1', mark: 'sand', sub: 'h1' },
            { text: 'tokens 2', mark: 'sand', sub: 'h2' },
            { text: 'tokens 3', mark: 'sand', sub: 'h3' },
          ],
        },
        {
          label: '2. Look up each hash: get_computed_blocks()',
          blocks: [
            { text: 'blk 0', mark: 'lilac', sub: 'hit' },
            { text: 'blk 1', mark: 'lilac', sub: 'hit' },
            { text: 'blk 2', mark: 'lilac', sub: 'hit' },
            { text: 'no block', mark: 'rose', sub: 'miss' },
          ],
        },
        {
          label: '3. Touch the computed blocks: allocate_slots()',
          blocks: [
            { text: 'blk 0', mark: 'lilac', sub: '+1 ref' },
            { text: 'blk 1', mark: 'lilac', sub: '+1 ref' },
            { text: 'blk 2', mark: 'lilac', sub: '+1 ref' },
          ],
        },
        {
          label: '4. Allocate the tail, if the pool has capacity',
          blocks: [
            { text: 'blk 0', mark: 'lilac' },
            { text: 'blk 1', mark: 'lilac' },
            { text: 'blk 2', mark: 'lilac' },
            { text: 'blk 3', mark: 'amber', sub: 'computed now' },
          ],
        },
      ]}
      legend={[
        { label: 'Reused prefix', mark: 'lilac' },
        { label: 'New tail', mark: 'amber' },
      ]}
      notes={[{ row: 2, block: 2, text: 'they leave the free queue' }]}
    />
  )
}
