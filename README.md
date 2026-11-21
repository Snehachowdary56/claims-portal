# Harbour claims portal (React + TypeScript prototype)

[![CI](https://github.com/Snehachowdary56/claims-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Snehachowdary56/claims-portal/actions/workflows/ci.yml)

A working prototype of an insurance claims portal, built on my [Harbour design system and UX case study](https://github.com/Snehachowdary56/accessible-design-system): it turns the case study's claim flow into a working React app.
Customers see their claims, filter them by status, and file a new claim with validation and clear,
accessible error messages.

> Harbour Insurance is fictional. All data is made up.

**Live demo:** https://snehachowdary56.github.io/claims-portal/ (static build: new claims are saved only in your browser)

**Lighthouse** (desktop, median of 3 runs in CI): Performance 100 · Accessibility 100 · Best Practices 96 · SEO 90

## What it shows

| Area | How |
|---|---|
| Web application | React 18 with **TypeScript** (strict mode): typed props, state, events and API responses; shared types in `src/types.ts` used by the browser, the Express API and the tests |
| Type safety | `npm run typecheck` (tsc, strict) runs in CI before tests; Babel strips types for Webpack and Jest |
| UI framework | Bootstrap 5, themed with the Harbour design tokens (`src/tokens.css`, from the [Harbour design system](https://github.com/Snehachowdary56/accessible-design-system)) |
| Build | Webpack 5 + Babel (TypeScript preset): code splitting (the claim form loads only when opened), content-hashed files for caching, CSS minification, source maps |
| Performance | Imports only the Bootstrap parts the app uses: CSS cut from **233 KB to 94 KB (60% smaller)**. A performance budget in `webpack.config.js` fails the build if the first load gets too big. |
| Client-server | Express API in TypeScript (`server/server.ts`, run with `tsx`): policies as **XML**, claims as **JSON**, claim submission with server-side checks |
| XML/JSON | Policies parsed from XML with `DOMParser` (`src/xml.ts`); claims sent and received as JSON |
| One set of rules | `src/validation.ts` is used by both the form and the server, so they can never disagree |
| Accessibility | Labels, error summary that takes focus, `aria-invalid` and `aria-describedby`, 44px targets, visible focus, skip link, reduced motion |
| Quality | 27 Jest tests (React Testing Library, supertest, jest-axe), Playwright browser tests of both builds, Lighthouse checks, ESLint with typescript-eslint, GitHub Actions CI |
| Demo build | `npm run build:demo` bundles the same XML/JSON data into a static site for GitHub Pages (no server); claims are validated with the same rules and kept in `localStorage` |

## Run it (Windows Command Prompt)

Needs Node.js 18 or newer.

```
npm install
npm start
```

Open http://localhost:8080. `npm start` runs the Webpack dev server with the API inside it.

Production build and server:

```
npm run build
npm run serve
```

Open http://localhost:3001.

Tests: `npm test` (25 tests), `npm run lint`, `npm run e2e` (browser test, needs `npx playwright install chromium` once).

## API

| Method | Path | Returns |
|---|---|---|
| GET | `/api/policies` | Policies as XML (number, type, coverage limit, claim types) |
| GET | `/api/claims` | Claims as JSON, newest first |
| POST | `/api/claims` | Creates a claim (201) or returns field errors (400) |

## Layout

```
src/            React app (TypeScript): App.tsx, components/, api.ts, types.ts, xml.ts, validation.ts, bootstrap.scss
server/         Express API (server.ts) and sample data (policies.xml, claims.json)
tests/          Jest tests (XML parsing, validation, API, UI flows, accessibility)
e2e/            Playwright browser test
tsconfig.json, webpack.config.js, babel.config.cjs, jest.config.cjs, eslint.config.js
```

## Bug write-ups

See [BUGS.md](BUGS.md): what caused each bug, the fix, and the test that now guards it.
