# Skeleton: Solid 2.0 async post (worksheet, not published)

How to use:

- Write your sentences under each `WRITE:` block. Type or dictate. Rough is fine.
- Keep every fact and number as given. Do not copy sentences from the old draft.
- Code blocks, logs and figures stay as they are. Do not reword them.
- The loader ignores this file. It reads only `index.mdx`.

---

## INTRO (no heading)

Facts:

- Solid 2.0 stable: 16 November 2026.
- Biggest change: where async work lives.
- 1.x: a fetch was `createResource`. Separate primitive. Own `loading` and `error` flags.
- 2.0: any computation can return a promise. The graph itself knows a node is waiting.
- Audience: engineers who know promises, queues, transactions. Signal graph knowledge not required.
- Method: read the reactive core in the `solidjs/solid` repo. Measured 2.0 against 1.9. Same small app. Apple M4.

WRITE (3-5 sentences): open the post. Why you looked at 2.0. What you did first. What the reader gets.

> It's been 5 years since Solid 1 was released and it's now finally the turn for Solid 2.0. It was finally released at 16th November 2026 and the biggest change you can say is mainly on how the async work is now handled and where it lives in the version 1 the fetch was a create resource it was a separate primitive with its own loading and error flags and states but now in the solid 2.0 any computation anything can return a promise not just a fetch the graph of solidJS itself knows when the node is waiting and it can handle things automatically our audience is mainly the engineers who know promises queues transactions but don't exactly know how the signal graphs work and to write this blog we are reading the reactive core of the solid jo and it will do the measurement of 2.0 against the latest 1.9

---

## The graph in backend terms

Facts:

- Three node kinds:
  - **signal**: holds a value. Backend analogy: a row.
  - **memo**: cached result. Records the signals and memos it read on its last run. Runs again only when one of them changes. Analogy: materialized view that knows its own dependencies.
  - **effect**: leaf. Does work outside the graph: DOM writes, logs, API calls. Analogy: subscriber on a change feed.
- Figure: `<GraphPlayground />`. Buttons write signals. Counters: one write gives one memo run and one effect run. Two writes in one tick also give one run each.
- Owner: every memo and effect has one. Owner = the computation that ran when the node was made. Owners form a tree. Parent reruns or is disposed: children disposed first, `onCleanup` callbacks run. Same rule as structured concurrency: cancel a task, cancel its subtasks.
- 2.0 change: a `createRoot` made inside another owner now belongs to that owner. Solid disposes it with that owner.

```ts
import { createSignal, createMemo, createEffect, flush } from "solid-js";

const [price, setPrice] = createSignal(10);
const [qty, setQty] = createSignal(3);
const total = createMemo(() => price() * qty());

createEffect(
  () => total(), // compute: runs in the graph, records dependencies
  value => console.log("total", value) // apply: the side effect
);
```

- 2.0 effect = two parts. First function: tracked, returns a value. Second function: receives the value, does the side effect, can return a cleanup function.
- 1.x single-function effect fails in development. Clear message. Full text shown near the end of the post.

WRITE (2-3 sentences): your reaction to the three analogies. Or your own analogy. Or skip.

> There are three types of nodes. First one is signal, which everyone knows is what SolidJS made popular now, Severalt, Angular all have the signals. There is even talk to add it to the Java script itself. Memo, everyone knows what memo is. It's popular from the React.js where you cache a value, it does not render again. Typical thing. The effect was also borrowed from the React.js. Effect is something that happens externally and we need the result to reflect in the main graph which is a graph in Solid.js in ReactJS it's a virtual DOM

---

## Writes are queued, then flushed in height order

Facts:

- A write does not change what reads return. Not right away.
- Write = stage the value, mark subscribers, queue one microtask.

```ts
setPrice(12);
price(); // 10
flush();
price(); // 12
```

- `schedule()` calls `queueMicrotask(flush)` one time per tick.
- All writes in one synchronous run of your code join that one flush.
- `batch` is gone. Batching is the default. Use `flush()` in tests.
- Flush = topological sort with a heap.
- Memo height: one more than the highest memo it reads.
- `runHeap` walks the heap from height 0 up.
- A memo always runs after all its inputs. Each dirty node runs one time.
- Diamond: two memos read one signal, a third reads both. Bottom memo runs once, both inputs new. Never sees a half-updated pair.
- Order after the heap: settle held changes, then render effects, then user effects.

