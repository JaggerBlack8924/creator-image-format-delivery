import test from "node:test";
import assert from "node:assert/strict";
import { chooseFormat } from "./format-choice";

test("subscriber without AVIF support receives WebP", () => {
  assert.equal(chooseFormat({ image: "creator-upload-42", subscriberSupportsAvif: false }), "webp");
});

test("AVIF-capable subscriber receives AVIF", () => {
  assert.equal(chooseFormat({ image: "creator-upload-42", subscriberSupportsAvif: true }), "avif");
});
