import type { CSSProperties, ReactNode } from 'react'

import { Figure, HandNote, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

/*
 * One vocabulary for the five "Rust on a laptop" posts:
 *   sand block    a file or a folder that is only kept
 *   lilac block   the subject: what is new, private or rebuilt
 *   blue block    a shared thing: a cache, a store, shared data
 *   rose tick     a thing that is stopped or deleted
 *   ink outline   a container: a folder, a worktree, an image, a process
 *   dashed line   a link that holds no data of its own
 */

const SMALL: CSSProperties = { fontSize: 11 }
const TINY: CSSProperties = { fontSize: 9.5 }
const MONO: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9.5,
}
const PATH: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 8,
}

/** A marker block with an optional label in its middle. */
function Block({
  x,
  y,
  w,
  h = 30,
  mark,
  children,
  strong = false,
  style = SMALL,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  children?: ReactNode
  strong?: boolean
  style?: CSSProperties
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        filter="url(#pp-marker)"
        style={{ fill: MARKS[mark] }}
      />
      {children ? (
        <text
          className={strong ? 'fig-strong' : undefined}
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
          style={style}
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

/** A container: an ink outline, dashed when it holds only links. */
function Frame({
  x,
  y,
  w,
  h,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  dashed?: boolean
}) {
  return (
    <rect
      className="fig-axis"
      x={x}
      y={y}
      width={w}
      height={h}
      rx="5"
      strokeDasharray={dashed ? '5 5' : undefined}
    />
  )
}

/** A thin connector with a pen arrow head. */
function Arrow({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      className="ink-stroke"
      markerEnd="url(#pp-ink-arrow)"
      strokeDasharray={dashed ? '5 5' : undefined}
      d={d}
    />
  )
}

/** A grid of small squares: one square is one file, crate or block. */
function Squares({
  x,
  y,
  n,
  cols,
  size = 8,
  gap = 2,
  mark,
  tinted = 0,
  tint = 'lilac',
}: {
  x: number
  y: number
  n: number
  cols: number
  size?: number
  gap?: number
  mark: MarkName
  /** The first `tinted` squares take the `tint` mark. */
  tinted?: number
  tint?: MarkName
}) {
  return (
    <g filter="url(#pp-marker)">
      {Array.from({ length: n }, (_, index) => (
        <rect
          key={index}
          x={x + (index % cols) * (size + gap)}
          y={y + Math.floor(index / cols) * (size + gap)}
          width={size}
          height={size}
          style={{ fill: MARKS[index < tinted ? tint : mark] }}
        />
      ))}
    </g>
  )
}

/** The place where something is stopped or deleted. */
function Stop({ x, y }: { x: number; y: number }) {
  return (
    <rect
      x={x - 3}
      y={y - 9}
      width="6"
      height="18"
      filter="url(#pp-marker)"
      style={{ fill: MARKS.rose }}
    />
  )
}

/** A step number in a pen circle. */
function Num({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle className="ink-stroke" cx={x} cy={y} r="8" />
      <text
        className="fig-strong"
        x={x}
        y={y + 4}
        textAnchor="middle"
        style={SMALL}
      >
        {n}
      </text>
    </g>
  )
}

/* ------------------------------------------------------------------ */
/* Post 1: where the disk goes                                         */
/* ------------------------------------------------------------------ */

/** The Cargo 1.100 build-dir layout: one folder for each compiled unit. */
export function BuildDirUnits() {
  return (
    <Figure
      title="One folder for each compiled unit"
      legend={[
        { label: 'a compiled copy of syn', mark: 'lilac' },
        { label: 'a build script', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 176"
        role="img"
        aria-label="Since Cargo 1.100 each compiled unit of a package has its own folder under build/<package>/<hash>. After build, check, test and clippy the package syn had four compiled copies. A build script has one folder for its binary and one for its run output."
      >
        <text className="fig-strong" x="10" y="18" style={MONO}>
          target/debug/build/syn/
        </text>
        <path className="fig-axis" d="M16 26V40H310M114 40V48M212 40V48" />
        <path className="fig-axis" d="M16 40V48M310 40V48" />
        {[0, 1, 2, 3].map((index) => (
          <g key={index}>
            <Block x={10 + index * 98} y={50} w={90} h={62} mark="lilac" />
            <text
              className="fig-strong"
              x={18 + index * 98}
              y={68}
              style={MONO}
            >
              {'<hash>/'}
            </text>
            <text x={26 + index * 98} y={84} style={MONO}>
              out/
            </text>
            <text x={26 + index * 98} y={99} style={MONO}>
              fingerprint/
            </text>
          </g>
        ))}
        <HandNote
          x={24}
          y={144}
          text="4 compiled copies of syn after one day"
          rotate={-2}
        />

        <text className="fig-strong" x="420" y="18" style={MONO}>
          target/debug/build/libc/
        </text>
        <path className="fig-axis" d="M426 26V40H584M426 40V48M584 40V48" />
        <Block x={420} y={50} w={150} h={34} mark="sand" />
        <text className="fig-strong" x="428" y="64" style={MONO}>
          {'<hash>/'}
        </text>
        <text x="428" y="77" style={MONO}>
          out/build_script_build
        </text>
        <text x="578" y="71" style={TINY}>
          binary
        </text>
        <Block x={420} y={94} w={150} h={34} mark="sand" />
        <text className="fig-strong" x="428" y="108" style={MONO}>
          {'<hash>/'}
        </text>
        <text x="428" y="121" style={MONO}>
          run/ + out/
        </text>
        <text x="578" y="115" style={TINY}>
          output
        </text>
        <text x="420" y="146" style={SMALL}>
          build script binary, build script output
        </text>
      </svg>
    </Figure>
  )
}

/** macOS debug info: object files stored twice, or one .dSYM per link. */
export function UnpackedObjects() {
  return (
    <Figure
      title="One dependency on macOS, stored twice"
      legend={[
        { label: 'inside the rlib', mark: 'sand' },
        { label: 'the second copy', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 262"
        role="img"
        aria-label="With unpacked debug info on macOS, each dependency's object files are stored inside the rlib and again as separate .o files, and the binary refers to the loose copies. With packed, dsymutil copies the debug info into a .dSYM bundle of 187 MB on each link."
      >
        <text className="fig-strong" x="10" y="18" style={SMALL}>
          split-debuginfo = unpacked
        </text>
        <Frame x={10} y={30} w={186} h={86} />
        <text x="20" y="46" style={MONO}>
          libactix_web.rlib
        </text>
        <Squares x={20} y={54} n={16} cols={8} size={16} gap={4} mark="sand" />
        <rect
          x="20"
          y="98"
          width="156"
          height="9"
          filter="url(#pp-marker)"
          style={{ fill: MARKS.sand }}
        />
        <text x="20" y="130" style={MONO}>
          cgu.00.o … cgu.15.o, lib.rmeta
        </text>

        <Squares
          x={236}
          y={54}
          n={16}
          cols={8}
          size={16}
          gap={4}
          mark="lilac"
        />
        <text x="236" y="46" style={SMALL}>
          the same .o files,
        </text>
        <text x="236" y="108" style={SMALL}>
          kept for debug info
        </text>

        <Block x={490} y={56} w={140} h={36} mark="sand">
          miniserve (binary)
        </Block>
        <Arrow dashed d="M486 74H400" />
        <text x="630" y="110" textAnchor="end" style={SMALL}>
          debug map: file names only
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M10 148H630" />

        <text className="fig-strong" x="10" y="172" style={SMALL}>
          split-debuginfo = packed
        </text>
        <Frame x={10} y={184} w={186} h={64} />
        <text x="20" y="200" style={MONO}>
          libactix_web.rlib
        </text>
        <Squares
          x={20}
          y={208}
          n={16}
          cols={8}
          size={16}
          gap={4}
          mark="sand"
        />
        <Block x={300} y={198} w={170} h={36} mark="lilac" strong>
          miniserve.dSYM 187 MB
        </Block>
        <Block x={490} y={198} w={140} h={36} mark="sand">
          miniserve (binary)
        </Block>
        <text x="300" y="250" style={SMALL}>
          dsymutil on every link
        </text>
      </svg>
    </Figure>
  )
}

/** A shared target directory: the second cargo command waits. */
export function SharedTargetLock() {
  const at = (seconds: number) => 96 + seconds * 10.4
  return (
    <Figure
      title="Two checkouts, one target directory"
      legend={[
        { label: 'waits for the lock', mark: 'sand' },
        { label: 'works', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="With a shared target directory, a cargo check started 2 seconds after a cold cargo build waits until the build finishes at 35.9 seconds and returns at about 50 seconds after its start, 48.5 seconds in total, against 31.4 seconds with its own directory."
      >
        <text x="10" y="50" style={SMALL}>
          A: cargo build
        </text>
        <Block x={at(0)} y={34} w={at(35.9) - at(0)} h={24} mark="lilac" />

        <text x="10" y="92" style={SMALL}>
          B: cargo check
        </text>
        <Block x={at(2)} y={76} w={at(35.9) - at(2)} h={24} mark="sand" />
        <text x={at(2) + 8} y={92} style={TINY}>
          Blocking waiting for file lock on build directory
        </text>
        <Block
          x={at(35.9)}
          y={76}
          w={at(50.5) - at(35.9)}
          h={24}
          mark="lilac"
          strong
        >
          check
        </Block>

        <rect
          className="fig-axis"
          x={at(0)}
          y={114}
          width={at(31.4) - at(0)}
          height={20}
          strokeDasharray="5 5"
        />
        <text x={at(0) + 8} y={128} style={TINY}>
          B alone, own target dir: 31.4 s
        </text>

        <HandNote
          x={556}
          y={30}
          text="48.5 s"
          arrowTo={[at(50.5) - 4, 72]}
        />

        <path className="fig-axis" d={`M${at(0)} 156H${at(50.5)}`} />
        {[0, 10, 20, 30, 40, 50].map((seconds) => (
          <g key={seconds}>
            <path className="fig-axis" d={`M${at(seconds)} 156v5`} />
            <text
              x={at(seconds)}
              y={176}
              textAnchor="middle"
              style={SMALL}
            >
              {seconds} s
            </text>
          </g>
        ))}
        <path
          className="fig-axis"
          strokeDasharray="2 5"
          strokeWidth="1"
          d={`M${at(35.9)} 28V150`}
        />
        <text x={at(35.9) - 4} y={24} textAnchor="end" style={TINY}>
          35.9 s
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Post 2: one cache for every worktree                                */
/* ------------------------------------------------------------------ */

/** Two worktrees, two sets of absolute paths, one action key. */
export function ActionKeyPaths() {
  const call = (y: number, name: string) => (
    <g>
      <Frame x={10} y={y} w={276} h={64} />
      <text className="fig-strong" x="20" y={y + 18} style={SMALL}>
        worktree {name}
      </text>
      <text x="20" y={y + 36} style={PATH}>
        .../mnt/mbx/{name}/crates/mdbook-core/src/lib.rs
      </text>
      <text x="20" y={y + 52} style={MONO}>
        .../{name}/target/debug
      </text>
    </g>
  )
  return (
    <Figure
      title="Two rustc calls for mdbook-core, one cache entry"
      legend={[{ label: 'one store entry', mark: 'blue' }]}
    >
      <svg
        viewBox="0 0 640 196"
        role="img"
        aria-label="Two worktrees run the same rustc call with different absolute paths. mbx replaces the workspace and target roots with placeholders, so both calls produce one action key and share one store entry."
      >
        {call(14, 'wt1')}
        {call(116, 'wt2')}
        <Arrow d="M288 50C298 60 296 78 304 84" />
        <Arrow d="M288 144C298 134 296 116 304 110" />

        <Frame x={308} y={62} w={226} h={70} />
        <text className="fig-strong" x="318" y="80" style={SMALL}>
          replace roots
        </text>
        <text x="318" y="100" style={PATH}>
          {'${workspace}/crates/mdbook-core/src/lib.rs'}
        </text>
        <text x="318" y="118" style={PATH}>
          {'${target}/debug'}
        </text>

        <Arrow d="M536 97H566" />
        <Block x={572} y={70} w={54} h={54} mark="blue" />
        <text
          className="fig-strong"
          x="599"
          y="60"
          textAnchor="middle"
          style={SMALL}
        >
          one action key
        </text>
        <text x="599" y="142" textAnchor="middle" style={SMALL}>
          one store entry
        </text>
        <HandNote x={520} y={176} text="same key" rotate={-3} />
      </svg>
    </Figure>
  )
}

/** One store, five targets that hold clones of its objects. */
export function OneStoreFiveTargets() {
  const targets = [8, 8, 20, 20, 8]
  return (
    <Figure
      title="Five targets, one copy of the bytes"
      legend={[
        { label: 'store object', mark: 'blue' },
        { label: "a target's own files", mark: 'lilac' },
        { label: 'logical size', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 258"
        role="img"
        aria-label="mbx keeps one 678 MiB store. Each of the five worktree targets holds reflinked clones of store objects, so the targets add up to 4.5 GiB of logical data but use 0.94 GiB of disk."
      >
        <text className="fig-strong" x="20" y="18" style={SMALL}>
          store, 678 MiB
        </text>
        <Frame x={20} y={26} w={404} h={58} />
        <Squares x={30} y={36} n={114} cols={38} mark="blue" />
        <rect
          x="30"
          y="66"
          width="378"
          height="8"
          filter="url(#pp-marker)"
          style={{ fill: MARKS.blue }}
        />

        {targets.map((own, index) => {
          const x = 20 + index * 84
          return (
            <g key={index}>
              <Arrow dashed d={`M${x + 34} 152V90`} />
              <Frame x={x} y={156} w={68} h={58} dashed />
              <rect
                x={x + 8}
                y={206 - own}
                width="14"
                height={own}
                filter="url(#pp-marker)"
                style={{ fill: MARKS.lilac }}
              />
              <text x={x + 34} y={232} textAnchor="middle" style={MONO}>
                wt{index + 1}/target
              </text>
            </g>
          )
        })}
        <HandNote x={300} y={128} text="reflink" rotate={-4} />

        <path className="fig-axis" d="M470 214H630" />
        <Block x={486} y={34} w={50} h={180} mark="sand" />
        <text x="511" y="232" textAnchor="middle" style={SMALL}>
          logical
        </text>
        <text
          className="fig-strong"
          x="511"
          y="248"
          textAnchor="middle"
          style={SMALL}
        >
          4.5 GiB
        </text>
        <Block x={566} y={176.4} w={50} h={37.6} mark="lilac" />
        <text x="591" y="232" textAnchor="middle" style={SMALL}>
          on disk
        </text>
        <text
          className="fig-strong"
          x="591"
          y="248"
          textAnchor="middle"
          style={SMALL}
        >
          0.94 GiB
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Post 3: copy-on-write worktrees                                     */
/* ------------------------------------------------------------------ */

/** An APFS clone: two files, one set of blocks, until a write. */
export function CloneBlocks() {
  const files = (x: number) => (
    <g>
      <Block x={x} y={30} w={104} h={30} mark="sand" style={MONO}>
        big.bin
      </Block>
      <Block x={x + 150} y={30} w={104} h={30} mark="sand" style={MONO}>
        clone.bin
      </Block>
      <text x={x + 52} y={22} textAnchor="middle" style={TINY}>
        own inode
      </text>
      <text x={x + 202} y={22} textAnchor="middle" style={TINY}>
        own inode
      </text>
    </g>
  )
  return (
    <Figure
      title="What an APFS clone shares"
      legend={[
        { label: 'shared block', mark: 'blue' },
        { label: 'private block', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 214"
        role="img"
        aria-label="An APFS clone shares all data blocks with the original. du counts 2.0 GB, the volume uses 1,073,766,400 bytes, and a 1 MiB write into the clone adds exactly 1,048,576 bytes of private blocks."
      >
        {files(20)}
        <Arrow d="M72 62V98" />
        <Arrow d="M222 62C222 80 190 84 180 98" />
        <Squares x={22} y={104} n={8} cols={8} size={26} gap={5} mark="blue" />
        <text x="22" y="150" style={SMALL}>
          1 GiB, shared
        </text>
        <text className="fig-strong" x="22" y="178" style={SMALL}>
          du: 2.0G
        </text>
        <text className="fig-strong" x="22" y="198" style={SMALL}>
          Volume Used Space: 1,073,766,400 bytes
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M312 10V204" />

        {files(350)}
        <Arrow d="M402 62V98" />
        <Arrow d="M552 62C552 80 520 84 510 98" />
        <Squares x={352} y={104} n={7} cols={7} size={26} gap={5} mark="blue" />
        <Arrow d="M570 62V98" />
        <rect
          x="569"
          y="104"
          width="26"
          height="26"
          filter="url(#pp-marker)"
          style={{ fill: MARKS.lilac }}
        />
        <text x="352" y="150" style={SMALL}>
          7 shared, 1 private
        </text>
        <text className="fig-strong" x="352" y="178" style={SMALL}>
          1 MiB written: +1,048,576 bytes
        </text>
      </svg>
    </Figure>
  )
}

/** The five steps of `git twig new`, from donor to registered worktree. */
export function TwigNewPipeline() {
  const dirs = [0, 1, 2, 3, 4, 5]
  return (
    <Figure
      bleed
      title="git twig new, step by step"
      caption="Counts are from the Vite run."
      legend={[
        { label: 'tracked directory', mark: 'blue' },
        { label: 'its clone', mark: 'lilac' },
        { label: 'deleted', mark: 'rose' },
      ]}
    >
      <svg
        viewBox="0 0 640 372"
        role="img"
        aria-label="git twig new builds a private index, picks the worktree with the most matching blobs (3,016 of 3,016), clones its 6 tracked top-level directories, deletes everything untracked and ignored, verifies each clone against its blob (3,011 match), lets Git write the rest, then registers the worktree with Git. The donor's root node_modules and target directories are never touched."
      >
        <text className="fig-strong" x="10" y="18" style={SMALL}>
          main checkout (donor)
        </text>
        <Frame x={10} y={26} w={620} h={56} />
        {dirs.map((index) => (
          <Block key={index} x={54 + index * 62} y={40} w={50} h={28} mark="blue" />
        ))}
        <Num x={32} y={54} n={2} />
        <rect
          className="fig-axis"
          x="446"
          y="40"
          width="82"
          height="28"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
        />
        <text x="487" y="58" textAnchor="middle" opacity="0.6" style={MONO}>
          node_modules/
        </text>
        <rect
          className="fig-axis"
          x="538"
          y="40"
          width="60"
          height="28"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
        />
        <text x="568" y="58" textAnchor="middle" opacity="0.6" style={MONO}>
          target/
        </text>
        <text x="630" y="98" textAnchor="end" style={TINY}>
          never touched
        </text>

        {dirs.map((index) => (
          <Arrow key={index} d={`M${79 + index * 62} 72V122`} />
        ))}
        <Num x={452} y={100} n={3} />

        <text className="fig-strong" x="630" y="118" textAnchor="end" style={MONO}>
          .git/twigs/staging
        </text>
        <Frame x={10} y={126} w={620} h={56} dashed />
        <Num x={32} y={154} n={1} />
        {dirs.map((index) => (
          <Block
            key={index}
            x={54 + index * 62}
            y={140}
            w={50}
            h={28}
            mark="lilac"
          />
        ))}
        <Num x={446} y={154} n={4} />
        <Arrow d="M458 154H494" />
        <Stop x={502} y={154} />
        <text x="512" y="158" style={TINY}>
          untracked, ignored
        </text>

        {dirs.map((index) => (
          <Arrow key={index} d={`M${79 + index * 62} 172V222`} />
        ))}
        <Num x={452} y={200} n={5} />

        <text className="fig-strong" x="630" y="218" textAnchor="end" style={SMALL}>
          new worktree
        </text>
        <Frame x={10} y={226} w={620} h={56} />
        {dirs.map((index) => (
          <Block
            key={index}
            x={54 + index * 62}
            y={240}
            w={50}
            h={28}
            mark="lilac"
          />
        ))}

        <text x="10" y="304" style={SMALL}>
          1 read-tree into private index · 2 pick donor: most matching blobs
          (3,016 of 3,016)
        </text>
        <text x="10" y="322" style={SMALL}>
          3 clonefile 6 top-level directories · deleted: untracked and ignored,
          e.g. packages/vite/node_modules
        </text>
        <text x="10" y="340" style={SMALL}>
          4 git hash-object each clone = blob? 3,011 yes · no → git
          checkout-index
        </text>
        <text x="10" y="358" style={SMALL}>
          5 git worktree add --no-checkout, move in, read-tree index
        </text>
      </svg>
    </Figure>
  )
}

/** File times decide whether a cloned target/ is fresh or stale. */
export function TargetMtime() {
  const row = (
    y: number,
    name: string,
    fileX: number,
    time: string,
    mark: MarkName,
    verdict: string,
  ) => (
    <g>
      <text className="fig-strong" x="10" y={y + 4} style={SMALL}>
        {name}
      </text>
      <path className="fig-axis" d={`M130 ${y}H620`} />
      <Block x={fileX - 7} y={y - 14} w={14} h={28} mark={mark} />
      <text x={fileX} y={y - 22} textAnchor="middle" style={SMALL}>
        {time}
      </text>
      <path className="fig-axis" strokeWidth="2.4" d={`M380 ${y - 16}V${y + 16}`} />
      <text className="fig-strong" x="130" y={y + 38} style={SMALL}>
        {verdict}
      </text>
    </g>
  )
  return (
    <Figure
      title="Is the source older than the build record?"
      legend={[
        { label: 'source file, time kept', mark: 'lilac' },
        { label: 'source file, time new', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 232"
        role="img"
        aria-label="clonefile keeps the donor's file times, so Cargo sees the sources as older than the cloned build output: fresh, 0 crates, 0.65 seconds with the copy, plus 1.2 MB. Files written by git worktree add are newer, and the 9 workspace crates rebuild: 5.0 seconds, plus 162 MB. Registry crates live in CARGO_HOME and are unchanged."
      >
        <text x="130" y="16" style={MONO}>
          crates/searcher/src/searcher/mod.rs
        </text>
        <text x="380" y="34" textAnchor="middle" style={TINY}>
          target/ build record: built after that checkout
        </text>
        <path
          className="fig-axis"
          strokeDasharray="2 5"
          strokeWidth="1"
          d="M380 40V178"
        />
        {row(
          74,
          'git twig',
          220,
          '04:11:36 (kept from donor)',
          'lilac',
          'Fresh: 0 crates, 0.65 s with the copy, +1.2 MB',
        )}
        {row(
          160,
          'git worktree add',
          520,
          '06:35:18 (written now)',
          'sand',
          'Stale: 9 workspace crates, 5.0 s, +162 MB',
        )}
        <text x="130" y="224" style={TINY}>
          registry crates live in CARGO_HOME, unchanged
        </text>
        <text x="620" y="62" textAnchor="end" style={TINY}>
          time →
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Post 4: faster dev builds                                           */
/* ------------------------------------------------------------------ */

/** The edit-build-run loop, with each tool above the step it shortens. */
export function LoopToolMap() {
  const steps: Array<{
    x: number
    w: number
    name: string
    mark: MarkName
    tools: Array<string>
  }> = [
    { x: 10, w: 56, name: 'edit', mark: 'sand', tools: [] },
    {
      x: 76,
      w: 134,
      name: 'front end',
      mark: 'lilac',
      tools: [
        'cargo check',
        'parallel front end (nightly)',
        "Relink Don't Rebuild",
        '(open PR)',
      ],
    },
    {
      x: 220,
      w: 134,
      name: 'codegen',
      mark: 'sand',
      tools: ['Cranelift', 'TPDE (not shipped)', 'debug = line-tables-only'],
    },
    {
      x: 364,
      w: 134,
      name: 'link',
      mark: 'lilac',
      tools: [
        'Apple ld (macOS)',
        'mold',
        'Wild',
        'Wild incremental (planned)',
      ],
    },
    {
      x: 508,
      w: 122,
      name: 'run',
      mark: 'sand',
      tools: ['opt-level 3', 'for dependencies'],
    },
  ]
  return (
    <Figure
      bleed
      title="Each tool shortens one step of the loop"
      legend={[
        { label: 'the two biggest parts of a rebuild', mark: 'lilac' },
        { label: 'the other steps', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 216"
        role="img"
        aria-label="The loop has five steps: edit, front end, codegen, link and run. Each tool in this post shortens one step: cargo check, the parallel front end and Relink Don't Rebuild shorten the front end; Cranelift, TPDE and debug settings shorten codegen; Apple ld, mold and Wild shorten the link; and optimized dependencies shorten the run. Subsecond replaces codegen, link and restart with a patch of one crate."
      >
        {steps.map((step) => (
          <g key={step.name}>
            {step.tools.map((tool, index) => (
              <text
                key={tool}
                x={step.x + 4}
                y={88 - (step.tools.length - 1 - index) * 15}
                style={TINY}
              >
                {tool}
              </text>
            ))}
            <Block x={step.x} y={98} w={step.w} h={34} mark={step.mark} strong>
              {step.name}
            </Block>
          </g>
        ))}
        <path className="ink-stroke" d="M220 146V154H630V146" />
        <text x="425" y="170" textAnchor="middle" style={SMALL}>
          subsecond hot-patch: rebuild one crate, keep the process
        </text>
        <Arrow d="M600 182C600 204 60 204 38 138" />
        <HandNote x={70} y={186} text="the loop" rotate={-3} />
      </svg>
    </Figure>
  )
}

/** One edit in a low crate runs the front end of every crate above it. */
export function RebuildCascade() {
  const crates: Array<[string, number]> = [
    ['utils', 57],
    ['config', 105],
    ['content', 151],
    ['render', 86],
    ['markdown', 104],
    ['templates', 186],
    ['site', 248],
    ['zola (bin)', 180],
  ]
  const scale = 0.42
  return (
    <Figure
      title="One edit in utils, eight front ends"
      caption="Bar length is time. All bars use one scale."
      legend={[
        { label: 'edited crate', mark: 'lilac' },
        { label: 'front end of a dependent crate', mark: 'sand' },
        { label: 'codegen and link', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 326"
        role="img"
        aria-label="An edit inside the utils crate makes seven dependent crates run their front end again, one after another: utils 57 ms, config 105 ms, content 151 ms, render 86 ms, markdown 104 ms, templates 186 ms, site 248 ms and the zola binary 180 ms, before 380 ms of codegen and an 840 ms link. Relink Don't Rebuild would skip the dependent front ends when the public API of utils did not change."
      >
        {crates.map(([name, ms], index) => {
          const y = 12 + index * 30
          return (
            <g key={name}>
              <text x="84" y={y + 15} textAnchor="end" style={SMALL}>
                {name}
              </text>
              <Block
                x={96}
                y={y}
                w={ms * scale}
                h={20}
                mark={index === 0 ? 'lilac' : 'sand'}
              />
              <text x={104 + ms * scale} y={y + 15} style={SMALL}>
                {ms} ms
              </text>
              {index < crates.length - 1 ? (
                <Arrow d={`M100 ${y + 21}V${y + 28}`} />
              ) : null}
            </g>
          )
        })}
        <HandNote x={200} y={28} text="edited here" rotate={-3} />
        <path
          className="ink-stroke"
          strokeDasharray="5 5"
          d="M300 46H312V208H300"
        />
        <text x="324" y="116" style={SMALL}>
          Relink Don&apos;t Rebuild would skip these
        </text>
        <text x="324" y="132" style={SMALL}>
          when the public API of utils
        </text>
        <text x="324" y="148" style={SMALL}>
          did not change
        </text>

        <Block x={96} y={262} w={380 * scale} h={26} mark="blue" />
        <text x="96" y="306" style={SMALL}>
          codegen 380 ms
        </text>
        <Block
          x={102 + 380 * scale}
          y={262}
          w={840 * scale}
          h={26}
          mark="blue"
        />
        <text x={102 + 380 * scale} y="306" style={SMALL}>
          link 840 ms
        </text>
      </svg>
    </Figure>
  )
}

/** Hot-patching: a new jump table row in the running process. */
export function HotPatchJumpTable() {
  return (
    <Figure
      title="A patch replaces one row of the jump table"
      legend={[
        { label: 'the new function', mark: 'lilac' },
        { label: 'unchanged', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 276"
        role="img"
        aria-label="The running program calls tick through a jump table. dx rebuilds the binary crate, links the changed functions against the running process, and sends a new table over a websocket, so the next call runs the new tick. Save to new output took 0.76 seconds, against 1.51 seconds for a cargo build plus a restart. Only the binary crate is patched, and struct layout changes crash the process."
      >
        <text className="fig-strong" x="10" y="18" style={SMALL}>
          running zola process
        </text>
        <Frame x={10} y={26} w={292} h={150} />
        <Block x={22} y={84} w={78} h={32} mark="sand">
          main loop
        </Block>
        <Arrow d="M102 100H156" />
        <text x="22" y="136" style={MONO}>
          subsecond::call(tick)
        </text>

        <text className="fig-strong" x="164" y="50" style={SMALL}>
          jump table
        </text>
        <Block x={164} y={58} w={126} h={26} mark="sand" style={MONO}>
          tick → v0
        </Block>
        <path className="ink-stroke" d="M170 71H284" />
        <Block x={164} y={90} w={126} h={26} mark="lilac" strong style={MONO}>
          tick → v1
        </Block>
        <Block x={164} y={122} w={126} h={26} mark="sand" style={MONO}>
          build → v0
        </Block>

        <text className="fig-strong" x="372" y="18" style={SMALL}>
          dx serve --hot-patch
        </text>
        <Frame x={372} y={26} w={258} h={150} />
        <text x="384" y="52" style={SMALL}>
          1 rebuild the zola crate
        </text>
        <text x="384" y="82" style={SMALL}>
          2 link changed functions against
        </text>
        <text x="394" y="98" style={SMALL}>
          the running addresses
        </text>
        <text x="384" y="128" style={SMALL}>
          3 send new jump table
        </text>
        <Arrow d="M368 124C340 124 330 103 296 103" />
        <text x="336" y="140" textAnchor="middle" style={TINY}>
          websocket
        </text>

        <HandNote x={20} y={206} text="save to new output 0.76 s" rotate={-2} />
        <HandNote
          x={300}
          y={210}
          text="cargo build 1.51 s, then restart"
          rotate={-2}
        />
        <Stop x={14} y={254} />
        <text x="26" y="258" style={SMALL}>
          only the binary crate is patched; struct layout changes crash
        </text>
      </svg>
    </Figure>
  )
}

/* ------------------------------------------------------------------ */
/* Post 5: Docker                                                      */
/* ------------------------------------------------------------------ */

/** Two stages: everything needed to build, and the one file that ships. */
export function RustTwoStages() {
  const build: Array<[string, MarkName]> = [
    ['Rust toolchain', 'sand'],
    ['~/.cargo/registry', 'sand'],
    ['src/', 'sand'],
    ['target/ (173 crates)', 'blue'],
  ]
  return (
    <Figure
      title="Only the binary crosses to the final image"
      legend={[
        { label: 'stays in the build stage', mark: 'sand' },
        { label: 'target/', mark: 'blue' },
        { label: 'the binary', mark: 'lilac' },
      ]}
    >
      <svg
        viewBox="0 0 640 248"
        role="img"
        aria-label="The build stage on rust:1.100.0-trixie holds the Rust toolchain, the cargo registry, the source and a target directory with 173 crates: 2,147 MB if shipped. Only the 6.2 MB static musl binary is copied with COPY --from=build into the final distroless/static-debian13 image, which is 9.6 MB with CA certificates, tzdata and /etc/passwd."
      >
        <text className="fig-strong" x="10" y="18" style={SMALL}>
          build stage: rust:1.100.0-trixie
        </text>
        <Frame x={10} y={26} w={290} h={176} />
        {build.map(([label, mark], index) => (
          <Block
            key={label}
            x={22}
            y={38 + index * 40}
            w={266}
            h={32}
            mark={mark}
          >
            {label}
          </Block>
        ))}
        <text className="fig-strong" x="10" y="224" style={SMALL}>
          2,147 MB if shipped
        </text>

        <Arrow d="M292 174H404" />
        <text x="348" y="164" textAnchor="middle" style={MONO}>
          COPY --from=build
        </text>

        <text className="fig-strong" x="630" y="104" textAnchor="end" style={SMALL}>
          final stage: distroless/static-debian13
        </text>
        <Frame x={408} y={112} w={222} h={90} />
        <Block x={418} y={122} w={202} h={30} mark="sand" style={TINY}>
          CA certificates, tzdata, /etc/passwd
        </Block>
        <Block x={418} y={160} w={202} h={30} mark="lilac" strong>
          /app, static musl, 6.2 MB
        </Block>
        <text className="fig-strong" x="630" y="224" textAnchor="end" style={SMALL}>
          9.6 MB
        </text>
      </svg>
    </Figure>
  )
}

/** A Docker layer is rebuilt whole; a cache mount keeps target/. */
export function CargoCacheKeep() {
  const row = (
    y: number,
    name: string,
    tinted: number,
    dashed: boolean,
    lines: Array<string>,
    result: string,
  ) => (
    <g>
      <text className="fig-strong" x="10" y={y} style={SMALL}>
        {name}
      </text>
      <Frame x={10} y={y + 8} w={366} h={62} dashed={dashed} />
      <Squares x={18} y={y + 16} n={175} cols={35} mark="sand" tinted={tinted} />
      {lines.map((line, index) => (
        <text key={line} x="390" y={y + 24 + index * 15} style={SMALL}>
          {line}
        </text>
      ))}
      <text className="fig-strong" x="390" y={y + 64} style={SMALL}>
        {result}
      </text>
    </g>
  )
  return (
    <Figure
      bleed
      title="175 crates, and how many compile again"
      caption="One square is one crate."
      legend={[
        { label: 'compiled again', mark: 'lilac' },
        { label: 'kept', mark: 'sand' },
      ]}
    >
      <svg
        viewBox="0 0 640 286"
        role="img"
        aria-label="A dependency layer made with a dummy main.rs or cargo-chef is one Docker layer keyed on Cargo.toml and Cargo.lock. When humantime is added, the layer is rebuilt whole and all 175 crates compile again. A cache mount keeps target/ between builds, so only 2 crates compile: humantime and the app. After an edit of main.rs, both methods compile only 1 crate, the app."
      >
        {row(
          18,
          'dummy main.rs / cargo-chef, after "add humantime"',
          175,
          false,
          ['one Docker layer, keyed on', 'Cargo.toml + Cargo.lock'],
          '175 compile again',
        )}
        {row(
          112,
          'cache mounts, after "add humantime"',
          2,
          true,
          ['target/ cache mount,', 'kept by BuildKit'],
          '2: humantime, app',
        )}
        {row(
          206,
          'edit main.rs, both methods',
          1,
          true,
          ['only the app crate changed'],
          '1: app',
        )}
      </svg>
    </Figure>
  )
}

/** What happens to SIGTERM when it reaches PID 1. */
export function Pid1Sigterm() {
  return (
    <Figure
      title="SIGTERM from docker stop, three ways"
      legend={[
        { label: 'the Rust binary', mark: 'sand' },
        { label: 'tini', mark: 'blue' },
        { label: 'the handler', mark: 'lilac' },
        { label: 'dropped', mark: 'rose' },
      ]}
    >
      <svg
        viewBox="0 0 640 300"
        role="img"
        aria-label="A Rust binary as PID 1 without a SIGTERM handler ignores docker stop, because the kernel drops the signal, and is killed with SIGKILL after 10 seconds: exit 137 after 10.12 seconds. With tini as PID 1, the signal is forwarded and the default action terminates the process at once: exit 143 after 0.08 seconds, with open requests cut. A tokio handler in a binary that is PID 1 drains open requests and exits with 0 after 0.09 seconds."
      >
        <text className="fig-strong" x="10" y="18" style={SMALL}>
          Rust binary as PID 1, no handler
        </text>
        <text x="10" y="44" style={TINY}>
          SIGTERM
        </text>
        <Arrow d="M10 52H238" />
        <Stop x={248} y={52} />
        <text x="130" y="70" textAnchor="middle" style={SMALL}>
          dropped by the kernel
        </text>
        <Block x={260} y={32} w={150} h={54} mark="sand">
          binary
        </Block>
        <Arrow d="M10 78C80 92 190 92 256 80" />
        <text x="130" y="100" textAnchor="middle" style={SMALL}>
          SIGKILL after 10 s
        </text>
        <text className="fig-strong" x="630" y="62" textAnchor="end" style={SMALL}>
          exit 137, 10.12 s
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M10 112H630" />

        <text className="fig-strong" x="10" y="134" style={SMALL}>
          tini (--init) as PID 1
        </text>
        <text x="10" y="158" style={TINY}>
          SIGTERM
        </text>
        <Arrow d="M10 166H136" />
        <Block x={140} y={148} w={70} h={36} mark="blue">
          tini
        </Block>
        <Arrow d="M212 166H256" />
        <Block x={260} y={148} w={150} h={36} mark="sand">
          binary
        </Block>
        <text x="260" y="200" style={SMALL}>
          default action: terminate
        </text>
        <text className="fig-strong" x="630" y="170" textAnchor="end" style={SMALL}>
          exit 143, 0.08 s, requests cut
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M10 212H630" />

        <text className="fig-strong" x="10" y="234" style={SMALL}>
          Rust binary as PID 1, tokio handler
        </text>
        <text x="10" y="258" style={TINY}>
          SIGTERM
        </text>
        <Arrow d="M10 266H136" />
        <Block x={140} y={248} w={130} h={36} mark="lilac" style={MONO}>
          shutdown_signal()
        </Block>
        <Arrow d="M272 266H296" />
        <Block x={300} y={248} w={150} h={36} mark="sand">
          drain open requests
        </Block>
        <text className="fig-strong" x="630" y="270" textAnchor="end" style={SMALL}>
          exit 0, 0.09 s
        </text>
      </svg>
    </Figure>
  )
}
