# Week 13 QA Plan (Project 3 Only: Prompt Chain Tool)

> Scope note: This plan is only for the current Prompt Chain Tool repository (Week 12 state). Project 1 and Project 2 are intentionally excluded.

## Test Scope

This QA plan covers:
- Auth entry and admin access path
- Humor flavor CRUD + duplication
- Step CRUD + reorder
- Flavor test run flow and admin stats rendering

## Branch-style Test Plan

### A) Auth & Access
1. Open `/` while signed out and verify CTA routes to `/login`.
2. Open `/login` and trigger Google OAuth button; verify callback route is configured.
3. Sign in with authorized admin account and verify `/admin/flavors` is accessible.

### B) Flavor Management
1. Create a new flavor from `/admin/flavors`.
2. Edit flavor name/description from `/admin/flavors/[id]`.
3. Delete flavor using delete confirmation flow; verify cancel does not delete.

### C) Duplicate Flow (Week 12 feature)
1. Duplicate a flavor with existing steps.
2. Verify new flavor gets unique slug (`copy`, `copy-2`, etc. as needed).
3. Verify duplicated flavor includes copied steps in original `order_by` sequence.

### D) Step Management
1. Add multiple steps to a flavor.
2. Edit a step prompt and title.
3. Reorder steps up/down and verify visual order + persisted order.
4. Delete a step and verify remaining steps still render and save correctly.

### E) Flavor Run / Integration
1. Run “Test This Flavor” with a sample image.
2. Verify response payload is shown in UI and no runtime error appears.
3. Re-run after step edits to confirm updated prompts affect output.

### F) Admin Stats (Week 12 feature)
1. Verify stats cards render on `/admin/flavors`.
2. Cross-check totals change after creating/deleting flavors and steps.
3. Confirm graceful error message appears if stats query fails.

## Post-testing Summary (2–3 bullets as requested)

- Completed end-to-end checks for this repo’s core tree: auth entry → flavor CRUD → step CRUD/reorder → test run; main flows were operational.
- Verified Week 12 additions: duplicate flow correctly cloned flavor + steps with stable ordering, and stats cards rendered with live totals.
- Verified safety/usability behaviors from Week 11/12: delete confirmation prevents accidental removal and empty-state/start guidance improves first-time navigation.
