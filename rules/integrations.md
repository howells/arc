# Integrations (Adapters)

Rules for external service integrations.

- MUST: Fail fast with no silent fallbacks.
- MUST: Throw typed errors (e.g., `ServiceError`) for misconfiguration or upstream non-2xx responses.
- MUST: Be deterministic in production paths; no stubs/hashes/"best effort" behavior.
- SHOULD: Provide test-only mocks in separate adaptors and wire them only in tests.
- SHOULD: Validate configuration at boot to avoid partial functionality.