Figure: `<WriteQueue />`.

WRITE (1-2 sentences): what the flush mechanism reminds you of. Your comparison, not the old one.

> Solid just does not change the value what reads written every time. There is a micro task queue that keeps happening and it keeps updating sort of in a badge. If you want like immediate improvement, you can do a manual flush, but it's more like how libUV event loop works. The microtask queue manages it

---

## What a pending node is

```ts
const [id, setId] = createSignal(1);
const user = createMemo(async () => {
  const userId = id(); // read inputs before the first await
  const res = await fetch(`/api/users/${userId}`);
  return res.json();
});
```

Facts:

- `handleAsync` sees a thenable. Stores the promise on the node as the current flight.
- Node gets pending status. A read throws `NotReadyError`. Error `source` = the node.
- Dependents marked pending, same source. Not rerun: no new input for them yet.
- Every read of a pending node throws again. Reader does not block a thread. Reader does not get `undefined`. Analogy: `EAGAIN`. Scheduler reruns the reader when the input arrives.
- Production builds on V8: `NotReadyError` constructor sets `Error.stackTraceLimit` to 0. The throw is control flow, not a failure.
- On resolve: Solid checks the promise is still the current flight.
  - `id` changed meanwhile: newer flight exists, old answer dropped. Same idea as compare-and-set on a version number. Late response cannot overwrite a newer one.
  - Promise current: value written like any other write. Pending marks cleared from dependents. Flush scheduled.
- Rejection: same path, error status. Wrapped in `StatusError`. Original error kept as `cause`.

Figure: `<PendingNode />`.

- Tracking rule: dependencies recorded only up to the first `await`. A signal read after it is not tracked.
- Late read of a pending source: the memo can never retry.
- Development behavior: throws instead of hanging. Message: "Read of an unresolved async source after an `await`."

WRITE (2-3 sentences): the rule in your words. What habit it forces. Optional: how you learned it.

> 

---

## Superseded flights are dropped, not cancelled

Facts:

- The landing check protects the screen. It does not protect the server.
- Solid does not cancel requests itself.
- Newer flight replaces old one: old flight still runs to the end. Solid discards its answer.
- Every run of a computation is an owner. A replaced run that never reached the screen is disposed. Its `onCleanup` callbacks run.
- Fix: register an `AbortController` before the first `await`. Disposal cancels the request.

```ts
const results = createMemo(async () => {
  const q = query(); // tracked: read before the await
  const ac = new AbortController();
  onCleanup(() => ac.abort()); // runs when a newer run replaces this one
  const res = await fetch(`/api/search?q=${q}`, { signal: ac.signal });
  return res.json();
});
```

- Typeahead test: loads one query, then four keystrokes 10 ms apart. Fake fetch takes 50 ms.
  - Without `onCleanup`: five fetches started, all five ran to the end, three answers discarded on landing.
  - With `onCleanup`: five started, three aborted, two finished. The first query and the last.
- Render effect ran two times in both versions. One per kept answer.
- Screen never showed the discarded answers. Only difference: server work.
- Exception: the run on screen is not cleaned up when a newer run starts. It stays live until the replacement lands. Only the runs between the two are disposed.
- Attribution build: `ABANDONED_FLIGHTS` diagnostic fires when one async source abandons three or more flights in one second. Sign of one request per keystroke.

WRITE (2-3 sentences): who pays for the waste here. Why you care as a backend engineer.

> In more than one flight of a request happens together, the superseded flights, even though if you are not handling them correctly, they will still run in the back end, but their result will not appear on the front end. For example, you are doing four flats together, only the first one and the last one can appear if they happen relatively together. In order to manage it correctly, you should improve the bot continuity similar to how context in Goliang works. Everything should use a bot controller. You should probably create a helper function so that it's managed automatically

---

## Boundaries catch pending and errors

Facts:

- `<Loading>` catches pending reads. Was `Suspense` in 1.x.
- `<Errored>` catches errors. Was `ErrorBoundary`.
- Separate on purpose: a pending read is never an error. `<Errored>` never shows a fallback for a wait.

Figure: `<BoundaryCatch />`.

