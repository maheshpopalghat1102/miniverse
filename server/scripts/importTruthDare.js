
import mongoose from "mongoose";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

import TruthDarePrompt from "../models/TruthDarePrompt.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIRECTORY = path.resolve(
  __dirname,
  "../data/truth-dare"
);

const BATCH_SIZE = 250;

const CATEGORY_MAP = {
  normal: "normal",
  "adult-18-plus": "adult-18-plus",
  private: "private",
  couples: "couples",
  "friends-party": "friends-party",
  "funny-crazy": "funny-crazy",
  "long-distance": "long-distance",
};

const PROMPT_TYPES = ["truth", "dare"];

const VALID_DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
];

const VALID_LANGUAGES = ["en", "hi", "mr"];

const args = new Set(process.argv.slice(2));

const DRY_RUN = args.has("--dry-run");
const SKIP_DUPLICATES = args.has("--skip-duplicates");
const REPLACE_CONTENT = args.has("--replace-content");

const allowedArgs = new Set([
  "--dry-run",
  "--skip-duplicates",
  "--replace-content",
]);

for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

if (SKIP_DUPLICATES && REPLACE_CONTENT) {
  throw new Error(
    "Use either --skip-duplicates or --replace-content, not both."
  );
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validatePrompt(prompt, category, type, filePath) {
  const errors = [];

  if (!prompt || typeof prompt !== "object" || Array.isArray(prompt)) {
    return [`Invalid prompt object in ${filePath}`];
  }

  if (!isNonEmptyString(prompt.promptId)) {
    errors.push("promptId must be a non-empty string");
  }

  if (!isNonEmptyString(prompt.content)) {
    errors.push("content must be a non-empty string");
  }

  if (
    prompt.language !== undefined &&
    !VALID_LANGUAGES.includes(prompt.language)
  ) {
    errors.push(`Invalid language: ${prompt.language}`);
  }

  if (
    prompt.difficulty !== undefined &&
    !VALID_DIFFICULTIES.includes(prompt.difficulty)
  ) {
    errors.push(`Invalid difficulty: ${prompt.difficulty}`);
  }

  if (
    prompt.ageRestricted !== undefined &&
    typeof prompt.ageRestricted !== "boolean"
  ) {
    errors.push("ageRestricted must be a boolean");
  }

  if (
    prompt.active !== undefined &&
    typeof prompt.active !== "boolean"
  ) {
    errors.push("active must be a boolean");
  }

  if (
    prompt.minPlayers !== undefined &&
    (!Number.isInteger(prompt.minPlayers) || prompt.minPlayers < 1)
  ) {
    errors.push("minPlayers must be an integer greater than 0");
  }

  if (
    prompt.maxPlayers !== undefined &&
    (!Number.isInteger(prompt.maxPlayers) || prompt.maxPlayers < 1)
  ) {
    errors.push("maxPlayers must be an integer greater than 0");
  }

  if (
    Number.isInteger(prompt.minPlayers) &&
    Number.isInteger(prompt.maxPlayers) &&
    prompt.minPlayers > prompt.maxPlayers
  ) {
    errors.push("minPlayers cannot exceed maxPlayers");
  }

  if (
    prompt.tags !== undefined &&
    (!Array.isArray(prompt.tags) ||
      !prompt.tags.every((tag) => isNonEmptyString(tag)))
  ) {
    errors.push("tags must be an array of non-empty strings");
  }

  if (!PROMPT_TYPES.includes(type)) {
    errors.push(`Invalid prompt type: ${type}`);
  }

  if (!CATEGORY_MAP[category]) {
    errors.push(`Invalid category folder: ${category}`);
  }

  return errors.map(
    (error) => `${filePath} [${prompt.promptId || "unknown"}]: ${error}`
  );
}

async function readJsonFile(filePath) {
  let rawData;

  try {
    rawData = await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Required data file not found: ${filePath}`);
    }

    throw error;
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    throw new Error(
      `Invalid JSON in ${filePath}: ${error.message}`
    );
  }
}

async function loadPrompts() {
  const allPrompts = [];
  const validationErrors = [];
  const seenIds = new Set();

  for (const [folder, databaseCategory] of Object.entries(CATEGORY_MAP)) {
    for (const type of PROMPT_TYPES) {
      const filePath = path.join(
        DATA_DIRECTORY,
        folder,
        `${type}s.json`
      );

      const records = await readJsonFile(filePath);

      if (!Array.isArray(records)) {
        validationErrors.push(
          `${filePath}: Expected a JSON array`
        );
        continue;
      }

      for (const prompt of records) {
        const errors = validatePrompt(
          prompt,
          folder,
          type,
          filePath
        );

        validationErrors.push(...errors);

        if (
          prompt &&
          isNonEmptyString(prompt.promptId)
        ) {
          const normalizedId = prompt.promptId.trim();

          if (seenIds.has(normalizedId)) {
            validationErrors.push(
              `${filePath}: Duplicate promptId "${normalizedId}" across data files`
            );
          } else {
            seenIds.add(normalizedId);
          }
        }

        if (errors.length > 0) {
          continue;
        }

        allPrompts.push({
          promptId: prompt.promptId.trim(),
          type,
          category: databaseCategory,
          content: prompt.content.trim(),
          language: prompt.language || "en",
          difficulty: prompt.difficulty || "easy",
          ageRestricted:
            prompt.ageRestricted ??
            (folder === "adult-18-plus"),
          minPlayers: prompt.minPlayers ?? 2,
          maxPlayers: prompt.maxPlayers ?? 10,
          tags: prompt.tags || [],
          isActive: prompt.active ?? true,
        });
      }
    }
  }

  if (validationErrors.length > 0) {
    console.error("\nValidation errors:");

    validationErrors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });

    throw new Error(
      `Found ${validationErrors.length} validation error(s). Import cancelled.`
    );
  }

  return allPrompts;
}

async function importPrompts(prompts) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  const existingIds = new Set();

  const databaseRecords = await TruthDarePrompt.find(
    {
      promptId: {
        $in: prompts.map((prompt) => prompt.promptId),
      },
    },
    { promptId: 1 }
  ).lean();

  databaseRecords.forEach((record) => {
    existingIds.add(record.promptId);
  });

  const operations = [];

  for (const prompt of prompts) {
    const exists = existingIds.has(prompt.promptId);

    if (exists && SKIP_DUPLICATES) {
      skipped++;
      continue;
    }

    if (exists && !REPLACE_CONTENT) {
      skipped++;
      continue;
    }

    if (exists && REPLACE_CONTENT) {
      operations.push({
        updateOne: {
          filter: { promptId: prompt.promptId },
          update: {
            $set: {
              content: prompt.content,
              type: prompt.type,
              category: prompt.category,
              language: prompt.language,
              difficulty: prompt.difficulty,
              ageRestricted: prompt.ageRestricted,
              minPlayers: prompt.minPlayers,
              maxPlayers: prompt.maxPlayers,
              tags: prompt.tags,
              isActive: prompt.active,
            },
          },
        },
      });

      updated++;
      continue;
    }

    operations.push({
      insertOne: {
        document: prompt,
      },
    });

    inserted++;
  }

  if (DRY_RUN) {
    console.log("\nDRY RUN: No database changes were made.");
    console.log(`Would insert: ${inserted}`);
    console.log(`Would update: ${updated}`);
    console.log(`Would skip: ${skipped}`);

    return;
  }

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = operations.slice(i, i + BATCH_SIZE);

    await TruthDarePrompt.bulkWrite(batch, {
      ordered: true,
    });

    console.log(
      `Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`
    );
  }

  console.log("\nImport completed.");
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
}

async function main() {
  try {
    if (!process.env.MONGODB_URI && !DRY_RUN) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    console.log("Loading Truth or Dare data...");

    const prompts = await loadPrompts();

    console.log(`\nValidated prompts: ${prompts.length}`);

    const categoryCounts = {};

    for (const prompt of prompts) {
      const key = `${prompt.category} / ${prompt.type}`;
      categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    }

    console.table(categoryCounts);

    if (DRY_RUN) {
      console.log("\nRunning in dry-run mode.");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB.");
    }

    await importPrompts(prompts);
  } catch (error) {
    console.error("\nImport failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

main();
