# Instructor Guide: Trust Horizon

This guide covers learning alignment, mechanics, and classroom delivery for **Trust Horizon**,
built for Chapter 17 (AI Security: Machine Learning, Generative AI, and Agents) and Chapter 18
(Trusted Computing and Side-Channel Attacks) of 305331/316331 Computer and Information
Security — the twelfth and final game in the original roadmap.

---

## 1. Educational Alignment

| MLO | After this stage, learners can | Stage |
|---|---|---|
| MLO17.1 + MLO18.1 | Build an AI threat model separating security from safety; identify a TCB and its trust dependencies | Stage 1: Threat & Trust Maps |
| MLO17.2 + MLO18.2 | Analyze data/model-attack impact on AI assets; separate what secure boot/TPM/attestation support from what they don't | Stage 2: Evidence Scope |
| MLO17.3 + MLO18.3 | Analyze prompt/context/output risk in an LLM application; explain algorithm strength vs. implementation/platform leakage | Stage 3: Layers of Trust |
| MLO17.4 + MLO18.4 | Evaluate AI agent rights and controls with evidence; evaluate platform/side-channel mitigation with residual risk | Stage 4: Agency & Hardening |

This game combines two chapters, following the precedent of Vault & Signature Bench
(chapters 5+7) and Endpoint Frontier (chapters 15+16). All scenarios are synthetic and reuse
the Student Project Portal cases from the approved chapter sources
(`textbook/lecture-notes/chapter-17/00-chapter.md` and `chapter-18/00-chapter.md`) — the Course
Assistant's asset map and the gateway's trust-dependency map, the outdated-FAQ-document case and
the gateway attestation-evidence case, the prompt-injection document case (matching the
chapter's own comprehension check) and the algorithm-vs-timing case, and the agent
permission-matrix exercise plus the gateway manufacturer's overclaim are the chapters' own
worked examples, not new inventions.

**Source timing note:** both chapter-17 and chapter-18's manuscripts were undergoing separate,
concurrent depth expansions while this game was built (the same situation Network Ops Center,
API Gatekeeper, Hardening Bay, SOC Watch, Cloud Custodian, and Endpoint Frontier handled for
chapters 10-16). If those expansions later change wording, examples, or structure, treat this
game's content as needing a follow-up review rather than assuming it is automatically out of
sync — the underlying MLOs and mechanisms it tests are stable.

---

## 2. The rules that are not just "harder" scoring

**Stage 1 — a completed map is not proof of safety.** Chapter 17 warns that finishing an
asset/attack-surface map does not mean no security risk remains; chapter 18 warns that knowing a
gateway "has some chip" does not make a specific trust claim true.

**Stage 2 — a label or a passed check is not proof of everything.** Chapter 17's own exercise
targets exactly the claim that an "official" document label means its content stays correct
forever; chapter 18's own exercise targets the claim that passed attestation certifies sensor
data is correct.

**Stage 3 — algorithm security does not imply implementation security.** Chapter 18's own
comprehension check is built around exactly this distinction, matched here against chapter 17's
parallel point that a model must never decide authorization on the service's behalf.

**Stage 4 — hardware trust features are not full protection.** Chapter 18's manufacturer
overclaim ("TPM + secure boot + standard cryptography means fully protected") is the chapter's
own worked example of an overclaim, reused here as the stage's hard rule. All four rules use the
same hard-overclaim mechanism as Vault & Signature Bench, Network Ops Center, API Gatekeeper,
Hardening Bay, SOC Watch, Cloud Custodian, and Endpoint Frontier.

## 3. Stage Mechanics

### Stage 1: Threat & Trust Maps (2 items)
Claim-judgment on the Course Assistant's asset/attack-surface map (with a bonus distinguishing
AI security from AI safety) and on the gateway's trust-dependency map for a key-usage claim.

### Stage 2: Evidence Scope (2 items)
Claim-judgment on the outdated-FAQ-document case (with a bonus on what finding model extraction
actually means) and on the gateway's attestation-evidence case.

### Stage 3: Layers of Trust (2 items)
A retrieval-authorization decision on the prompt-injection document case (with a bonus on why a
model must never decide authorization) and claim-judgment on the "algorithm secure implies
implementation secure" case.

### Stage 4: Agency & Hardening (5 items)
Four classification items matching the chapter's own agent permission-matrix exercise exactly
(read own status — agent OK; draft a request — agent OK; approve a request — human approval;
change another user's status from a chat request — deny, with a bonus on why a log doesn't prove
a decision was correct), followed by claim-judgment on the gateway manufacturer's "protects
against everything" claim (with a bonus on residual risk).

---

## 4. Bilingual Use

Every scenario and UI string ships in Thai and English. Use the toggle in the top bar, or link
directly with `?lang=th` (305331 sections) or `?lang=en` (316331 sections) so each course's portal
entry point opens in its own default language. Switching language mid-item re-renders that item
fresh (a minor trade-off to keep the toggle simple); it never affects scores already recorded for
earlier items.

---

## 5. Classroom Delivery Strategies

### Option A: In-Class Icebreaker (10–15 minutes)
Run individually across the AI Security and Trusted Computing weeks, before presenting the
formal definitions. Debrief by asking which claim triggered the overclaim warning, and what a
threat model, a data label, an algorithm's proof, and a hardware chip all have in common: none
of them alone closes the question.

### Option B: Competitive Score Attack (15–20 minutes)
Students race for points, which combine per-item accuracy with a speed bonus. Award the top
three "Trust Horizon" ranks. Stage 4's agent items tend to separate students who still think a
conversational agent's competence justifies broader access from those who check the actual
impact and reversibility of each action.

### Option C: Assessment & Evidence Collection
After finishing, students click "Generate certificate" to produce a one-page summary (name, ID,
date, rank, overall accuracy, and a verification signature) that they print or save as PDF and
submit with their chapter worksheet — a fitting capstone for the last chapter of the course.
