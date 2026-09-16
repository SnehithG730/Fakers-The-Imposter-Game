# AGENT_README.md - Project Policies & Developer Guidelines

## Project: THE FIVE ELEMENTS — IMPOSTER
A real-time multiplayer elemental deduction game.

### Mandatory Development Rules
1. Non-destructive implementation: Do not overwrite or remove working functionality unless strictly required by architectural changes.
2. Minimal & localized changes: Keep diffs tight, focused, and clean.
3. No unrelated refactoring: Keep focus on requested game features and quality standards.
4. Dependency & Import awareness: Ensure all imported modules and types are properly installed and correctly typed.
5. Zero new errors / warnings: Zero TypeScript errors, zero linter warnings, zero unhandled promise rejections, zero console error spam.
6. Strict Security Boundaries:
   - Never send game secrets (such as the secret keyword or the imposter identity) to unauthorized clients.
   - The imposter must NEVER receive the keyword in their network payload.
   - Normal teams must NEVER receive the imposter identity until the REVEALED state.
   - Authenticate all WebSocket connections and HTTP endpoints.
   - Passwords must be hashed and never exposed in client bundles.
7. Authoritative State Machine: Server is the sole source of truth for round transitions (READY, ACTIVE, BUZZER_READY, BUZZER_ACTIVE, LOCKED, REVEALED), timers, and buzzer queues.
8. Accessibility & Responsiveness: Responsive layouts, keyboard navigation, accessible contrast.
9. Testing & Verification: Full unit test coverage for state transitions, secret sanitization, buzzer concurrency, and auth.
