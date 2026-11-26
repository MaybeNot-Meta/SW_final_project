const categoryData = {
  class: { label: "수업 과제", title: "수업에서 몰입했던 과제를 떠올려보세요", questions: ["어떤 수업 과제나 발표였나요?", "내가 맡은 역할과 맡기 어려웠던 점은?", "어떤 지식이나 기술을 실제로 활용했나요?"], color: "#4b82c3", light: "#edf4fc", text: "#315d91" },
  club: { label: "동아리", title: "동아리에서 책임지고 성장한 순간을 떠올려보세요", questions: ["동아리에서 맡은 활동이나 역할은 무엇인가요?", "팀원과 협업하며 해결한 어려움은?", "이 경험을 통해 얻은 역량은 무엇인가요?"], color: "#d6a62a", light: "#fff4cf", text: "#947019" },
  contest: { label: "대회·공모전", title: "새로운 도전을 시작했던 경험을 떠올려보세요", questions: ["어떤 대회나 공모전에 참여했나요?", "시작 전 막막했던 점과 준비 과정은?", "결과와 관계없이 얻은 배움은 무엇인가요?"], color: "#dc7d42", light: "#fff0e5", text: "#a85b2e" },
  work: { label: "알바·인턴", title: "일터에서 배운 경험을 떠올려보세요", questions: ["어떤 업무를 담당했나요?", "기존 방식과 달리 해결했던 일이 있었나요?", "이 경험에서 발견한 강점은 무엇인가요?"], color: "#7567bd", light: "#f0edfb", text: "#51468d" },
  volunteer: { label: "봉사", title: "누군가를 돕고 변화를 만든 경험을 떠올려보세요", questions: ["어떤 봉사 활동에 참여했나요?", "현장에서 마주한 어려움은 무엇인가요?", "나와 상대방에게 어떤 변화가 있었나요?"], color: "#cf6f91", light: "#fceaf1", text: "#9d4d68" },
  hobby: { label: "취미·자기계발", title: "꾸준히 몰입한 자기계발 경험을 떠올려보세요", questions: ["어떤 취미나 공부를 시작하게 되었나요?", "꾸준히 하기 위해 어떤 방법을 사용했나요?", "성장 과정에서 발견한 흥미와 역량은 무엇인가요?"], color: "#36a19a", light: "#e8f7f5", text: "#287b76" },
  award: { label: "수상·자격증", title: "성취를 인정받았던 경험을 떠올려보세요", questions: ["어떤 수상이나 자격을 얻었나요?", "준비 과정에서 어떤 노력을 했나요?", "이 성취가 내 목표와 어떻게 연결되나요?"], color: "#cf6259", light: "#fdeceb", text: "#98463f" },
  other: { label: "기타", title: "내 경험을 떠올려보세요", questions: ["어떤 경험이었나요?", "내가 한 일은 무엇인가요?", "그 경험에서 무엇을 배웠나요?"], color: "#667c92", light: "#f0f3f7", text: "#4f6072" }
};

const templateFields = {
  star: [["상황 (Situation)", "어떤 배경에서 경험이 시작됐나요?"], ["과제 (Task)", "나에게 주어진 목표나 과제는 무엇인가요?"], ["행동 (Action)", "목표를 위해 내가 직접 한 행동은 무엇인가요?"], ["결과 (Result)", "어떤 성과와 배움을 얻었나요?"]],
  kpt: [["유지할 점 (Keep)", "계속 유지하고 싶은 행동이나 좋은 점은?"], ["문제점 (Problem)", "어려웠거나 개선이 필요한 점은?"], ["시도할 점 (Try)", "다음에 시도할 구체적인 행동은?"]],
  free: [["경험 이야기", "당시 상황과 인상 깊었던 순간을 자유롭게 작성하세요"], ["배운 점", "이 경험을 통해 알게 된 점이나 앞으로의 다짐은?"]]
};

const recordTitleExamples = {
  class: "수업 발표에서 맡은 기획 및 분석 역할",
  club: "동아리 홍보팀 운영과 모집 성과",
  contest: "교내 공모전 기획안 제작과 발표",
  work: "카페 아르바이트에서 고객 응대 개선",
  volunteer: "지역아동센터 학습 멘토링 봉사",
  hobby: "매주 기록하며 완성한 영어 학습 계획",
  award: "정보처리기능사 자격증 준비 경험",
  other: "나에게 의미 있었던 활동"
};

// STEP 7: 모든 파트가 공통 저장소(records)를 사용합니다.
// 예시 기록은 실제 사용자의 기록과 혼동하지 않도록 자동 생성하지 않습니다.
const categoryAliases = {
  "수업 과제": "class", "동아리": "club", "동아리·대외활동": "club",
  "대회·공모전": "contest", "공모전": "contest", "알바·인턴": "work",
  "봉사": "volunteer", "취미·자기계발": "hobby", "취미로 만든 것": "hobby",
  "수상·자격증": "award"
};

