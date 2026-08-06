#!/usr/bin/env node
// Definition of Done for this repository. Exits non-zero on any failure.
import { readFileSync, readdirSync, existsSync, statSync, lstatSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const failures = [];
const fail = (file, msg) => failures.push(`${relative(root, file).replace(/\\/g, "/")}: ${msg}`);

const SKILLS_DIR = join(root, ".claude", "skills");
const AGENTS_MD = join(root, "AGENTS.md");
const LINE_BUDGET = 150;

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );

// --- 1. Every skill has valid frontmatter, and its name matches its directory.
const skillNames = new Set();
for (const entry of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const file = join(SKILLS_DIR, entry.name, "SKILL.md");
  if (!existsSync(file)) {
    fail(file, "missing SKILL.md");
    continue;
  }
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    fail(file, "missing YAML frontmatter");
    continue;
  }
  const name = fm[1].match(/^name:\s*(.+)$/m)?.[1].trim();
  const description = fm[1].match(/^description:\s*(.+)$/m)?.[1].trim();
  if (!name) fail(file, "frontmatter has no `name`");
  if (!description) fail(file, "frontmatter has no `description`");
  if (name && name !== entry.name) fail(file, `name "${name}" does not match directory "${entry.name}"`);
  if (name) skillNames.add(name);
}

// --- 2. Every `/skill` reference resolves to an installed skill.
//     This is the check that catches a skill pointing at one that was never installed.
const docs = [
  ...walk(SKILLS_DIR).filter((f) => f.endsWith(".md")),
  ...["AGENTS.md", "AGENTS.example.md", "README.md", "CONTEXT.md"]
    .map((f) => join(root, f))
    .filter(existsSync),
];
// Files we own are strict. Unedited upstream skills only warn: ADR-0002 keeps them
// byte-identical, so a dangling pointer there is upstream's to fix, not ours.
const OWNED = new Set(["onboard", "audit-docs", "grill-with-docs"]);
const NOT_SKILLS = new Set(["tmp", "dev", "etc", "usr", "var", "opt", "home", "src"]); // filesystem paths
const warnings = [];
for (const file of docs) {
  const owned = !file.startsWith(SKILLS_DIR) || OWNED.has(relative(SKILLS_DIR, file).split(/[\\/]/)[0]);
  const text = readFileSync(file, "utf8");
  for (const [, ref] of text.matchAll(/`\/([a-z][a-z0-9-]*)`/g)) {
    if (NOT_SKILLS.has(ref) || skillNames.has(ref)) continue;
    const msg = `references \`/${ref}\`, which is not an installed skill`;
    if (owned) fail(file, msg);
    else warnings.push(`${relative(root, file).replace(/\\/g, "/")}: ${msg}`);
  }
}

// --- 3. The instruction file stays inside its own budget.
if (existsSync(AGENTS_MD)) {
  const lines = readFileSync(AGENTS_MD, "utf8").split(/\r?\n/).length;
  if (lines > LINE_BUDGET) fail(AGENTS_MD, `${lines} lines, over the ${LINE_BUDGET}-line budget`);
} else {
  fail(AGENTS_MD, "missing — every repository needs one");
}

// --- 4. The Claude stub points at AGENTS.md and is a real file, not a symlink.
const claude = join(root, "CLAUDE.md");
if (!existsSync(claude)) {
  fail(claude, "missing — Claude Code does not read AGENTS.md natively");
} else {
  if (statSync(claude, { throwIfNoEntry: false })?.isSymbolicLink?.()) fail(claude, "is a symlink; use a stub file (breaks on Windows checkouts)");
  if (readFileSync(claude, "utf8").trim() !== "@AGENTS.md") fail(claude, "should contain exactly `@AGENTS.md`");
}

// --- 5. The mandated documents exist.
for (const p of ["CONTEXT.md", "docs/adr"]) {
  if (!existsSync(join(root, p))) fail(join(root, p), "missing — required by ADR-0004");
}

// --- 6. No symlinks in the skills tree. `npx skills` recreates them on every run;
//     committed from a machine with core.symlinks=true they corrupt Windows checkouts.
for (const entry of readdirSync(SKILLS_DIR)) {
  if (lstatSync(join(SKILLS_DIR, entry)).isSymbolicLink())
    fail(join(SKILLS_DIR, entry), "is a symlink — run `npm run skills:flatten`");
}

// --- 7. The one forked edit survives. `npx skills update` reverts it silently.
const gwd = join(SKILLS_DIR, "grill-with-docs", "SKILL.md");
if (existsSync(gwd)) {
  const text = readFileSync(gwd, "utf8");
  if (/^disable-model-invocation:\s*true/m.test(text))
    fail(gwd, "reverted to upstream — it must stay model-invocable to fire on its own (ADR-0001)");
  if (!/new seam, dependency, schema/.test(text))
    fail(gwd, "description has lost the trigger list — restore it, see ADR-0002");
}

if (warnings.length) {
  console.warn(`upstream warnings (${warnings.length}):\n` + warnings.map((w) => `  - ${w}`).join("\n"));
}
if (failures.length) {
  console.error(`check failed (${failures.length}):\n` + failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
console.log("check passed");
