import { readFileSync } from "node:fs";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import App from "../src/App.jsx";

const policiesXml = readFileSync(new URL("../server/data/policies.xml", import.meta.url), "utf8");
const seed = JSON.parse(readFileSync(new URL("../server/data/claims.json", import.meta.url), "utf8"));

function mockServer({ fail = false } = {}) {
  const posted = [];
  globalThis.fetch = jest.fn(async (url, init = {}) => {
    if (fail) return { ok: false, status: 503, json: async () => ({ message: "Service unavailable" }) };
    if (url === "/api/policies") return { ok: true, status: 200, text: async () => policiesXml };
    if (url === "/api/claims" && init.method === "POST") {
      const body = JSON.parse(init.body);
      posted.push(body);
      return { ok: true, status: 201, json: async () => ({ ...body, id: "CL-2026-0006", amount: Number(body.amount), status: "Submitted" }) };
    }
    if (url === "/api/claims") return { ok: true, status: 200, json: async () => seed };
    return { ok: false, status: 404, json: async () => ({}) };
  });
  return posted;
}

afterEach(() => jest.restoreAllMocks());

test("lists claims with totals and flags claims that need action", async () => {
  mockServer();
  render(<App />);
  const table = await screen.findByRole("table");
  expect(within(table).getAllByRole("row")).toHaveLength(1 + 5 + 1);
  expect(screen.getByText("1 claim needs more information from you.")).toBeInTheDocument();
  expect(within(table).getByText("$1,219.50")).toBeInTheDocument();
});

test("filters claims by status", async () => {
  mockServer();
  render(<App />);
  await userEvent.selectOptions(await screen.findByLabelText("Show"), "Paid");
  const rows = within(screen.getByRole("table")).getAllByRole("row");
  expect(rows).toHaveLength(1 + 2 + 1);
  expect(screen.getByText("2 claims")).toBeInTheDocument();
});

test("shows errors for an empty form and does not send it", async () => {
  const posted = mockServer();
  render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "New claim" }));
  await userEvent.click(await screen.findByRole("button", { name: "Submit claim" }));
  const summary = await screen.findByRole("alert");
  expect(summary).toHaveTextContent("Please fix 4 fields");
  expect(screen.getByLabelText("Policy")).toHaveAttribute("aria-invalid", "true");
  await waitFor(() => expect(summary).toHaveFocus());
  expect(posted).toHaveLength(0);
});

test("submits a valid claim and shows it at the top of the list", async () => {
  const posted = mockServer();
  render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "New claim" }));
  await userEvent.selectOptions(await screen.findByLabelText("Policy"), "HB-1002");
  await userEvent.selectOptions(screen.getByLabelText("What is the claim for?"), "Filling");
  const d = new Date();  // local date: toISOString() is UTC and can already be "tomorrow" in the evening
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  await userEvent.type(screen.getByLabelText("Date of the expense"), iso);
  await userEvent.type(screen.getByLabelText("Amount (CAD)"), "240");
  await userEvent.click(screen.getByRole("button", { name: "Submit claim" }));
  expect(await screen.findByText(/Claim CL-2026-0006 was submitted/)).toBeInTheDocument();
  expect(posted[0]).toMatchObject({ policyNumber: "HB-1002", type: "Filling", amount: "240" });
  expect(within(screen.getByRole("table")).getAllByRole("row")[1]).toHaveTextContent("CL-2026-0006");
});

test("tells the user when the server is down and offers a retry", async () => {
  mockServer({ fail: true });
  render(<App />);
  expect(await screen.findByRole("alert")).toHaveTextContent("Service unavailable");
  expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
});

test("claims list and claim form have no axe accessibility violations", async () => {
  mockServer();
  const { container } = render(<App />);
  await screen.findByRole("table");
  expect(await axe(container)).toHaveNoViolations();
  await userEvent.click(screen.getByRole("button", { name: "New claim" }));
  await screen.findByRole("button", { name: "Submit claim" });
  expect(await axe(container)).toHaveNoViolations();
});