function normalizeUiRecord(raw) {
  const categoryValue = raw.recordCategory || raw.category || "other";
  const category = categoryData[categoryValue]
    ? categoryValue
    : (categoryAliases[categoryValue] || "other");
  const templateValue = raw.recordUiTemplate || raw.template;
  const template = templateFields[templateValue] ? templateValue : "free";
  const fields = Array.isArray(raw.fields)
    ? raw.fields.map(field => String(field ?? ""))
    : [String(raw.content || ""), ""];
  return {
    ...raw,
    category,
    template,
    fields,
    summary: String(raw.summary || raw.content || "").slice(0, 160),
    tags: Array.isArray(raw.tags) ? raw.tags : []
  };
}

function loadUnifiedRecords() {
  return getRecords().map(normalizeUiRecord);
}

let records = loadUnifiedRecords();

let selectedCategory = "class";
// 이미 저장한 "경험 꺼내기" 기록을 다시 방문했을 때도 보여 줍니다.
// 신규 응답은 직무 매칭을 누르기 전까지 기존 기록을 변경하지 않습니다.
// 저장된 경험·태그·ID를 같은 행에 연결하여 재방문 및 수정 시에도 보존합니다.
const extractionSavedRows = getRecords().filter(record =>
  record.source === "경험꺼내기" && categoryData[record.recordCategory] && typeof record.content === "string"
);
let extractedExperiences = {};
let extractedTagChoices = {};
let extractedRecordIds = {};
extractionSavedRows.forEach(record => {
  const category = record.recordCategory;
  (extractedExperiences[category] ||= []).push(record.content);
  (extractedTagChoices[category] ||= []).push(Array.isArray(record.tags) ? [...record.tags] : []);
  (extractedRecordIds[category] ||= []).push(record.id);
});
// 다른 탭에서 저장한 경험 꺼내기 기록을 수정·삭제할 때 입력 캐시도 동기화합니다.
// 삭제 취소나 아직 저장하지 않은 다른 입력은 건드리지 않습니다.
function removeExtractedCacheById(id) {
  for (const [category, ids] of Object.entries(extractedRecordIds)) {
    const index = ids.findIndex(item => String(item) === String(id));
    if (index < 0) continue;
    ids.splice(index, 1);
    extractedExperiences[category]?.splice(index, 1);
    extractedTagChoices[category]?.splice(index, 1);
    return;
  }
}
function syncExtractedCacheRecord(record) {
  if (!record || record.source !== "경험꺼내기") return;
  removeExtractedCacheById(record.id);
  const category = categoryData[record.recordCategory] ? record.recordCategory : "other";
  (extractedExperiences[category] ||= []).push(record.content || "");
  (extractedTagChoices[category] ||= []).push([...(record.tags || [])]);
  (extractedRecordIds[category] ||= []).push(record.id);
}

let selectedRecords = new Set(); // ID는 문자열로 통일해 비교합니다.
let selectedTemplate = "star";
let viewDate = new Date();
let editingId = null;
let fullCalendarInstance = null;
let calHeatmapInstance = null;

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-button").forEach(button => {
    const active = button.dataset.tab === tabName;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
  document.getElementById(`${tabName}-panel`).classList.add("active");
  if (tabName === "extract") {
    updateGuide();
  }
  if (tabName === "calendar") renderCalendar();
  if (tabName === "list") renderRecords();
}

document.querySelectorAll(".tab-button").forEach(button => button.addEventListener("click", () => switchTab(button.dataset.tab)));

document.querySelectorAll(".extract-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".extract-tab").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    selectedCategory = tab.dataset.category;
    updateGuide();
  });
});

function updateGuide() {
  const data = categoryData[selectedCategory];
  document.getElementById("guideTag").textContent = data.label;
  document.getElementById("guideTitle").textContent = data.title;
  const guideTag = document.getElementById("guideTag");
  guideTag.style.background = data.light;
  guideTag.style.color = data.text;
  const extractWorkspace = document.querySelector(".extract-workspace");
  if (extractWorkspace) extractWorkspace.style.borderLeftColor = data.color;
  document.querySelectorAll(".extract-tab").forEach(tab => {
    const tabData = categoryData[tab.dataset.category];
    tab.classList.toggle("active", tab.dataset.category === selectedCategory);
    if (tab.dataset.category === selectedCategory) {
      tab.style.setProperty("--category-color", tabData.color);
      tab.style.background = tabData.light;
      tab.style.borderColor = tabData.color;
      tab.style.color = tabData.text;
    } else {
      tab.style.removeProperty("--category-color");
      tab.style.background = "";
      tab.style.borderColor = "";
      tab.style.color = "";
    }
  });
  const saved = extractedExperiences[selectedCategory] || [""];
  document.getElementById("questionList").innerHTML = data.questions.map((question, index) =>
    `<div class="question-item"><span>${index + 1}</span>${escapeHtml(question)}</div>`
  ).join("");
  document.getElementById("experienceInputList").innerHTML = "";
  saved.forEach((value, index) => addExperienceInput(index + 1, value));
  updateExperienceCount();
  if (window.lucide) lucide.createIcons();
}

