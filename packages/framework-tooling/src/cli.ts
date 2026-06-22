import { generateProject } from "./core.js";

try {
  await generateProject();
  console.log("Validated the experimental framework and generated the static data API.");
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
