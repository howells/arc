# LLM API Testing Best Practices

When testing code that calls LLM APIs (OpenRouter, OpenAI, Anthropic, etc.):

## Never Blame "Network Issues"

It is almost NEVER a network problem. It's almost always:
1. **Payload too large** — Token limits exceeded
2. **Invalid request format** — Missing fields, wrong types
3. **Code bug** — Logic error, wrong variable
4. **Wrong model ID** — Model renamed or unavailable

**Error Diagnosis:**

| Error Pattern | Likely Cause | NOT the cause |
|---------------|--------------|---------------|
| "Timeout" on LLM call | Payload too large, model overloaded | "Network issues" |
| "400 Bad Request" | Invalid payload, missing required field | "Network issues" |
| "413 Payload Too Large" | Request body exceeds limit | "Network issues" |
| "429 Rate Limited" | Too many requests, need backoff | "Network issues" |
| "500 Internal Server Error" | Bug in YOUR code (usually) | "Network issues" |

**Only after exhausting code causes:** Consider actual network issues (DNS, proxy, firewall)

## Input/Output Validation

**Always validate before sending (Zod/TypeScript example):**
```typescript
import { z } from 'zod';

const llmRequestSchema = z.object({
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().max(100_000), // Catch oversized content early
  })),
  max_tokens: z.number().int().positive().max(4096),
});

// Validate before API call — catches payload issues early
const validated = llmRequestSchema.parse(request);
```

**For Python:** Use Pydantic with similar constraints.

## Payload Size Management

| Model Tier | Typical Input Limit | Keep Test Requests Under |
|------------|--------------------|--------------------|
| Fast (-flash, -mini variants) | 128K-1M tokens | 10K tokens |
| Standard (GPT-4o, Claude Sonnet) | 128K tokens | 20K tokens |
| Large context | 200K tokens | 50K tokens |

**Red flags for payload issues:**
- Stringifying entire objects without truncation
- Concatenating multiple documents without size check
- Embedding base64 images without compression

## Fast Models for Testing

**Prefer fast models in tests:**
- `-flash` variants (Gemini Flash, etc.) — Fast, cheap
- `-mini` variants (GPT-4o-mini, etc.) — Fast, cheap
- `-haiku` variants (Claude Haiku) — Fast, cheap

**Set aggressive timeouts:**
```typescript
const response = await fetch(apiUrl, {
  signal: AbortSignal.timeout(10_000), // 10s max for LLM calls
});
```

## Model Discovery

**Reference:** https://routerbase.danielhowells.com/llms.txt

When choosing a model for testing:
1. Prefer `-flash`, `-mini`, or `-lite` variants for speed
2. Check token limits match your test payloads
3. Verify the model is available on your provider