// 사용자가 태그를 직접 조정할 수 있습니다. 자동 추천은 '수정 전' 초안에만 적용됩니다.
function setExperienceTagSelection(wrapper, tags) {
  const chosen = new Set(tags);
  wrapper.querySelectorAll('.experience-tag-options input[type="checkbox"]').forEach(input => {
    input.checked = chosen.has(input.value);
  });
  const summary = wrapper.querySelector('.experience-tag-count');
  if (summary) summary.textContent = `${chosen.size}개 선택`;
}

function addExperienceInput(number, value = "") {
  const inputIndex = number - 1;
  const data = categoryData[selectedCategory];
  const category = selectedCategory;
  const wrapper = document.createElement("div");
  wrapper.className = "experience-input";
  const deleteButton = number === 1
    ? ""
    : `<button type="button" class="experience-delete-button" aria-label="경험 ${number} 삭제" title="경험 입력 지우기"><i data-lucide="trash-2"></i></button>`;
  const savedTags = extractedTagChoices[category]?.[inputIndex];
  const initialTags = Array.isArray(savedTags)
    ? savedTags : (value.trim() ? extractionTags(category, value) : []);
  (extractedTagChoices[category] ||= [])[inputIndex] = [...initialTags];
  const tagOptions = TAGS.map(tag => `<label class="skill-tag-choice experience-tag-choice"><input type="checkbox" value="${escapeHtml(tag)}" ${initialTags.includes(tag) ? "checked" : ""}>${escapeHtml(tag)}</label>`).join("");
  wrapper.innerHTML = `<div class="experience-input-header"><span>${number}</span><strong>경험 ${number}</strong>${deleteButton}</div>
    <textarea class="experience-answer" data-index="${inputIndex}" maxlength="180" aria-label="${escapeHtml(data.label)} 경험 ${number} 설명" placeholder="${escapeHtml(data.questions[0])}"></textarea>
    <div class="experience-tag-editor"><div class="experience-tag-heading"><strong>역량 태그</strong><span class="experience-tag-count">${initialTags.length}개 선택</span></div>
    <div class="experience-tag-options" role="group" aria-label="경험 ${number} 역량 태그">${tagOptions}</div></div>`;
  document.getElementById("experienceInputList").appendChild(wrapper);
  const textarea = wrapper.querySelector("textarea");
  textarea.value = value;
  textarea.addEventListener("input", () => {
    // 기존 저장 기록 또는 사용자 직접 선택은 자동 추천으로 덮어쓰지 않습니다.
    if (!wrapper.dataset.tagsEdited && !extractedRecordIds[category]?.[inputIndex]) {
      const suggestion = textarea.value.trim() ? extractionTags(category, textarea.value) : [];
      extractedTagChoices[category][inputIndex] = [...suggestion];
      setExperienceTagSelection(wrapper, suggestion);
    }
    updateExperienceCount();
  });
  wrapper.querySelectorAll('.experience-tag-options input').forEach(input => {
    input.addEventListener('change', () => {
      wrapper.dataset.tagsEdited = 'true';
      extractedTagChoices[category][inputIndex] = Array.from(wrapper.querySelectorAll('.experience-tag-options input:checked'))
        .map(checkbox => checkbox.value);
      setExperienceTagSelection(wrapper, extractedTagChoices[category][inputIndex]);
      updateExperienceCount();
    });
  });
  const deleteButtonElement = wrapper.querySelector(".experience-delete-button");
  if (deleteButtonElement) deleteButtonElement.addEventListener("click", () => deleteExperienceInput(inputIndex));
}

document.getElementById("addExperienceButton").addEventListener("click", () => {
  // 현재 입력을 저장한 다음 새 입력칸을 만듭니다.
  updateExperienceCount();
  const saved = extractedExperiences[selectedCategory] || [""];
  saved.push("");
  extractedExperiences[selectedCategory] = saved;
  (extractedTagChoices[selectedCategory] ||= []).push([]);
  (extractedRecordIds[selectedCategory] ||= []).push(null);
  addExperienceInput(saved.length);
  updateExperienceCount();
  if (window.lucide) lucide.createIcons();
});

function deleteExperienceInput(index) {
  updateExperienceCount();
  const values = [...(extractedExperiences[selectedCategory] || [])];
  values.splice(index, 1);
  (extractedTagChoices[selectedCategory] ||= []).splice(index, 1);
  (extractedRecordIds[selectedCategory] ||= []).splice(index, 1);
  if (values.length === 0) values.push("");
  extractedExperiences[selectedCategory] = values;
  document.getElementById("experienceInputList").innerHTML = "";
  values.forEach((value, valueIndex) => addExperienceInput(valueIndex + 1, value));
  updateExperienceCount();
  if (window.lucide) lucide.createIcons();
  showToast("입력칸을 정리했어요. 이미 저장한 기록은 기록 목록에 그대로 남아요.");
}

