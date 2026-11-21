# Bug write-ups

## 1. Server-side field errors never reached the claim form

**Symptom.** When the Express API rejected a claim with 400, the form showed only "Please fix the highlighted fields."
with no field highlighted and no error summary. The browser checks normally catch problems first, so this only showed
when the server disagreed with the browser (for example, the date passes midnight between filling in and sending).

**Cause.** The server returns `{ message, errors }`, and the form already handled `err.errors`, but the API client's
`check()` built a plain `Error` with only the message and dropped `errors`. In JavaScript nothing flagged the mismatch.

**How it was found.** Converting the app to TypeScript. Typing the error the form expects (`ApiError` with
`errors?: FieldErrors`) showed that the server client never set it, while the offline demo client did.

**Fix.** `check()` now throws an `ApiError` with the HTTP status and the field errors from the response body, and the form
checks `err instanceof ApiError` before using them.

**Prevention.** `tests/api.test.ts` checks that a 400 keeps its field errors and that a non-JSON error still gives a
readable message; `tsc` in strict mode runs in CI before the tests.
