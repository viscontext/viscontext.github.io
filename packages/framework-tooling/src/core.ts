import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Ajv2020, type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import { parse } from "yaml";

export type JsonObject = Record<string, unknown>;

export interface FrameworkSection {
  id: string;
  schema: string;
}

export interface FrameworkManifest extends JsonObject {
  id: string;
  version: string;
  status: "experimental" | "stable" | "deprecated";
  recordSchema: string;
  terminology: string;
  presentation: string;
  sections: FrameworkSection[];
}

export interface PresentationField {
  id: string;
  label: string;
  help: string;
  valueType: "text" | "url";
}

export interface PresentationSection {
  id: string;
  label: string;
  description: string;
  fields: PresentationField[];
}

export interface PresentationConfig extends JsonObject {
  record: {
    eyebrow: string;
    frameworkNotice: string;
  };
  sections: PresentationSection[];
}

export interface Terminology extends JsonObject {
  project: {
    name: string;
    description: string;
  };
  terms: {
    record: { singular: string; plural: string };
    section: { singular: string; plural: string };
    work: { singular: string; plural: string };
  };
}

export interface CompilerContext {
  framework: FrameworkManifest;
  presentation: PresentationConfig;
  terminology: Terminology;
  validateRecord: ValidateFunction;
}

export class FrameworkValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: ErrorObject[] = [],
  ) {
    super(message);
    this.name = "FrameworkValidationError";
  }
}

export const defaultRepositoryRoot = path.resolve(
  fileURLToPath(new URL("../../../", import.meta.url)),
);

async function readYaml(filePath: string): Promise<JsonObject> {
  const source = await fs.readFile(filePath, "utf8");
  const value: unknown = parse(source);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new FrameworkValidationError(`${filePath} must contain a YAML object.`);
  }

  return value as JsonObject;
}

async function findYamlFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findYamlFiles(entryPath);
      return entry.isFile() && /\.ya?ml$/u.test(entry.name) ? [entryPath] : [];
    }),
  );

  return nested.flat().sort();
}

function requireString(value: unknown, name: string): asserts value is string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new FrameworkValidationError(`${name} must be a non-empty string.`);
  }
}

function assertFrameworkManifest(value: JsonObject): asserts value is FrameworkManifest {
  requireString(value.id, "framework.id");
  requireString(value.version, "framework.version");
  if (!/^\d+\.\d+\.\d+$/u.test(value.version)) {
    throw new FrameworkValidationError("framework.version must be a semantic version.");
  }
  if (!["experimental", "stable", "deprecated"].includes(String(value.status))) {
    throw new FrameworkValidationError(
      "framework.status must be experimental, stable, or deprecated.",
    );
  }
  requireString(value.recordSchema, "framework.recordSchema");
  requireString(value.terminology, "framework.terminology");
  requireString(value.presentation, "framework.presentation");

  if (!Array.isArray(value.sections) || value.sections.length === 0) {
    throw new FrameworkValidationError("framework.sections must contain at least one section.");
  }

  const ids = value.sections.map((section, index) => {
    if (!section || typeof section !== "object") {
      throw new FrameworkValidationError(`framework.sections[${index}] must be an object.`);
    }
    const candidate = section as JsonObject;
    requireString(candidate.id, `framework.sections[${index}].id`);
    requireString(candidate.schema, `framework.sections[${index}].schema`);
    return candidate.id;
  });

  if (new Set(ids).size !== ids.length) {
    throw new FrameworkValidationError("framework section IDs must be unique.");
  }
}

function assertTerminology(value: JsonObject): asserts value is Terminology {
  const project = value.project as JsonObject | undefined;
  const terms = value.terms as JsonObject | undefined;
  requireString(project?.name, "terminology.project.name");
  requireString(project?.description, "terminology.project.description");

  for (const term of ["record", "section", "work"] as const) {
    const labels = terms?.[term] as JsonObject | undefined;
    requireString(labels?.singular, `terminology.terms.${term}.singular`);
    requireString(labels?.plural, `terminology.terms.${term}.plural`);
  }
}

function assertPresentation(
  value: JsonObject,
  framework: FrameworkManifest,
): asserts value is PresentationConfig {
  const record = value.record as JsonObject | undefined;
  requireString(record?.eyebrow, "presentation.record.eyebrow");
  requireString(record?.frameworkNotice, "presentation.record.frameworkNotice");

  if (!Array.isArray(value.sections)) {
    throw new FrameworkValidationError("presentation.sections must be an array.");
  }

  const frameworkIds = framework.sections.map((section) => section.id);
  const presentationIds = value.sections.map((section, index) => {
    if (!section || typeof section !== "object") {
      throw new FrameworkValidationError(`presentation.sections[${index}] must be an object.`);
    }
    const candidate = section as JsonObject;
    requireString(candidate.id, `presentation.sections[${index}].id`);
    requireString(candidate.label, `presentation.sections[${index}].label`);
    requireString(candidate.description, `presentation.sections[${index}].description`);
    if (!Array.isArray(candidate.fields) || candidate.fields.length === 0) {
      throw new FrameworkValidationError(`presentation.sections[${index}].fields must be an array.`);
    }
    const fieldIds = candidate.fields.map((field, fieldIndex) => {
      if (!field || typeof field !== "object") {
        throw new FrameworkValidationError(
          `presentation.sections[${index}].fields[${fieldIndex}] must be an object.`,
        );
      }
      const fieldValue = field as JsonObject;
      requireString(fieldValue.id, `presentation.sections[${index}].fields[${fieldIndex}].id`);
      requireString(fieldValue.label, `presentation.sections[${index}].fields[${fieldIndex}].label`);
      requireString(fieldValue.help, `presentation.sections[${index}].fields[${fieldIndex}].help`);
      if (!["text", "url"].includes(String(fieldValue.valueType))) {
        throw new FrameworkValidationError(
          `presentation.sections[${index}].fields[${fieldIndex}].valueType is unsupported.`,
        );
      }
      return fieldValue.id;
    });
    if (new Set(fieldIds).size !== fieldIds.length) {
      throw new FrameworkValidationError(
        `presentation section ${candidate.id} contains duplicate field IDs.`,
      );
    }
    return candidate.id;
  });

  if (JSON.stringify(frameworkIds) !== JSON.stringify(presentationIds)) {
    throw new FrameworkValidationError(
      "presentation sections must match framework sections in the same order.",
    );
  }
}

