import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const stagedFiles = new Map();

function readStageFile(fileName) {
  if (stagedFiles.has(fileName)) return stagedFiles.get(fileName);
  const candidates = [
    path.join(rootDir, "artifacts/api-server/public/staging", fileName),
    path.join(rootDir, fileName),
  ];
  const filePath = candidates.find(existsSync);
  assert.ok(filePath, `Could not find staging file: ${fileName}`);
  const content = readFileSync(filePath, "utf8");
  stagedFiles.set(fileName, content);
  return content;
}

function stageFileExists(fileName) {
  return [
    path.join(rootDir, "artifacts/api-server/public/staging", fileName),
    path.join(rootDir, fileName),
  ].some(existsSync);
}

test("staging puzzle storage only reads from the shared puzzle table", () => {
  const source = readStageFile("cloud-storage.js");
  assert.match(source, /async function _sbGet/);
  assert.match(source, /async function cloudGetIndex/);
  assert.match(source, /async function cloudGetPuzzle/);
  assert.match(source, /async function cloudGetPuzzles/);
  assert.doesNotMatch(
    source,
    /method\s*:\s*['"](?:POST|PATCH|PUT|DELETE)['"]/i,
  );
  assert.match(source, /publishing is disabled/i);
  assert.match(source, /deleting puzzles is disabled/i);
});

test("staging authentication and progress helpers make no database requests", () => {
  const source = readStageFile("staging-auth.js");
  assert.equal(stageFileExists("supabase-auth.js"), false);
  assert.doesNotMatch(source, /\bfetch\s*\(/i);
  assert.doesNotMatch(source, /createClient|\.from\s*\(/i);
  assert.match(source, /function sbGetUser\(\)\s*\{\s*return null;/);
  assert.match(
    source,
    /async function sbSaveProgress\(\)\s*\{\s*return false;/,
  );
  assert.match(source, /async function sbSaveRating\(\)\s*\{\s*return false;/);
  assert.match(source, /async function sbSaveComment\(\)\s*\{\s*return false;/);
});

test("staging browser data is kept separate from the live site's browser data", () => {
  const source = readStageFile("staging-safety.js");
  assert.match(source, /arrowword_staging:/);
  assert.match(source, /storage\.clear\s*=\s*function/);
  assert.match(source, /startsWith\(prefix\)/);
  assert.match(source, /cloudPublishPuzzle/);
  assert.match(source, /ghPublishPuzzle/);
  assert.match(source, /sbSaveProgress/);
});

test("every staging page loads its warning and only staging authentication", () => {
  const pageNames = [
    "about-builder.html",
    "admin.html",
    "browse.html",
    "builder.html",
    "data-deletion.html",
    "delete-puzzles.html",
    "directory.html",
    "index.html",
    "privacy.html",
  ];

  for (const pageName of pageNames) {
    const page = readStageFile(pageName);
    assert.match(
      page,
      /staging-safety\.js/i,
      `${pageName} needs the test-site warning`,
    );
    assert.doesNotMatch(page, /(?:src|href)=["'][^"']*supabase-auth\.js/i);
  }

  for (const pageName of ["admin.html", "directory.html"]) {
    assert.match(readStageFile(pageName), /staging-auth\.js/i);
  }
});

test("staging pages avoid production-root and API-only navigation paths", () => {
  for (const pageName of [
    "browse.html",
    "index.html",
    "builder.html",
    "directory.html",
  ]) {
    const page = readStageFile(pageName);
    assert.doesNotMatch(
      page,
      /href=["']\/(?:play|builder|directory|index|about)/i,
    );
    assert.doesNotMatch(page, /fetch\s*\(\s*['"]\/api\//i);
  }
});
