# Cloudflare Workers

Rules for Cloudflare Workers, KV, R2, and related services. See [typescript.md](typescript.md) for general type rules and [security.md](security.md) for input validation.

## Runtime

- MUST: Use ES module format (`export default { fetch }`). Never use Service Worker format.
- MUST: Type all bindings in an `Env` interface. Never use untyped `env`.
- MUST: Use `crypto.randomUUID()` — not the `uuid` package (crashes in Workers runtime).
- MUST: Use Web APIs (`fetch`, `Request`, `Response`, `crypto`, `TextEncoder`) — not Node.js equivalents.
- NEVER: Import `fs`, `path`, `net`, `child_process`, or other Node.js-only modules.
- SHOULD: Enable Node.js compatibility (`nodejs_compat`) only when a dependency requires it.

## Limits

| Resource | Free | Paid |
|----------|------|------|
| CPU time per request | 10ms | 5 min |
| Memory per isolate | 128 MB | 128 MB |
| Subrequests per request | 50 | 1,000 |
| Environment variables | 64 (5 KB each) | 128 (5 KB each) |
| Request body | 100 MB | 100 MB+ |

- MUST: Design for 128 MB memory — no large in-memory buffers. Stream large responses.
- SHOULD: Keep CPU time well under limits. Most requests should be <2ms.

## Wrangler & Deployment

- MUST: Use `wrangler secret put` for secrets. Never put secrets in `wrangler.toml`.
- MUST: Set explicit `bucket_name`, `database_name`, `namespace_id` in bindings — don't rely on binding name alone.
- MUST: Set `compatibility_date` to a recent date. Update quarterly.
- SHOULD: Use `wrangler dev` for local development with real bindings.
- SHOULD: Use `wrangler deploy` for production (not manual uploads).

## KV

- MUST: Design for eventual consistency — writes propagate globally in ~60 seconds.
- MUST: Respect 1 write per second per key limit. Exceeding returns 429.
- MUST: Validate sizes before write: keys ≤512 bytes, values ≤25 MB, metadata ≤1 KB.
- MUST: Check `list_complete` flag when paginating — never assume result count equals completion.
- SHOULD: Use bulk reads (up to 100 keys) instead of individual reads.
- SHOULD: Set `cacheTtl` (minimum 60s) for frequently read keys to reduce latency.
- NEVER: Use KV for atomic operations or strong consistency. Use Durable Objects instead.

## R2

- MUST: Use multipart uploads for objects >100 MB. Uncompleted uploads auto-abort after 7 days.
- MUST: Check `truncated` property when listing — max 1,000 results per call.
- MUST: Use prefix filtering when listing. Unfiltered listing is expensive at scale.
- SHOULD: Leverage strong consistency — R2 writes are immediately visible globally after Promise resolves.
- SHOULD: Use conditional operations (`onlyIf`) to avoid unnecessary reads/writes.

## Error Handling

- MUST: Wrap the top-level `fetch` handler in try/catch. Unhandled errors crash the isolate.
- MUST: Return structured error responses — not raw exception messages.
- SHOULD: Log errors with `console.error` for wrangler tail / Logpush visibility.
- NEVER: Expose internal error details, binding names, or KV namespace IDs to clients.

## Testing

- MUST: Use Vitest with `@cloudflare/vitest-pool-workers` for unit tests against real Workers runtime.
- SHOULD: Test with real bindings in `wrangler dev` for integration tests.
- SHOULD: Use `miniflare` for isolated local testing when real bindings aren't needed.
- NEVER: Mock the Workers runtime in tests — the runtime has real behavioral differences from Node.js.

## Security

- MUST: Validate all input at the worker boundary (headers, query params, body).
- MUST: Authenticate requests before accessing bindings.
- MUST: Use `crypto.subtle` for cryptographic operations (AES, HMAC, SHA).
- NEVER: Trust `cf-connecting-ip` or other headers without Cloudflare in front.
- NEVER: Store unencrypted secrets in KV or R2.
