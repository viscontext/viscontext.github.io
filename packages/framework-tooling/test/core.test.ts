import { readFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "yaml";
import { describe, expect, it } from "vitest";

import {
  createCompilerContext,
  defaultRepositoryRoot,
  FrameworkValidationError,
  generateProject,
  loadExampleRecords,
  validateRecordData,
  type JsonObject,
} from "../src/core.js";

describe("experimental framework compiler", () => {
  it("validates the placeholder record", async () => {
    const context = await createCompilerContext();
    const records = await loadExampleRecords(context);

    expect(records).toHaveLength(1);
    expect(records[0]?.id).toBe("placeholder-record");
    expect(context.framework.sections.map((section) => section.id)).toEqual(["overview"]);
  });

  it("reports invalid records with field paths", async () => {
    const context = await createCompilerContext();
    const fixturePath = path.join(
      defaultRepositoryRoot,
      "packages/framework-tooling/test/fixtures/invalid-record.yaml",
    );
    const fixture = parse(await readFile(fixturePath, "utf8")) as JsonObject;

    expect(() => validateRecordData(context, fixture)).toThrow(FrameworkValidationError);
    expect(() => validateRecordData(context, fixture)).toThrow(/contributors|intendedUse/u);
  });

  it("generates deterministic site and API payloads", async () => {
    await generateProject();
    const apiPath = path.join(
      defaultRepositoryRoot,
      "generated/public/api/v1/records/placeholder-record.json",
    );
    const generated = JSON.parse(await readFile(apiPath, "utf8")) as JsonObject;

    expect(generated.id).toBe("placeholder-record");
    expect(generated.frameworkVersion).toBe("0.1.0");
  });
});
