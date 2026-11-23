import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const directory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data"
);

const readJson = (relativePath) =>
  JSON.parse(
    fs.readFileSync(path.join(directory, relativePath), "utf8")
  );

const assertUnique = (values, message) => {
  assert.equal(new Set(values).size, values.length, message);
};

test("quiz and word game banks have at least 100 unique entries", () => {
  for (const file of fs.readdirSync(path.join(directory, "quizzes"))) {
    const questions = readJson(path.join("quizzes", file));

    assert.ok(questions.length >= 100, `${file} needs 100 questions`);
    assertUnique(
      questions.map((question) => question.questionId),
      `${file} contains duplicate question IDs`
    );
    assertUnique(
      questions.map((question) => question.question.trim().toLowerCase()),
      `${file} contains duplicate question text`
    );

    for (const question of questions) {
      assert.equal(question.options.length, 4);
      assert.ok(question.correctIndex >= 0);
      assert.ok(question.correctIndex < question.options.length);
      assertUnique(question.options, `${question.questionId} has duplicate options`);
    }
  }

  for (const file of fs.readdirSync(path.join(directory, "words"))) {
    const words = readJson(path.join("words", file));

    assert.ok(words.length >= 100, `${file} needs 100 words`);
    assertUnique(
      words.map((entry) => entry.word.toLowerCase()),
      `${file} contains duplicate words`
    );
    assert.ok(words.every((entry) => entry.hint.trim()));
  }
});

test("emoji and picture game banks have at least 100 unique entries", () => {
  const emojiQuestions = readJson("emojis/emojiQuestions.json");
  assert.ok(emojiQuestions.length >= 100);
  assertUnique(
    emojiQuestions.map((question) => question.questionId),
    "Emoji bank contains duplicate IDs"
  );
  assertUnique(
    emojiQuestions.map((question) => question.answer.trim().toLowerCase()),
    "Emoji bank contains duplicate answers"
  );

  const pictureQuestions = readJson("pictures/pictureQuestions.json");
  assert.ok(pictureQuestions.length >= 100);
  assertUnique(
    pictureQuestions.map((question) => question.questionId),
    "Picture bank contains duplicate IDs"
  );
  assertUnique(
    pictureQuestions.map((question) => question.answer.trim().toLowerCase()),
    "Picture bank contains duplicate answers"
  );
  assert.ok(
    pictureQuestions.every(
      (question) =>
        question.imageId &&
        /^https:\/\//.test(question.imageUrl) &&
        !question.imageUrl.includes("YOUR_CLOUD")
    )
  );
});

test("every Truth-or-Dare category has 200 unique truths and dares", () => {
  const categoryDirectory = path.join(directory, "truth-dare");
  const promptIds = [];
  const promptContent = [];

  for (const category of fs.readdirSync(categoryDirectory)) {
    for (const type of ["truths", "dares"]) {
      const prompts = readJson(
        path.join("truth-dare", category, `${type}.json`)
      );

      assert.ok(
        prompts.length >= 200,
        `${category}/${type} needs 200 prompts`
      );

      for (const prompt of prompts) {
        promptIds.push(prompt.promptId);
        promptContent.push(prompt.content.trim().toLowerCase());
        assert.ok(prompt.active);
        assert.equal(prompt.ageRestricted, category === "adult-18-plus");
      }
    }
  }

  assertUnique(promptIds, "Truth-or-Dare prompt IDs must be globally unique");
  assertUnique(
    promptContent,
    "Truth-or-Dare prompt content must be globally unique"
  );
});