function updateExperienceCount() {
  const answers = Array.from(document.querySelectorAll(".experience-answer"));
  extractedExperiences[selectedCategory] = answers.map(answer => answer.value);
  let filledCount = 0;
  let untaggedCount = 0;
  Object.entries(extractedExperiences).forEach(([category, values]) => {
    (values || []).forEach((value, index) => {
      if (!String(value || "").trim()) return;
      filledCount++;
      if (!(extractedTagChoices[category]?.[index] || []).length) untaggedCount++;
    });
  });
  const count = document.getElementById("experienceCount");
  const countMessage = `${filledCount} / 3 경험 입력${untaggedCount ? ` · 태그 미선택 ${untaggedCount}개` : ""}`;
  if (count.textContent !== countMessage) count.textContent = countMessage;
  const jobMatchButton = document.getElementById("jobMatchButton");
  jobMatchButton.disabled = filledCount < 3 || untaggedCount > 0;
  jobMatchButton.title = filledCount < 3 ? "세 가지 경험을 입력해주세요"
    : untaggedCount ? "각 경험에서 역량 태그를 한 개 이상 선택해주세요"
    : "선택한 역량 태그와 경험을 저장하고 직무 매칭으로 이동";
}

function startWriting() {
  switchTab("write");
  document.getElementById("recordCategory").value = selectedCategory;
  updateTitlePlaceholder(selectedCategory);
  renderTemplateFields();
  setTimeout(() => document.getElementById("recordTitle").focus(), 50);
}

function updateTitlePlaceholder(category) {
  document.getElementById("recordTitle").placeholder = `예) ${recordTitleExamples[category]}`;
}

document.getElementById("recordCategory").addEventListener("change", event => {
  updateTitlePlaceholder(event.target.value);
});

document.getElementById("startRecord").addEventListener("click", startWriting);
// 경험 꺼내기: 공통 역량 태그 목록에 맞춰 초안을 추천합니다.
// 추천된 태그를 사용자가 직접 바꾸면 해당 선택을 우선합니다.
const extractionTagPatterns = [
  ["개발", /개발|구현|코딩|코드|프로그래밍|자바스크립트|javascript|python|파이썬|웹사이트|github|깃허브/i],
  ["디자인", /디자인|시각화|ui|ux|피그마|figma|레이아웃|시안/i],
  ["기획", /기획|계획|아이디어|설계|전략|구성|분석|운영/i],
  ["영상", /영상|촬영|편집|유튜브|동영상/i],
  ["글쓰기", /글쓰기|글을|글쓴|보고서|문서|기사|논술|작성/i],
  ["협업", /협업|팀원|팀플|조별|모둠|협력|공동|조율|소통/i],
  ["사용자 리서치", /리서치|조사|설문|인터뷰|사용자|고객|피드백/i],
  ["데이터 분석", /데이터|통계|엑셀|분석|머신러닝|실험|시각화/i],
  ["발표", /발표|프레젠테이션|ppt|설명회|시연/i]
];
const extractionFallbackTags = {
  class: "기획", club: "협업", contest: "기획", work: "협업",
  volunteer: "협업", hobby: "기획", award: "기획", other: "기획"
};

function extractionTags(category, content) {
  const matched = extractionTagPatterns
    .filter(([, pattern]) => pattern.test(content))
    .map(([tag]) => tag)
    .filter(tag => TAGS.includes(tag));
  return matched.length ? matched : [extractionFallbackTags[category] || "기획"];
}

function saveExtractedExperiences() {
  updateExperienceCount();
  const existing = getRecords();
  let added = 0;
  for (const [category, answers] of Object.entries(extractedExperiences)) {
    if (!categoryData[category] || !Array.isArray(answers)) continue;
    for (let index = 0; index < answers.length; index++) {
      const content = String(answers[index] || "").trim();
      if (!content) continue;
      const tags = (extractedTagChoices[category]?.[index] || []).filter(tag => TAGS.includes(tag));
      if (!tags.length) throw new Error("각 경험에서 역량 태그를 하나 이상 선택해 주세요.");
      const savedId = extractedRecordIds[category]?.[index];
      const original = existing.find(record => record.id === savedId && record.source === "경험꺼내기");
      const sameContent = existing.find(record => record.source === "경험꺼내기"
        && record.recordCategory === category && String(record.content || "").trim() === content);
      const previous = original || sameContent;
      const record = saveRecord({
        ...(previous || {}),
        source: "경험꺼내기", recordCategory: category, recordUiTemplate: "free",
        title: content.length > 48 ? `${content.slice(0, 48)}…` : content,
        category: categoryData[category].label, date: previous?.date || today(),
        content, summary: content.slice(0, 160), fields: [content, ""], tags
      });
      (extractedRecordIds[category] ||= [])[index] = record.id;
      // 저장된 행은 수정할 때 동일한 ID를 사용하여 프로젝트 연결도 보존합니다.
      if (!previous) added++;
      if (!existing.find(item => item.id === record.id)) existing.push(record);
    }
  }
  return added;
}

