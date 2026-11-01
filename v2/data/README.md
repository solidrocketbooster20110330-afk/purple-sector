# Data provider integration

Provider integration is intentionally not hard-coded yet.

Before selecting an adapter, verify:
- endpoint availability and terms of use
- whether live session timing is actually supplied
- update frequency and latency
- historical versus live coverage
- telemetry/position availability and rate limits

All provider responses must be normalized into `v2/types/live-timing.ts`.
