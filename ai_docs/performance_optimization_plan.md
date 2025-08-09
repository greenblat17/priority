## Performance Optimization Plan

This document outlines a practical, high-impact plan to improve application performance across frontend and backend. Items are grouped by priority (P0 highest). Each item includes concrete actions and file-level pointers.

### Frontend P0: Render fewer DOM nodes

- Virtualize task lists/tables to render only visible rows
  - Action: integrate windowing in `src/components/tasks/task-list-linear.tsx` and `src/components/tasks/task-table-grouped.tsx` using a virtualizer (e.g., @tanstack/react-virtual or intersection observers)
  - Keep fixed row heights for smooth scroll; lazy-render group sections

### Frontend P0: Reduce client JS and re-renders

- Convert top-level pages to Server Components; keep client islands small
  - Action: make `src/app/tasks/page.tsx` a Server Component; move interactivity (filters, table, modals) to client components
  - Remove unnecessary "use client" at page level

### Frontend P0: Dynamic import heavy, rarely-used UI

- Code-split large dialogs and non-default views
  - Action: dynamic import with `{ ssr: false }` for:
    - `TaskDetailPanel`, `TaskEditDialog`, `DuplicateReviewDialog`
    - `GroupManagementDialog`
    - `TaskKanbanView`
    - `QuickAddModal` (only where opened)
  - Provide lightweight fallbacks

### Frontend P0: Cut expensive animations

- Prefer CSS transitions over framer-motion on list rows
  - Action: in `task-list-linear.tsx` and `task-table-grouped.tsx`, remove motion-based row hover/enter transitions; keep micro-interactions only where necessary

### Frontend P1: Tame React Query churn

- Avoid broad refetches and lower re-fetch frequency
  - Action: in `src/hooks/use-tasks.ts`:
    - Replace `refetchQueries({ queryKey: taskKeys.all, type: 'active' })` with targeted cache updates (`setQueriesData` on specific task IDs for `analysis`/`status`)
    - Add `staleTime: 60000`, `refetchOnWindowFocus: false`, `keepPreviousData: true`
  - Narrow `select` fields for list queries (no `select *`), fetch full details lazily

### Frontend P1: Fetch smaller payloads

- Split “list fields” vs “detail fields”
  - Action: in `useTasks` select: `id, description, status, created_at, source, group_id` and minimal analysis fields (`priority, ice_score, complexity, confidence_score, category`)
  - Load full record and attachments when opening `TaskDetailPanel`

### Frontend P1: Server-side filtering and sorting

- Push search/filter/order to DB
  - Action: use API/supabase queries that return filtered/sorted slices; stop client-sorting large arrays in `TaskList`

### Frontend P2: Prefetch smarter

- Prefetch next page near viewport bottom; prefetch details on row hover
  - Action: leverage `queryClient.prefetchQuery` and `usePrefetchTasks`

### Backend P0: Add covering indexes for hot paths

- SQL migrations (create if not exists):
  - `CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at ON public.tasks(user_id, created_at DESC);`
  - `CREATE INDEX IF NOT EXISTS idx_tasks_user_status_created_at ON public.tasks(user_id, status, created_at DESC);`
  - Full-text search (optional):
    - `ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS search_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(description,''))) STORED;`
    - `CREATE INDEX IF NOT EXISTS idx_tasks_search ON public.tasks USING GIN (search_tsv);`
  - Analysis priority/category (if queried):
    - `CREATE INDEX IF NOT EXISTS idx_analyses_priority ON public.task_analyses(priority);`
    - `CREATE INDEX IF NOT EXISTS idx_analyses_category ON public.task_analyses(category);`

### Backend P1: Server list API + keyset pagination

- Extend `src/app/api/v1/tasks/route.ts` to support:
  - Query params: `q`, `status`, `category`, `orderBy`, `orderDir`, cursor pagination (`cursor` = last `(created_at,id)`)
  - Return: `items`, `nextCursor`, and `counts` per status for tabs
- Update client to cursor pagination over offset for large lists

### Backend P1: Reduce realtime noise

- Scope realtime updates or disable for large workspaces
  - Action: in `use-tasks.ts`, listen only to `task_analyses` INSERT and update a single cached task; avoid global refetch
  - Feature flag to disable realtime and rely on polling/backoff for stability

### Backend P2: Precompute counts/aggregations

- Materialized view or cached endpoints for status/category counts
  - Refresh via triggers on write or scheduled job

### Perceived performance P0: Faster interactions

- Keep optimistic UI for create/update/delete; keep toasts short and non-blocking

### Network and build P1: Cache, compress, and shrink JS

- Ensure API responses have reasonable cache headers (read-only endpoints)
- Confirm Brotli/gzip enabled (Vercel default)
- Bundle hygiene:
  - Verify tree-shaking of `lucide-react` (import only used icons)
  - Ensure framer-motion is only in client islands
  - Remove unused UI imports and dead code

### Observability P1: Measure and iterate

- Add user-timing marks around list fetch/render
- Track Web Vitals (existing `WebVitalsProvider`) and custom metrics:
  - Tasks page TTI, median list fetch latency, render duration
- Log query duration in `useTasks` and latency in `/api/v1/tasks`

---

## Suggested concrete edits (next steps)

1. Indexes migration

- Add a migration file: `supabase/migrations/XXXX_add_performance_indexes.sql` with the indexes above

2. Harden `useTasks`

- Add `staleTime`, `refetchOnWindowFocus: false`, `keepPreviousData: true`
- Narrow `select` to list fields; fetch details lazily in `TaskDetailPanel`
- Replace global refetch calls with targeted `setQueriesData`

3. Virtualize rows

- Implement virtualization in `task-list-linear.tsx` and `task-table-grouped.tsx`
- Fixed row height and overscan; lazy-render group sections

4. API improvements

- Extend `/api/v1/tasks` for server-side filtering/search and keyset pagination
- Return `counts` and `nextCursor` for fast tabs and pagination UX

5. Code-splitting

- Dynamic import heavy dialogs and `TaskKanbanView` with fallbacks

6. Realtime scope

- Limit to `task_analyses` insert events; update only the affected task in cache

These steps provide immediate wins (P0) and lay groundwork for sustained performance at scale.