document.getElementById("jobMatchButton").addEventListener("click", () => {
  if (document.getElementById("jobMatchButton").disabled) return;
  try {
    saveExtractedExperiences();
    window.location.assign("../job/index.html");
  } catch (error) {
    showToast(error.message || "경험을 저장하지 못했어요");
  }
});
document.getElementById("quickAddButton").addEventListener("click", () => {
  // 새 기록은 기존 기록 편집 상태를 절대 덮어쓰지 않습니다.
  editingId = null;
  recordForm.reset();
  document.getElementById("editorTitle").textContent = "새 경험 기록";
  selectedTemplate = "star";
  document.querySelectorAll(".template-item").forEach(item => item.classList.toggle("active", item.dataset.template === "star"));
  startWriting();
});

document.querySelectorAll(".template-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".template-item").forEach(template => template.classList.remove("active"));
    item.classList.add("active");
    selectedTemplate = item.dataset.template;
    renderTemplateFields();
  });
});

function renderTemplateFields() {
  const fields = templateFields[selectedTemplate];
  document.getElementById("dynamicFields").innerHTML = fields.map(([label, placeholder], index) =>
    `<label>${escapeHtml(label)}<textarea name="field${index}" placeholder="${escapeHtml(placeholder)}"></textarea></label>`
  ).join("");
  if (!document.getElementById("recordDate").value) {
    document.getElementById("recordDate").value = new Date().toISOString().slice(0, 10);
  }
}

function renderSkillTags() {
  document.getElementById("skillTagOptions").innerHTML = TAGS.map((tag, index) => `
    <label class="skill-tag-choice">
      <input type="checkbox" name="skillTag" value="${escapeHtml(tag)}" id="skillTag${index}">
      ${escapeHtml(tag)}
    </label>`).join("");
}

function getSelectedSkillTags() {
  return Array.from(document.querySelectorAll('#skillTagOptions input[name="skillTag"]:checked'))
    .map(input => input.value);
}

function setSelectedSkillTags(tags) {
  const selected = new Set(Array.isArray(tags) ? tags : []);
  document.querySelectorAll('#skillTagOptions input[name="skillTag"]').forEach(input => {
    input.checked = selected.has(input.value);
  });
}

function setRecordSaveStatus(message) {
  const status = document.getElementById("saveStatus");
  status.textContent = message;
}

// 직접 임시저장할 때만 저장 완료로 표시합니다. 그 전에는 오해를 줄이도록 작성 중으로 표시합니다.
const recordForm = document.getElementById("recordForm");
recordForm.addEventListener("input", () => setRecordSaveStatus("작성 중 · 미저장"));
recordForm.addEventListener("change", () => setRecordSaveStatus("작성 중 · 미저장"));
document.getElementById("saveDraft").addEventListener("click", () => {
  try {
    saveDraft();
    showToast("임시저장했어요");
  } catch (error) {
    setRecordSaveStatus("임시저장 실패");
    showToast(error.message || "임시저장에 실패했어요");
  }
});

function saveDraft() {
  const form = new FormData(recordForm);
  const draft = Object.fromEntries(form.entries());
  draft.template = selectedTemplate;
  draft.skillTags = getSelectedSkillTags(); // 여러 태그 선택도 모두 복원 가능하게 저장
  draft.editingId = editingId; // 기존 기록을 편집 중이면 같은 기록의 초안으로 복원
  localStorage.setItem("growpath-draft", JSON.stringify(draft));
  setRecordSaveStatus("임시저장 완료");
}

function restoreDraft() {
  let draft;
  try { draft = JSON.parse(localStorage.getItem("growpath-draft") || "null"); }
  catch (error) { return; }
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) return;
  selectedTemplate = templateFields[draft.template] ? draft.template : selectedTemplate;
  editingId = draft.editingId != null && getRecord(draft.editingId) ? draft.editingId : null;
  document.getElementById("editorTitle").textContent = editingId !== null ? "기록 수정" : "새 경험 기록";
  document.querySelectorAll(".template-item").forEach(item =>
    item.classList.toggle("active", item.dataset.template === selectedTemplate));
  renderTemplateFields();
  for (const [id, value] of Object.entries({recordCategory: draft.category, recordDate: draft.date,
    recordTitle: draft.title, recordSummary: draft.summary})) {
    const input = document.getElementById(id);
    if (input && typeof value === "string") input.value = value;
  }
  updateTitlePlaceholder(document.getElementById("recordCategory").value);
  templateFields[selectedTemplate].forEach((_, index) => {
    const field = document.querySelector(`[name="field${index}"]`);
    if (field && typeof draft[`field${index}`] === "string") field.value = draft[`field${index}`];
  });
  setSelectedSkillTags(Array.isArray(draft.skillTags) ? draft.skillTags : (draft.skillTag ? [draft.skillTag] : []));
  setRecordSaveStatus("임시저장본 불러옴");
}