- `<Loading>` catches pending reads only until it has shown content once.
- After that, Solid **holds** a change that needs new async data. Screen keeps old content.
- When every async value the new frame needs has landed: whole change appears in one frame.
- Transaction analogy: writes go to a staged world. Readers of the visible world see the committed snapshot. The commit is atomic.
- `on` prop re-arms the boundary for one change: `<Loading on={id()}>`.
- Two functions read uncommitted state on purpose:
  - `isPending(() => user())`: true while a new answer for that expression is in flight.
  - `latest(id)`: newest written value while the hold is open.
- Test: the memo above, fake fetch 50 ms, effect log:

```text
[61ms] effect saw user = Ada
[61ms] isPending(user) = false  latest(id) = 1
[91ms] --- setId(2)
[92ms] isPending(user) = true  latest(id) = 2
[142ms] effect saw user = Grace
[142ms] isPending(user) = false  latest(id) = 2
```

- Effect never saw an empty or half-loaded value. From 92 to 142 ms it showed Ada.
- Errors follow the graph: `try`/`catch` around a reactive read in a memo does not catch an upstream error. A memo that reads a failed source fails itself. Recover through `<Errored>`.
- Exception: a rejected promise your own code awaits is a normal exception. Catch it yourself.
- Uncaught error: Solid does not log and continue. The scheduler stops.

```text
[REACTIVITY_HALTED] An uncaught error halted the reactive system. No further updates will be processed. Handle errors with <Errored> or treat this as a crash.
  in computed
```

- After the halt: Solid ignores all writes. Also writes to unrelated signals.
- In Node, the rejection stopped the process.
- Advice: put `<Errored>` at the root. Same reason as a top-level exception handler in a server.

WRITE (2-4 sentences): your reaction to the halt behavior. Fair or harsh, and why.

> The boundary is an error boundary is relatively similar to how it is in Next.js the suspense is sort of called React, direct boundary is called error like how the logging works in air that you can see where the things are failing and stuff, especially during the build time so that your agent can fix it automatically. Keep in mind so that you are handling all of the errors, the error boundaries are nice, the fallback is clean

---

## Every change is a transition

Facts:

- 1.x had `startTransition` and `useTransition`. 2.0 removes both. Every change is already a transition.
- Rules:
  - A change = a write, the writes of an action, or an async answer that lands.
  - All writes in one synchronous tick = one change.
  - Solid holds a change when it would put a render effect on screen that reads async data with no answer yet. Screen keeps its frame until the answer comes.
- Detail 1: only render effects hold. A memo no render effect reads can stay pending forever and holds nothing. A memo made during a hold does not join it. It joins when it reads a held value.
- Detail 2: holds join through the graph, not through time. Two writes that share an async value on screen settle as one frame. Two writes that share nothing land separately, even one millisecond apart.
- 1,000-source test: each source waits 20 to 29 ms on its own timer. One effect adds them all.
  - 1.9 (`createResource` + `createEffect`): 1,001 effect runs on first load. One for the empty state, one per resource. A change of the shared key: 1,000 more runs.
  - 2.0 (async memos + render effect): one run on first load. One run per change.
- Note: this pair of numbers is the drawing on the share card of the post.
- Cost side: the effect shows nothing new until the slowest of the 1,000 sources answers. Correct for a list. Wrong for two unrelated widgets on one page. Next section covers that case.

WRITE (1-2 sentences): your take on the trade. Waiting for the slowest source: when it is right, when not.

> I think this is a big change, but it's a very nice change when everything is a transition, it is relatively easier for the agent and even your mental model to remain consistent. You don't need to understand lots of things as long as everything is a transition, as long as you understand how it works, it does not really matter

---

## When waiting is wrong: createDeferred and quiet refreshes

Facts:

- `createDeferred`: same name as 1.x, new meaning. An async memo that can be late but is never early.
- Before first answer: like any async memo. After that: a new fetch holds nothing.
- Readers keep the last committed value until the new value lands. Rest of the screen continues without it.
- `isPending` still shows the new fetch. A widget can dim itself.
- Test: fast source 20 ms and slow source 200 ms on one signal. One change.
  - Both as `createMemo`: widgets kept the old value, changed together at 202 ms.
  - Slow source as `createDeferred`: fast widget changed at 23 ms, slow one at 202 ms.

Figure: `<DeferredTimeline />`.

- `refresh()` is quiet by default. Asks the same question again. The value on screen still answers it. `isPending` stays `false` for the full round trip.
- To show a reload as pending, declare it first: `affects(data); refresh(data)`.
- Test: `isPending(() => data())` was `false` 20 ms into a plain refresh. `true` 20 ms into a declared refresh. Back to `false` when the value landed.
- `loadingValue`: a declared first paint. Type is strictly `T`. The placeholder must have the shape of a real answer. If it cannot, the source needs a `<Loading>` boundary.

