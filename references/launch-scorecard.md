# Launch Scorecard

Launch uses a compact readiness scorecard so users can see whether a project is
blocked, shareable with caveats, or ready without reading every checklist item.

Score each axis from 0-3 using verified checklist evidence.

## Axes

| Axis              | 0                                                  | 1                                                                                 | 2                                                                          | 3                                                                                |
| ----------------- | -------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Public URL        | No public URL or domain known                      | URL exists but DNS/HTTPS/access state unknown                                     | Public URL known, HTTPS or access state has caveats                        | Public URL, HTTPS, canonical/access state verified                               |
| Shareability      | Missing title/description/assets                   | Basic metadata exists but OG/favicon/canonical gaps remain                        | Share metadata mostly ready, external preview unchecked                    | Metadata, OG image, favicon, canonical URL, and robots posture verified          |
| Content Readiness | Obvious placeholders/TODOs/demo copy remain        | Some content gaps or broken support/contact paths                                 | Main content ready with minor deferred polish                              | Placeholder-free, primary CTA/contact/error states ready                         |
| Detected Services | Required service settings missing or unknown       | Services detected but production settings mostly need user/dashboard verification | Service settings mostly known with specific user-owned checks remaining    | Active services have production URL/env/callback/webhook posture verified        |
| Deeper Checks     | Testing/audit missing and required for launch risk | One deeper check missing or explicitly deferred with risk                         | Deeper checks partly complete or intentionally deferred for low-risk share | Relevant `/arc:testing` and `/arc:audit` status recorded with no launch blockers |

## Interpretation

| Range | Status                 |
| ----- | ---------------------- |
| 0-7   | Blocked                |
| 8-11  | Shareable with caveats |
| 12-15 | Ready                  |

Do not inflate scores for items that require external dashboards, credentials,
DNS, or live validators. Mark those as `Needs user` in the checklist and score
the axis according to evidence available in the repository and user-provided
facts.
