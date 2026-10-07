import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const stage = process.env.STAGE ?? "00-starter";
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

test(`member UI: ${stage}`, async () => {
  const dom = new JSDOM(readFileSync("index.html", "utf8"), {
    url: "http://localhost:5173",
  });
  Object.assign(globalThis, {
    document: dom.window.document,
    FormData: dom.window.FormData,
  });
  const document = dom.window.document;
  const form = document.querySelector<HTMLFormElement>("form")!;
  const input = document.querySelector<HTMLInputElement>("#name")!;
  const status = () => document.querySelector("#status")!.textContent!;
  let posts = 0,
    failPost = false,
    failGet = false;
  const rows: unknown[] = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith("health"))
      return new Response(
        JSON.stringify({ note: "Local SQLite fallback — not Supabase" }),
      );
    if (options?.method === "POST") {
      posts++;
      await tick();
      if (failPost) return new Response("unavailable", { status: 503 });
      rows.push(JSON.parse(String(options.body)));
      return new Response(
        JSON.stringify(stage < "09" ? { received: true } : rows.at(-1)),
        { status: stage < "09" ? 200 : 201 },
      );
    }
    if (failGet) throw new Error("offline");
    return new Response(JSON.stringify(rows));
  };
  await import("../members.ts");
  await tick();
  assert.match(
    document.querySelector("#storage")!.textContent!,
    /not Supabase/,
  );
  assert.match(document.querySelector("#list")!.textContent!, /No entries/);
  const submit = () =>
    form.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true }),
    );
  if (stage === "00-starter") {
    assert.equal(form.querySelector("button"), null);
    submit();
    await tick();
    assert.match(status(), /Button connected/);
    assert.equal(posts, 0);
    return;
  }
  input.value = "   ";
  submit();
  await tick();
  assert.match(status(), /1 and 80/);
  input.value = "x".repeat(81);
  submit();
  await tick();
  assert.match(status(), /1 and 80/);
  input.value = "<img src=x onerror=alert(1)>";
  submit();
  submit();
  await tick();
  await tick();
  assert.equal(
    document.querySelector("#list img"),
    null,
    "names render as text, not markup",
  );
  if (stage === "03-local") {
    assert.match(document.querySelector("#list")!.textContent!, /<img/);
    assert.equal(posts, 0);
    return;
  }
  assert.equal(posts, 1, "rapid repeated submits send only one request");
  if (stage < "09") assert.match(status(), /not saved yet/);
  else assert.match(status(), /saved/);
  if (stage === "10-solution")
    assert.match(document.querySelector("#list")!.textContent!, /<img/);
  failPost = true;
  input.value = "Demo retry";
  submit();
  await tick();
  await tick();
  assert.match(status(), /503/);
  assert.equal(input.value, "Demo retry");
  assert.equal(
    form.querySelector<HTMLButtonElement>("button")!.disabled,
    false,
  );
  if (stage === "10-solution") {
    failPost = false;
    failGet = true;
    submit();
    await tick();
    await tick();
    assert.match(status(), /saved, but list reload failed/);
    assert.equal(input.value, "");
  }
});

test("API error contract", async () => {
  const { request } = await import("../api.ts");
  globalThis.fetch = async () => new Response("invalid", { status: 422 });
  await assert.rejects(request("/api/test"), /Check your input/);
  globalThis.fetch = async () => {
    throw new Error("network");
  };
  await assert.rejects(request("/api/test"), /Cannot reach/);
  globalThis.fetch = async () => new Response("not-json");
  await assert.rejects(request("/api/test"), /invalid JSON/);
});
