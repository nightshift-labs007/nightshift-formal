// Checks that manifest.json matches these Lean sources and the fingerprint recorded on Algorand TestNet.
// Node 18+, no dependencies: node verify-manifest.mjs
import crypto from "node:crypto";
import fs from "node:fs";
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const m = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
// the same file list and order as Nightshift's scripts/formal.mjs
const files = ["lakefile.toml", "lean-toolchain", "properties.json", "Vectors.lean", ...["Guardian", "Vault", "Oracle", "Cloak"].map((x) => `Nightshift/${x}.lean`)];
const src = sha(files.map((f) => fs.readFileSync(f, "utf8")).join("\n\u0000\n"));
const hash = sha(JSON.stringify({ ...m, algorand: undefined }, null, 2));
const row = (ok, label, extra = "") => console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? `  ${extra}` : ""}`);
row(src === m.sourceSha256, "Lean sources match the manifest (sourceSha256)", src.slice(0, 16) + "…");
row(hash === m.algorand.manifestSha256, "manifest fingerprint recomputes", hash.slice(0, 16) + "…");
row(m.properties.every((p) => p.status === "verified"), `all ${m.properties.length} properties marked verified`);
const tx = await (await fetch(`https://testnet-idx.algonode.cloud/v2/transactions/${m.algorand.txId}`)).json();
const note = Buffer.from(tx.transaction?.note ?? "", "base64").toString();
row(note.includes(m.algorand.manifestSha256), `Algorand TestNet tx ${m.algorand.txId.slice(0, 10)}… carries the fingerprint`, `round ${tx.transaction?.["confirmed-round"]}`);