document.getElementById("recordForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const title = String(form.get("title") || "").trim();
  if (!title) {
    showToast("기록 제목을 입력해주세요");
    return;
  }
  const tags = getSelectedSkillTags();
  if (!tags.length) {
    showToast("역량 태그를 하나 이상 선택해 주세요");
    return;
  }
  const fields = [];
  for (const [key, value] of form.entries()) {
    if (key.startsWith("field")) fields.push(String(value).trim());
  }
  const category = form.get("category");
  const summary = String(form.get("summary") || "").trim();
  const previous = editingId !== null ? getRecord(editingId) : null;
  const content = fields.filter(Boolean).join("\n\n") || summary;

  try {
    const savedRecord = saveRecord({
      ...(previous || {}),
      ...(editingId !== null ? { id: editingId } : {}),
      source: previous?.source || "기록",
      // 공통 템플릿 검증은 기존 규칙 그대로 유지하고, STAR/KPT는 별도 속성에 보관
      template: previous?.template ?? null,
      recordUiTemplate: selectedTemplate,
      recordCategory: category,
      category: categoryData[category]?.label || "기타",
      title,
      date: form.get("date") || today(),
      summary,
      content,
      fields,
      tags
    });
    if (previous?.source === "경험꺼내기") syncExtractedCacheRecord(savedRecord);
  } catch (error) {
    showToast(error.message || "경험 저장에 실패했어요");
    return;
  }

  editingId = null;
  records = loadUnifiedRecords();
  selectedRecords.clear();
  event.currentTarget.reset();
  setSelectedSkillTags([]);
  document.getElementById("editorTitle").textContent = "새 경험 기록";
  localStorage.removeItem("growpath-draft");
  setRecordSaveStatus("임시저장 전");
  renderTemplateFields();
  updateProjectGroupButton();
  renderRecords();
  renderCalendar();
  switchTab("list");
  showToast("경험을 저장했어요");
});

