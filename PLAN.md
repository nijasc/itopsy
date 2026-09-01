# Brandopsy — Implementation Plan

Status: planning only. No application code has been written from this
plan yet (schema.ts still holds the scaffold placeholder table).

## Design decisions made on your behalf (flagging per instructions)

The spec under-specifies a number of things. Rather than block on them,
here's what I'm picking and why. Push back on any of these before phase
1 if you want something different — cheapest to change now.

1. **Sessions table** — spec's data model omits it, but Lucia (session-based)
   needs one. Adding `sessions(id, user_id, expires_at)` per
   `@lucia-auth/adapter-drizzle` conventions.

2. **Slugs** — generated server-side from title on create (slugify +
   short random suffix on collision), editable by admin afterward. Not
   spec'd explicitly.

3. **Pagination** — cursor-based on `(created_at, id)` for the gallery,
   simple `LIMIT/OFFSET` for admin tables (small N, needs jump-to-page
   more than infinite scroll). Gallery loads 24 per page with a "load
   more" button rather than infinite scroll, to keep it simple and
   keyboard/a11y-friendly.

4. **Thumbnails** — spec explicitly says don't render 40 live iframes.
   Rather than a screenshot pipeline (needs headless browser
   infrastructure — Playwright, storage, invalidation on edit — heavy
   for v1), gallery cards use a sandboxed iframe with `sandbox=""`
   (empty — scripts disabled entirely) and `pointer-events: none`,
   scaled down via CSS `transform: scale()` inside an overflow-hidden
   container, so the real CSS/HTML layout renders as a static preview
   without executing any JS or allowing interaction. This is cheap,
   requires no extra infrastructure, and is safe — the grid never
   grants `allow-scripts` at all, since it doesn't need interactivity.
   Full interactive iframe with `sandbox="allow-scripts"` is reserved
   for `/study/[slug]`. Flag: if visual fidelity of thumbnails matters
   a lot, a real screenshot pipeline (Playwright + object storage) is
   a fine phase-9 upgrade.

5. **Comment edit window** — spec has `edited_at`/`is_deleted` but no
   stated policy. Picking: author can edit their own comment within 15
   minutes of posting (checked server-side against `created_at`), can
   delete (soft) any time. Admin/owner can soft-delete any comment any
   time (moderation), no time limit.

6. **Search** — Postgres `tsvector` generated column over
   `title || subject || dek`, GIN index, `websearch_to_tsquery` for
   query parsing (handles quoted phrases / `-exclusion` from user
   input reasonably).

7. **Severity/tags filter UI** — checkboxes for tags (multi-select,
   OR within tags, AND across filter groups), single-select pill group
   for severity, dropdown for sort. All filter state lives in the URL
   query string (`?tags=x,y&severity=savage&sort=liked`) so filtered
   views are shareable/bookmarkable and work via SvelteKit's normal
   `load` + form-less GET navigation — no client JS required for the
   base case.

8. **Draft visibility** — draft studies are visible only to admin+
   (author or any admin) via the load function's role check; anon/user
   requesting a draft's slug gets a 404, not a 403 (don't leak
   existence of unpublished studies).

9. **Owner demotion protection** — enforced at the mutation layer
   (form action), not just DB constraint: reject any demote action
   where `target.role === 'owner'`, and additionally rely on the
   partial unique index so an owner row can never be silently
   overwritten by a race in the promote path either.

10. **Like counter** — `like_count` is denormalized per spec. Kept in
    sync via a Postgres trigger on `likes` insert/delete (not
    app-level increment/decrement), so it can't drift under concurrent
    requests or app crashes mid-request.

## Phase breakdown

### Phase 1 — DB schema + migrations
Files:
- `src/lib/server/db/schema.ts` — replace placeholder with `users`,
  `sessions`, `studies`, `likes`, `comments` tables, enums
  (`role`, `severity`, `status`), relations via `relations()`.
- `drizzle/*` — generated migration SQL (via `drizzle-kit generate`),
  plus a hand-written migration (or `drizzle-kit`'s custom migration
  hook) for the partial unique index on `users` and the `tsvector`
  generated column + GIN index on `studies`, and the like-count
  trigger — these aren't expressible via Drizzle's schema DSL and need
  raw SQL migrations.
