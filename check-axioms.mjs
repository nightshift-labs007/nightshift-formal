// Reads the output of `lake env lean Nightshift/Audit.lean` (stdin) and checks every theorem in properties.json:
// it must be present and depend only on Lean's three standard axioms (no sorryAx, nothing added).
import fs from "node:fs";
const ALLOWED = new Set(["propext", "Classical.choice", "Quot.sound"]);
const out = fs.readFileSync(0, "utf8");
const props = JSON.parse(fs.readFileSync("properties.json", "utf8"));
const list = Array.isArray(props) ? props : props.properties;
const axioms = new Map();
for (const m of out.matchAll(/'([^']+)' depends on axioms: \[([^\]]*)\]|'([^']+)' does not depend on any axioms/g)) {
  if (m[3]) axioms.set(m[3], []);
  else axioms.set(m[1], m[2].split(",").map((s) => s.trim()).filter(Boolean));
}
let ok = 0;
for (const p of list) {
  const ax = axioms.get(p.theorem);
  const good = !!ax && ax.every((a) => ALLOWED.has(a));
  if (good) ok++;
  console.log(`${good ? "verified" : "NOT OK  "}  ${p.id.padEnd(4)} ${p.theorem}${ax && !good ? `  [${ax.join(", ")}]` : ax ? "" : "  (missing)"}`);
}
console.log(`\n${ok}/${list.length} properties verified`);
process.exit(ok === list.length ? 0 : 1);
