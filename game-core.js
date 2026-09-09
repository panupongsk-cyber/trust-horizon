/**
 * Trust Horizon - Core Logic & Scenario Bank
 * 305331 / 316331 Computer and Information Security, Naresuan University
 * Chapter 17 (AI Security: Machine Learning, Generative AI, and Agents, MLO17.1-17.4) and
 * Chapter 18 (Trusted Computing and Side-Channel Attacks, MLO18.1-18.4)
 *
 * Every scenario is synthetic and grounded in the Student Project Portal case used across
 * the 305331 textbook (see textbook/lecture-notes/chapter-17/00-chapter.md and
 * chapter-18/00-chapter.md). Bilingual text is stored as { th, en } pairs; UI chrome strings
 * live separately in i18n.js.
 *
 * Every item carries its own `kind`, dispatched by app.js, mirroring the eleven existing new
 * games. Mechanics here (classify, authorization decisions, claim-judgment) are all reused
 * rather than inventing new UI. Each stage pairs one AI-security MLO with one
 * trusted-computing MLO on a shared theme, the same two-chapter combination pattern used by
 * vault-signature-bench/ (chapters 5+7) and endpoint-frontier/ (chapters 15+16).
 */

// ---------------------------------------------------------------------------
// Shared vocabularies
// ---------------------------------------------------------------------------

const DECISION = {
  ALLOW: { th: "Allow", en: "Allow" },
  DENY: { th: "Deny", en: "Deny" },
};

const CLAIM_VERDICT = {
  CAN_CLAIM: { th: "กล่าวได้", en: "Can claim" },
  CANNOT_CLAIM_YET: { th: "ยังกล่าวไม่ได้", en: "Cannot claim yet" },
};

const AGENT_ACTION_LEVEL = {
  AGENT_OK: { th: "ให้ agent ทำได้เอง", en: "The agent can do this on its own" },
  HUMAN_APPROVAL: { th: "ต้องมี human approval", en: "Needs human approval" },
  DENY: { th: "ปฏิเสธ", en: "Deny" },
};

// ---------------------------------------------------------------------------
// Stage 1 (MLO17.1 + MLO18.1) - Threat/trust maps: what they do and don't prove
// ---------------------------------------------------------------------------

