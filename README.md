# Nightshift formal verification

The 24 safety properties behind [Nightshift](https://nightshift.buzz), stated and proven in **Lean 4** (Mathlib v4.28.0).
Proofs were produced with Harmonic's **Aristotle** and are checked by Lean's kernel. You don't need to trust us or
Aristotle: anyone can re-check them with the steps below.

| Module | Properties | What it covers |
|---|---|---|
| `Nightshift/Vault.lean` | V0–V7 | health factor, liquidation, rounding, liquidation bonus, borrow limit |
| `Nightshift/Guardian.lean` | G1–G5 | automatic loan protection: never negative, never more than the collateral, lands on the target, minimal, refuses when it can't help |
| `Nightshift/Oracle.lean` | O1–O3 | fair value within its signals, weights, confidence monotonicity and bounds |
| `Nightshift/Cloak.lean` | C1–C4 | zero-knowledge solvency circuit: no overflow, field arithmetic, rounding soundness |

Plain-English statements: [PROPERTIES.md](PROPERTIES.md). How each model maps to the Solidity and TypeScript code, and
what is **not** covered: [MAPPING.md](MAPPING.md). These are proofs about mathematical models of the logic, not the
compiled contracts, and not a substitute for an audit.

## Re-check it yourself

Requires [elan](https://github.com/leanprover/elan) (Lean's installer) and Node 18+.

```sh
lake exe cache get                                         # download prebuilt Mathlib (a few minutes)
lake build                                                 # Lean's kernel checks every proof
lake env lean Nightshift/Audit.lean | node check-axioms.mjs   # each theorem uses only Lean's standard axioms
node verify-manifest.mjs                                   # sources match manifest.json and its Algorand record
```

Expected: `24/24 properties verified`, every theorem depending only on `propext`, `Classical.choice` and `Quot.sound`
(no `sorryAx`), and four `PASS` lines from `verify-manifest.mjs`. The same checks run on every push in
[GitHub Actions](../../actions).

## The fingerprint on Algorand

`manifest.json` lists the 24 properties, the Lean and Mathlib versions, and a SHA-256 of these source files. The
SHA-256 of the manifest itself is written into the note of an Algorand TestNet transaction
(`algorand.txId`), so the list can't be changed afterwards without it showing. `verify-manifest.mjs` recomputes both
hashes and reads the transaction from a public Algorand indexer.

Files are stored byte-for-byte (see `.gitattributes`) because the fingerprint covers them exactly.
