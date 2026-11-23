
import "dotenv/config";

import mongoose from "mongoose";
import TruthDarePrompt from "../models/TruthDarePrompt.js";

const categories = [
  "normal",
  "adult-18-plus",
  "private",
  "couples",
  "friends-party",
  "funny-crazy",
  "long-distance-couples",
];

const validateTruthDare = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const prompts = await TruthDarePrompt.find({})
      .select(
        "promptId type category content language ageRestricted active"
      )
      .lean();

    const errors = [];
    const promptIds = new Set();

    const counts = Object.fromEntries(
      categories.map((category) => [
        category,
        { truth: 0, dare: 0 },
      ])
    );

    for (const prompt of prompts) {
      if (!prompt.promptId) {
        errors.push("Prompt found without promptId.");
      } else if (promptIds.has(prompt.promptId)) {
        errors.push(`Duplicate promptId: ${prompt.promptId}`);
      } else {
        promptIds.add(prompt.promptId);
      }

      if (!["truth", "dare"].includes(prompt.type)) {
        errors.push(`Invalid type: ${prompt.promptId}`);
      }

      if (!categories.includes(prompt.category)) {
        errors.push(`Invalid category: ${prompt.promptId}`);
        continue;
      }

      if (
        typeof prompt.content !== "string" ||
        prompt.content.trim().length < 5
      ) {
        errors.push(`Missing or invalid content: ${prompt.promptId}`);
      }

      if (
        prompt.category === "adult-18-plus" &&
        prompt.ageRestricted !== true
      ) {
        errors.push(
          `Adult prompt missing age restriction: ${prompt.promptId}`
        );
      }

      if (prompt.active !== false) {
        counts[prompt.category][prompt.type] += 1;
      }
    }

    console.log("\nTRUTH OR DARE VALIDATION");
    console.table(
      categories.map((category) => ({
        category,
        truths: counts[category].truth,
        dares: counts[category].dare,
        total:
          counts[category].truth + counts[category].dare,
      }))
    );

    console.log("Total database prompts:", prompts.length);
    console.log("Active prompt IDs:", promptIds.size);

    if (errors.length > 0) {
      console.error("\nValidation errors:");

      errors.forEach((error) => console.error(`- ${error}`));

      process.exitCode = 1;
    } else {
      console.log("\nAll Truth or Dare prompts passed validation.");
    }

    const minimumPerType = 500;

    const insufficientCategories = categories.filter(
      (category) =>
        counts[category].truth < minimumPerType ||
        counts[category].dare < minimumPerType
    );

    if (insufficientCategories.length > 0) {
      console.warn(
        "\nCategories below the target of 500 truths and 500 dares:"
      );

      insufficientCategories.forEach((category) => {
        console.warn(
          `${category}: ${counts[category].truth} truths, ${counts[category].dare} dares`
        );
      });

      process.exitCode = 1;
    }
  } catch (error) {
    console.error("Truth or Dare validation failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

validateTruthDare();
