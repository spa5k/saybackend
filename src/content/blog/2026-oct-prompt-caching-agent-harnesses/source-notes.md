# Source notes

Checked on 2026-08-31. One visual per agent: claude-code/, codex/, pi/, opencode/.

Shared mechanism claims (all agents):

| Claim | Source | Kind |
|---|---|---|
| Each turn resends the full context; unchanged prefixes are reused. | [Claude Code prompt caching](https://code.claude.com/docs/en/prompt-caching), [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| The cache stores KV state and matches by exact prefix; a change before a breakpoint invalidates the tail. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Cached input tokens bill at a reduced rate. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching), [Claude Code prompt caching](https://code.claude.com/docs/en/prompt-caching) | Verified |

Per-agent claims:

| Agent | Claim | Source | Kind |
|---|---|---|---|
| Claude Code | Layers ordered rarely-changing first: system prompt, project context, conversation. | [Claude Code prompt caching](https://code.claude.com/docs/en/prompt-caching) | Verified |
| Claude Code | Model and effort level are part of the cache key. | [Claude Code prompt caching](https://code.claude.com/docs/en/prompt-caching) | Verified |
| Codex | OpenAI prompt caching is enabled by default and caches the full rendered context. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Codex | OpenAI keeps a cached prefix eligible for about 30 minutes after the last write or reuse; older models hold it for 5-10 minutes up to 1 hour, and a 24-hour option exists. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| pi | Auto-compaction when context exceeds window minus reserve; /compact manual. | [pi compaction docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/compaction.md) | Verified |
| pi | Context rebuilt as system + summary + kept messages; compaction calls disable prompt-cache writes where supported. | [pi compaction docs](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/compaction.md) | Verified |
| opencode v2 | Session warming sends periodic keep-alive model requests to preserve provider-side prompt caches; disabled by default. | [opencode v2 warming](https://opencode.ai/v2/docs/warming/) | Verified |
| opencode v2 | After 4 minutes idle the keep-alive repeats while idle and stops 30 minutes after the last non-warming request. | [opencode v2 warming](https://opencode.ai/v2/docs/warming/) | Verified |
| opencode v2 | Auto-compaction builds a checkpoint (structured summary + serialized tail) and rebuilds later requests from the latest checkpoint plus following messages. | [opencode v2 compaction](https://opencode.ai/v2/docs/compaction/) | Verified |
| Economics | Anthropic cache-read tokens are 0.1x (90% off) the base input rate; cache-write tokens are 1.25x. | [Anthropic prompt caching pricing](https://platform.claude.com/docs/en/build-with-claude/prompt-caching#pricing) | Verified |
| Economics | OpenAI cache-read tokens are discounted up to 90%; cache-write tokens are 1.25x. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Economics | One cache write plus one full cache read costs ~1.35x ordinary input, versus 2x to process the same prefix twice without caching. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Economics | Across ten requests, one cache write plus nine cache reads costs ~2.15x, versus 10x without caching. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Economics | OpenAI break-even crossover: L = 102.4 + 1177.6 / N. Across 10 requests, expanding a prefix of at least 221 tokens to 1024 tokens is cheaper; a 103-token prefix needs at least 1963 requests; a prefix of 102 tokens or fewer never benefits. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Economics | OpenAI cached state lives on individual machines; traffic > 15 requests/min can overflow-rout and miss the cache. A prompt cache key helps route matching prefixes to the same machine but does not pin or guarantee a read hit. | [OpenAI prompt caching](https://platform.openai.com/docs/guides/prompt-caching) | Verified |
| Economics | Anthropic pre-warm pattern (max_tokens: 0) loads the prompt, writes the cache, and returns no output, removing the cache-miss latency penalty and reducing time-to-first-token. It incurs a normal cache write charge if the prefix is not already cached. | [Anthropic prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) | Verified |
| Claude Code | The cache hit rate is monitored as an internal service-level concern; a few percentage points of miss rate can meaningfully change cost and latency across a fleet of agent sessions. | [Claude Code blog: prompt caching is everything](https://code.claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything) | Qualitative |
| Benchmark | No published apples-to-apples prompt-cache benchmark across harnesses exists as of check. Provider economics and documented prefix strategy are the citable comparison; actual windowed hit rate depends on session shape. | Checked 2026-08-31, no primary source | Absence |
