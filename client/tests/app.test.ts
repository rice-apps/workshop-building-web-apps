import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const tick = () => new Promise(resolve => setTimeout(resolve, 20));

for (const page of ["members", "projects"]) {
  test(`${page}: list, add, double submit, validation, and errors`, async () => {
    const dom = new JSDOM(readFileSync(`${page}.html`, "utf8"));
    Object.assign(globalThis, {document: dom.window.document, FormData: dom.window.FormData});
    const doc = dom.window.document;
    const rows: unknown[] = [];
    let posts = 0, failPost = false, failGet = false;
    globalThis.fetch = async (_url, options) => {
      if (options?.method === "POST") {
        posts++;
        await tick();
        if (failPost) return new Response("failure", {status:503});
        rows.push({id:"demo", ...JSON.parse(String(options.body))});
        return new Response(JSON.stringify(rows.at(-1)), {status:201});
      }
      if (failGet) throw new Error("offline");
      return new Response(JSON.stringify(rows));
    };
    await import(`../${page}.ts`);
    await tick();
    const status = () => doc.querySelector("#status")!.textContent!;
    const form = doc.querySelector("form")!;
    const input = doc.querySelector<HTMLInputElement>("#name")!;
    const submit = () => form.dispatchEvent(new dom.window.Event("submit", {cancelable:true}));
    assert.match(doc.querySelector("#list")!.textContent!, /No .* yet/);
    input.value=" "; submit(); await tick();
    assert.match(status(), /1 and 80/);
    input.value="<img src=x>"; submit(); submit(); await tick(); await tick();
    assert.equal(posts,1);
    assert.match(status(), /saved/);
    assert.equal(doc.querySelector("#list img"),null);
    assert.match(doc.querySelector("#list")!.textContent!, /<img src=x>/);
    failPost=true; input.value="Demo Retry"; submit(); await tick(); await tick();
    assert.match(status(), /503/);
    assert.equal(input.value,"Demo Retry");
    assert.equal(form.querySelector("button")!.disabled,false);
    failPost=false; failGet=true; submit(); await tick(); await tick();
    assert.match(status(), /Saved, but list reload failed/);
    assert.equal(input.value,"");
  });
}
