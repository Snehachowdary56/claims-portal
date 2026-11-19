// Policy data arrives as XML from the server; turn it into plain objects.

export function parsePoliciesXml(text, Parser = globalThis.DOMParser) {
  const doc = new Parser().parseFromString(text, "application/xml");
  if (doc.getElementsByTagName("parsererror").length) throw new Error("Policy data is not valid XML.");
  return Array.from(doc.getElementsByTagName("policy")).map((el) => {
    const limit = el.getElementsByTagName("coverageLimit")[0];
    return {
      number: el.getAttribute("number"),
      type: el.getAttribute("type"),
      holder: el.getElementsByTagName("holder")[0]?.textContent ?? "",
      coverageLimit: Number(limit?.textContent ?? 0),
      currency: limit?.getAttribute("currency") ?? "CAD",
      claimTypes: Array.from(el.getElementsByTagName("type")).map((t) => t.textContent),
    };
  });
}
