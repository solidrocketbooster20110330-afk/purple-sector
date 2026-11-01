# V2 Architecture

## Layers
1. UI: timing tower, session header, telemetry panels, circuit map.
2. Domain types: normalized session, driver, timing, sector, telemetry, and track-status models.
3. Provider adapters: external data source -> normalized domain models.
4. API routes: server-side access, caching, validation, and graceful unavailable states.

## Principles
- Keep provider-specific response shapes out of UI components.
- Preserve source timestamps and provenance.
- Distinguish live, delayed, cached, stale, and unavailable data.
- Do not infer DRS, tyre, GPS, or sector values when absent.
- Use stable driver identifiers, never list positions, for data association.
