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
  it("validates fictional and imported catalog records", async () => {
    const context = await createCompilerContext();
    const records = await loadExampleRecords(context);

    expect(records).toHaveLength(20);
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
    const methane = records.find((record) => record.id === "nasa-sources-of-methane");
    expect((methane?.provenance as JsonObject).provider).toBe(
      "NASA Scientific Visualization Studio",
    );
    const methaneVisualization = ((methane?.visualizations as JsonObject).items as JsonObject[])[0];
    const methaneMedia = (methaneVisualization.media as JsonObject).items as JsonObject[];
    expect(methaneMedia.find((item) => item.id === "methane-layer-frames")?.itemCount).toBe(
      262144,
    );
    const coBenefitsAtlas = records.find((record) => record.id === "uk-co-benefits-atlas");
    expect((coBenefitsAtlas?.visualizations as JsonObject).totalCount).toBe(5);
    expect(coBenefitsAtlas?.contributors).toHaveLength(10);
    const ipccAtlas = records.find((record) => record.id === "ipcc-wgi-interactive-atlas");
    expect((ipccAtlas?.provenance as JsonObject).provider).toBe(
      "Intergovernmental Panel on Climate Change (IPCC)",
    );
    expect((ipccAtlas?.visualizations as JsonObject).totalCount).toBe(2);
    const ipccSpm = records.find((record) => record.id === "ipcc-wgi-spm-1");
    expect((ipccSpm?.visualizations as JsonObject).totalCount).toBe(2);

    const importedRecords = records.filter((record) => record.provenance);
    for (const record of importedRecords) {
      const visualizations = (record.visualizations as JsonObject).items as JsonObject[];
      const hasSourcePreview = visualizations.some((visualization) => {
        const media = visualization.media as JsonObject | undefined;
        const assets = (media?.items ?? []) as JsonObject[];
        return assets.some((asset) => asset.kind === "image" && Boolean(asset.url));
      });
      expect(hasSourcePreview, `${String(record.id)} should expose a source preview`).toBe(true);
    }
  });

  it("requires provenance for imported real-world records", async () => {
    const context = await createCompilerContext();
    const records = await loadExampleRecords(context);
    const importedRecord = structuredClone(
      records.find((record) => record.id === "owid-human-development-index"),
    ) as JsonObject;
    delete importedRecord.provenance;

    expect(() => validateRecordData(context, importedRecord)).toThrow(
      /must include source provenance/u,
    );
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
    expect(generated.frameworkVersion).toBe("0.4.0");
  });
});
