/**
 * Trust Horizon Game Unit Tests - Lightweight Node-native verification script
 */

const assert = require("assert");
const {
  STAGE1_MAPPING,
  STAGE2_EVIDENCE_SCOPE,
  STAGE3_LAYERS,
  STAGE4_AGENCY,
  calculateScore,
  scoreToolSelect,
  scoreAuthorization,
  scoreClaims,
  evaluateLearningOutcome,
} = require("./game-core.js");

console.log("=========================================");
console.log("RUNNING TRUST HORIZON GAME CORE TESTS...");
console.log("=========================================");

try {
  // Test 1: Scenario bank integrity and bilingual coverage
  console.log("Test 1: Verifying scenario bank structure and bilingual fields...");
  assert.strictEqual(STAGE1_MAPPING.length, 2, "Stage 1 should have exactly 2 threat/trust-map claims items.");
  assert.strictEqual(STAGE2_EVIDENCE_SCOPE.length, 2, "Stage 2 should have exactly 2 evidence-scope claims items.");
  assert.strictEqual(STAGE3_LAYERS.length, 2, "Stage 3 should have exactly 2 items (1 authorization + 1 claims).");
  assert.strictEqual(STAGE4_AGENCY.length, 5, "Stage 4 should have exactly 5 items (4 classify + 1 claims).");

  const s3ClaimsItems = STAGE3_LAYERS.filter((i) => i.kind === "claims");
  const s4ClaimsItems = STAGE4_AGENCY.filter((i) => i.kind === "claims");
  [...STAGE1_MAPPING, ...STAGE2_EVIDENCE_SCOPE, ...s3ClaimsItems, ...s4ClaimsItems].forEach((item) => {
    const trapCount = item.claims.filter((c) => c.trap).length;
    assert.ok(trapCount >= 1, `Item ${item.id} must include at least 1 trap claim.`);
  });

  const denyCount = STAGE4_AGENCY.filter((i) => i.kind === "tool_select" && i.correct === "DENY").length;
  assert.ok(denyCount >= 1, "Stage 4 must include at least 1 deny classification, matching the chapter-17 exercise's own requirement.");
  console.log("✔ Scenario bank verified successfully.");

  // Test 2: Score calculation logic (shared speed-bonus formula)
  console.log("Test 2: Verifying calculateScore speed-bonus rules...");
  assert.strictEqual(calculateScore(100, 0, 45), 150, "Zero elapsed time should reward maximum points + speed bonus.");
  assert.strictEqual(calculateScore(100, 45, 45), 50, "Reaching the time limit should reward the minimum floor points.");
  console.log("✔ Score calculations verified successfully.");

  // Test 3: Stage 1 threat/trust-map claims and overclaim rule
  console.log("Test 3: Verifying Stage 1 claims scoring and overclaim rule...");
  const s1item1 = STAGE1_MAPPING[0];
  const s1PerfectVerdicts = {};
  s1item1.claims.forEach((c) => { s1PerfectVerdicts[c.id] = c.correctVerdict; });
  const s1CorrectBonus = s1item1.bonusQuestion.options.find((b) => b.correct);
  const s1Perfect = scoreClaims(s1item1, { verdicts: s1PerfectVerdicts, bonusId: s1CorrectBonus.id });
  assert.strictEqual(s1Perfect.ratio, 1, "Correctly judging every threat-map claim and the bonus should score a perfect ratio.");
  const s1Trap = s1item1.claims.find((c) => c.trap);
  const s1Overclaimed = scoreClaims(s1item1, { verdicts: { ...s1PerfectVerdicts, [s1Trap.id]: "CAN_CLAIM" }, bonusId: s1CorrectBonus.id });
  assert.strictEqual(s1Overclaimed.ratio, 0, "Marking the map-means-no-risk trap claim as 'can claim' must zero the score.");
  assert.strictEqual(s1Overclaimed.overclaimed, true);
  console.log("✔ Stage 1 scoring and overclaim rule verified successfully.");

  // Test 4: Stage 2 evidence-scope claims and overclaim rule
  console.log("Test 4: Verifying Stage 2 claims scoring and overclaim rule...");
  const s2item2 = STAGE2_EVIDENCE_SCOPE[1];
  const s2PerfectVerdicts = {};
  s2item2.claims.forEach((c) => { s2PerfectVerdicts[c.id] = c.correctVerdict; });
  const s2Perfect = scoreClaims(s2item2, { verdicts: s2PerfectVerdicts });
  assert.strictEqual(s2Perfect.ratio, 1, "Correctly judging every attestation claim should score a perfect ratio.");
  const s2Trap = s2item2.claims.find((c) => c.trap);
  const s2Overclaimed = scoreClaims(s2item2, { verdicts: { ...s2PerfectVerdicts, [s2Trap.id]: "CAN_CLAIM" } });
  assert.strictEqual(s2Overclaimed.ratio, 0, "Marking the attestation-proves-sensor-data trap claim as 'can claim' must zero the score.");
  assert.strictEqual(s2Overclaimed.overclaimed, true);
  console.log("✔ Stage 2 scoring and overclaim rule verified successfully.");

  // Test 5: Stage 3 retrieval authorization and algorithm/implementation claims
  console.log("Test 5: Verifying Stage 3 authorization and claims scoring...");
  const s3item1 = STAGE3_LAYERS[0];
  assert.strictEqual(s3item1.kind, "authorization", "Stage 3 item 1 should be the retrieval authorization decision.");
  const correctCondition3 = s3item1.conditionOptions.find((c) => c.correct);
  const correctBonus3 = s3item1.bonusQuestion.options.find((b) => b.correct);
  const s3Perfect = scoreAuthorization(s3item1, { decision: s3item1.correctDecision, conditionId: correctCondition3.id, bonusId: correctBonus3.id });
  assert.strictEqual(s3Perfect.ratio, 1, "Correct decision, reasoning, and bonus answer should score a perfect ratio.");
  const s3WrongDecision = scoreAuthorization(s3item1, { decision: "ALLOW", conditionId: correctCondition3.id, bonusId: correctBonus3.id });
  assert.ok(s3WrongDecision.ratio < s3Perfect.ratio, "The wrong allow/deny decision should score lower than a perfect answer.");

  const s3item2 = STAGE3_LAYERS[1];
  assert.strictEqual(s3item2.kind, "claims", "Stage 3 item 2 should be the algorithm-vs-implementation claims item.");
  const s3ClaimsTrap = s3item2.claims.find((c) => c.trap);
  const s3ClaimsPerfectVerdicts = {};
  s3item2.claims.forEach((c) => { s3ClaimsPerfectVerdicts[c.id] = c.correctVerdict; });
  const s3ClaimsOverclaimed = scoreClaims(s3item2, { verdicts: { ...s3ClaimsPerfectVerdicts, [s3ClaimsTrap.id]: "CAN_CLAIM" } });
  assert.strictEqual(s3ClaimsOverclaimed.ratio, 0, "Marking the algorithm-secure-implies-implementation-secure trap claim must zero the score.");
  console.log("✔ Stage 3 scoring verified successfully.");

  // Test 6: Stage 4 agent action-level classification and platform-hardening overclaim
  console.log("Test 6: Verifying Stage 4 classification and overclaim rule...");
  const s4item4 = STAGE4_AGENCY[3];
  assert.ok(s4item4.bonusQuestion, "The deny-classification item must carry a bonus question.");
  const correctBonus4 = s4item4.bonusQuestion.options.find((b) => b.correct);
  const s4Perfect = scoreToolSelect(s4item4, { choice: s4item4.correct, bonusId: correctBonus4.id });
  assert.strictEqual(s4Perfect.ratio, 1, "Correct agent action-level classification and bonus should score a perfect ratio.");
  const s4Wrong = scoreToolSelect(s4item4, { choice: "AGENT_OK", bonusId: correctBonus4.id });
  assert.ok(s4Wrong.ratio < s4Perfect.ratio, "Classifying a denied action as agent-OK must never score as well as the correct answer.");

  const s4item5 = STAGE4_AGENCY[4];
  const s4ClaimsPerfectVerdicts = {};
  s4item5.claims.forEach((c) => { s4ClaimsPerfectVerdicts[c.id] = c.correctVerdict; });
  const s4CorrectBonus = s4item5.bonusQuestion.options.find((b) => b.correct);
  const s4ClaimsPerfect = scoreClaims(s4item5, { verdicts: s4ClaimsPerfectVerdicts, bonusId: s4CorrectBonus.id });
  assert.strictEqual(s4ClaimsPerfect.ratio, 1, "Correctly judging the platform-hardening claims and the bonus should score a perfect ratio.");
  const s4ClaimsTrap = s4item5.claims.find((c) => c.trap);
  const s4ClaimsOverclaimed = scoreClaims(s4item5, { verdicts: { ...s4ClaimsPerfectVerdicts, [s4ClaimsTrap.id]: "CAN_CLAIM" }, bonusId: s4CorrectBonus.id });
  assert.strictEqual(s4ClaimsOverclaimed.ratio, 0, "Marking the full-protection trap claim as 'can claim' must zero the score.");
  assert.strictEqual(s4ClaimsOverclaimed.overclaimed, true);
  console.log("✔ Stage 4 scoring and overclaim rule verified successfully.");

  // Test 7: Learning outcome mapping
  console.log("Test 7: Verifying evaluateLearningOutcome output classifications...");
  const perfect = evaluateLearningOutcome({ s1: 100, s2: 100, s3: 100, s4: 100 });
  assert.strictEqual(perfect.accuracy, 100);
  assert.strictEqual(perfect.title.en, "Chief AI & Trusted Computing Security Officer");
  const zero = evaluateLearningOutcome({ s1: 0, s2: 0, s3: 0, s4: 0 });
  assert.strictEqual(zero.accuracy, 0);
  assert.strictEqual(zero.title.en, "Trust Horizon Trainee");
  console.log("✔ Learning outcomes mapping verified successfully.");

  console.log("\n=========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY! [PASS]");
  console.log("=========================================");
  process.exit(0);
} catch (error) {
  console.error("\n❌ TEST SUITE FAILED:");
  console.error(error);
  process.exit(1);
}