- `src/lib/server/db/index.ts` — postgres.js client + drizzle instance.
- `.env` / `.env.example` — `DATABASE_URL`.

Commit boundary: **"Add DB schema, migrations, and Postgres triggers/indexes"**

### Phase 2 — Auth + role logic
Files:
- `src/lib/server/auth.ts` — Lucia setup with the Drizzle adapter,
  session cookie config.
- `src/hooks.server.ts` — session validation on every request,
  populate `event.locals.user`/`event.locals.session`.
- `src/app.d.ts` — extend `App.Locals` types.
- `src/routes/signup/+page.server.ts` — registration action: hash
  password (oslo), attempt insert with `role: 'owner'`, catch unique
  violation, retry with `role: 'user'`.
- `src/routes/login/+page.server.ts`, `+page.svelte` for both
  login/signup, `src/routes/logout/+server.ts` or action.
- `src/lib/server/authz.ts` — small helper(s): `requireRole(locals, 'admin')`
  etc., used in every server load/action that needs it.

Commit boundary: **"Add Lucia session auth, owner-race-safe signup, role helpers"**

### Phase 3 — Gallery + filtering
Files:
- `src/routes/+page.server.ts` — load: parse URL search params (tags,
  severity, sort, search, page), query published studies only, return
  facet counts for filter UI.
