# Week 12: Admin & Prompt Tool Polish

## Completed in this repo

### 1) Admin statistics added
On `/admin/flavors`, added live aggregate stats cards for:
- total humor flavors
- total flavor steps
- total test runs

These values are queried from Supabase and show an error message if stats cannot be loaded.

### 2) Prompt tool duplication added
Added support to duplicate a humor flavor and all related steps with a unique new slug.

- UI: new **Duplicate** button on each flavor card in `/admin/flavors`.
- API: `_method=duplicate` branch in `/api/flavors/[id]`.
- Behavior:
  - load source flavor
  - create new flavor (`<old-slug> copy`, with auto-unique suffix)
  - copy all associated steps in original order
  - redirect to the duplicated flavor detail page

## Week-to-week dependency
This Week 12 work includes and builds on the Week 11 usability improvements already implemented in this repository.
