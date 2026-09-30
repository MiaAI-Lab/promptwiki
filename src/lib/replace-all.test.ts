import assert from "node:assert/strict";
import { test } from "node:test";
import { replaceAll } from "./replace-all.ts";

test("a case-insensitive match after a dotted capital i keeps the rest of the word", () => {
  assert.equal(replaceAll("AİB", "b", "Q", false), "AİQ");
  assert.equal(replaceAll("AİB AİB", "b", "Q", false), "AİQ AİQ");
});

test("case-insensitive replace stays literal for regex characters", () => {
  assert.equal(replaceAll("Hello hello", "hello", "hi", false), "hi hi");
  assert.equal(replaceAll("a.b", ".", "Q", false), "aQb");
  assert.equal(replaceAll("a", "a", "$&", false), "$&");
  assert.equal(replaceAll("aaa", "aa", "b", false), "ba");
});

test("case-sensitive replace does not fold case", () => {
  assert.equal(replaceAll("AİB", "B", "Q", true), "AİQ");
  assert.equal(replaceAll("AİB", "b", "Q", true), "AİB");
});
