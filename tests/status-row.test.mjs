// The status row of the core dock under Clean (executors, model, effort) lies on the bottom row of the composer card, left of the
// plugin buttons, and keeps --tools-w + --tail free on the right. With several plugin buttons the chips are wider than what is
// left, and the row ran left over «+». The theme gives way by steps, by the container width. Browserless: checks the text of clean.css.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const css = fs.readFileSync(path.join(import.meta.dirname, "..", "clean.css"), "utf8");
const MANY = "slot-composer-tools ~ .slot-composer-tools ~ .slot-composer-tools";   // three or more plugin buttons
// @container status (...) { body } blocks that concern the row under several plugin buttons: [{ max, min, body }]
const steps = [...css.matchAll(/@container status \(((?:min-width:\s*\d+px\)\s*and\s*\()?)max-width:\s*(\d+)px\)\s*\{(.*)\}[ \t]*$/gm)]
  .map((m) => ({ max: +m[2], body: m[3] })).filter((s) => s.body.includes(MANY));
// the core already folds the row at this container width (modules/web/static/css/dock.css)
const CORE = 520;

test("effort moves into the model menu before the chips reach «+», earlier than the core does", () => {
  const eff = steps.filter((s) => /\.stat-eff\s*\{\s*display:\s*none/.test(s.body) && !/\.stat-par/.test(s.body));
  assert.ok(eff.length && Math.max(...eff.map((s) => s.max)) > CORE, "no step hides the effort chip above the core's width");
  assert.ok(steps.some((s) => /\.mod-eff\s*\{\s*display:\s*block/.test(s.body)), "effort stays reachable: a section in the model menu");
});

test("the model gives way only to the executors chip, never alone", () => {
  for (const s of steps.filter((x) => /\.stat-mod\s*\{\s*display:\s*none/.test(x.body))) {
    assert.match(s.body, /\.stat-par \+ \.stat-mod\s*\{\s*display:\s*none/);
  }
});

test("under the width where the row wraps the buttons, the room for them is not reserved twice", () => {
  const wrap = steps.find((s) => /padding-right:\s*var\(--tail\)/.test(s.body));
  assert.ok(wrap, "no step drops --tools-w from the right padding");
  assert.doesNotMatch(wrap.body, /--tools-w/);
});
