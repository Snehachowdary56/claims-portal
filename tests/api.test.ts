// The server API client: errors from the Express API reach the form with their field messages.
import { api } from "../src/api.ts";
import { ApiError } from "../src/types.ts";

afterEach(() => jest.restoreAllMocks());

test("a 400 from the server becomes an ApiError that keeps the field errors", async () => {
  globalThis.fetch = jest.fn(async () => ({
    ok: false,
    status: 400,
    json: async () => ({ message: "Please fix the highlighted fields.", errors: { amount: "The most this policy covers is $1,500." } }),
  })) as unknown as typeof fetch;

  const err = await api.submit({ policyNumber: "HB-1002", type: "Filling", incidentDate: "2026-11-10", amount: "5000" }).catch((e) => e);
  expect(err).toBeInstanceOf(ApiError);
  expect(err).toMatchObject({ status: 400, message: "Please fix the highlighted fields." });
  expect(err.errors).toEqual({ amount: "The most this policy covers is $1,500." });
});

test("a server error that is not JSON still gives a readable message", async () => {
  globalThis.fetch = jest.fn(async () => ({
    ok: false,
    status: 502,
    json: async () => {
      throw new SyntaxError("Unexpected token <");
    },
  })) as unknown as typeof fetch;

  await expect(api.claims()).rejects.toMatchObject({ status: 502, message: "Request failed (502)" });
});