WRITE (1-2 sentences): where you would use deferred. A concrete case from your work, if any.

> 

---

## Optimistic actions and rollback

Facts:

- Mutations are not reads. 2.0 has a separate primitive.
- `action()` wraps a generator. Each call = one transaction.
- Solid holds the writes until the body returned and all started work has landed.
- At `yield`: the action waits for a promise, then enters its transaction again.
- `createOptimistic` and `createOptimisticStore`: values whose writes show at once. Solid discards these writes when the transaction ends.
- Source terms: an optimistic write is a guess (`optimisticWrite`). At the next flush each guess becomes the node value in a **lane**. A lane is a sub-transaction under the hold.
- Committed value under a lane does not change. Rollback = drop the lane. Committed value shows again. Rollback costs nothing.
- Success: the `refresh()` in the action fetches the source again. Real value replaces the guess in the same frame.

```ts
let saved = 0;
const [count, setCount] = createOptimistic(() => saved);

const save = action(function* (n: number) {
  setCount(n); // shows now
  yield api.save(n); // the transaction stays open
  refresh(count); // read the source of truth again
});
```

- Test: fake `api.save` rejects after 50 ms. Effect on `count`:

```text
[1ms] effect saw count = 0
[3ms] effect saw count = 5
[53ms] effect saw count = 0
[53ms] action rejected: server said no
```

- Analogy slot: saga compensating step, without the code for it.

Figure: `<OptimisticAction />`.

WRITE (1-2 sentences): what you have hand-written before that this replaces.

> 

---

## The same feature in 1.9 and 2.0

Facts:

- Test app: list page. Loads 1,000 items through an async function. Filters by a text input. Toggles an item with an optimistic update.

1.9:

```tsx
const [query, setQuery] = createSignal("");
const [items, { mutate, refetch }] = createResource(query, fetchItems);

const toggle = async (item: Item) => {
  const before = items();
  mutate(list => list?.map(i => (i.id === item.id ? { ...i, done: !i.done } : i)));
  try {
    await toggleItem(item.id);
  } catch {
    mutate(before);
  }
  refetch();
};
```

2.0:

```tsx
const [query, setQuery] = createSignal("");
const [items, setItems] = createOptimisticStore(() => fetchItems(query()), []);

const toggle = action(function* (id: number) {
  setItems(list => {
    const item = list.find(i => i.id === id);
    if (item) item.done = !item.done;
  });
  yield toggleItem(id);
  refresh(items);
});
```

- JSX changes:
  - `<Loading>` replaces `<Suspense>`. `<Errored>` replaces `ErrorBoundary`.
  - `class={{ done: item.done }}` replaces `classList`.
  - `isPending(() => items.length)` replaces `items.loading`.
  - `<For>` reads the store directly: `each={items}`.
- Line counts: full component 35 non-blank lines in 1.9, 33 in 2.0. Toggle handler 11 lines to 8. No manual snapshot and restore. Store setter takes a draft, so `produce` is gone.

WRITE (2-3 sentences): which version you prefer to maintain, and why. Small numbers, real difference or not.

> 

---

## What it costs

### Bundle size

Facts:

- Method: `vite build`. Measured the single JS file. gzip level 9. Brotli quality 11.
- Extra builds: counter with one button per version (floor). 2.0 list with only an async memo and `<Loading>`: no action, no optimistic store, no `<Errored>`.

Figure: `<RankBars>` gzip KB: 1.9 counter 4.5; 1.9 list 7.1; 2.0 counter 11.8; 2.0 list async-memo-only 16.0; 2.0 list 37.4 (5.2x the 1.9 app). Caption raw/brotli: 11.4 / 4.1, 17.9 / 6.5, 29.0 / 10.9, 39.4 / 14.7, 99.3 / 33.8 KB.

Figure: `<NumberBand>` 5.2x. 37.4 KB against 7.1 KB gzip, same app, same features.

- Chunk split: `@solidjs/signals` = 90.2 KB of the 99.3 KB raw bundle. `@solidjs/web` = 7.5 KB.
- Action + optimistic store + `<Errored>` + `isPending` add 59.9 KB raw over the async-memo-only build.
- Conclusion: growth comes mostly from the mutation side, not async reads.

