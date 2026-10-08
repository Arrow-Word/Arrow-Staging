import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function readPuzzlePage(fileName) {
  const candidates = [
    path.join(rootDir, "artifacts/api-server/public", fileName),
    path.join(rootDir, fileName),
  ];
  const pagePath = candidates.find(existsSync);
  assert.ok(
    pagePath,
    `Could not find ${fileName} in the Replit app folder or project root`,
  );
  return readFileSync(pagePath, "utf8");
}

const builderHtml = readPuzzlePage("builder.html");
const directoryHtml = readPuzzlePage("directory.html");

function extractFunction(source, name) {
  const signature = `function ${name}(`;
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, `Expected ${name}() to exist`);

  const end = source.slice(start).search(/\n\}/);
  assert.notEqual(end, -1, `Could not find the end of ${name}()`);
  return source.slice(start, start + end + 2);
}

function loadArrowHelpers(source) {
  const code = [
    extractFunction(source, "arrowSVG"),
    extractFunction(source, "answerArrowSVG"),
    extractFunction(source, "firstAnswerTarget"),
    extractFunction(source, "getAnswerArrowMarkers"),
    "globalThis.arrowHelpers = { answerArrowSVG, firstAnswerTarget, getAnswerArrowMarkers };",
  ].join("\n");
  const context = {};
  vm.runInNewContext(code, context);
  return context.arrowHelpers;
}

function makeGrid(size = 11) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ t: "empty" })),
  );
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

const directionTargets = {
  right: [0, 1, "left"],
  left: [0, -1, "right"],
  down: [1, 0, "top"],
  up: [-1, 0, "bottom"],
  "right-down": [0, 1, "left"],
  "down-right": [1, 0, "top"],
  "left-down": [0, -1, "right"],
  "down-left": [1, 0, "top"],
  "right-up": [0, 1, "left"],
  "up-right": [-1, 0, "bottom"],
  "left-up": [0, -1, "right"],
  "up-left": [-1, 0, "bottom"],
};

for (const [pageName, html] of [
  ["builder", builderHtml],
  ["directory solver", directoryHtml],
]) {
  test(`${pageName}: all arrow directions target the first adjacent answer square`, () => {
    const { firstAnswerTarget, getAnswerArrowMarkers } = loadArrowHelpers(html);

    for (const [direction, [dr, dc, edge]] of Object.entries(
      directionTargets,
    )) {
      assert.deepEqual(
        plain(firstAnswerTarget(direction, 5, 5)),
        { r: 5 + dr, c: 5 + dc, edge },
        `${direction} should point from the clue into its first answer square`,
      );

      const grid = makeGrid();
      grid[5][5] = {
        t: "clue",
        clues: [{ dir: direction, textSize: 12 }],
      };
      assert.deepEqual(
        plain(getAnswerArrowMarkers(5 + dr, 5 + dc, grid, 12)),
        [{ dir: direction, edge, position: 50 }],
        `${direction} should render once at the center of its clue slot`,
      );
    }
  });

  test(`${pageName}: four clue arrows stay aligned with differently sized clue slots`, () => {
    const { getAnswerArrowMarkers } = loadArrowHelpers(html);
    const grid = makeGrid();
    grid[5][5] = {
      t: "clue",
      clues: [
        { dir: "up", textSize: 8 },
        { dir: "left", textSize: 12 },
        { dir: "right", textSize: 20 },
        { dir: "down", textSize: 16 },
      ],
    };

    const checks = [
      [4, 5, "up", "bottom", (4 / 56) * 100],
      [5, 4, "left", "right", 25],
      [5, 6, "right", "left", (30 / 56) * 100],
      [6, 5, "down", "top", (48 / 56) * 100],
    ];

    for (const [r, c, dir, edge, position] of checks) {
      const markers = plain(getAnswerArrowMarkers(r, c, grid, 12));
      assert.equal(markers.length, 1, `${dir} should have one marker`);
      assert.equal(markers[0].dir, dir);
      assert.equal(markers[0].edge, edge);
      assert.ok(
        Math.abs(markers[0].position - position) < 1e-9,
        `${dir} should align at ${position}%, got ${markers[0].position}%`,
      );
    }
  });

  test(`${pageName}: answer-arrow strokes remain thin`, () => {
    const { answerArrowSVG } = loadArrowHelpers(html);
    assert.match(answerArrowSVG("right", 16), /stroke-width="1"/);
  });
}

test("builder and solver render arrows in answer cells, not clue slots", () => {
  const builderGrid = extractFunction(builderHtml, "makeTd");
  const directoryGrid = extractFunction(directoryHtml, "buildSolverGrid");

  assert.match(builderGrid, /appendAnswerArrowMarkers\(td,r,c\)/);
  assert.match(directoryGrid, /appendAnswerArrowMarkers\(td,r,c,G2,cSz,tSz\)/);
  assert.doesNotMatch(builderGrid, /slot-arrow|arrDiv|arrowSVG\(/);
  assert.doesNotMatch(directoryGrid, /slot-arrow|arrowSVG\(/);
});

test("builder print and standalone export keep the same answer-cell arrows", () => {
  const printGrid = extractFunction(builderHtml, "buildPrintGrid");
  const exportSection = builderHtml.slice(
    builderHtml.indexOf("// ── Solver HTML export"),
  );

  assert.match(printGrid, /getAnswerArrowMarkers\(r,c\)/);
  assert.match(printGrid, /answerArrowSVG\(marker\.dir,markerSize\)/);
  assert.match(exportSection, /getAnswerArrowMarkers\(r,c,G2,tSz\)/);
  assert.match(
    exportSection,
    /class="answer-arrow-marker edge-\$\{marker\.edge\}"/,
  );
  assert.match(exportSection, /font-size:\$\{Math\.round\(cSz\*0\.38\)\}px/);
  assert.doesNotMatch(exportSection, /arrH=|<div class="slot-arrow">/);
});

test("letter placement and responsive edge overlays remain separate", () => {
  assert.match(
    builderHtml,
    /sp\.style\.fontSize=Math\.round\(cellSizePx\*0\.38\)\+'px'/,
  );
  assert.match(
    builderHtml,
    /inp\.style\.fontSize=Math\.round\(cellSizePx\*0\.38\)\+'px'/,
  );
  assert.match(builderHtml, /'text-anchor':'middle'/);
  assert.match(builderHtml, /Math\.round\(cSz\*0\.38\)/);
  assert.match(
    directoryHtml,
    /inp\.style\.fontSize=Math\.round\(cSz\*0\.38\)\+'px'/,
  );

  for (const html of [builderHtml, directoryHtml]) {
    assert.match(html, /Math\.round\(cellPx\*0\.25\)/);
    assert.match(
      html,
      /\.answer-arrow-marker\.edge-left\{left:1px;top:var\(--slot-position\)/,
    );
    assert.match(
      html,
      /\.answer-arrow-marker\.edge-right\{right:1px;top:var\(--slot-position\)/,
    );
    assert.match(
      html,
      /\.answer-arrow-marker\.edge-top\{top:1px;left:var\(--slot-position\)/,
    );
    assert.match(
      html,
      /\.answer-arrow-marker\.edge-bottom\{bottom:1px;left:var\(--slot-position\)/,
    );
  }
});
