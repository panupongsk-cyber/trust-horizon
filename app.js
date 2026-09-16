/**
 * Trust Horizon - App controller (DOM rendering and state machine).
 * Depends on i18n.js and game-core.js being loaded first.
 *
 * Mechanics dispatch per item (item.kind), mirroring vault-signature-bench/,
 * owasp-defense-grid/, network-ops-center/, api-gatekeeper/, hardening-bay/, soc-watch/,
 * cloud-custodian/, and endpoint-frontier/. Every mechanic here (classify, authorization
 * decisions, claim-judgment) is reused from those games' shapes.
 */

(function () {
  "use strict";

  const STAGES = [
    { key: "s1", nameKey: "stage1Name", items: STAGE1_MAPPING },
    { key: "s2", nameKey: "stage2Name", items: STAGE2_EVIDENCE_SCOPE },
    { key: "s3", nameKey: "stage3Name", items: STAGE3_LAYERS },
    { key: "s4", nameKey: "stage4Name", items: STAGE4_AGENCY },
  ];

  const TOOL_DICTS = { s4: AGENT_ACTION_LEVEL };

  const state = {
    lang: resolveLanguage(),
    player: { name: "", id: "" },
    stageIndex: 0,
    itemIndex: 0,
    submitted: false,
    stageResults: { s1: [], s2: [], s3: [], s4: [] },
  };

  const el = (id) => document.getElementById(id);

  // -------------------------------------------------------------------
  // i18n wiring
  // -------------------------------------------------------------------

  function applyStaticI18n() {
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.getAttribute("data-i18n"), state.lang);
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === state.lang);
    });
    document.documentElement.setAttribute("lang", state.lang);
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    el(id).classList.add("active");
  }

  // -------------------------------------------------------------------
  // Generic choice-group helpers
  // -------------------------------------------------------------------

  function makeChoiceGroup(groupName, options) {
    const wrap = document.createElement("div");
    wrap.className = "choice-group";
    wrap.dataset.group = groupName;
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      btn.dataset.value = opt.value;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        if (state.submitted) return;
        wrap.querySelectorAll(".choice-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function readSingle(groupEl) {
    if (!groupEl) return null;
    const active = groupEl.querySelector(".choice-btn.active");
    return active ? active.dataset.value : null;
  }

  function fieldBlock(labelText) {
    const block = document.createElement("div");
    block.className = "field-block";
    const label = document.createElement("p");
    label.className = "field-block-label";
    label.textContent = labelText;
    block.appendChild(label);
    return block;
  }

  function bonusBlock(item, area) {
    if (!item.bonusQuestion) return;
    const block = fieldBlock(bi(item.bonusQuestion.prompt, state.lang));
    block.appendChild(
      makeChoiceGroup("bonus", shuffle(item.bonusQuestion.options).map((o) => ({ value: o.id, label: bi(o, state.lang) })))
    );
    area.appendChild(block);
  }

  // -------------------------------------------------------------------
  // Kind: tool_select (Stage 4 agent action-level classify)
  // -------------------------------------------------------------------

  function renderToolSelect(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const dict = TOOL_DICTS[currentStage().key];
    const options = shuffle(item.options).map((k) => ({ value: k, label: bi(dict[k], state.lang) }));
    const block = fieldBlock(state.lang === "th" ? "จัดการอย่างไร" : "How should this be handled");
    block.appendChild(makeChoiceGroup("choice", options));
    area.appendChild(block);

    bonusBlock(item, area);
  }

  function collectToolSelect(item) {
    const area = el("answerArea");
    const choice = readSingle(area.querySelector('[data-group="choice"]'));
    const bonusId = item.bonusQuestion ? readSingle(area.querySelector('[data-group="bonus"]')) : null;
    return { choice, bonusId, complete: !!choice && (item.bonusQuestion ? !!bonusId : true) };
  }

  // -------------------------------------------------------------------
  // Kind: authorization (Stage 3 retrieval authorization)
  // -------------------------------------------------------------------

  function renderAuthorization(item) {
    el("scenarioCard").hidden = false;
    el("itemTitle").textContent = "";
    const labelRequest = state.lang === "th" ? "คำร้อง" : "Request";
    el("itemScenario").textContent =
      `${labelRequest}: ${bi(item.request, state.lang)}  |  Subject: ${bi(item.subject, state.lang)}  |  Object: ${bi(item.object, state.lang)}`;

    const area = el("answerArea");
    area.innerHTML = "";

    const decisionBlock = fieldBlock(state.lang === "th" ? "ตัดสินใจ" : "Decision");
    decisionBlock.appendChild(
      makeChoiceGroup("decision", Object.keys(DECISION).map((k) => ({ value: k, label: bi(DECISION[k], state.lang) })))
    );
    area.appendChild(decisionBlock);

    const conditionBlock = fieldBlock(state.lang === "th" ? "เหตุผลที่ใช้ตัดสิน" : "The reasoning used to decide");
    conditionBlock.appendChild(
      makeChoiceGroup("condition", shuffle(item.conditionOptions).map((c) => ({ value: c.id, label: bi(c, state.lang) })))
    );
    area.appendChild(conditionBlock);

    bonusBlock(item, area);
  }

  function collectAuthorization(item) {
    const area = el("answerArea");
    const decision = readSingle(area.querySelector('[data-group="decision"]'));
    const conditionId = readSingle(area.querySelector('[data-group="condition"]'));
    const bonusId = item.bonusQuestion ? readSingle(area.querySelector('[data-group="bonus"]')) : null;
    return { decision, conditionId, bonusId, complete: !!decision && !!conditionId && (item.bonusQuestion ? !!bonusId : true) };
  }

  // -------------------------------------------------------------------
  // Kind: claims (Stages 1, 2, 3, 4)
  // -------------------------------------------------------------------

  function renderClaims(item) {
    const area = el("answerArea");
    area.innerHTML = "";

    const verdictOptions = Object.keys(CLAIM_VERDICT).map((k) => ({ value: k, label: bi(CLAIM_VERDICT[k], state.lang) }));
    item.claims.forEach((claim) => {
      const block = fieldBlock(`“${bi(claim.text, state.lang)}”`);
      block.appendChild(makeChoiceGroup(`claim-${claim.id}`, verdictOptions));
      area.appendChild(block);
    });

    bonusBlock(item, area);
  }

  function collectClaims(item) {
    const area = el("answerArea");
    const verdicts = {};
    item.claims.forEach((c) => {
      verdicts[c.id] = readSingle(area.querySelector(`[data-group="claim-${c.id}"]`));
    });
    const bonusId = item.bonusQuestion ? readSingle(area.querySelector('[data-group="bonus"]')) : null;
    const complete = item.claims.every((c) => !!verdicts[c.id]) && (item.bonusQuestion ? !!bonusId : true);
    return { verdicts, bonusId, complete };
  }

  const RENDERERS = {
    tool_select: renderToolSelect,
    authorization: renderAuthorization,
    claims: renderClaims,
  };
  const COLLECTORS = {
    tool_select: collectToolSelect,
    authorization: collectAuthorization,
    claims: collectClaims,
  };
  const SCORERS = {
    tool_select: scoreToolSelect,
    authorization: scoreAuthorization,
    claims: scoreClaims,
  };

  // -------------------------------------------------------------------
  // Stage flow
  // -------------------------------------------------------------------

  function currentStage() {
    return STAGES[state.stageIndex];
  }

  function currentItem() {
    return currentStage().items[state.itemIndex];
  }

  function renderItem() {
    state.submitted = false;
    const stage = currentStage();
    const item = currentItem();

    el("stageNumber").textContent = String(state.stageIndex + 1);
    el("stageName").textContent = t(stage.nameKey, state.lang);
    el("itemProgress").textContent =
      (state.lang === "th" ? "ข้อ " : "Item ") + (state.itemIndex + 1) + " / " + stage.items.length;

    if (item.kind === "authorization") {
      // renderAuthorization() sets the scenario-card content itself.
    } else if (item.kind === "tool_select") {
      el("scenarioCard").hidden = false;
      el("itemTitle").textContent = "";
      el("itemScenario").textContent = bi(item.prompt, state.lang);
    } else {
      el("scenarioCard").hidden = false;
      el("itemTitle").textContent = item.title ? bi(item.title, state.lang) : "";
      el("itemScenario").textContent = item.scenario ? bi(item.scenario, state.lang) : "";
    }

    RENDERERS[item.kind](item);

    el("feedbackBox").hidden = true;
    el("submitBtn").hidden = false;
    el("nextBtn").hidden = true;

  }

  function isLastItemOfStage() {
    return state.itemIndex >= currentStage().items.length - 1;
  }

  function isLastStage() {
    return state.stageIndex >= STAGES.length - 1;
  }

  function handleSubmit() {
    if (state.submitted) return;
    state.submitted = true;

    const stage = currentStage();
    const item = currentItem();
    const answer = COLLECTORS[item.kind](item);

    if (!answer.complete) {
      state.submitted = false;
      showIncompleteHint();
      return;
    }

    const result = SCORERS[item.kind](item, answer);
    state.stageResults[stage.key].push(result.ratio);

    showFeedback(item, result);

    el("submitBtn").hidden = true;
    const nextBtn = el("nextBtn");
    nextBtn.hidden = false;
    const isFinalItem = isLastItemOfStage() && isLastStage();
    nextBtn.textContent = t(isFinalItem ? "seeResultsButton" : "nextButton", state.lang);
  }

  function showIncompleteHint() {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.add("hint");
    box.classList.remove("warning");
    el("feedbackHeadline").textContent =
      state.lang === "th" ? "กรอกคำตอบให้ครบทุกส่วนก่อนส่ง" : "Fill in every part of the answer before submitting.";
    el("feedbackExplanation").textContent = "";
    setTimeout(() => {
      box.hidden = true;
      box.classList.remove("hint");
    }, 1800);
  }

  function showFeedback(item, result) {
    const box = el("feedbackBox");
    box.hidden = false;
    box.classList.remove("hint", "warning");

    if (result.overclaimed) {
      box.classList.add("warning");
      el("feedbackHeadline").textContent = t("overclaimWarningTitle", state.lang);
      el("feedbackExplanation").textContent = t("overclaimWarningBody", state.lang);
      return;
    }

    const pct = Math.round(result.ratio * 100);
    el("feedbackHeadline").textContent =
      (state.lang === "th" ? "ความแม่นยำของข้อนี้: " : "Accuracy for this item: ") + pct + "%";
    el("feedbackExplanation").textContent = item.explanation ? bi(item.explanation, state.lang) : "";
  }

  function goToNext() {
    if (!isLastItemOfStage()) {
      state.itemIndex += 1;
      renderItem();
      return;
    }
    if (!isLastStage()) {
      state.stageIndex += 1;
      state.itemIndex = 0;
      renderItem();
      return;
    }
    showResults();
  }

  // -------------------------------------------------------------------
  // Results & local practice summary
  // -------------------------------------------------------------------

  function average(list) {
    if (!list.length) return 0;
    return (list.reduce((a, b) => a + b, 0) / list.length) * 100;
  }

  function showResults() {
    const stageAccuracies = {
      s1: average(state.stageResults.s1),
      s2: average(state.stageResults.s2),
      s3: average(state.stageResults.s3),
      s4: average(state.stageResults.s4),
    };
    const outcome = evaluateLearningOutcome(stageAccuracies);
    state.lastOutcome = outcome;

    el("rankBadge").textContent = outcome.badge;
    el("rankTitle").textContent = bi(outcome.title, state.lang);
    el("rankDescription").textContent = bi(outcome.description, state.lang);
    el("overallAccuracyValue").textContent = Math.round(outcome.accuracy) + "%";

    const breakdown = el("stageBreakdown");
    breakdown.innerHTML = "";
    STAGES.forEach((stage) => {
      const row = document.createElement("div");
      row.className = "breakdown-row";
      const label = document.createElement("span");
      label.textContent = t(stage.nameKey, state.lang);
      const value = document.createElement("span");
      value.className = "mono";
      value.textContent = Math.round(stageAccuracies[stage.key]) + "%";
      row.appendChild(label);
      row.appendChild(value);
      breakdown.appendChild(row);
    });

    showScreen("screen-results");
  }

  function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function openPracticeSummary() {
    const dateStr = formatLocalDate(new Date());
    el("certName").textContent = state.player.name;
    el("certId").textContent = state.player.id;
    el("certDate").textContent = dateStr;
    el("certRankLabel").textContent = state.lang === "th" ? "ช่วงผลการฝึก" : "Practice band";
    el("certRankValue").textContent = bi(state.lastOutcome.title, state.lang);
    el("certAccuracy").textContent = Math.round(state.lastOutcome.accuracy) + "%";
    el("certSignature").textContent = state.lang === "th"
      ? "สร้างในเบราว์เซอร์นี้เท่านั้น — ไม่ใช่ระเบียนทางการหรือระเบียนที่ตรวจสอบได้"
      : "Generated in this browser only — not an official or verifiable record.";
    el("certModal").hidden = false;
  }

  // -------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------

  function resetGame() {
    state.stageIndex = 0;
    state.itemIndex = 0;
    state.stageResults = { s1: [], s2: [], s3: [], s4: [] };
    el("stageIndicator").hidden = true;
    showScreen("screen-start");
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyStaticI18n();

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lang = setLanguage(btn.getAttribute("data-lang"));
        applyStaticI18n();
        const activeScreen = document.querySelector(".screen.active");
        if (activeScreen && activeScreen.id === "screen-stage") {
          renderItem();
        } else if (activeScreen && activeScreen.id === "screen-results") {
          showResults();
        }
      });
    });

    el("startForm").addEventListener("submit", (e) => {
      e.preventDefault();
      state.player.name = el("playerName").value.trim();
      state.player.id = el("playerId").value.trim();
      if (!state.player.name || !state.player.id) return;
      el("stageIndicator").hidden = false;
      showScreen("screen-stage");
      renderItem();
    });

    el("submitBtn").addEventListener("click", handleSubmit);
    el("nextBtn").addEventListener("click", goToNext);
    el("playAgainBtn").addEventListener("click", resetGame);
    el("certBtn").addEventListener("click", openPracticeSummary);
    el("certCloseBtn").addEventListener("click", () => {
      el("certModal").hidden = true;
    });
    el("certPrintBtn").addEventListener("click", () => window.print());
  });
})();
