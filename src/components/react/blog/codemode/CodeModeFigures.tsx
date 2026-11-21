import type { ReactNode } from 'react'

import { Figure, HandNote, LINES, MARKS } from '@/components/paper/Figure'
import type { MarkName } from '@/components/paper/Figure'

/*
 * One vocabulary for the five code mode posts:
 *   sand box    the model, or the host process
 *   lilac box   the program that the model wrote
 *   blue box    a tool, or the server behind it
 *   amber bar   a permission check
 *   rose tick   a call that is stopped
 *   ink outline the sandbox wall
 */

const SMALL = { fontSize: 11 }

/** A marker box with a label in its middle. */
function Box({
  x,
  y,
  w,
  h = 40,
  mark,
  children,
  strong = false,
}: {
  x: number
  y: number
  w: number
  h?: number
  mark: MarkName
  children?: ReactNode
  strong?: boolean
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
          style={SMALL}
        >
          {children}
        </text>
      ) : null}
    </g>
  )
}

/** The sandbox wall: an ink outline, dashed when it is not a real wall. */
function Wall({
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

/** A permission check on the path of a call. */
function Gate({
  x,
  y,
  h = 30,
  w = 9,
  dashed = false,
}: {
  x: number
  y: number
  h?: number
  w?: number
  dashed?: boolean
}) {
  if (dashed) {
    return (
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill="none"
        strokeDasharray="3 3"
        strokeWidth="1.6"
        style={{ stroke: LINES.amber }}
      />
    )
  }
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      filter="url(#pp-marker)"
      style={{ fill: MARKS.amber }}
    />
  )
}

/** The place where a call is stopped. */
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

/** N thin lines between two boxes: one line is one call and its result. */
function Trips({
  n,
  x1,
  x2,
  y,
  h,
}: {
  n: number
  x1: number
  x2: number
  y: number
  h: number
}) {
  const step = h / (n - 1)
  return (
    <g>
      {Array.from({ length: n }, (_, index) => (
        <path
          key={index}
          className="fig-axis"
          strokeWidth="1"
          d={`M${x1} ${y + index * step}H${x2}`}
        />
      ))}
    </g>
  )
}

type LoopsProps = {
  title: string
  caption?: ReactNode
  aria: string
  n: number
  leftTitle: string
  rightTitle: string
  toolLabel: string
  tripLabel: string
  contextLabel: string
  leftTotal: string
  wallLabel: string
  programLabel: string
  sendLabel: string
  returnLabel: string
  rightTotal: string
  note: string
}

/** The same task as N model round trips, and as one program. */
function Loops(props: LoopsProps) {
  const steps = props.n
  const stepWidth = 300 / steps
  return (
    <Figure
      bleed
      title={props.title}
      caption={props.caption}
      legend={[
        { label: 'model', mark: 'sand' },
        { label: 'program', mark: 'lilac' },
        { label: 'tools', mark: 'blue' },
      ]}
    >
      <svg viewBox="0 0 640 262" role="img" aria-label={props.aria}>
        <text className="fig-strong" x="10" y="20">
          {props.leftTitle}
        </text>
        <Box x={10} y={36} w={80} h={130} mark="sand">
          model
        </Box>
        <Box x={220} y={36} w={90} h={130} mark="blue">
          {props.toolLabel}
        </Box>
        <Trips n={steps} x1={94} x2={216} y={42} h={118} />
        <text x="155" y="180" textAnchor="middle" style={SMALL}>
          {props.tripLabel}
        </text>
        {Array.from({ length: steps }, (_, index) => {
          const height = 5 + (index * 19) / (steps - 1)
          return (
            <rect
              key={index}
              x={10 + index * stepWidth}
              y={206 - height}
              width={stepWidth - 2}
              height={height}
              filter="url(#pp-marker)"
              style={{ fill: MARKS.sand }}
            />
          )
        })}
        <text x="10" y="224" style={SMALL}>
          {props.contextLabel}
        </text>
        <text className="fig-strong" x="10" y="250">
          {props.leftTotal}
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M325 10V254" />

        <text className="fig-strong" x="340" y="20">
          {props.rightTitle}
        </text>
        <Box x={340} y={36} w={62} h={130} mark="sand">
          model
        </Box>
        <Wall x={470} y={36} w={100} h={130} />
        <Box x={478} y={81} w={84} h={40} mark="lilac">
          {props.programLabel}
        </Box>
        <Box x={590} y={36} w={40} h={130} mark="blue" />
        <Trips n={steps} x1={572} x2={588} y={42} h={118} />
        <Arrow d="M406 76H464" />
        <text x="435" y="66" textAnchor="middle" style={SMALL}>
          {props.sendLabel}
        </text>
        <Arrow d="M466 130H408" />
        <text
          className="fig-strong"
          x="435"
          y="150"
          textAnchor="middle"
          style={SMALL}
        >
          {props.returnLabel}
        </text>
        <text x="630" y="184" textAnchor="end" style={SMALL}>
          {props.wallLabel}
        </text>
        <text className="fig-strong" x="340" y="250">
          {props.rightTotal}
        </text>
        <HandNote x={352} y={214} text={props.note} rotate={-3} />
      </svg>
    </Figure>
  )
}

/** Post 1: 20 tool calls as 21 model turns, and as one program. */
export function CodeModeLoop() {
  return (
    <Loops
      title="Twenty issue_read calls, two ways"
      caption="One thin line is one call and its result. The step chart is the context that the model reads again on each turn."
      aria="Two lanes for the same task of 20 issue_read calls. With tool calls, the model and the tools exchange 20 round trips, each result is about 889 tokens, and the context grows to 29,557 tokens at the last turn: 21 model turns. With code mode, the model sends one program of 189 tokens into a sandbox, the sandbox makes the 20 calls to the host, and 90 tokens return to the model: 2 model turns."
      n={20}
      leftTitle="Tool calls"
      rightTitle="Code mode"
      toolLabel="tools"
      tripLabel="20 results, ~889 tokens each"
      contextLabel="context: 29,557 tokens at the last turn"
      leftTotal="21 model turns"
      wallLabel="sandbox, issue_read × 20"
      programLabel="program"
      sendLabel="189 tokens"
      returnLabel="90 tokens"
      rightTotal="2 model turns"
      note="results stay in here"
    />
  )
}

/** Post 3: the chain of 10 orders with Code Mode off and on. */
export function ClaudeCodeMode() {
  return (
    <Loops
      title="A chain of 10 orders, Code Mode off and on"
      caption="Medians of three runs for each setting, on Haiku 5.5. Input tokens include cache reads and writes."
      aria="Two lanes for the same task, follow a chain of 10 orders. With Code Mode off, the model and the mock MCP server exchange 10 round trips, the context grows from 37,346 to 45,190 tokens, and the run takes 12 requests and 492,147 input tokens. With Code Mode on, the model sends one REPL script into a vm context inside the claude process, the script makes the 10 calls in 0.4 seconds, and one result returns: 3 requests and 73,125 input tokens."
      n={10}
      leftTitle="Code Mode off"
      rightTitle="Code Mode on"
      toolLabel="MCP server"
      tripLabel="10 calls, one per request"
      contextLabel="context: 37,346 to 45,190 tokens"
      leftTotal="12 requests, 492,147 input tokens"
      wallLabel="vm context in the claude process"
      programLabel="REPL script"
      sendLabel="one script"
      returnLabel="one result"
      rightTotal="3 requests, 73,125 input tokens"
      note="10 calls in 0.4 s"
    />
  )
}

/** Post 1: programmatic tool calling pauses the code at each tool call. */
export function PtcPause() {
  const gaps = [190, 300, 410]
  return (
    <Figure
      title="Programmatic tool calling: the code stops at each call"
      legend={[
        { label: 'the code runs', mark: 'lilac' },
        { label: 'your tool runs', mark: 'blue' },
      ]}
      caption={
        <>
          Each <code>tool_use</code> block names its caller,{' '}
          <code>code_execution_20260120</code>. The container runs Python 3.11
          and has no internet.
        </>
      }
    >
      <svg
        viewBox="0 0 640 226"
        role="img"
        aria-label="A timeline in three rows. In the Anthropic container, the code runs and stops at each await of a tool. At each stop the API sends a tool_use block down to your application, your application checks the call, runs the tool and sends a tool_result back, and the code continues. This happens three times. At the end only the final output goes to Claude's context."
      >
        <text className="fig-strong" x="10" y="50">
          container
        </text>
        <text className="fig-strong" x="10" y="112">
          API
        </text>
        <text className="fig-strong" x="10" y="172">
          your app
        </text>
        <Box x={100} y={32} w={70} h={28} mark="lilac" />
        <Box x={210} y={32} w={70} h={28} mark="lilac" />
        <Box x={320} y={32} w={70} h={28} mark="lilac" />
        <Box x={430} y={32} w={60} h={28} mark="lilac" />
        {gaps.map((cx) => (
          <g key={cx}>
            <Arrow d={`M${cx - 8} 64V146`} />
            <Arrow d={`M${cx + 8} 148V66`} />
            <Box x={cx - 46} y={152} w={92} h={32} mark="blue">
              check, run tool
            </Box>
          </g>
        ))}
        <text x="176" y="108" textAnchor="end" style={SMALL}>
          tool_use
        </text>
        <text x="204" y="124" style={SMALL}>
          tool_result
        </text>
        <Arrow d="M494 46H516" />
        <Box x={520} y={32} w={110} h={28} mark="sand">
          Claude&apos;s context
        </Box>
        <text x="575" y="78" textAnchor="middle" style={SMALL}>
          final output only
        </text>
        <HandNote
          x={300}
          y={214}
          text="your permission check goes here"
          rotate={-2}
        />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M292 208C262 208 236 202 222 190"
        />
      </svg>
    </Figure>
  )
}

/** Post 1: what crosses the wall of a Dynamic Worker isolate. */
export function SandboxBoundary() {
  const blocked = [
    { y: 124, call: 'fetch()', error: 'not permitted' },
    { y: 146, call: "import('node:fs')", error: 'No such module' },
    { y: 168, call: 'process.env', error: '[]' },
  ]
  return (
    <Figure
      title="One exit from the isolate"
      legend={[
        { label: 'the program', mark: 'lilac' },
        { label: 'the one way out', mark: 'blue' },
        { label: 'stopped at the wall', mark: 'rose' },
      ]}
      caption="The host keeps the MCP client and the credentials. The program only gets a proxy that sends each call over Workers RPC."
    >
      <svg
        viewBox="0 0 640 226"
        role="img"
        aria-label="A Dynamic Worker isolate holds the program and a codemode Proxy. One arrow leaves the isolate through the proxy, over Workers RPC, to the ToolDispatcher on the host, which holds the MCP client and the credentials. Three other calls stop at the wall: fetch is not permitted, import of node:fs gives No such module, and process.env is an empty array. The timeout is a setTimeout race, so a while true loop never yields to it."
      >
        <Wall x={10} y={30} w={330} h={154} />
        <text className="fig-strong" x="22" y="50">
          Dynamic Worker isolate
        </text>
        <Box x={22} y={62} w={130} h={36} mark="lilac">
          {'async () => { … }'}
        </Box>
        <Box x={206} y={62} w={122} h={36} mark="blue">
          codemode Proxy
        </Box>
        <Arrow d="M156 80H200" />
        <Arrow d="M332 80H414" />
        <text x="377" y="70" textAnchor="middle" style={SMALL}>
          Workers RPC
        </text>
        <Box x={420} y={40} w={210} h={70} mark="sand" />
        <text className="fig-strong" x="432" y="62">
          ToolDispatcher
        </text>
        <text x="432" y="82" style={SMALL}>
          MCP client
        </text>
        <text x="432" y="98" style={SMALL}>
          credentials
        </text>
        {blocked.map((row) => (
          <g key={row.call}>
            <text x="22" y={row.y + 4} style={SMALL}>
              {row.call}
            </text>
            <Arrow d={`M130 ${row.y}H332`} />
            <Stop x={340} y={row.y} />
            <text x="354" y={row.y + 4} style={SMALL}>
              {row.error}
            </text>
          </g>
        ))}
        <text x="10" y="210" style={SMALL}>
          timeout: a setTimeout race
        </text>
        <HandNote
          x={236}
          y={212}
          text="while (true) never yields"
          rotate={-2}
        />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M230 206C212 200 190 200 172 204"
        />
      </svg>
    </Figure>
  )
}

/** Post 2: the path of one nested call in pi. */
export function PiCodeMode() {
  const stack: Array<{ label: string; mark: MarkName }> = [
    { label: 'ctx.executeTool', mark: 'sand' },
    { label: 'argument validation', mark: 'amber' },
    { label: 'tool_call hook', mark: 'amber' },
    { label: 'read.execute()', mark: 'blue' },
    { label: 'tool_result hook', mark: 'amber' },
  ]
  return (
    <Figure
      bleed
      title="pi: the path of one nested call"
      legend={[
        { label: 'the script', mark: 'lilac' },
        { label: 'checks and hooks', mark: 'amber' },
        { label: 'the tool', mark: 'blue' },
      ]}
      caption="The call and the result cross the thread boundary as JSON. One crossing takes 0.02 ms."
    >
      <svg
        viewBox="0 0 640 300"
        role="img"
        aria-label="The script runs in a QuickJS VM, WebAssembly with a 256 MiB heap, inside a worker thread. A call to tools.read goes to the main thread of the pi process as a postMessage with type call, id, name and JSON args. In the main thread it passes through ctx.executeTool, argument validation, the tool_call hook, read.execute and the tool_result hook. The result returns to the VM as JSON. Only the script output goes to the model. The worker and VM start in 20 ms, one nested read takes 0.4 to 0.45 ms, and the bridge crossing alone takes 0.02 ms."
      >
        <Box x={10} y={10} w={90} h={32} mark="sand">
          model
        </Box>
        <Arrow d="M55 68V46" />
        <text x="66" y="60" style={SMALL}>
          only the script output
        </text>
        <Wall x={10} y={70} w={250} h={216} />
        <text className="fig-strong" x="22" y="92">
          pi process, main thread
        </text>
        {stack.map((row, index) => (
          <Box
            key={row.label}
            x={22}
            y={104 + index * 35}
            w={226}
            h={28}
            mark={row.mark}
          >
            {row.label}
          </Box>
        ))}
        <Wall x={380} y={100} w={250} h={112} />
        <text className="fig-strong" x="392" y="122">
          worker thread
        </text>
        <text x="392" y="142" style={SMALL}>
          QuickJS VM, WebAssembly, 256 MiB heap
        </text>
        <Box x={392} y={152} w={226} h={40} mark="lilac">
          {'await tools.read({ path })'}
        </Box>
        <Arrow d="M376 160C340 150 300 132 264 120" />
        <text x="320" y="124" textAnchor="middle" style={SMALL}>
          postMessage
        </text>
        <Arrow d="M264 262C300 240 340 204 376 186" />
        <text x="306" y="272" style={SMALL}>
          result (JSON)
        </text>
        <text x="392" y="246" style={SMALL}>
          worker + VM start: 20 ms
        </text>
        <text x="392" y="264" style={SMALL}>
          one nested read: 0.4 to 0.45 ms
        </text>
        <text x="392" y="282" style={SMALL}>
          bridge crossing alone: 0.02 ms
        </text>
      </svg>
    </Figure>
  )
}

/** Post 2: what the model sees, and what a script can call. */
export function PiCodeModeReach() {
  const shared = ['read', 'bash', 'edit', 'write', 'ext_echo']
  return (
    <Figure
      title="pi: declared to the model, callable from a script"
      legend={[
        { label: 'in both', mark: 'lilac' },
        { label: 'model only', mark: 'sand' },
        { label: 'script only', mark: 'blue' },
      ]}
      caption="An MCP server with codemode exposure is not declared to the model and not listed. A script can still call its tools."
    >
      <svg
        viewBox="0 0 640 206"
        role="img"
        aria-label="Two rows of tools. Declared to the model: read, bash, edit, write, ext_echo and codemode. Callable from a script: read, bash, edit, write, ext_echo, and the 40 tools of the MCP server mcp__tracker. codemode is model-only. grep, find and ls are inactive and not reachable from either side."
      >
        <text className="fig-strong" x="10" y="20">
          declared to the model
        </text>
        {shared.map((name, index) => (
          <Box key={name} x={10 + index * 82} y={30} w={74} h={36} mark="lilac">
            {name}
          </Box>
        ))}
        <Box x={420} y={30} w={80} h={36} mark="sand">
          codemode
        </Box>
        <text className="fig-strong" x="10" y="98">
          callable from a script
        </text>
        {shared.map((name, index) => (
          <Box
            key={name}
            x={10 + index * 82}
            y={108}
            w={74}
            h={36}
            mark="lilac"
          >
            {name}
          </Box>
        ))}
        <Box x={420} y={108} w={210} h={36} mark="blue">
          mcp__tracker: 40 tools
        </Box>
        <text x="10" y="186" style={SMALL}>
          inactive, not reachable
        </text>
        {['grep', 'find', 'ls'].map((name, index) => (
          <g key={name}>
            <Wall x={174 + index * 82} y={166} w={74} h={30} dashed />
            <text
              x={211 + index * 82}
              y={185}
              textAnchor="middle"
              style={SMALL}
            >
              {name}
            </text>
          </g>
        ))}
      </svg>
    </Figure>
  )
}

/** Post 3: where rules, hooks and the sandbox act on a script. */
export function ClaudeCodeModeChecks() {
  const stubs = [
    { y: 70, label: '$`echo one`' },
    { y: 118, label: '$`touch denied.txt`' },
    { y: 166, label: 'tools.mcp__mock__get_order()' },
  ]
  return (
    <Figure
      bleed
      title="Claude Code: three places where a check runs"
      legend={[
        { label: 'the script', mark: 'lilac' },
        { label: 'a check', mark: 'amber' },
        { label: 'refused', mark: 'rose' },
        { label: 'the tool', mark: 'blue' },
      ]}
    >
      <svg
        viewBox="0 0 640 296"
        role="img"
        aria-label="Claude writes a script. Gate 1 acts on the REPL tool: a PreToolUse hook that reads tool_input.code, an ask rule on REPL, and the auto mode classifier that reads the code once. The script runs in a vm context in the claude process and makes three calls. Gate 2 acts on each call: the PreToolUse hook and the deny and ask rules, under the tool's own name. The touch call is refused and the script continues. The shell call then runs inside the sandbox. The MCP call goes to the MCP server outside the sandbox. Gate 3 is PostToolUse on REPL with updatedToolOutput, before Claude reads the result."
      >
        <text x="45" y="96" textAnchor="middle" style={SMALL}>
          Claude writes
        </text>
        <Box x={10} y={104} w={70} h={36} mark="lilac">
          script
        </Box>
        <text className="fig-strong" x="98" y="84" textAnchor="middle">
          1
        </text>
        <Gate x={94} y={92} h={60} />
        <Arrow d="M82 122H90" />
        <Arrow d="M106 122H116" />
        <Wall x={120} y={36} w={222} h={172} />
        <text className="fig-strong" x="132" y="57" style={SMALL}>
          vm context in the claude process
        </text>
        {stubs.map((stub) => (
          <g key={stub.label}>
            <Box x={130} y={stub.y} w={202} h={30} mark="lilac">
              {stub.label}
            </Box>
            <Arrow d={`M344 ${stub.y + 15}H360`} />
            <Gate x={364} y={stub.y} />
          </g>
        ))}
        <text className="fig-strong" x="368" y="60" textAnchor="middle">
          2
        </text>
        <Stop x={380} y={133} />
        <text x="392" y="137" style={SMALL}>
          refused, script continues
        </text>
        <Wall x={428} y={50} w={112} h={56} dashed />
        <text x="484" y="44" textAnchor="middle" style={SMALL}>
          sandbox, shell only
        </text>
        <Arrow d="M376 85H436" />
        <Box x={440} y={72} w={88} h={26} mark="blue">
          shell
        </Box>
        <Arrow d="M376 181H436" />
        <Box x={440} y={168} w={110} h={26} mark="blue">
          MCP server
        </Box>
        <Arrow d="M532 85C562 85 566 108 584 116" />
        <Arrow d="M554 181C574 181 572 140 584 130" />
        <text className="fig-strong" x="592" y="84" textAnchor="middle">
          3
        </text>
        <Gate x={588} y={92} h={60} />
        <Arrow d="M600 122H628" />
        <text x="630" y="170" textAnchor="end" style={SMALL}>
          result
        </text>
        <HandNote x={452} y={222} text="outside the sandbox" rotate={-3} />
        <text x="10" y="246" style={SMALL}>
          1 REPL: PreToolUse hook on tool_input.code, ask: [&quot;REPL&quot;],
          auto mode reads the code once
        </text>
        <text x="10" y="264" style={SMALL}>
          2 each call: PreToolUse hook and deny/ask rules, under the
          tool&apos;s own name
        </text>
        <text x="10" y="282" style={SMALL}>
          3 PostToolUse on REPL: updatedToolOutput
        </text>
      </svg>
    </Figure>
  )
}

/** A grid of small tiles: one tile is one tool sent to the model. */
function Tiles({
  x,
  y,
  marks,
}: {
  x: number
  y: number
  marks: Array<MarkName>
}) {
  return (
    <g>
      {marks.map((mark, index) => (
        <rect
          key={index}
          x={x + (index % 11) * 26}
          y={y + Math.floor(index / 11) * 18}
          width="22"
          height="13"
          filter="url(#pp-marker)"
          style={{ fill: MARKS[mark] }}
        />
      ))}
    </g>
  )
}

/** Post 4: what OpenCode sends to the model, with Code Mode off and on. */
export function OpenCodeCatalog() {
  const direct: Array<MarkName> = [
    ...Array.from({ length: 46 }, () => 'blue' as const),
    ...Array.from({ length: 13 }, () => 'sand' as const),
  ]
  const codeMode: Array<MarkName> = [
    ...Array.from({ length: 12 }, () => 'sand' as const),
    'lilac',
  ]
  return (
    <Figure
      bleed
      title="OpenCode: the first request with GitHub's 46 MCP tools"
      legend={[
        { label: 'GitHub tool', mark: 'blue' },
        { label: 'built-in tool', mark: 'sand' },
        { label: 'execute', mark: 'lilac' },
      ]}
      caption="One tile is one tool definition in the request. The token counts are for the whole first request."
    >
      <svg
        viewBox="0 0 640 244"
        role="img"
        aria-label="Two panels. With codemode false, the request carries 59 tool definitions, 46 GitHub tools and 13 built-ins, and is 17,154 tokens. With Code Mode, the request carries 13 tools, 12 built-ins and execute, and the system prompt holds a catalog: github, 46 tools, 3 shown, with the names add_comment_to_pending_review, add_issue_comment and add_reply_to_pull_request_comment, then 43 more through search. That request is 6,331 tokens. The catalog has a budget of 2,000 tokens."
      >
        <text className="fig-strong" x="10" y="20">
          codemode: false
        </text>
        <Tiles x={10} y={32} marks={direct} />
        <text x="10" y="156" style={SMALL}>
          59 tools: issue_read, list_issues, search_code, …
        </text>
        <text className="fig-num" x="10" y="190">
          17,154 tokens
        </text>

        <path className="fig-axis" strokeDasharray="2 6" d="M320 10V200" />

        <text className="fig-strong" x="340" y="20">
          Code Mode
        </text>
        <Tiles x={340} y={32} marks={codeMode} />
        <text x="394" y="61" style={SMALL}>
          13 tools, one is execute
        </text>
        <Wall x={340} y={74} w={290} h={88} />
        <text className="fig-strong" x="350" y="92" style={SMALL}>
          github (46 tools, 3 shown)
        </text>
        <text x="350" y="108" style={SMALL}>
          add_comment_to_pending_review
        </text>
        <text x="350" y="122" style={SMALL}>
          add_issue_comment
        </text>
        <text x="350" y="136" style={SMALL}>
          add_reply_to_pull_request_comment
        </text>
        <text x="350" y="154" style={SMALL}>
          43 more: search(...)
        </text>
        <text x="620" y="92" textAnchor="end" style={SMALL}>
          system prompt
        </text>
        <text className="fig-num" x="340" y="190">
          6,331 tokens
        </text>
        <HandNote x={474} y={222} text="budget: 2,000 tokens" rotate={-3} />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M560 204C572 196 578 184 578 168"
        />
      </svg>
    </Figure>
  )
}

/** Post 4: how a call leaves the OpenCode VM. */
export function OpenCodeCallPath() {
  const blocked = [
    { y: 190, call: 'import fs', error: 'Cannot import' },
    { y: 212, call: 'setTimeout', error: 'Unknown identifier' },
    { y: 234, call: 'file://', error: 'filesystem access' },
  ]
  return (
    <Figure
      bleed
      title="OpenCode: how a call leaves the VM"
      legend={[
        { label: 'the program', mark: 'lilac' },
        { label: 'permission check', mark: 'amber' },
        { label: 'outside', mark: 'blue' },
        { label: 'stopped', mark: 'rose' },
      ]}
      caption="The VM is a bytecode interpreter written in TypeScript. It runs inside the OpenCode process."
    >
      <svg
        viewBox="0 0 640 296"
        role="img"
        aria-label="The OpenCode process holds the Code Mode VM. A call to tools.github.issue_read leaves the VM, passes the permission check github_issue_read, goes through the MCP client and reaches the github server over stdio. A fetch call passes the permission check webfetch with the URL and reaches the network, with 30 seconds for each request. Three calls stop at the VM wall: import fs gives Cannot import, setTimeout gives Unknown identifier, and a file URL gives filesystem access. The return value and the logs go back to the model, 68 tokens here, and are cut over 2,000 lines or 50 KiB. A while true loop has no time limit."
      >
        <Box x={10} y={8} w={80} h={30} mark="sand">
          model
        </Box>
        <Arrow d="M50 82V42" />
        <text x="100" y="22" style={SMALL}>
          return value + logs: 68 tokens
        </text>
        <text x="100" y="38" style={SMALL}>
          cut over 2,000 lines or 50 KiB
        </text>
        <Wall x={10} y={54} w={482} h={232} />
        <text className="fig-strong" x="110" y="74">
          OpenCode process
        </text>
        <Wall x={22} y={84} w={200} h={166} />
        <text className="fig-strong" x="62" y="104" style={SMALL}>
          Code Mode VM
        </text>
        <Box x={32} y={112} w={180} h={28} mark="lilac">
          tools.github.issue_read()
        </Box>
        <Box x={32} y={146} w={180} h={28} mark="lilac">
          fetch(url)
        </Box>
        <text x="304" y="104" textAnchor="middle" style={SMALL}>
          permission
        </text>
        <Arrow d="M216 126H240" />
        <Box x={244} y={112} w={120} h={28} mark="amber">
          github_issue_read
        </Box>
        <Arrow d="M368 126H380" />
        <Box x={384} y={112} w={100} h={28} mark="blue">
          MCP client
        </Box>
        <Arrow d="M488 126H526" />
        <text x="512" y="106" textAnchor="middle" style={SMALL}>
          stdio
        </text>
        <Box x={530} y={112} w={100} h={28} mark="blue">
          github server
        </Box>
        <Arrow d="M216 160H240" />
        <Box x={244} y={146} w={120} h={28} mark="amber">
          {'webfetch <url>'}
        </Box>
        <Arrow d="M368 160H526" />
        <Box x={530} y={146} w={100} h={28} mark="blue">
          network, 30 s
        </Box>
        {blocked.map((row) => (
          <g key={row.call}>
            <text x="32" y={row.y + 4} style={SMALL}>
              {row.call}
            </text>
            <Arrow d={`M104 ${row.y}H214`} />
            <Stop x={222} y={row.y} />
            <text x="234" y={row.y + 4} style={SMALL}>
              {row.error}
            </text>
          </g>
        ))}
        <HandNote
          x={250}
          y={272}
          text="while (true): no time limit"
          rotate={-2}
        />
        <path
          className="ink-stroke"
          markerEnd="url(#pp-ink-arrow)"
          d="M244 266C226 264 200 262 180 254"
        />
      </svg>
    </Figure>
  )
}

/** Post 5: where the program runs in each system, and where the wall is. */
export function CodeModeSandboxes() {
  const col = (index: number) => 10 + index * 126
  const names = ['Claude API', 'Cloudflare', 'pi', 'Claude Code', 'OpenCode']
  const stops = [
    '90 s cell',
    'platform CPU limit',
    'cancel or timeout_ms',
    '300M-step budget',
    'cancel only',
  ]
  const [a, b, c, d, e] = [0, 1, 2, 3, 4].map(col)
  return (
    <Figure
      bleed
      title="Where the program runs, from the farthest wall to the closest"
      legend={[
        { label: 'host process', mark: 'sand' },
        { label: 'the program', mark: 'lilac' },
        { label: 'the wall', mark: 'amber' },
      ]}
      caption={
        <>
          The last line of each column is what stops <code>while (true)</code>.
        </>
      }
    >
      <svg
        viewBox="0 0 640 276"
        role="img"
        aria-label="Five columns. Claude API: Python code runs in an Anthropic container with no internet, apart from your application; each call pauses the code and comes down as tool_use, and tool_result goes back up. A 90 second cell limit stops a loop. Cloudflare: the code runs in a V8 isolate beside your Worker, which holds the ToolDispatcher and the credentials; Workers RPC crosses the wall and fetch stops at it. The platform CPU limit stops a loop. pi: the code runs in a QuickJS VM, WebAssembly with 256 MiB, in a worker thread of the pi process, and calls runToolCall on the main thread by postMessage. A cancel or timeout_ms stops a loop. Claude Code: the code runs in a sealed vm context in the claude process; shell calls pass a sandbox and MCP calls go around it. A budget of 300 million steps stops a loop. OpenCode: the code runs in a bytecode VM written in TypeScript in the OpenCode process, and fetch goes to the network. Only a cancel stops a loop."
      >
        {names.map((name, index) => (
          <text
            key={name}
            className="fig-strong"
            x={col(index) + 59}
            y="18"
            textAnchor="middle"
          >
            {name}
          </text>
        ))}
        {stops.map((stop, index) => (
          <text
            key={stop}
            x={col(index) + 59}
            y="266"
            textAnchor="middle"
            style={SMALL}
          >
            {stop}
          </text>
        ))}

        {/* Claude API: the code is in another data centre. */}
        <Wall x={a + 4} y={30} w={110} h={62} />
        <Box x={a + 19} y={38} w={80} h={26} mark="lilac">
          Python
        </Box>
        <text x={a + 59} y="82" textAnchor="middle" style={SMALL}>
          container
        </text>
        <Arrow d={`M${a + 12} 96V160`} />
        <Arrow d={`M${a + 106} 162V98`} />
        <text x={a + 59} y="114" textAnchor="middle" style={SMALL}>
          tool_use
        </text>
        <Gate x={a + 4} y={124} w={110} h={6} />
        <text x={a + 59} y="150" textAnchor="middle" style={SMALL}>
          tool_result
        </text>
        <Box x={a + 4} y={166} w={110} h={40} mark="sand">
          your application
        </Box>

        {/* Cloudflare: an isolate beside the Worker. */}
        <Wall x={b + 4} y={30} w={110} h={62} />
        <Box x={b + 19} y={38} w={80} h={26} mark="lilac">
          JavaScript
        </Box>
        <text x={b + 59} y="82" textAnchor="middle" style={SMALL}>
          V8 isolate
        </text>
        <Arrow d={`M${b + 16} 96V160`} />
        <text x={b + 22} y="114" style={SMALL}>
          RPC
        </text>
        <Arrow d={`M${b + 66} 96V118`} />
        <text x={b + 72} y="114" style={SMALL}>
          fetch()
        </text>
        <Gate x={b + 4} y={124} w={110} h={6} />
        <Box x={b + 4} y={166} w={110} h={56} mark="sand" />
        <text
          className="fig-strong"
          x={b + 59}
          y="188"
          textAnchor="middle"
          style={SMALL}
        >
          your Worker
        </text>
        <text x={b + 59} y="208" textAnchor="middle" style={SMALL}>
          credentials
        </text>

        {/* pi: a VM in a worker thread of the same process. */}
        <Box x={c + 4} y={30} w={110} h={192} mark="sand" />
        <text className="fig-strong" x={c + 12} y="48" style={SMALL}>
          pi process
        </text>
        <Wall x={c + 10} y={56} w={98} h={66} />
        <text x={c + 59} y="72" textAnchor="middle" style={SMALL}>
          worker thread
        </text>
        <Box x={c + 18} y={82} w={82} h={30} mark="lilac">
          QuickJS VM
        </Box>
        <Gate x={c + 10} y={128} w={98} h={6} />
        <Arrow d={`M${c + 20} 124V172`} />
        <text x={c + 28} y="158" style={SMALL}>
          postMessage
        </text>
        <text x={c + 59} y="192" textAnchor="middle" style={SMALL}>
          runToolCall
        </text>

        {/* Claude Code: a vm context in the same process. */}
        <Box x={d + 4} y={30} w={110} h={192} mark="sand" />
        <text className="fig-strong" x={d + 12} y="48" style={SMALL}>
          claude process
        </text>
        <Wall x={d + 10} y={56} w={98} h={66} />
        <text x={d + 59} y="72" textAnchor="middle" style={SMALL}>
          vm context
        </text>
        <Box x={d + 18} y={82} w={82} h={30} mark="lilac">
          JavaScript
        </Box>
        <Gate x={d + 10} y={128} w={98} h={6} />
        <Wall x={d + 10} y={150} w={62} h={62} dashed />
        <Arrow d={`M${d + 40} 124V172`} />
        <text x={d + 41} y="190" textAnchor="middle" style={SMALL}>
          sandbox:
        </text>
        <text x={d + 41} y="204" textAnchor="middle" style={SMALL}>
          shell
        </text>
        <Arrow d={`M${d + 92} 124V186`} />
        <text x={d + 92} y="204" textAnchor="middle" style={SMALL}>
          MCP
        </text>

        {/* OpenCode: an interpreter in the same process, no wall. */}
        <Box x={e + 4} y={30} w={110} h={192} mark="sand" />
        <text className="fig-strong" x={e + 12} y="48" style={SMALL}>
          OpenCode process
        </text>
        <Wall x={e + 10} y={56} w={98} h={66} dashed />
        <text x={e + 59} y="72" textAnchor="middle" style={SMALL}>
          bytecode VM
        </text>
        <Box x={e + 18} y={82} w={82} h={30} mark="lilac">
          JavaScript
        </Box>
        <Arrow d={`M${e + 20} 124V232`} />
        <text x={e + 28} y="244" style={SMALL}>
          fetch: network
        </text>
        <HandNote x={e + 32} y={160} text={'no wall,\nno features'} />
      </svg>
    </Figure>
  )
}

type Lane = {
  name: string
  note: string
  gates: 'each' | 'dashed' | 'none'
  first?: boolean
}

/** Post 5: where a permission check runs in each system. */
export function CodeModeChecks() {
  const lanes: Array<Lane> = [
    {
      name: 'Claude Code',
      note: 'whole script, then each call',
      gates: 'each',
      first: true,
    },
    { name: 'OpenCode', note: 'each call and each fetch', gates: 'each' },
    { name: 'pi', note: 'only a hook from an extension', gates: 'dashed' },
    { name: 'Cloudflare', note: 'needsApproval tools: left out', gates: 'none' },
  ]
  const stubs = [150, 220, 290]
  return (
    <Figure
      bleed
      title="Where a permission check runs"
      legend={[
        { label: 'the script', mark: 'lilac' },
        { label: 'a call', mark: 'blue' },
        { label: 'a check', mark: 'amber' },
        { label: 'refused', mark: 'rose' },
      ]}
      caption="A dashed mark is a check that exists only when you add it. A dashed call is a tool that the sandbox does not get."
    >
      <svg
        viewBox="0 0 640 326"
        role="img"
        aria-label="Five lanes, each a script that makes three calls. Claude Code: one check on the whole script through the REPL hook, the ask rule and auto mode, then rules and hooks on each call; one call is refused and the script continues. OpenCode: a permission check on each call, such as github_issue_read, and a webfetch check with the URL on fetch; the default is allow. pi: a tool_call hook on each call only if an extension adds one. Cloudflare: no checks on the calls; a tool marked needsApproval is not in the sandbox. Claude API: each call leaves the lane and goes to your application, where your own check runs."
      >
        {lanes.map((lane, index) => {
          const y = 22 + index * 54
          const outside = lane.gates === 'none'
          return (
            <g key={lane.name}>
              <text className="fig-strong" x="10" y={y + 18}>
                {lane.name}
              </text>
              {lane.first ? <Gate x={116} y={y - 3} h={32} /> : null}
              <Box x={130} y={y} w={230} h={26} mark="lilac" />
              {stubs.map((x, stubIndex) => {
                const refused = lane.first === true && stubIndex === 2
                if (outside && stubIndex === 2) {
                  return <Wall key={x} x={376} y={y + 4} w={50} h={18} dashed />
                }
                return (
                  <g key={x}>
                    {lane.gates === 'none' ? null : (
                      <Gate
                        x={x - 2}
                        y={y - 3}
                        h={32}
                        w={7}
                        dashed={lane.gates === 'dashed'}
                      />
                    )}
                    <Box
                      x={x + 9}
                      y={y + 4}
                      w={46}
                      h={18}
                      mark={refused ? 'rose' : 'blue'}
                    />
                  </g>
                )
              })}
              <text x="440" y={y + 18} style={SMALL}>
                {lane.note}
              </text>
            </g>
          )
        })}
        <HandNote x={548} y={118} text="default: allow" rotate={-3} />

        <text className="fig-strong" x="10" y="256">
          Claude API
        </text>
        <Box x={130} y={238} w={230} h={26} mark="lilac" />
        {stubs.map((x) => (
          <g key={x}>
            <Box x={x + 9} y={242} w={46} h={18} mark="blue" />
            <Arrow d={`M${x + 32} 266V292`} />
            <Gate x={x + 18} y={274} w={28} h={6} />
          </g>
        ))}
        <Box x={130} y={296} w={230} h={24} mark="sand">
          your application
        </Box>
        <text x="440" y="256" style={SMALL}>
          your own check, each call
        </text>
      </svg>
    </Figure>
  )
}