function renderRecords(query = "") {
  const filter = document.getElementById("categoryFilter").value;
  let filtered = records.filter(record => filter === "all" || record.category === filter);
  if (query.trim() && window.Fuse) {
    filtered = new Fuse(filtered, { keys: ["title", "summary", "tags", "fields"], threshold: 0.38 }).search(query.trim()).map(result => result.item);
  } else if (query.trim()) {
    filtered = filtered.filter(record => JSON.stringify(record).toLowerCase().includes(query.trim().toLowerCase()));
  }
  const sortOrder = document.getElementById("recordSort").value;
  filtered = [...filtered].sort((a, b) => {
    const dateDiff = new Date(`${a.date}T12:00:00`) - new Date(`${b.date}T12:00:00`);
    return sortOrder === "oldest" ? dateDiff : -dateDiff;
  });
  document.getElementById("recordCount").textContent = records.length;
  const list = document.getElementById("recordList");
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><i data-lucide="notebook-pen"></i><h3>아직 이 조건의 기록이 없어요</h3><p>새 경험을 기록하고 성장 목록을 채워보세요.</p><button class="primary-button" id="emptyAdd"><i data-lucide="plus"></i>첫 기록 작성</button></div>`;
    document.getElementById("emptyAdd").addEventListener("click", () => startWriting());
  } else {
    list.innerHTML = filtered.map(record => {
      const date = new Date(`${record.date}T12:00:00`);
      const category = categoryData[record.category];
      const dateStyle = category
        ? `style="background:${category.light};color:${category.text}"`
        : "";
      return `<article class="record-card${selectedRecords.has(String(record.id)) ? " selected" : ""}">
        <input class="record-select" type="checkbox" aria-label="${escapeHtml(record.title)} 선택" data-select="${record.id}" ${selectedRecords.has(String(record.id)) ? "checked" : ""}>
        <div class="record-date" ${dateStyle}><strong>${date.getDate()}</strong><small>${String(date.getMonth() + 1).padStart(2, "0")}월</small></div>
        <div class="record-info"><h3><button type="button" class="record-title-button" data-view="${record.id}" aria-label="${escapeHtml(record.title)} 내용 보기">${escapeHtml(record.title)}</button></h3><p>${escapeHtml(record.summary || record.fields.join(" · "))}</p><div class="record-tags">${(record.tags || [categoryData[record.category].label]).map(tag => `<span class="record-tag">${escapeHtml(tag)}</span>`).join("")}</div></div>
        <div class="record-actions"><button class="icon-button" aria-label="기록 편집" title="기록 편집" data-edit="${record.id}"><i data-lucide="pencil"></i></button><button class="icon-button" aria-label="기록 삭제" title="기록 삭제" data-delete="${record.id}"><i data-lucide="trash-2"></i></button></div>
      </article>`;
    }).join("");
  }
  if (window.lucide) lucide.createIcons();
  document.querySelectorAll("[data-select]").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const id = checkbox.dataset.select;
      if (checkbox.checked) selectedRecords.add(id);
      else selectedRecords.delete(id);
      checkbox.closest(".record-card").classList.toggle("selected", checkbox.checked);
      updateProjectGroupButton();
    });
  });
  document.querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.delete;
    const realId = records.find(item => String(item.id) === id)?.id;
    if (realId === undefined) return;
    const record = records.find(item => String(item.id) === id);
    if (!window.confirm(`'${record?.title || "이 기록"}'을 삭제할까요?\n삭제하면 프로젝트와의 연결도 해제되며 복구할 수 없어요.`)) return;
    if (!deleteRecord(realId)) {
      showToast("기록 삭제에 실패했어요");
      return;
    }
    if (record?.source === "경험꺼내기") removeExtractedCacheById(realId);
    records = loadUnifiedRecords();
    selectedRecords.delete(id);
    updateProjectGroupButton();
    renderRecords(document.getElementById("recordSearch").value);
    renderCalendar();
    showToast("기록을 삭제했어요");
  }));
  document.querySelectorAll("[data-view]").forEach(button => button.addEventListener("click", () => {
    openRecordView(button.dataset.view);
  }));
  document.querySelectorAll("[data-edit]").forEach(button => button.addEventListener("click", () => {
    const record = records.find(item => String(item.id) === button.dataset.edit);
    if (!record) return;
    editingId = record.id;
    selectedTemplate = templateFields[record.recordUiTemplate] ? record.recordUiTemplate : (templateFields[record.template] ? record.template : "star");
    switchTab("write");
    document.querySelectorAll(".template-item").forEach(item => item.classList.toggle("active", item.dataset.template === selectedTemplate));
    document.getElementById("recordCategory").value = record.category;
    updateTitlePlaceholder(record.category);
    document.getElementById("recordDate").value = record.date;
    document.getElementById("recordTitle").value = record.title;
    document.getElementById("recordSummary").value = record.summary;
    renderTemplateFields();
    setSelectedSkillTags(record.tags);
    templateFields[selectedTemplate].forEach((_, index) => {
      const textarea = document.querySelector(`[name="field${index}"]`);
      if (textarea) textarea.value = record.fields[index] || "";
    });
    document.getElementById("editorTitle").textContent = "기록 수정";
  }));
}

document.getElementById("recordSearch").addEventListener("input", event => renderRecords(event.target.value));
document.getElementById("categoryFilter").addEventListener("change", () => renderRecords(document.getElementById("recordSearch").value));
document.getElementById("recordSort").addEventListener("change", () => renderRecords(document.getElementById("recordSearch").value));
document.getElementById("projectGroupButton").addEventListener("click", () => {
  if (!selectedRecords.size) return;
  // 기록 ID는 비교할 때만 문자열로 사용하고 저장 시에는 원본 ID를 보존합니다.
  const selected = getRecords().filter(record => selectedRecords.has(String(record.id)));
  if (!selected.length) {
    showToast("선택한 기록을 찾을 수 없어요");
    return;
  }
  const groupedIds = new Set(getProjects().flatMap(project => (project.recordIds || []).map(String)));
  if (selected.some(record => groupedIds.has(String(record.id)))) {
    showToast("이미 묶인 기록이 있어요. 프로젝트 화면에서 관리해 주세요");
    return; // 기존 프로젝트의 기록을 실수로 이동/중복시키지 않습니다.
  }
  try {
    const project = saveProject({
      title: selected[0].title + (selected.length > 1 ? ` 외 ${selected.length - 1}개` : ""),
      recordIds: selected.map(record => record.id)
    });
    window.location.assign(`../../portfolio/index.html?project=${encodeURIComponent(project.id)}`);
  } catch (error) {
    showToast(error.message || "프로젝트를 만들지 못했어요");
  }
});

let recordViewTrigger = null;

function openRecordView(id) {
  const record = records.find(item => String(item.id) === String(id));
  if (!record) return;
  recordViewTrigger = document.activeElement;
  const category = categoryData[record.category] || { label: "기타", light: "#edf3f8", text: "#53647a" };
  const date = new Date(`${record.date}T12:00:00`);
  const dateText = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  const fieldDefinitions = templateFields[record.recordUiTemplate] || templateFields[record.template] || templateFields.star;
  const fields = fieldDefinitions.map(([label], index) => `
    <div class="record-view-field">
      <strong>${escapeHtml(label)}</strong>
      <p>${escapeHtml(record.fields[index] || "작성된 내용이 없습니다.")}</p>
    </div>
  `).join("");
  const tags = (record.tags || [category.label]).map(tag => `<span class="record-tag">${escapeHtml(tag)}</span>`).join("");

  document.getElementById("recordViewContent").innerHTML = `
    <div class="record-view-header">
      <span class="record-view-category" style="background:${category.light};color:${category.text}">${escapeHtml(category.label)}</span>
      <h2 id="recordViewTitle">${escapeHtml(record.title)}</h2>
      <span class="record-view-date">${escapeHtml(dateText)}</span>
    </div>
    ${record.summary ? `<p class="record-view-summary"><strong>한 줄 요약</strong><br>${escapeHtml(record.summary)}</p>` : ""}
    <div class="record-view-fields">${fields}</div>
    <div class="record-view-tags">${tags}</div>
  `;

  const modal = document.getElementById("recordViewModal");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  modal.querySelector(".record-view-close").focus();
  if (window.lucide) lucide.createIcons();
}

function closeRecordView() {
  const modal = document.getElementById("recordViewModal");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.style.removeProperty("overflow");
  if (recordViewTrigger && typeof recordViewTrigger.focus === "function") recordViewTrigger.focus();
  recordViewTrigger = null;
}

document.querySelectorAll("[data-close-record-view]").forEach(element => {
  element.addEventListener("click", closeRecordView);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeRecordView();
});

function updateProjectGroupButton() {
  const button = document.getElementById("projectGroupButton");
  button.disabled = selectedRecords.size === 0;
  document.getElementById("selectedRecordCount").textContent = selectedRecords.size;
}

function renderCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  document.getElementById("calendarTitle").textContent = `${year}년 ${month + 1}월`;
  if (window.FullCalendar) {
    const calendarEvents = records.map(record => ({
      id: String(record.id),
      title: record.title,
      start: record.date,
      allDay: true,
      backgroundColor: categoryData[record.category]?.color || "#4b82c3",
      borderColor: categoryData[record.category]?.color || "#4b82c3",
      textColor: "#ffffff"
    }));
    if (!fullCalendarInstance) {
      fullCalendarInstance = new FullCalendar.Calendar(document.getElementById("fullCalendar"), {
        initialView: "dayGridMonth",
        initialDate: viewDate,
        locale: "ko",
        headerToolbar: false,
        height: "auto",
        dayMaxEvents: 2,
        events: calendarEvents,
        dateClick: info => {
          document.getElementById("recordDate").value = info.dateStr;
          startWriting();
        }
      });
      fullCalendarInstance.render();
    } else {
      fullCalendarInstance.gotoDate(viewDate);
      fullCalendarInstance.removeAllEvents();
      fullCalendarInstance.addEventSource(calendarEvents);
    }
  }
  const monthCount = records.filter(record => record.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length;
  document.getElementById("monthRecordCount").textContent = `이달의 기록 ${monthCount}개`;
  renderStreak();
}

function renderStreak() {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const streakSource = records.map(record => ({ date: `${record.date}T12:00:00`, value: 1 }));
  document.getElementById("streakWeek").innerHTML = days.map((day, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - mondayOffset + index);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const done = records.some(record => record.date === dateKey);
    return `<div class="streak-day${done ? " done" : ""}">${day}<i><i data-lucide="${done ? "check" : "minus"}"></i></i></div>`;
  }).join("");
  initializeCalHeatmap(streakSource);
  const streakDates = new Set(records.map(record => record.date));
  let streak = 0;
  const cursor = new Date();
  while (streakDates.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  document.getElementById("streakCount").textContent = streak || 0;
}

async function initializeCalHeatmap(source) {
  try {
    if (!calHeatmapInstance && window.CalHeatmap) {
      calHeatmapInstance = new window.CalHeatmap();
    }
    if (!calHeatmapInstance) return;
    await calHeatmapInstance.paint({
      itemSelector: "#streakWeek",
      range: 1,
      domain: {
        type: "month",
        gutter: 0,
        label: { text: "", position: "top" }
      },
      subDomain: {
        type: "day",
        radius: 12,
        width: 24,
        height: 24,
        gutter: 5
      },
      date: { start: new Date(new Date().setDate(new Date().getDate() - 6)) },
      data: { source, x: "date", y: "value" },
      scale: { color: { type: "linear", domain: [0, 1], range: ["#edf2f6", "#2889d2"] } }
    });
  } catch (error) {
    if (window.lucide) lucide.createIcons();
  }
}

document.getElementById("prevMonth").addEventListener("click", () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1); renderCalendar(); });
document.getElementById("nextMonth").addEventListener("click", () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1); renderCalendar(); });

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

updateGuide();
renderTemplateFields();
renderSkillTags();
restoreDraft();
renderRecords();
renderCalendar();
updateProjectGroupButton();
updateTitlePlaceholder(document.getElementById("recordCategory").value);
// 홈 대시보드·온보딩에서 직접 들어올 때 해당 탭을 보여줍니다.
// 기존 기록 데이터와 저장 로직에는 영향을 주지 않습니다.
const entryParams = new URLSearchParams(window.location.search);
const entryTab = entryParams.get("tab");
if (["extract", "write", "list", "calendar"].includes(entryTab)) {
  switchTab(entryTab);
}

// '질문으로 경험 기록하기'에서 받은 질문을 작성 화면에 안내합니다.
if (entryTab === "write" && entryParams.get("question")) {
  const question = entryParams.get("question").slice(0, 240);
  selectedTemplate = "free";
  document.querySelectorAll(".template-item").forEach(item => {
    item.classList.toggle("active", item.dataset.template === selectedTemplate);
  });
  renderTemplateFields();

  const panel = document.createElement("div");
  panel.className = "record-linked-question";
  const heading = document.createElement("strong");
  heading.textContent = "오늘의 질문";
  const description = document.createElement("p");
  description.textContent = question;
  panel.append(heading, description);
  const recordForm = document.getElementById("recordForm");
  recordForm.parentNode.insertBefore(panel, recordForm);

  const storyInput = document.querySelector('#dynamicFields textarea[name="field0"]');
  if (storyInput) {
    storyInput.placeholder = `${question}
경험을 자유롭게 적어 보세요.`;
  }
}
if (window.lucide) lucide.createIcons();
