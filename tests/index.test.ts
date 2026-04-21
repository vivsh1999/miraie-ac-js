import { expect, test } from "vite-plus/test";
import { createSession } from "../src/index.ts";

test("createSession is exported", () => {
  expect(typeof createSession).toBe("function");
});
