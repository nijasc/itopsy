# Brandopsy

A SvelteKit web app hosting a filterable gallery of satirical "case study"
documents. Each case study is a self-contained, uniquely styled HTML
document (companies, brands, products, institutions — any subject)
rendered inside a sandboxed iframe. Visitors browse and read for free;
registered users can like, comment, and reply; admins author and manage
studies; the site owner manages admins.

## Stack

- SvelteKit (TypeScript), Vite
- Tailwind CSS (`tailwindcss` + `@tailwindcss/vite`)
- Drizzle ORM + `postgres` driver, `drizzle-kit` for migrations
- Lucia (`lucia` + `@lucia-auth/adapter-drizzle`) for session-based auth,
  `oslo` for crypto/token helpers
- CodeMirror (`codemirror`, `@codemirror/lang-html`,
  `@codemirror/theme-one-dark`) for the admin HTML editor
- Zod for validation
- Package manager: **bun** (not npm/node — this machine has no Node.js
  install; use `bun` / `bunx` for everything)

## Role hierarchy

`owner > admin > user > anon`

- The **first person to register** automatically becomes the **owner**.
- The owner manages admins (promote/demote).
- Admins author and manage case studies.
- Registered users can like, comment, and reply.
- Anonymous visitors can browse and read case studies for free.

## Case study rendering — security constraint

Each case study's HTML must be rendered inside a **sandboxed iframe**:

```html
<iframe sandbox="allow-scripts" srcdoc={studyHtml}></iframe>
```

- Always include `sandbox="allow-scripts"`.
- **Never** add `allow-same-origin` — combining it with `allow-scripts`
  lets the sandboxed document script its way out of the sandbox and
  access the parent origin.
- Never inline a case study's HTML directly into the app DOM.
