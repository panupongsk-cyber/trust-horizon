/**
 * Trust Horizon - UI chrome strings and language resolution.
 *
 * Scenario/content bilingual text lives in game-core.js next to the data it labels. This
 * file only holds fixed interface chrome, shared by 305331 (Thai-first) and 316331
 * (English-only) through the same games-portal. Same technical pattern as the other new
 * games' i18n.js.
 */

const SUPPORTED_LANGS = ["th", "en"];
const DEFAULT_LANG = "en";
const LANG_STORAGE_KEY = "thrz_lang";

function resolveLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lang");
    if (fromQuery && SUPPORTED_LANGS.includes(fromQuery)) {
      window.localStorage.setItem(LANG_STORAGE_KEY, fromQuery);
      return fromQuery;
    }
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch (e) {
    // localStorage or URLSearchParams unavailable (e.g. under Node for tests) - fall through.
  }
  return DEFAULT_LANG;
}

function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return DEFAULT_LANG;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // Ignore storage failures; the toggle still works for the current page view.
  }
  return lang;
}

const UI_STRINGS = {
  gameTitle: { th: "เกม Trust Horizon", en: "Trust Horizon" },
  gameSubtitle: {
    th: "ตัดสินขอบเขตของ AI threat model กับ trust dependency ตัดสินขอบเขตของหลักฐาน data/model attack กับ attestation ตัดสิน authorization ของ retrieval กับ algorithm/implementation และตัดสินสิทธิ์ของ agent กับข้อจำกัดของ platform hardening",
    en: "Judge AI-threat-model and trust-dependency boundaries, judge data/model-attack and attestation evidence scope, decide retrieval authorization and algorithm-vs-implementation claims, and judge agent action levels and platform-hardening limits",
  },
  startPrompt: { th: "กรอกชื่อและรหัสนักศึกษาเพื่อเริ่ม", en: "Enter your name and student ID to begin" },
  nameLabel: { th: "ชื่อ-นามสกุล", en: "Full name" },
  idLabel: { th: "รหัสนักศึกษา", en: "Student ID" },
  startButton: { th: "เริ่มสำรวจขอบฟ้า", en: "Start the survey" },
  stageLabel: { th: "ด่านที่", en: "Stage" },
  timeLeft: { th: "เวลาที่เหลือ", en: "Time left" },
  submitButton: { th: "ส่งคำตอบ", en: "Submit" },
  nextButton: { th: "ถัดไป", en: "Next" },
  seeResultsButton: { th: "ดูผลลัพธ์", en: "See results" },
  playAgainButton: { th: "เล่นอีกครั้ง", en: "Play again" },
  generateCertificateButton: { th: "สร้างใบรับรอง", en: "Generate certificate" },
  printButton: { th: "พิมพ์ / บันทึกเป็น PDF", en: "Print / Save as PDF" },
  closeButton: { th: "ปิด", en: "Close" },
  resultsTitle: { th: "สรุปผลการสำรวจ Trust Horizon", en: "Trust Horizon survey summary" },
  overallAccuracy: { th: "ความแม่นยำโดยรวม", en: "Overall accuracy" },
  stage1Name: { th: "ด่าน 1: Threat & Trust Maps", en: "Stage 1: Threat & Trust Maps" },
  stage2Name: { th: "ด่าน 2: Evidence Scope", en: "Stage 2: Evidence Scope" },
  stage3Name: { th: "ด่าน 3: Layers of Trust", en: "Stage 3: Layers of Trust" },
  stage4Name: { th: "ด่าน 4: Agency & Hardening", en: "Stage 4: Agency & Hardening" },
  overclaimWarningTitle: { th: "คำเตือน: กล่าวเกินหลักฐานที่มี", en: "Warning: overclaiming beyond the evidence" },
  overclaimWarningBody: {
    th: "แผนที่ threat/trust ที่ครบถ้วน ป้ายกำกับเอกสาร attestation ที่ผ่าน ความแข็งแรงเชิงคณิตศาสตร์ของ algorithm หรือ log ของ agent ล้วนสนับสนุนข้อกล่าวอ้างที่แคบและเฉพาะเจาะจงเท่านั้น ไม่ได้พิสูจน์หรือรับประกันความปลอดภัยทั้งหมดโดยอัตโนมัติ การสรุปเกินขอบเขตนี้เป็นการกล่าวเกินหลักฐาน",
    en: "A complete threat/trust map, a document label, a passed attestation check, an algorithm's mathematical strength, or an agent's log each support only a narrow, specific claim — none of them automatically proves or guarantees overall safety. Going beyond that is an overclaim.",
  },
  certName: { th: "ชื่อ", en: "Name" },
  certId: { th: "รหัสนักศึกษา", en: "Student ID" },
  certDate: { th: "วันที่", en: "Date" },
  certSignature: { th: "รหัสยืนยันผล", en: "Verification signature" },
  langToggleLabel: { th: "ภาษา", en: "Language" },
};

function t(key, lang) {
  const entry = UI_STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry[DEFAULT_LANG];
}

function bi(field, lang) {
  if (!field) return "";
  return field[lang] || field[DEFAULT_LANG] || "";
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    SUPPORTED_LANGS,
    DEFAULT_LANG,
    LANG_STORAGE_KEY,
    resolveLanguage,
    setLanguage,
    UI_STRINGS,
    t,
    bi,
  };
}