const STAGE1_MAPPING = [
  {
    id: "S1-1",
    kind: "claims",
    title: { th: "Asset/attack-surface map ของ Course Assistant", en: "The Course Assistant's asset/attack-surface map" },
    scenario: {
      th: "ทีมสร้าง asset/attack-surface map ของ Course Assistant ครบทุกส่วน ตั้งแต่เอกสารรายวิชา, vector store, inference API, tool และผู้ใช้",
      en: "The team has completed an asset/attack-surface map of the Course Assistant, covering course documents, the vector store, the inference API, tools, and users.",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "แผนที่นี้ช่วยแยกว่า \"ผู้ช่วยตอบจากเอกสารรายวิชาได้\" ต่างจาก \"ผู้ช่วยเห็นข้อมูลลงทะเบียนของผู้ใช้คนนี้ได้\" และ claim หลังต้องเชื่อมกับ identity และ authorization ที่ใช้จริง",
          en: "This map helps distinguish \"the assistant can answer from course documents\" from \"the assistant can see this user's registration data\" — and the latter claim must be tied to real identity and authorization.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจากสร้าง asset/attack-surface map ครบทุกส่วนแล้ว จึงสรุปได้ว่าไม่มี security risk ใดเหลืออยู่",
          en: "Since the asset/attack-surface map is now complete for every part, it can be concluded that no security risk remains.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    bonusQuestion: {
      prompt: {
        th: "AI security ต่างจาก AI safety อย่างไร",
        en: "How does AI security differ from AI safety?",
      },
      options: [
        {
          id: "B_SECURITY_VS_SAFETY",
          th: "Security มุ่งลดความเสี่ยงต่อ confidentiality, integrity, availability และการควบคุมการเข้าถึงจากผู้โจมตี ส่วน safety สนใจพฤติกรรมที่อาจไม่ปลอดภัยแม้ไม่มีผู้โจมตี ทั้งสองเกี่ยวข้องกันแต่ใช้แทนกันไม่ได้",
          en: "Security focuses on reducing risk to confidentiality, integrity, availability, and access control from an attacker; safety concerns behavior that may be unsafe even with no attacker present. The two are related but not interchangeable",
          correct: true,
        },
        {
          id: "B_SAME_THING",
          th: "ทั้งสองคำหมายถึงสิ่งเดียวกันและใช้แทนกันได้เสมอ",
          en: "Both terms mean the same thing and can always be used interchangeably",
          correct: false,
        },
        {
          id: "B_SAFETY_SUBSET_SECURITY",
          th: "Safety เป็นเพียงหัวข้อย่อยของ security ที่ไม่จำเป็นต้องแยกพิจารณา",
          en: "Safety is just a minor subtopic of security that never needs separate consideration",
          correct: false,
        },
      ],
    },
  },
  {
    id: "S1-2",
    kind: "claims",
    title: { th: "Trust-dependency map ของ gateway", en: "The gateway's trust-dependency map" },
    scenario: {
      th: "gateway ของ Portal ใช้ key เพื่อยืนยันการสื่อสารกับ service กลาง ทีมต้องการยืนยัน claim ว่า \"key ไม่ถูกใช้โดย process ทั่วไป\"",
      en: "The Portal's gateway uses a key to authenticate its communication with the central service. The team wants to support the claim \"the key is not used by ordinary processes.\"",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "การทำ trust-dependency map ช่วยให้เห็นว่า claim นี้พึ่งพา hardware key store, firmware ที่เริ่มต้น platform, ระบบปฏิบัติการที่แยก process และ policy ที่กำหนดว่า service ใดเรียก operation ได้ ร่วมกันหลายส่วน",
          en: "A trust-dependency map shows that this claim relies jointly on the hardware key store, the firmware that starts the platform, the OS's process separation, and the policy defining which service may invoke the operation.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจากทราบว่า gateway มี chip เก็บ key ชนิดหนึ่งอยู่แล้ว จึงสรุปได้ว่า claim ทั้งหมดเป็นจริง",
          en: "Since it's already known that the gateway has some kind of key-storage chip, it can be concluded that the whole claim is true.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    explanation: {
      th: "หากมีเพียงข้อมูลว่า gateway มี chip ชนิดหนึ่ง ยังสรุปไม่ได้ว่า claim ทั้งหมดเป็นจริง เพราะยังไม่ทราบ policy, firmware version, identity ของ service หรือวิธีที่ระบบตรวจผลจากองค์ประกอบเหล่านั้น",
      en: "Knowing only that the gateway has some chip is not enough to conclude the whole claim holds — the policy, firmware version, service identity, and how the system verifies these components are all still unknown.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 2 (MLO17.2 + MLO18.2) - Data/model attacks and attestation scope
// ---------------------------------------------------------------------------

const STAGE2_EVIDENCE_SCOPE = [
  {
    id: "S2-1",
    kind: "claims",
    title: { th: "เอกสาร FAQ ที่มีคำแนะนำล้าสมัย", en: "An FAQ document with outdated advice" },
    scenario: {
      th: "Course Assistant รับเอกสาร FAQ จากหลายฝ่าย ภายหลังพบว่าเอกสารหนึ่งมีคำแนะนำเก่าที่ขัดกับประกาศล่าสุด และเอกสารนั้นถูกใช้เป็น context ในการตอบคำถาม",
      en: "The Course Assistant ingests FAQ documents from several parties. It later turns out one document contains outdated advice that contradicts the latest announcement, and that document is being used as context to answer questions.",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "ปัญหานี้สัมพันธ์กับ integrity และ provenance ของ knowledge source แม้ model หลักจะไม่เปลี่ยนรุ่น ทีมควรระบุเจ้าของเอกสาร รุ่น/วันที่ และกติกาว่าเอกสารใดเข้าสู่ฐานค้นหาได้",
          en: "This is a knowledge-source integrity and provenance problem even though the main model hasn't changed versions — the team should identify the document's owner, version/date, and the rule for what enters the search index.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจากเอกสารมี label \"เอกสารทางการ\" จึงตีความได้ว่าเนื้อหาถูกต้องตลอดเวลาโดยไม่ต้องมีวงจรปรับปรุง",
          en: "Since the document is labeled \"official,\" its content can be interpreted as correct at all times, with no need for a review cycle.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    bonusQuestion: {
      prompt: {
        th: "การพบว่ามี model extraction เกิดขึ้น หมายความว่าอย่างไร",
        en: "What does finding that model extraction has occurred actually mean?",
      },
      options: [
        {
          id: "B_EXTRACTION_NOT_FULL_COPY",
          th: "ไม่ได้แปลว่า model ถูกคัดลอกสมบูรณ์เสมอไป ต้องประเมินว่า model ให้ข้อมูลอะไรผ่าน interface, ใครเรียกได้ และ logging/quota เป็นอย่างไร",
          en: "It does not always mean the model has been fully copied — it still needs assessing what information the model reveals through its interface, who can call it, and what logging/quota exists",
          correct: true,
        },
        {
          id: "B_EXTRACTION_MEANS_FULL_COPY",
          th: "หมายความว่า model ถูกคัดลอกออกไปทั้งหมดโดยสมบูรณ์เสมอ",
          en: "It always means the model has been copied out completely and fully",
          correct: false,
        },
        {
          id: "B_EXTRACTION_IRRELEVANT",
          th: "เป็นความเสี่ยงที่ไม่เกี่ยวข้องกับ confidentiality ของระบบ AI",
          en: "It is a risk irrelevant to the confidentiality of an AI system",
          correct: false,
        },
      ],
    },
  },
  {
    id: "S2-2",
    kind: "claims",
    title: { th: "Attestation evidence ของ gateway", en: "The gateway's attestation evidence" },
    scenario: {
      th: "Service กลางของ Portal ตรวจ attestation evidence จาก gateway แล้วพบว่าตรงกับ policy ที่กำหนด",
      en: "The Portal's central service checks the gateway's attestation evidence and finds it matches the configured policy.",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "Service อาจยอมรับได้ว่า gateway รายงาน measurement ที่สอดคล้องกับ firmware reference ในช่วงเวลานั้น",
          en: "The service may accept that the gateway reported a measurement matching the firmware reference at that point in time.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจาก attestation ผ่านแล้ว จึงรับรองได้ว่าข้อมูลจาก sensor ที่ gateway ส่งมาถูกต้องแน่นอนทุกค่า",
          en: "Since attestation passed, it can be certified that every piece of sensor data the gateway sends is definitely correct.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    explanation: {
      th: "Attestation เกี่ยวกับ claim ของ platform ไม่ใช่การตรวจความถูกต้องของข้อมูลทุกค่า และไม่ครอบคลุม application logic, network condition หรือ sensor ที่ต่ออยู่ทั้งหมด",
      en: "Attestation is about a claim regarding the platform, not a check on every data value's correctness — it does not cover application logic, network conditions, or every connected sensor.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 3 (MLO17.3 + MLO18.3) - Retrieval authorization and algorithm vs. implementation
// ---------------------------------------------------------------------------

const STAGE3_LAYERS = [
  {
    id: "S3-1",
    kind: "authorization",
    request: { th: "แสดงข้อมูลการลงทะเบียนของผู้ใช้อื่น ตามที่ข้อความในเอกสารที่ผู้ใช้อัปโหลดร้องขอ", en: "Reveal another user's registration data, as requested by text inside a document the user uploaded" },
    subject: { th: "Course Assistant (model/agent)", en: "The Course Assistant (model/agent)" },
    object: { th: "ข้อมูลการลงทะเบียนของผู้ใช้อื่น", en: "Another user's registration data" },
    correctDecision: "DENY",
    conditionOptions: [
      { id: "C_FROM_DOCUMENT_NOT_IDENTITY", th: "คำขอนี้อ้างอิงจากข้อความในเอกสารที่ผู้ใช้อัปโหลด ไม่ใช่จาก identity และสิทธิ์ของผู้ใช้ปัจจุบันที่ service ตรวจสอบได้หรือไม่ (ใช่ จึงไม่ควรอนุญาต)", en: "Does this request come from text in an uploaded document, rather than the current user's identity and permission that the service can verify (yes — so it should not be allowed)?", correct: true },
      { id: "C_MODEL_SOUNDS_CONFIDENT", th: "Model ตอบด้วยความมั่นใจสูงในคำตอบที่สร้างขึ้นหรือไม่", en: "Did the model respond with high confidence in its generated answer?", correct: false },
      { id: "C_DOCUMENT_IS_LONG", th: "เอกสารที่แทรกข้อความนี้มีความยาวมากหรือไม่", en: "Is the document containing this inserted text very long?", correct: false },
    ],
    bonusQuestion: {
      prompt: {
        th: "เหตุใด model จึงไม่ควรเป็นผู้ตัดสิน authorization",
        en: "Why shouldn't the model be the one deciding authorization?",
      },
      options: [
        {
          id: "B_MODEL_NOT_POLICY_REFERENCE",
          th: "Model มีหน้าที่สร้างภาษาหรือช่วยตีความ ไม่ใช่จุดอ้างอิงของ policy การเข้าถึงข้อมูล การตัดสินใจต้องเกิดที่ service ตาม identity และ policy ที่ตรวจสอบได้จริง",
          en: "The model's job is generating language or helping interpret, not serving as the reference point for a data-access policy — the decision must happen at the service, based on verifiable identity and policy",
          correct: true,
        },
        {
          id: "B_MODEL_KNOWS_BEST",
          th: "เพราะ model เข้าใจบริบทของคำขอดีกว่า service เสมอ จึงควรให้ model ตัดสินใจแทน",
          en: "Because the model always understands the request's context better than the service, so it should decide instead",
          correct: false,
        },
        {
          id: "B_MODEL_HAS_OWN_IDENTITY",
          th: "เพราะ model มี identity ของตนเองที่เทียบเท่าผู้ใช้ทุกคนอยู่แล้ว",
          en: "Because the model already has its own identity equivalent to every user",
          correct: false,
        },
      ],
    },
  },
  {
    id: "S3-2",
    kind: "claims",
    title: { th: "\"Algorithm ปลอดภัย จึง implementation ก็ปลอดภัยด้วย\"", en: "\"The algorithm is secure, so the implementation is too\"" },
    scenario: {
      th: "ทีมเลือก algorithm cryptographic มาตรฐานสำหรับ gateway แล้วกล่าวว่า \"algorithm มีคุณสมบัติด้าน confidentiality ตามสมมติฐานที่กำหนด จึง implementation ไม่เปิดเผยข้อมูลผ่าน timing ด้วยเช่นกัน\"",
      en: "The team chose a standard cryptographic algorithm for the gateway and says \"the algorithm has confidentiality properties under its stated assumptions, so the implementation doesn't leak information through timing either.\"",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "ความแข็งแรงเชิงคณิตศาสตร์ของ algorithm ไม่ได้หมายความว่า implementation ปิดข้อมูลทุกชนิดเสมอไป ต้องแยกคำถามว่า algorithm ปลอดภัยตามสมมติฐานหรือไม่ กับ implementation/platform มีพฤติกรรมที่เผยความสัมพันธ์กับ secret หรือไม่",
          en: "An algorithm's mathematical strength doesn't mean the implementation always seals off every kind of data — whether the algorithm is secure under its assumptions and whether the implementation/platform behaves in a way that reveals a relationship with the secret are two separate questions.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจาก algorithm มีคุณสมบัติด้าน confidentiality ตามสมมติฐานทางคณิตศาสตร์แล้ว จึงสรุปได้ว่า implementation ไม่เปิดเผยข้อมูลผ่าน timing ด้วยเช่นกัน",
          en: "Since the algorithm has confidentiality properties under its mathematical assumptions, it can be concluded that the implementation also doesn't leak information through timing.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    explanation: {
      th: "คำตอบต่อคำถามว่า algorithm ปกป้องข้อมูลตามสมมติฐานหรือไม่ อาจเป็นบวก ขณะที่คำตอบต่อคำถามว่า implementation เปิดเผยความสัมพันธ์กับ secret หรือไม่ ยังต้องขึ้นกับ hardware, compiler, runtime และสภาพแวดล้อม",
      en: "The answer to whether the algorithm protects data under its assumptions may be yes, while whether the implementation reveals a relationship with the secret still depends on the hardware, compiler, runtime, and environment.",
    },
  },
];

// ---------------------------------------------------------------------------
// Stage 4 (MLO17.4 + MLO18.4) - Agent action levels and platform-hardening overclaims
// ---------------------------------------------------------------------------

const STAGE4_AGENCY = [
  {
    id: "S4-1",
    kind: "tool_select",
    prompt: {
      th: "Agent อ่านสถานะการลงทะเบียนของผู้ใช้ที่กำลังสนทนาอยู่ในขณะนี้",
      en: "The agent reads the registration status of the user currently chatting with it.",
    },
    options: ["AGENT_OK", "HUMAN_APPROVAL", "DENY"],
    correct: "AGENT_OK",
    explanation: {
      th: "การอ่านข้อมูลของผู้ใช้ปัจจุบันเองตามหน้าที่ที่ตั้งใจไว้ มีผลกระทบต่ำและเป็นหน้าที่ที่เหมาะสมของ agent",
      en: "Reading the current user's own data, as intended, has low impact and is an appropriate task for the agent.",
    },
  },
  {
    id: "S4-2",
    kind: "tool_select",
    prompt: {
      th: "Agent ร่างคำร้องให้เจ้าหน้าที่พิจารณา โดยให้ผู้ใช้ตรวจทานก่อนส่ง",
      en: "The agent drafts a request for staff review, with the user reviewing it before it is sent.",
    },
    options: ["AGENT_OK", "HUMAN_APPROVAL", "DENY"],
    correct: "AGENT_OK",
    explanation: {
      th: "การร่างคำร้องที่ผู้ใช้ยังต้องตรวจทานก่อนส่งเป็นงานที่ผลกระทบจำกัดและย้อนอธิบายได้ เหมาะกับ agent",
      en: "Drafting a request the user still reviews before sending has limited, explainable impact and suits the agent.",
    },
  },
  {
    id: "S4-3",
    kind: "tool_select",
    prompt: {
      th: "อนุมัติคำร้องที่ส่งเข้าสู่ระบบแล้ว",
      en: "Approving a request that has already been submitted.",
    },
    options: ["AGENT_OK", "HUMAN_APPROVAL", "DENY"],
    correct: "HUMAN_APPROVAL",
    explanation: {
      th: "การอนุมัติกระทบผลลัพธ์ที่เป็นทางการของผู้ใช้ จึงควรมี human approval ตามหลักการใช้กับ action ที่กระทบผู้ใช้หรือข้อมูลสำคัญ",
      en: "Approval affects the user's official outcome, so it needs human approval, consistent with the principle for actions affecting users or important data.",
    },
  },
  {
    id: "S4-4",
    kind: "tool_select",
    prompt: {
      th: "เปลี่ยนสถานะการลงทะเบียนของผู้ใช้คนอื่น เพียงเพราะข้อความใน chat ขอให้ทำ",
      en: "Changing another user's registration status, simply because a chat message asked for it.",
    },
    options: ["AGENT_OK", "HUMAN_APPROVAL", "DENY"],
    correct: "DENY",
    explanation: {
      th: "ไม่ควรให้ agent เปลี่ยนสถานะลงทะเบียนหรืออ่านข้อมูลของผู้อื่นเพียงเพราะข้อความใน chat ขอให้ทำ เพราะเป็นการขยายสิทธิ์เกินหน้าที่ที่จำเป็น",
      en: "The agent should not change another user's registration status or read their data just because a chat message asked — that would extend its privilege beyond what its task requires.",
    },
    bonusQuestion: {
      prompt: {
        th: "เหตุใด \"agent มี log แล้ว\" จึงไม่พิสูจน์ว่า decision ของ model ถูกต้อง",
        en: "Why doesn't \"the agent has a log\" prove the model's decision was correct?",
      },
      options: [
        {
          id: "B_LOG_EXPLAINS_NOT_VALIDATES",
          th: "Log ช่วยอธิบายเหตุการณ์ที่เกิดขึ้น แต่ไม่ทำให้ decision ของ model ถูกต้องหรือเหมาะสมขึ้นมาเอง",
          en: "A log helps explain what happened, but it doesn't itself make the model's decision correct or appropriate",
          correct: true,
        },
        {
          id: "B_LOG_PROVES_CORRECTNESS",
          th: "Log พิสูจน์ได้เสมอว่าการตัดสินใจของ model ถูกต้องตามเป้าหมาย",
          en: "A log always proves the model's decision was correct for its goal",
          correct: false,
        },
        {
          id: "B_LOG_IRRELEVANT",
          th: "Log ไม่มีประโยชน์ใด ๆ ต่อการวิเคราะห์เหตุการณ์ของ agent เลย",
          en: "A log is of no use whatsoever for analyzing an agent's events",
          correct: false,
        },
      ],
    },
  },
  {
    id: "S4-5",
    kind: "claims",
    title: { th: "\"มี TPM, secure boot และ cryptography มาตรฐาน จึงป้องกันได้ทั้งหมด\"", en: "\"It has TPM, secure boot, and standard cryptography, so it's fully protected\"" },
    scenario: {
      th: "ผู้ผลิตระบุว่า gateway มี TPM, secure boot และใช้ cryptography มาตรฐาน จึง \"ป้องกันการโจมตีได้ทั้งหมด\"",
      en: "A manufacturer states that the gateway has a TPM, secure boot, and uses standard cryptography, so it \"protects against all attacks.\"",
    },
    claims: [
      {
        id: "C1",
        text: {
          th: "เทคโนโลยีเหล่านี้ช่วยสนับสนุนการเริ่ม boot ตาม policy การเก็บ/ใช้ key ตามกลไกของ TPM และปกป้องคุณสมบัติบางส่วนของการสื่อสาร แต่ยังต้องรู้ firmware lifecycle, policy ของ key, application logic, identity, ตำแหน่งติดตั้ง และ adversary model ก่อนกล่าวถึงความเสี่ยงโดยรวม",
          en: "These technologies help support policy-compliant boot, TPM-mechanism key storage/use, and protecting some communication properties — but firmware lifecycle, key policy, application logic, identity, installation location, and the adversary model still need to be known before speaking to overall risk.",
        },
        correctVerdict: "CAN_CLAIM",
        trap: false,
      },
      {
        id: "C2",
        text: {
          th: "เนื่องจาก gateway มี TPM, secure boot และใช้ cryptography มาตรฐานแล้ว จึงป้องกันการโจมตีได้ทั้งหมดจริงตามที่ผู้ผลิตกล่าวอ้าง",
          en: "Since the gateway has TPM, secure boot, and standard cryptography, it really does protect against all attacks, as the manufacturer claims.",
        },
        correctVerdict: "CANNOT_CLAIM_YET",
        trap: true,
      },
    ],
    bonusQuestion: {
      prompt: {
        th: "Residual risk คืออะไร และเหตุใดจึงต้องสื่อสารให้ผู้ตัดสินใจทราบ",
        en: "What is residual risk, and why must it be communicated to decision-makers?",
      },
      options: [
        {
          id: "B_RESIDUAL_RISK_MUST_COMMUNICATE",
          th: "ความเสี่ยงที่ยังเหลืออยู่หลังใช้มาตรการแล้ว ต้องสื่อสารตรงไปตรงมาเพื่อให้ผู้ตัดสินใจรับทราบขอบเขตของการป้องกันจริง แทนที่จะเชื่อว่าไม่มีความเสี่ยงเหลือ",
          en: "The risk that remains after mitigations are applied — it must be communicated plainly so decision-makers know the real scope of protection, instead of believing no risk remains",
          correct: true,
        },
        {
          id: "B_RESIDUAL_RISK_ZERO_AFTER_MITIGATION",
          th: "ความเสี่ยงที่หมดไปโดยอัตโนมัติเมื่อใช้มาตรการป้องกันใด ๆ แล้ว",
          en: "Risk that automatically disappears once any mitigation is applied",
          correct: false,
        },
        {
          id: "B_RESIDUAL_RISK_ONLY_VENDOR_CONCERN",
          th: "เป็นเรื่องที่ผู้ผลิตต้องจัดการเท่านั้น ไม่เกี่ยวข้องกับผู้ตัดสินใจใช้งาน",
          en: "Something only the manufacturer needs to manage, unrelated to the deployment decision-maker",
          correct: false,
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/** Same speed-bonus formula used across the other 305331 games. */
function calculateScore(basePoints, timeElapsedSeconds, maxTimeSeconds = 45) {
  if (timeElapsedSeconds >= maxTimeSeconds) {
    return Math.floor(basePoints * 0.5);
  }
  const speedRatio = (maxTimeSeconds - timeElapsedSeconds) / maxTimeSeconds;
  const speedBonus = Math.floor(basePoints * 0.5 * speedRatio);
  return basePoints + speedBonus;
}

function scoreToolSelect(item, answer) {
  const mainCorrect = answer.choice === item.correct;
  if (!item.bonusQuestion) {
    return { ratio: mainCorrect ? 1 : 0 };
  }
  const chosenBonus = item.bonusQuestion.options.find((b) => b.id === answer.bonusId);
  const bonusCorrect = !!(chosenBonus && chosenBonus.correct);
  return { ratio: (mainCorrect ? 0.6 : 0) + (bonusCorrect ? 0.4 : 0) };
}

function scoreAuthorization(item, answer) {
  const decisionCorrect = answer.decision === item.correctDecision;
  const chosenCondition = item.conditionOptions.find((c) => c.id === answer.conditionId);
  const conditionCorrect = !!(chosenCondition && chosenCondition.correct);

  let ratio;
  if (item.bonusQuestion) {
    const chosenBonus = item.bonusQuestion.options.find((b) => b.id === answer.bonusId);
    const bonusCorrect = !!(chosenBonus && chosenBonus.correct);
    ratio = (decisionCorrect ? 0.4 : 0) + (conditionCorrect ? 0.3 : 0) + (bonusCorrect ? 0.3 : 0);
  } else {
    ratio = (decisionCorrect ? 0.5 : 0) + (conditionCorrect ? 0.5 : 0);
  }
  return { ratio };
}

/**
 * Both chapters share the same epistemic-hygiene pattern: a completed threat/trust map, a
 * document label, a passed attestation check, an algorithm's mathematical strength, or an
 * agent's activity log each support only a narrow, specific claim. None of them alone proves
 * the broader thing overclaimed here (no remaining risk, unconditional truth, sensor-data
 * correctness, implementation-level safety, or full protection against every attack). Marking
 * any trap claim "can claim" scores that item zero, the same overclaim rule used in
 * vault-signature-bench/, network-ops-center/, api-gatekeeper/, hardening-bay/, soc-watch/,
 * cloud-custodian/, and endpoint-frontier/.
 */
function scoreClaims(item, answer) {
  const verdicts = answer.verdicts || {};
  const overclaimed = item.claims.some((c) => c.trap && verdicts[c.id] === "CAN_CLAIM");
  if (overclaimed) {
    return { ratio: 0, overclaimed: true };
  }

  const correctCount = item.claims.filter((c) => verdicts[c.id] === c.correctVerdict).length;
  const claimRatio = correctCount / item.claims.length;

  if (!item.bonusQuestion) {
    return { ratio: claimRatio, overclaimed: false };
  }
  const chosenBonus = item.bonusQuestion.options.find((b) => b.id === answer.bonusId);
  const bonusCorrect = !!(chosenBonus && chosenBonus.correct);
  return { ratio: 0.7 * claimRatio + 0.3 * (bonusCorrect ? 1 : 0), overclaimed: false };
}

// ---------------------------------------------------------------------------
// Outcome evaluation
// ---------------------------------------------------------------------------

function evaluateLearningOutcome(stageAccuracies) {
  const values = Object.values(stageAccuracies);
  const overallAccuracy =
    values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

  let rank = {
    badge: "🤖",
    title: { th: "ผู้เฝ้าขอบฟ้าแห่งความเชื่อมั่นฝึกหัด", en: "Trust Horizon Trainee" },
    description: {
      th: "เริ่มต้นได้ดี ลองเล่นซ้ำเพื่อฝึกแยกขอบเขตของ AI threat model, trust dependency, authorization ของ agent และข้อจำกัดของ platform hardening ให้คล่องขึ้น",
      en: "A solid start — replay to get faster at AI threat-model and trust-dependency boundaries, agent authorization, and platform-hardening limits.",
    },
  };

  if (overallAccuracy >= 90) {
    rank = {
      badge: "🛡️",
      title: { th: "หัวหน้าฝ่ายความมั่นคงปลอดภัย AI และ Trusted Computing", en: "Chief AI & Trusted Computing Security Officer" },
      description: {
        th: "วิเคราะห์ AI threat model, trust dependency, authorization ของ agent และข้อจำกัดของ platform hardening ได้แม่นยำครบทุกมิติ ไม่กล่าวเกินหลักฐานที่มี",
        en: "Analyzes AI threat models, trust dependencies, agent authorization, and platform-hardening limits accurately across every dimension, and never overclaims beyond the evidence.",
      },
    };
  } else if (overallAccuracy >= 75) {
    rank = {
      badge: "🔍",
      title: { th: "นักวิเคราะห์ความน่าเชื่อถืออาวุโส", en: "Senior Trust & AI Security Analyst" },
      description: {
        th: "ตัดสินใจถูกต้องเป็นส่วนใหญ่ ยังพลาดบ้างในรายละเอียดของขอบเขตหลักฐานหรือผลกระทบ",
        en: "Makes correct decisions most of the time, with a few slips on evidence scope or impact detail.",
      },
    };
  } else if (overallAccuracy >= 50) {
    rank = {
      badge: "🧭",
      title: { th: "นักวิเคราะห์ความน่าเชื่อถือ", en: "Trust & AI Security Analyst" },
      description: {
        th: "เข้าใจหลักการพื้นฐาน แต่ยังสับสนระหว่างกลไกที่สนับสนุน claim แคบ ๆ กับการรับประกันความปลอดภัยทั้งหมด หรือกล่าวเกินหลักฐานที่มี",
        en: "Grasps the basics, but still mixes up a mechanism supporting a narrow claim with a guarantee of overall safety, or overclaims beyond the evidence.",
      },
    };
  }

  return { accuracy: overallAccuracy, ...rank };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DECISION,
    CLAIM_VERDICT,
    AGENT_ACTION_LEVEL,
    STAGE1_MAPPING,
    STAGE2_EVIDENCE_SCOPE,
    STAGE3_LAYERS,
    STAGE4_AGENCY,
    calculateScore,
    scoreToolSelect,
    scoreAuthorization,
    scoreClaims,
    evaluateLearningOutcome,
  };
}
