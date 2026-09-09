# Trust Horizon

An interactive, bilingual (Thai/English) web-based cybersecurity learning game covering
**Chapter 17: AI Security (Machine Learning, Generative AI, and Agents)** and **Chapter 18:
Trusted Computing and Side-Channel Attacks** (305331/316331, Naresuan University). This is the
twelfth and final game in the original roadmap. Players survey the "trust horizon" — where AI
systems and hardware trust assumptions meet — for the same Student Project Portal case used
across the 305331 textbook: judging what a threat model or trust-dependency map does and
doesn't prove, judging the scope of data/model-attack and attestation evidence, deciding
retrieval authorization while judging why an algorithm's strength doesn't guarantee its
implementation, and judging agent action levels alongside platform-hardening overclaims.

## Features

- **4 stages, each pairing one AI-security MLO with one trusted-computing MLO** on a shared
  theme (17.1+18.1, 17.2+18.2, 17.3+18.3, 17.4+18.4) — the same two-chapter combination pattern
  Vault & Signature Bench used for chapters 5+7 and Endpoint Frontier used for chapters 15+16.
- **Bilingual by design**: every scenario, option, and UI label ships as `{ th, en }` pairs, same
  technical pattern as the eleven existing new games. A toggle in the top bar switches instantly;
  `?lang=th` or `?lang=en` sets the starting language.
- **Every mechanic here is reused, not reinvented**: classify (Stage 4's agent action levels),
  the allow/deny authorization decision (Access Control Console, OWASP Defense Grid, Network
  Ops Center, API Gatekeeper, SOC Watch, Cloud Custodian, Endpoint Frontier) applied to
  retrieval requests that must not be decided by the model itself, and claim-judgment with a
  hard overclaim rule (Vault & Signature Bench, Network Ops Center, API Gatekeeper, Hardening
  Bay, SOC Watch, Cloud Custodian, Endpoint Frontier) applied to AI and trusted-computing claims.
- **Four hard-coded teaching rules, not just partial credit**: Stage 1 zeroes any item where a
  "trap" claim (that a complete map proves no remaining risk, or that having some kind of chip
  proves a whole trust claim) is judged claimable. Stage 2 zeroes any item where a "trap" claim
  (that a document label proves permanent correctness, or that a passed attestation proves
  sensor-data correctness) is judged claimable. Stage 3 zeroes any item where a "trap" claim
  (that algorithm security implies implementation security) is judged claimable. Stage 4 zeroes
  any item where a "trap" claim (that TPM, secure boot, and standard cryptography protect
  against every attack) is judged claimable.
- **Pure client-side code**: vanilla HTML, CSS, and JS. No build step, no backend, no analytics
  wiring.

## Structure

```
trust-horizon/
├── index.html         # Shell: start screen, stage screen, results screen, certificate modal
├── styles.css         # "Trust horizon" dark-gold theme
├── i18n.js            # UI chrome strings (TH/EN) and language resolution (?lang=, localStorage)
├── game-core.js       # Scenario bank, scoring logic, learning-outcome evaluator (bilingual data)
├── app.js             # DOM controller, state machine, timer, per-item-kind renderers
├── game-core.test.js  # Unit test verifying scenario data and every scoring rule
└── teacher-guide.md   # CLO/MLO mapping and classroom delivery options
```

## How to Play

1. Start a local server from this folder:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000` (or `http://localhost:8000?lang=th` to start in Thai).

## Run Tests

Verify scenario data integrity and scoring logic, including all four overclaim rules:

```bash
node game-core.test.js
```

## Note on source timing

This game's scenario content is grounded in the chapter-17 and chapter-18 textbook manuscripts
as they stood when this game was built. Separate, concurrently active tasks were expanding both
manuscripts' depth at the same time; if those expansions later change the chapters' examples or
terminology, this game's scenarios may need a follow-up refresh to stay aligned.
