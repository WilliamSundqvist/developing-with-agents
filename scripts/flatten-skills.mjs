#!/usr/bin/env node
// Run after `npx skills add|update`. The CLI stores skills in .agents/ and points
// .claude/skills/* at them with symlinks. Symlinks committed from a machine with
// core.symlinks=true are checked out as plain text files containing the link path
// on machines without it — a silent, total corruption of the skills tree.
// This replaces each symlink with the real directory and drops .agents/.
import { readdirSync, lstatSync, realpathSync, cpSync, rmSync, rmdirSync, unlinkSync, renameSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const skillsDir = join(root, ".claude", "skills");

const removeLink = (p) => {
  try {
    rmdirSync(p); // directory symlink on Windows
  } catch {
    unlinkSync(p);
  }
};

let flattened = 0;
for (const entry of readdirSync(skillsDir)) {
  const path = join(skillsDir, entry);
  if (!lstatSync(path).isSymbolicLink()) continue;
  const staging = `${path}.real`;
  cpSync(realpathSync(path), staging, { recursive: true, dereference: true });
  removeLink(path);
  renameSync(staging, path);
  flattened++;
  console.log(`flattened ${entry}`);
}

const agents = join(root, ".agents");
if (existsSync(agents)) {
  rmSync(agents, { recursive: true, force: true });
  console.log("removed .agents/");
}

console.log(flattened ? `${flattened} skill(s) flattened` : "nothing to flatten");
