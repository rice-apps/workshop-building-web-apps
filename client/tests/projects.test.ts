import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const tick = () => new Promise((resolve) => setTimeout(resolve, 20));
test("Projects reference: empty, create, repeat guard, and failed reload", async () => {
  const dom = new JSDOM(readFileSync("projects.html", "utf8"));
  Object.assign(globalThis, {
    document: dom.window.document,
    FormData: dom.window.FormData,
  });
  const rows: unknown[] = [];
  let posts = 0,
    fail = false;
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith("health")) return new Response('{"note":"local"}');
    if (options?.method === "POST") {
      posts++;
      await tick();
      rows.push(JSON.parse(String(options.body)));
      return new Response(JSON.stringify(rows.at(-1)), { status: 201 });
    }
    if (fail) return new Response("failure", { status: 503 });
    return new Response(JSON.stringify(rows));
  };
  await import("../projects.ts");
  await tick();
  assert.match(document.querySelector("#list")!.textContent!, /No entries/);
  const form = document.querySelector("form")!;
  const input = document.querySelector<HTMLInputElement>("input")!;
  const submit = () =>
    form.dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
  input.value = "Demo project";
  submit();
  submit();
  await tick();
  await tick();
  assert.equal(posts, 1);
  assert.match(document.querySelector("#list")!.textContent!, /Demo project/);
  fail = true;
  input.value = "Demo project 2";
  submit();
  await tick();
  await tick();
  assert.match(
    document.querySelector("#status")!.textContent!,
    /saved, but list reload failed/,
  );
  assert.equal(input.value, "");
});
