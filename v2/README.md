# Purple Sector V2 — Live Timing

This is the isolated V2 development workspace inside the Purple Sector repository.
The existing V1 app remains unchanged.

## Product direction
- Live timing tower (position, driver, gap, interval, lap and sector times)
- Session control (session type, status, track status, clock)
- Telemetry analysis (speed, throttle, brake, gear, RPM, DRS when source data exists)
- Circuit map and driver positions only when reliable location data is available
- Mobile-first layout

## Data policy
Never fabricate live telemetry. Every displayed value must be sourced, timestamped, and marked unavailable when the provider does not supply it.

## Initial milestone
Build the read-only live timing shell, then connect a documented data provider behind a server-side adapter.
