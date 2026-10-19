import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./auth.css", import.meta.url), "utf8");

const defined = new Set([...css.matchAll(/(--uauth-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([...css.matchAll(/var\((--uauth-[a-z0-9-]+)\)/g)].map((m) => m[1]));

describe("auth stylesheet contract", () => {
  it("defines every --uauth variable it uses", () => {
    expect([...used].filter((v) => !defined.has(v))).toEqual([]);
  });

  it("imports the design-system stylesheet", () => {
    expect(css).toContain('@import "@umituz/web-design-system/styles.css";');
  });

  it("carries no udb- legacy prefix", () => {
    expect(css.match(/udb-[a-z0-9-]+/g) ?? []).toEqual([]);
  });

  it("carries no legacy --u-* tokens", () => {
    expect(css.match(/--u-[a-z0-9-]+/g) ?? []).toEqual([]);
  });

  it("reads only design-system variables that exist or are documented optional slots", () => {
    const optional = new Set([
      "--color-primary-hover",
      "--color-primary-soft",
      "--color-destructive-hover",
      "--color-destructive-soft",
      "--color-success-soft",
      "--color-warning-soft",
    ]);
    const dsCss = readFileSync(
      new URL("../../node_modules/@umituz/web-design-system/dist/styles.css", import.meta.url),
      "utf8",
    );
    const dsDefined = new Set([...dsCss.matchAll(/(--[a-z][a-z0-9-]*)\s*:/g)].map((m) => m[1]));
    const read = new Set([...css.matchAll(/var\((--[a-z][a-z0-9-]*)[,)]/g)].map((m) => m[1]));
    const missing = [...read].filter(
      (v) => !v.startsWith("--uauth-") && !dsDefined.has(v) && !optional.has(v),
    );
    expect(missing).toEqual([]);
  });
});