- `src/routes/+page.svelte` — filter sidebar/toolbar, study cards
  (using the scaled sandboxed-preview technique from decision #4),
  pagination control.
- `src/lib/components/StudyCard.svelte`, `FilterBar.svelte`.
- `src/lib/server/queries/studies.ts` — reusable Drizzle query builders
  for filter/sort/search so the load function stays thin.

Commit boundary: **"Add gallery with filter/sort/search"**

### Phase 4 — Study detail + sandboxed rendering
Files:
- `src/routes/study/[slug]/+page.server.ts` — load study by slug;
  draft → 404 unless admin+/author; increment view count if you want
  one (not in spec — skipping unless you want it).
- `src/routes/study/[slug]/+page.svelte` — full
  `<iframe sandbox="allow-scripts" srcdoc={study.htmlContent}>`,
  no `allow-same-origin`, sized to fill available viewport with a
  loading skeleton while it paints.
- `src/lib/components/SandboxedStudy.svelte` — wraps the iframe so the
  safety-critical attributes live in exactly one place in the codebase.

Commit boundary: **"Add study detail page with sandboxed iframe render"**

### Phase 5 — Likes + comments
Files:
- `src/routes/study/[slug]/+page.server.ts` — add `like`, `comment`,
  `deleteComment`, `editComment` form actions, each starting with a
  role check (`requireRole(locals, 'user')` for like/comment; author-
  or-admin+ check for edit/delete).
- `src/lib/components/LikeButton.svelte` — optimistic toggle via
  `use:enhance`.
- `src/lib/components/CommentThread.svelte`,
  `CommentForm.svelte` — one level of replies: fetch all comments for
  the study in one query, group client-side into
  top-level + `Map<parentId, replies[]>` rather than N+1 queries or a
  recursive CTE (spec caps depth at one level, so this is simpler and
  fast enough).
- `src/lib/server/queries/comments.ts`.

Commit boundary: **"Add likes and one-level-deep threaded comments"**

### Phase 6 — Admin CRUD + editor
Files:
- `src/routes/admin/+layout.server.ts` — `requireRole(locals, 'admin')`
  guard for the whole `/admin` subtree.
- `src/routes/admin/studies/+page.server.ts`, `+page.svelte` — table
  of all studies incl. drafts, counts, publish/unpublish/delete
  actions.
- `src/routes/admin/studies/new/+page.svelte`,
  `[id]/edit/+page.svelte` — split view: CodeMirror
  (`@codemirror/lang-html`, one-dark theme) + live preview iframe
  (debounced re-render of `srcdoc` on edit, still `sandbox="allow-scripts"`
  since this is the admin's own content and it's not embedded in the
  main app DOM), metadata form (title, subject, dek, tags, severity,
  status) validated with Zod.
- `src/routes/admin/studies/new/+page.server.ts`,
  `[id]/edit/+page.server.ts` — load + save actions, Zod schema shared
  between client and server via `src/lib/schemas/study.ts`.
- `src/lib/components/HtmlEditor.svelte` — CodeMirror wrapper.

Commit boundary: **"Add admin study CRUD with CodeMirror editor + live preview"**

### Phase 7 — Admin user management (owner only)
Files:
- `src/routes/admin/users/+page.server.ts` — `requireRole(locals, 'owner')`,
  list users, promote/demote actions with the owner-demotion guard
  from decision #9.
- `src/routes/admin/users/+page.svelte`.

Commit boundary: **"Add owner-only admin promotion/demotion page"**

### Phase 8 — Polish / a11y / responsive
- Empty states (no studies match filters, no comments yet).
- Focus management or animation on the iframe load skeleton.
- Keyboard navigation for filter pills, comment forms.
- Responsive check on gallery grid, split-view editor (likely stacks
  vertically on narrow viewports), admin tables (horizontal scroll
  wrapper).
- `prefers-color-scheme`/contrast pass on the app shell chrome (case
  studies themselves are exempt — they're deliberately each their own
  design).
- Error boundaries (`+error.svelte`) for 404s (bad slug) and 403-style
  redirects for unauthorized admin access.

Commit boundary: **"Polish pass: empty states, responsive layout, a11y"**

## Risk notes

- **Iframe sandboxing** is the highest-consequence item in this app —
  a mistake here is a real XSS-to-account-takeover vector, not just a
  bug. Mitigation: centralize the safety-critical attributes in a
  single `SandboxedStudy.svelte` component (phase 4) so there is
  exactly one place in the codebase that can get this wrong, and add
  an explicit test (even a simple Playwright/vitest-dom test) that
  asserts the rendered iframe's `sandbox` attribute contains
  `allow-scripts` and does **not** contain `allow-same-origin`, so a
  future refactor can't silently regress it. Verify manually too: load
  a study whose `html_content` includes
  `<script>try{parent.document}catch(e){document.body.textContent='blocked: '+e}</script>`
  and confirm it reports blocked, confirming cross-origin access is
  actually denied by the browser, not just by convention.

- **Owner race condition** — the partial unique index handles the DB
  level, but the *insert-then-catch-and-retry* code path needs testing
  under actual concurrency, not just read as correct. Verify by firing
  two concurrent signup requests (e.g. two `Promise.all` fetches
  against a fresh dev DB, or a small script issuing simultaneous HTTP
  requests) and asserting exactly one ends up `role='owner'` and the
  other is `role='user'`, both requests succeeding (no 500s from the
  retry path). Also verify the unique index actually rejects a second
  `role='owner'` row via a raw SQL insert, to make sure the partial
  index expression is correct (`(true) WHERE role = 'owner'` is a
  slightly unusual pattern — worth confirming it behaves as intended
  in whatever Postgres version is targeted).

- **Nested comment queries** — capped at one level per spec, so no
  recursive CTE needed; the risk is smaller than it looks. Still worth
  verifying: (a) a comment reply to a soft-deleted parent still renders
  sensibly (parent shows as "[deleted]" placeholder, not removed
  entirely, so the reply keeps context), (b) the single-query-then-group
  approach doesn't produce N+1 queries as comment counts grow — verify
  with a study seeded with ~200 comments and confirm one query loads
  the whole thread.

- **Denormalized like_count via trigger** — needs verification that
  the trigger fires correctly on both insert and delete (toggle
  off-then-on), and that a duplicate like attempt (double-click racing
  two requests) is rejected by the `UNIQUE(user_id, study_id)`
  constraint rather than double-counting. Test by rapid-toggling a
  like and confirming `like_count` matches actual row count in
  `likes`.

- **Draft-404-not-403** — verify by hitting a draft study's slug as an
  anonymous session and confirming a plain 404 page, not a redirect to
  login or a 403 that would confirm the slug exists.
