import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const tick = () => new Promise(resolve => setTimeout(resolve, 10));

for (const page of ["members", "projects"]) {
  test(`${page}: optimistic display, no refetch, and save failures`, async () => {
    const dom = new JSDOM(readFileSync(`client/ui/${page}.html`, "utf8"));
    Object.assign(globalThis, {document: dom.window.document});
    const doc = dom.window.document;
    let posts = 0, gets = 0;
    let finishRequest: (response: Response) => void = () => {};
    let failNetwork = false;
    globalThis.fetch = async (_url, options) => {
      if (options?.method === "POST") {
        posts++;
        if (failNetwork) throw new Error("Network unavailable");
        return new Promise<Response>(resolve => { finishRequest = resolve; });
      }
      gets++;
      return new Response("[]");
    };
    await import(`../../client/event-handlers/${page}.ts`);
    await tick();
    const input = doc.querySelector<HTMLInputElement>("#name")!;
    const button = doc.querySelector<HTMLButtonElement>(`#add-${page.slice(0, -1)}`)!;
    const list = doc.querySelector("#list")!;
    const status = () => doc.querySelector("#status")!.textContent!;
    assert.equal(gets, 1);
    input.value=" "; button.click();
    assert.match(status(), /1 and 80/);
    input.value="<img src=x>"; button.click();
    // The item must appear before the server response is released.
    assert.match(list.textContent!, /<img src=x>/);
    assert.equal(list.querySelector("img"), null);
    assert.equal(gets, 1);
    if (page === "members") {
      // Preserve TODO 1: learners still need to connect the request.
      assert.equal(posts, 0);
      assert.match(status(), /locally/);
      doc.querySelector<HTMLButtonElement>("#reload")!.click();
      await tick();
      assert.equal(list.children.length, 0);
      return;
    }
    button.click();
    assert.equal(posts, 1, "pending saves cannot be submitted twice");
    finishRequest(new Response(null, {status:201}));
    await tick();
    assert.match(status(), /saved/);
    assert.equal(input.value, "");
    assert.equal(gets, 1, "successful POST does not refetch");
    input.value="Demo failure"; button.click();
    assert.equal(list.children.length, 2);
    finishRequest(new Response(null, {status:503}));
    await tick();
    assert.equal(list.children.length, 1, "failed insert is rolled back in the UI");
    assert.equal(input.value, "Demo failure");
    assert.match(status(), /503/);
    assert.equal(button.disabled, false);
    failNetwork=true; button.click(); await tick();
    assert.equal(list.children.length, 1);
    assert.match(status(), /Network unavailable/);
    assert.equal(gets, 1);
  });
}