export async function createCompilerContext(
  repositoryRoot = defaultRepositoryRoot,
): Promise<CompilerContext> {
  const frameworkDirectory = path.join(repositoryRoot, "framework");
  const frameworkValue = await readYaml(path.join(frameworkDirectory, "framework.yaml"));
  assertFrameworkManifest(frameworkValue);

  const terminologyValue = await readYaml(
    path.resolve(frameworkDirectory, frameworkValue.terminology),
  );
  assertTerminology(terminologyValue);

  const presentationValue = await readYaml(
    path.resolve(frameworkDirectory, frameworkValue.presentation),
  );
  assertPresentation(presentationValue, frameworkValue);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addFormat("uri", {
    type: "string",
    validate(value: string) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  });

  const schemaFiles = await findYamlFiles(path.join(frameworkDirectory, "schemas"));
  const schemas = await Promise.all(schemaFiles.map(readYaml));
  for (const schema of schemas) ajv.addSchema(schema);

  for (const section of frameworkValue.sections) {
    const schema = await readYaml(path.resolve(frameworkDirectory, section.schema));
    const properties = schema.properties;
    if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
      throw new FrameworkValidationError(`Section schema ${section.schema} must define properties.`);
    }
    const presentationSection = presentationValue.sections.find(
      (candidate) => candidate.id === section.id,
    );
    const schemaFields = Object.keys(properties).sort();
    const presentedFields = (presentationSection?.fields ?? []).map((field) => field.id).sort();
    if (JSON.stringify(schemaFields) !== JSON.stringify(presentedFields)) {
      throw new FrameworkValidationError(
        `Presentation fields for ${section.id} must match its schema properties.`,
      );
    }
  }

  const recordSchemaPath = path.resolve(frameworkDirectory, frameworkValue.recordSchema);
  const recordSchema = await readYaml(recordSchemaPath);
  const schemaId = recordSchema.$id;
  requireString(schemaId, `${recordSchemaPath}.$id`);
  const validateRecord = ajv.getSchema(schemaId);

  if (!validateRecord) {
    throw new FrameworkValidationError(`Could not compile record schema ${schemaId}.`);
  }

  return {
    framework: frameworkValue,
    presentation: presentationValue,
    terminology: terminologyValue,
    validateRecord,
  };
}

export function validateRecordData(context: CompilerContext, record: JsonObject): void {
  if (!context.validateRecord(record)) {
    const errors = context.validateRecord.errors ?? [];
    const details = errors
      .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
      .join("; ");
    throw new FrameworkValidationError(`Record validation failed: ${details}`, errors);
  }
}

export async function loadExampleRecords(
  context: CompilerContext,
  repositoryRoot = defaultRepositoryRoot,
): Promise<JsonObject[]> {
  const examplesDirectory = path.join(repositoryRoot, "framework", "examples");
  const entries = await fs.readdir(examplesDirectory, { withFileTypes: true });
  const recordPaths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(examplesDirectory, entry.name, "record.yaml"))
    .sort();

  const records = await Promise.all(recordPaths.map(readYaml));
  for (const record of records) validateRecordData(context, record);
  return records;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function generateProject(repositoryRoot = defaultRepositoryRoot): Promise<void> {
  const context = await createCompilerContext(repositoryRoot);
  const records = await loadExampleRecords(context, repositoryRoot);
  const outputRoot = path.join(repositoryRoot, "generated");
  const dataRoot = path.join(outputRoot, "data");
  const apiRoot = path.join(outputRoot, "public", "api", "v1");

  await fs.rm(outputRoot, { recursive: true, force: true });

  const canonicalFramework = {
    ...context.framework,
    terminology: context.terminology,
    presentation: context.presentation,
  };
  const siteBundle = { framework: canonicalFramework, records };

  await writeJson(path.join(dataRoot, "site.json"), siteBundle);
  await writeJson(path.join(apiRoot, "framework", `${context.framework.version}.json`), canonicalFramework);
  await writeJson(path.join(apiRoot, "framework", "index.json"), {
    apiVersion: "v1",
    frameworks: [
      {
        id: context.framework.id,
        version: context.framework.version,
        status: context.framework.status,
        url: `/api/v1/framework/${context.framework.version}.json`,
      },
    ],
  });

  const recordSummaries = records.map((record) => ({
    id: record.id,
    version: record.version,
    frameworkVersion: record.frameworkVersion,
    title: (record.work as JsonObject).title,
    status: record.status,
    url: `/api/v1/records/${record.id}.json`,
  }));

  await writeJson(path.join(apiRoot, "records", "index.json"), {
    apiVersion: "v1",
    records: recordSummaries,
  });

  for (const record of records) {
    const recordId = String(record.id);
    const recordVersion = String(record.version);
    await writeJson(path.join(apiRoot, "records", `${recordId}.json`), record);
    await writeJson(
      path.join(apiRoot, "records", recordId, "versions", `${recordVersion}.json`),
      record,
    );
  }
}