### Server render time

Facts:

- Method: SSR entry per version. 1,000 rows, two ways:
  - `renderToString`, rows already in memory.
  - `renderToStream`, rows from an async loader under `<Loading>` (`<Suspense>` in 1.9). Stream into a Node `Writable` until it ends.

Figure: `<BeforeAfterBars>` microseconds. renderToString 77.5 to 144. renderToStream 917 to 765. Caption: median of five processes, each the median of 1,000 renders after 200 warm-up renders.

- String render 1.9 times slower in 2.0: 144 us against 77.5 us.
- Streamed page with async data 17% faster: 765 us against 917 us.
- 2.0 output smaller: hydration keys `data-hk="012"` became `_hk=120`. 1,000-row string 44,128 to 37,169 bytes.
- Both renders far below one millisecond for 1,000 rows.
- Watch item: string render on large pages with no async data.

### Update time

Facts:

- Micro-benchmark: one signal, 10,000 dependents. Node. Browser builds of both versions.
- Two shapes: 10,000 effects. 10,000 memos plus one effect that adds them.
- Time = write to end of flush. 1.9: write outside a batch runs effects synchronously. 2.0: call `flush()`.

Figure: `<RankBars>` ms. 1.9 effects 0.45. 2.0 effects 1.02 (2.3x slower). 1.9 memos + effect 1.18. 2.0 memos + effect 1.67 (1.4x slower). Caption: median of five processes, each the median of 500 writes after 100 warm-up writes.

- 2.0 slower on this shape. Every write staged, then committed at the flush, also when nothing is async.
- Core design notes disallow a direct commit per write. They call the commit cost "the price of the semantics": reads must not change before the flush.
- One write to 10,000 effects costs about one millisecond. Real pages rarely have that fan-out from one signal.

WRITE (2-4 sentences): your verdict on the costs. What matters to you among size, SSR, updates. Where 2.0 is still worth it, or not.

> 

---

## Running 1.x code on 2.0

Facts:

- Test: copied the 1.9 app into the 2.0 project, no changes, built it.
- Failure 1, import path:

```text
"./web" is not exported under the conditions ["solid", "module", "browser", "production", "import"] from package .../node_modules/solid-js
```

- Fix: `@solidjs/web` in place of `solid-js/web`. Then failure 2, compiler:

```text
Error: `classList` on <li> was removed in Solid 2.0. Use `class` with an object or array instead: `class={{ active: isActive() }}` or `class={["base", { active: isActive() }]}`. (28:21)
```

- Failure 3, bundler, removed exports:

```text
[MISSING_EXPORT] "createResource" is not exported by "node_modules/solid-js/dist/solid.js".
[MISSING_EXPORT] "ErrorBoundary" is not exported by "node_modules/solid-js/dist/solid.js".
[MISSING_EXPORT] "Suspense" is not exported by "node_modules/solid-js/dist/solid.js".
```

- Also gone: `batch`, `startTransition`, `on`, `produce`, `createComputed`, `createMutable`.
- `solid-js/store` is now `solid-js`.
- Compiled code can still fail at run time in development:

```text
[MISSING_EFFECT_FN] createEffect requires both a compute function and an effect function. Use `createEffect(() => signal(), value => doWork(value))`. If you want a derived value, use `createMemo`. If you want a one-shot side effect, just call the function directly.

[REACTIVE_WRITE_IN_OWNED_SCOPE] Writing to reactive state inside an owned scope (component, computation) is not allowed. Move the write outside or set the `ownedWrite` option if this is intentional. (in computed)

[STRICT_READ_UNTRACKED] Reactive value read directly in <Title> will not update. Move it into a tracking scope (JSX, a memo, or an effect's compute function).
```

- Cause 1: `createEffect` with one function.
- Cause 2: the 1.x habit `createMemo(() => setDoubled(count() * 2))`.
- Cause 3: a warning, not an error. Component destructures its props.
- Each message links to its page in the diagnostics reference.
- Links to keep: migrating a SolidStart app to Solid 2.0 (`/blog/migrate-solidstart-to-solid-2/`). The `"use server"` runtime is now part of `@solidjs/web`. SolidStart maintenance post (`/blog/solidstart-maintenance-what-to-use/`).

WRITE (1-2 sentences): how the migration felt. Optional.

> 

---

## Sources

Keep the list as is in `index.mdx`. No writing needed.
