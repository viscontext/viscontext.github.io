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

    expect(records).toHaveLength(9);
    expect(records.map((record) => record.id)).toContain("coastal-change");
    expect(context.framework.sections.map((section) => section.id)).toEqual([
      "project",
      "usage",
      "data",
      "analysis",
      "encoding",
      "limitations",
    ]);
    const atlas = records.find((record) => record.id === "biodiversity-atlas");
    expect((atlas?.visualizations as JsonObject).totalCount).toBe(240);
    expect(((atlas?.visualizations as JsonObject).items as JsonObject[])).toHaveLength(8);
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
      "generated/public/api/v1/records/coastal-change.json",
    );
    const generated = JSON.parse(await readFile(apiPath, "utf8")) as JsonObject;

    expect(generated.id).toBe("coastal-change");
    expect(generated.frameworkVersion).toBe("0.3.0");
  });
});
