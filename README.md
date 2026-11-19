# Harbour claims portal (React prototype)

[![CI](https://github.com/Snehachowdary56/claims-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/Snehachowdary56/claims-portal/actions/workflows/ci.yml)

A working prototype of an insurance claims portal, built on my [Harbour design system and UX case study](https://github.com/Snehachowdary56/accessible-design-system): it turns the case study's claim flow into a working React app.
Customers see their claims, filter them by status, and file a new claim with validation and clear,
accessible error messages.

> Harbour Insurance is fictional. All data is made up.

## What it shows

| Area | How |
|---|---|
| Web application | React 18 with ES6+ (modules, async/await, destructuring), JSX |
| UI framework | Bootstrap 5, themed with the Harbour design tokens (`src/tokens.css`, from the [Harbour design system](https://github.com/Snehachowdary56/accessible-design-system)) |
| Build | Webpack 5 + Babel: code splitting (the claim form loads only when opened), content-hashed files for caching, CSS minification, source maps |
| Performance | Imports only the Bootstrap parts the app uses: CSS cut from **233 KB to 94 KB (60% smaller)**. A performance budget in `webpack.config.js` fails the build if the first load gets too big. |
| Client-server | Express API (`server/server.js`): policies as **XML**, claims as **JSON**, claim submission with server-side checks |
| XML/JSON | Policies parsed from XML with `DOMParser` (`src/xml.js`); claims sent and received as JSON |
| One set of rules | `src/validation.js` is used by both the form and the server, so they can never disagree |
| Accessibility | Labels, error summary that takes focus, `aria-invalid` and `aria-describedby`, 44px targets, visible focus, skip link, reduced motion |
| Quality | 23 Jest tests (React Testing Library, supertest, jest-axe), a Playwright browser test, ESLint, GitHub Actions CI |

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

Tests: `npm test` (23 tests), `npm run lint`, `npm run e2e` (browser test, needs `npx playwright install chromium` once).

## API

| Method | Path | Returns |
|---|---|---|
| GET | `/api/policies` | Policies as XML (number, type, coverage limit, claim types) |
| GET | `/api/claims` | Claims as JSON, newest first |
| POST | `/api/claims` | Creates a claim (201) or returns field errors (400) |

## Layout

```
src/            React app: App.jsx, components/, api.js, xml.js, validation.js, bootstrap.scss
server/         Express API and sample data (policies.xml, claims.json)
tests/          Jest tests (XML parsing, validation, API, UI flows, accessibility)
e2e/            Playwright browser test
webpack.config.js, babel.config.cjs, jest.config.cjs, eslint.config.js
```
