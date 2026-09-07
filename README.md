<p align="center">
  <img src=".github/assets/banner.png" alt="ITopsy — Satirical case studies. Opened up. Examined. Found guilty." width="100%">
</p>

<p align="center">
  <a href="https://kit.svelte.dev"><img alt="SvelteKit" src="https://img.shields.io/badge/SvelteKit_2-FF3E00?logo=svelte&logoColor=white"></a>
  <a href="https://www.typescriptlang.org"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://bun.sh"><img alt="Bun" src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=white"></a>
  <a href="https://www.postgresql.org"><img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white"></a>
  <a href="https://orm.drizzle.team"><img alt="Drizzle ORM" src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black"></a>
  <a href="https://tailwindcss.com"><img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-8B2532"></a>
  <a href="#contributing"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-8B2532"></a>
</p>

<p align="center">
  <strong>ITopsy</strong> (rhymes with <em>autopsy</em>) is an open-source web app that hosts a filterable gallery of satirical case studies.<br>
  Companies, brands, products, people and institutions get opened up, examined, and found guilty of something. No refunds.
</p>

---

Every case study is a self-contained, uniquely styled HTML document written by an admin and rendered inside a locked-down iframe. Visitors browse and read for free. Registered users like, comment and reply. Admins author studies in a built-in HTML editor with live preview. The site owner keeps the admins in line.

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Roles](#roles)
- [Security model](#security-model)
- [Getting started](#getting-started)
- [Authoring a case study](#authoring-a-case-study)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

## Features

<p align="center">
  <img src=".github/assets/features.png" alt="Exhibit 01 The Registry, Exhibit 02 Sealed Exhibits, Exhibit 03 Admin Studio" width="100%">
</p>

**The registry (public gallery)**

- Full-text search backed by a generated Postgres `tsvector` column and GIN index, with tag suggestions as you type.
- Filter by tag, severity (`mild` · `medium` · `savage`) and language (English / Deutsch).
- Sort by _Freshest Outrage_, _Most Beloved_ or _Most Litigated_.
- All filter state lives in the URL query string, so any filtered view is shareable and bookmarkable.
- Cursor-based "load more" pagination, so deep pages stay fast.
- Gallery cards show a real, scaled-down render of each study with scripts fully disabled.

**Case study pages**

- The study's HTML runs inside a sandboxed iframe with its own scripts and styles, isolated from the app.
- Likes with a trigger-maintained counter, and one-level threaded comments with replies.
- Authors can edit their own comment for 15 minutes and delete it any time; admins can moderate everything.
- "Related case files" recommendations ranked by shared tags, severity, language and popularity. Plain SQL, no ML.
- SEO out of the box: meta tags, Open Graph, JSON-LD, `sitemap.xml` and `robots.txt`.

**Admin studio**

- CodeMirror HTML editor (One Dark theme) with a live sandboxed preview and a Zod-validated metadata form.
- Studies start _Sealed_ (draft) and are published or unpublished with one click.
- Slugs are generated from the title, with a short random suffix on collision.
- Every content and user action lands in an audit log. Admins see the content lifecycle; the owner sees everything.

**App shell**

- Light and dark mode, crimson [Skeleton UI](https://www.skeleton.dev) theme, toast notifications.
- Session-based auth with Lucia, passwords hashed with scrypt, a password change that evicts every other session.
- Public aliases for commenters, with a stable pseudonym as the default, so email addresses never reach the browser.
- Rate limiting on authentication, writes, and the search API, and security headers on every response.

## How it works

```mermaid
flowchart LR
    subgraph client["Browser"]
        gallery["Gallery<br/>filters live in the URL"]
        study["Study page"]
        frame["Sandboxed iframe<br/>allow-scripts only"]
        admin["Admin studio<br/>CodeMirror + live preview"]
    end

    subgraph kit["SvelteKit (SSR + form actions)"]
        hooks["hooks.server.ts<br/>validates the Lucia session"]
        guards["requireRole()<br/>owner > admin > user > anon"]
        loads["load functions"]
        actions["form actions<br/>like · comment · publish · promote"]
    end

    subgraph db["Postgres via Drizzle ORM"]
        users[("users / sessions")]
        studies[("studies<br/>+ tsvector search")]
        likes[("likes<br/>trigger keeps like_count in sync")]
        comments[("comments")]
        audit[("audit_logs")]
    end

    gallery --> hooks
    study --> hooks
    admin --> hooks
    hooks --> guards
    guards --> loads
    guards --> actions
    hooks --> users
    loads --> studies
    loads --> comments
    actions --> studies
    actions --> likes
    actions --> comments
    actions --> audit
    study -. srcdoc .-> frame
```

A case study moves through a tiny lifecycle, and every transition is written to the audit log:

```mermaid
stateDiagram-v2
    [*] --> Sealed : admin creates (study.create)
    Sealed --> Published : study.publish
    Published --> Sealed : study.unpublish
    Sealed --> [*] : owner deletes (study.delete)
    Published --> [*] : owner deletes (study.delete)
```

## Roles

The account whose email matches `OWNER_EMAIL` becomes the **owner** when it registers. Everyone else starts as a plain user, and there is never more than one owner.

| Capability                                     | Anonymous | User | Admin | Owner |
| ---------------------------------------------- | :-------: | :--: | :---: | :---: |
| Browse and read published studies              |    ✅     |  ✅  |  ✅   |  ✅   |
| Like, comment, reply                           |           |  ✅  |  ✅   |  ✅   |
| Edit own comment (15 min) / delete own comment |           |  ✅  |  ✅   |  ✅   |
| Create, edit, publish, unpublish studies       |           |      |  ✅   |  ✅   |
| See drafts and moderate comments               |           |      |  ✅   |  ✅   |
| Content audit log (`/admin/audit`)             |           |      |  ✅   |  ✅   |
| Promote / demote admins                        |           |      |       |  ✅   |
| Permanently delete studies and accounts        |           |      |       |  ✅   |
| Full audit log (`/admin/owner-audit`)          |           |      |       |  ✅   |

Role checks are enforced server-side in every load function and form action through `requireRole()` in [`src/lib/server/authz.ts`](src/lib/server/authz.ts). The owner can never be demoted.

## Security model

Rendering arbitrary, script-enabled HTML from admins is the whole point of the app, so the boundaries are deliberate:

- **One place renders study HTML.** [`SandboxedStudy.svelte`](src/lib/components/SandboxedStudy.svelte) is the only component allowed to put a study's raw HTML on screen. It uses `<iframe sandbox="allow-scripts" srcdoc={html}>` and **never** `allow-same-origin`. Combining the two would let a study script its way out of the sandbox and into the app's origin, cookies and session.
- **Thumbnails never run scripts.** Gallery previews use `sandbox=""` (everything disabled), `pointer-events: none` and a CSS scale, so the layout is real but inert.
- **Study HTML is never inlined into the app DOM.** Not for previews, not for the admin editor.
- **Drafts are invisible, not forbidden.** Requesting an unpublished study as a visitor returns a 404 rather than a 403, so the slug's existence isn't leaked.
- **Exactly one owner, and only the one you chose.** Signup offers the owner role only to the `OWNER_EMAIL` address, and a partial unique index (`one_owner_idx`) allows at most one `owner` row, so a fresh deployment can't be claimed by whoever registers first and a race between two signups can't produce two owners.
- **Every admin request is gated in the handle hook**, not just in the admin layout's load function, so client-side navigation after a demotion can't reach admin data.
- **Email addresses never leave the server** for anyone but the signed-in user. Comment authors appear under a chosen alias or a stable pseudonym derived from their id.
- **Changing your password logs out every other session** and issues a fresh one for the current browser.
- **Rate limits** on login and signup (per IP), on comments, likes, and profile changes (per user), and on the search API, plus `X-Frame-Options`, `frame-ancestors`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS on every response. The limiter is in-memory, so on multi-instance deployments it is a per-instance brake; put a platform limiter in front for real scale.
- **Deleting an account keeps the record intact.** Its studies are reassigned to the owner and its comments are retracted rather than destroyed, so other people's replies survive.
- **Counters can't drift.** `studies.like_count` is maintained by a Postgres trigger on the `likes` table, not by application code.
- **The audit log outlives its actors.** Entries snapshot the actor's email and role at the time of the action and survive account deletion.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) 1.x. The project uses Bun for everything (`bun install`, `bun run`, `bunx`).
- A PostgreSQL database. The client uses Neon's serverless HTTP driver, so a [Neon](https://neon.tech) connection string works out of the box. For any other Postgres, swap `drizzle-orm/neon-http` for `drizzle-orm/postgres-js` in [`src/lib/server/db/index.ts`](src/lib/server/db/index.ts) and [`scripts/migrate.ts`](scripts/migrate.ts). The `postgres` package is already installed.

### Run it locally

```bash
git clone https://github.com/nijasc/itopsy.git
cd itopsy
bun install
cp .env.example .env        # then fill in the values below
bun run scripts/migrate.ts  # applies the SQL migrations in ./drizzle
bun run dev
```

Open <http://localhost:5173> and sign up with the address you set as `OWNER_EMAIL`. That account is the owner. Head to `/admin/studies` to file your first case.

### Environment variables

| Variable       | Required | Description                                                                                                                |
| -------------- | :------: | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL` |    ✅    | Postgres connection string (`postgres://user:password@host:5432/dbname`).                                                  |
| `OWNER_EMAIL`  |    ✅    | The one address allowed to become the owner when it registers. Unset means nobody can claim the owner role through signup. |
| `AUTH_SECRET`  |          | Reserved for signing auth-related tokens. Set it to a long random string.                                                  |

### Database migrations

Migrations are plain SQL files in [`drizzle/`](drizzle/), generated by drizzle-kit plus a few hand-written ones for things the schema DSL can't express (the single-owner partial index, the `tsvector` search column, the like-count trigger).

```bash
bunx drizzle-kit generate     # after changing src/lib/server/db/schema/*
bun run scripts/migrate.ts    # apply pending migrations
```

### Deploying

The project ships with `@sveltejs/adapter-auto`, which picks the right adapter on Vercel, Netlify, Cloudflare and friends. For anything else, install the matching [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) and set it in [`vite.config.ts`](vite.config.ts). Run `bun run build` to produce a production build and `bun run preview` to try it locally. Behind a reverse proxy, set `ORIGIN` (and `ADDRESS_HEADER` for adapter-node) so canonical URLs, the sitemap, and the per-IP rate limits see the real origin and client address instead of the proxy's.

## Authoring a case study

Sign in as an admin, open `/admin/studies` and hit **New**. A study has:

| Field    | Notes                                                            |
| -------- | ---------------------------------------------------------------- |
| Title    | Used to generate the slug.                                       |
| Subject  | Who or what is on the table.                                     |
| Dek      | The one-paragraph standfirst shown on cards and used for search. |
| Tags     | Comma-separated. Drive the tag filter and recommendations.       |
| Severity | `mild`, `medium` or `savage`.                                    |
| Language | `en` or `de`.                                                    |
| Status   | `Sealed` (draft) or `Published`.                                 |
| HTML     | The complete document, edited in CodeMirror with a live preview. |

The HTML is a full standalone page. Bring your own `<style>`, fonts, and scripts. Inside the sandbox a study **can** use inline CSS and JavaScript and load external images and fonts, but it **cannot** read the site's cookies or storage, touch the parent page, submit forms, open popups or navigate the top frame.

A minimal starting point:

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Exhibit A</title>
		<style>
			body {
				margin: 0;
				font-family: Georgia, serif;
				background: #f7f0e6;
				color: #1c1c1c;
				padding: 3rem;
			}
			h1 {
				color: #8b2532;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}
		</style>
	</head>
	<body>
		<h1>Case file no. 001</h1>
		<p>The subject was opened up, examined, and found guilty of something.</p>
	</body>
</html>
```

## Project structure

```text
src/
├── hooks.server.ts            # validates the Lucia session on every request
├── lib/
│   ├── components/            # gallery, filter bar, comments, editor, SandboxedStudy
│   ├── schemas/               # Zod schemas shared by client and server
│   └── server/
│       ├── auth.ts            # Lucia setup (Drizzle adapter)
│       ├── authz.ts           # requireRole() / hasRole()
│       ├── audit.ts           # logAudit() and the action catalogue
│       ├── slug.ts            # unique slug generation
│       ├── db/schema/         # users, sessions, studies, likes, comments, audit_logs
│       └── queries/           # reusable Drizzle query builders
└── routes/
    ├── +page.svelte           # the registry (gallery + filters)
    ├── study/[slug]/          # study page, likes, comments, recommendations
    ├── admin/
    │   ├── studies/           # list, new, [id]/edit
    │   ├── users/             # owner-only promote / demote / delete
    │   ├── audit/             # admin-visible audit log
    │   └── owner-audit/       # full audit log
    ├── api/studies/           # JSON endpoint behind "load more"
    ├── login/ signup/ logout/ profile/
    └── sitemap.xml/
drizzle/                       # SQL migrations (generated + hand-written)
scripts/migrate.ts             # applies migrations
```

## Scripts

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `bun run dev`     | Start the Vite dev server.          |
| `bun run build`   | Production build.                   |
| `bun run preview` | Serve the production build locally. |
| `bun run check`   | `svelte-check` type checking.       |
| `bun run lint`    | Prettier check + ESLint.            |
| `bun run format`  | Format everything with Prettier.    |

## Contributing

Issues and pull requests are welcome. Please keep the case studies satirical and the sandbox intact.

1. Fork the repo and create a branch from `main`.
2. Make your change. Keep new Svelte code in runes mode (the project forces it).
3. Run `bun run lint` and `bun run check` before opening a PR.
4. Never add `allow-same-origin` to a study iframe, and never render study HTML outside `SandboxedStudy.svelte`. A PR that does either will be closed without trial.

The project ships with a [`CLAUDE.md`](CLAUDE.md) describing the stack, roles and the rendering constraint, which is a good five-minute orientation for humans too.

## Roadmap

- Screenshot-based thumbnails (Playwright + object storage) as an alternative to scaled iframes.
- An automated test that asserts the study iframe's `sandbox` attribute never gains `allow-same-origin`.
- More UI languages beyond English and German.

## License

[MIT](LICENSE). The case studies published on any ITopsy instance are satire and belong to their authors.
