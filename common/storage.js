
// ==========================================
// 공통 데이터 저장 관리
// 모든 페이지에서 동일한 저장 함수를 사용합니다.
// ==========================================

// localStorage에서 사용하는 키
const STORAGE_KEYS = {
  user: "user",
  records: "records",
  projects: "projects",
  scraps: "scraps"
};

// JSON 데이터를 안전하게 읽습니다.
function readData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) return fallback;

    const value = JSON.parse(raw);
    return value ?? fallback;
  } catch (error) {
    console.error("데이터 읽기 실패:", error);
    return fallback;
  }
}

// 데이터를 JSON 문자열로 저장합니다.
function writeData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  } catch (error) {
    console.error("데이터 저장 실패:", error);
    throw new Error("데이터를 저장하지 못했어요.");
  }
}

// ==========================================
// 1. 공통 유틸리티
// ==========================================

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환합니다.
function today() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 기록과 프로젝트의 고유 ID를 생성합니다.
function makeId(prefix = "id") {
  const time = Date.now();
  const random = Math.random().toString(36).slice(2, 10);

  return `${prefix}_${time}_${random}`;
}

// URL에 전달된 쿼리 값을 읽습니다.
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ==========================================
// 2. 사용자 정보
// ==========================================

// 사용자 정보를 불러옵니다.
function getUser() {
  const user = readData(STORAGE_KEYS.user, null);

  if (!user || typeof user !== "object" || Array.isArray(user)) {
    return null;
  }

  return user;
}

// 사용자 정보를 신규 저장하거나 일부 수정합니다.
function saveUser(changes) {
  if (!changes || typeof changes !== "object" || Array.isArray(changes)) {
    throw new Error("사용자 정보가 올바르지 않아요.");
  }

  const previous = getUser() || {
    nickname: "",
    userType: null,
    interestTags: [],
    targetJob: null
  };

  const updated = {
    ...previous,
    ...changes
  };

  // 닉네임을 확인합니다.
  if (
    typeof updated.nickname !== "string" ||
    !updated.nickname.trim()
  ) {
    throw new Error("닉네임을 입력해 주세요.");
  }

  updated.nickname = updated.nickname.trim();

  // 사용자 유형을 확인합니다.
  if (![1, 2].includes(updated.userType)) {
    throw new Error("사용자 유형을 선택해 주세요.");
  }

  // 관심 태그가 공통 목록에 있는지 확인합니다.
  if (!Array.isArray(updated.interestTags)) {
    throw new Error("관심 태그 형식이 올바르지 않아요.");
  }

  if (updated.interestTags.some(tag => !TAGS.includes(tag))) {
    throw new Error("등록되지 않은 관심 태그가 있어요.");
  }

  updated.interestTags = [...new Set(updated.interestTags)];

  // 목표 직무 ID의 기본 형식을 확인합니다.
  if (
    updated.targetJob !== null &&
    typeof updated.targetJob !== "string"
  ) {
    throw new Error("목표 직무 정보가 올바르지 않아요.");
  }

  return writeData(STORAGE_KEYS.user, updated);
}

// ==========================================
// 3. 경험 기록
// ==========================================

// 경험 기록을 날짜 최신순으로 불러옵니다.
function getRecords() {
  const records = readData(STORAGE_KEYS.records, []);

  if (!Array.isArray(records)) return [];

  return [...records].sort((a, b) =>
    String(b.date || "").localeCompare(String(a.date || ""))
  );
}

// ID에 해당하는 경험 하나를 가져옵니다.
function getRecord(id) {
  return getRecords().find(item => item.id === id) || null;
}

// 경험 기록을 추가하거나 수정합니다.
function saveRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("기록 정보가 올바르지 않아요.");
  }

  const records = getRecords();
  const id = record.id || makeId("record");

  const index = records.findIndex(item => item.id === id);
  const previous = index >= 0 ? records[index] : {};

  const updated = {
    source: "기록",
    template: null,
    category: null,
    content: "",
    date: today(),
    tags: [],
    ...previous,
    ...record,
    id
  };

  // 제목을 확인합니다.
  if (
    typeof updated.title !== "string" ||
    !updated.title.trim()
  ) {
    throw new Error("경험 제목을 입력해 주세요.");
  }

  // 경험 출처를 확인합니다.
  if (!SOURCES.includes(updated.source)) {
    throw new Error("경험 출처가 올바르지 않아요.");
  }

  // 템플릿을 확인합니다.
  if (
    updated.template !== null &&
    !TEMPLATES.includes(updated.template)
  ) {
    throw new Error("기록 템플릿이 올바르지 않아요.");
  }

  // 경험 기록에는 역량 태그가 반드시 있어야 합니다.
  if (
    !Array.isArray(updated.tags) ||
    updated.tags.length === 0
  ) {
    throw new Error("역량 태그를 하나 이상 선택해 주세요.");
  }

  if (updated.tags.some(tag => !TAGS.includes(tag))) {
    throw new Error("등록되지 않은 역량 태그가 있어요.");
  }

  updated.tags = [...new Set(updated.tags)];

  // 기록을 추가하거나 수정합니다.
  if (index >= 0) {
    records[index] = updated;
  } else {
    records.push(updated);
  }

  writeData(STORAGE_KEYS.records, records);

  return updated;
}

// 경험을 삭제하고 프로젝트 참조도 정리합니다.
function deleteRecord(id) {
  const records = getRecords();
  const filtered = records.filter(item => item.id !== id);

  if (filtered.length === records.length) return false;

  writeData(STORAGE_KEYS.records, filtered);

  const projects = getProjects().map(project => ({
    ...project,
    recordIds: (project.recordIds || []).filter(
      recordId => recordId !== id
    )
  }));

  writeData(STORAGE_KEYS.projects, projects);

  return true;
}

// ==========================================
// 4. 포트폴리오 프로젝트
// ==========================================

// 저장된 프로젝트 목록을 불러옵니다.
function getProjects() {
  const projects = readData(STORAGE_KEYS.projects, []);
  return Array.isArray(projects) ? projects : [];
}

// ID로 프로젝트 하나를 찾습니다.
function getProject(id) {
  return getProjects().find(item => item.id === id) || null;
}

// 프로젝트를 추가하거나 수정합니다.
function saveProject(project) {
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error("프로젝트 정보가 올바르지 않아요.");
  }

  const projects = getProjects();
  const id = project.id || makeId("project");

  const index = projects.findIndex(item => item.id === id);
  const previous = index >= 0 ? projects[index] : {};

  const updated = {
    title: "",
    recordIds: [],
    star: null,
    ...previous,
    ...project,
    id
  };

  if (
    typeof updated.title !== "string" ||
    !updated.title.trim()
  ) {
    throw new Error("프로젝트 제목을 입력해 주세요.");
  }

  if (!Array.isArray(updated.recordIds)) {
    throw new Error("프로젝트 기록 목록이 올바르지 않아요.");
  }

  updated.recordIds = [...new Set(updated.recordIds)];

  if (index >= 0) {
    projects[index] = updated;
  } else {
    projects.push(updated);
  }

  writeData(STORAGE_KEYS.projects, projects);

  return updated;
}

// 프로젝트를 삭제합니다.
function deleteProject(id) {
  const projects = getProjects();
  const filtered = projects.filter(item => item.id !== id);

  if (filtered.length === projects.length) return false;

  writeData(STORAGE_KEYS.projects, filtered);
  return true;
}

// 프로젝트에 포함되지 않은 경험을 찾습니다.
function getUngroupedRecords() {
  const groupedIds = new Set();

  getProjects().forEach(project => {
    (project.recordIds || []).forEach(id => groupedIds.add(id));
  });

  return getRecords().filter(
    record => !groupedIds.has(record.id)
  );
}

// ==========================================
// 5. 공모전 스크랩
// ==========================================

// 저장한 공모전 ID 목록을 불러옵니다.
function getScraps() {
  const scraps = readData(STORAGE_KEYS.scraps, []);
  return Array.isArray(scraps) ? scraps : [];
}

// 공모전이 스크랩되었는지 확인합니다.
function isScrapped(id) {
  return getScraps().includes(id);
}

// 공모전 스크랩을 추가하거나 해제합니다.
function toggleScrap(id) {
  const scraps = getScraps();

  const updated = scraps.includes(id)
    ? scraps.filter(item => item !== id)
    : [...scraps, id];

  return writeData(STORAGE_KEYS.scraps, updated);
}

// ==========================================
// 6. 역량 태그 통계
// ==========================================

// 기록에 사용된 태그별 경험 개수를 계산합니다.
function getTagCounts() {
  const counts = {};

  TAGS.forEach(tag => {
    counts[tag] = 0;
  });

  getRecords().forEach(record => {
    const tags = Array.isArray(record.tags)
      ? [...new Set(record.tags)]
      : [];

    tags.forEach(tag => {
      if (Object.prototype.hasOwnProperty.call(counts, tag)) {
        counts[tag] += 1;
      }
    });
  });

  return counts;
}

// ==========================================
// 7. 전체 데이터 초기화
// ==========================================

// 서비스에서 사용하는 데이터만 초기화합니다.
function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });

  return true;
}

// ==========================================
// 8. 발표용 샘플 데이터
// ==========================================

// data/sample.js에 정의된 데이터를 저장합니다.
function loadSampleData() {
  if (typeof SAMPLE_DATA === "undefined") {
    console.warn("샘플 데이터가 아직 준비되지 않았어요.");
    return false;
  }

  if (
    !SAMPLE_DATA.user ||
    !Array.isArray(SAMPLE_DATA.records) ||
    !Array.isArray(SAMPLE_DATA.projects) ||
    !Array.isArray(SAMPLE_DATA.scraps)
  ) {
    console.error("샘플 데이터 형식이 올바르지 않아요.");
    return false;
  }

  writeData(STORAGE_KEYS.user, SAMPLE_DATA.user);
  writeData(STORAGE_KEYS.records, SAMPLE_DATA.records);
  writeData(STORAGE_KEYS.projects, SAMPLE_DATA.projects);
  writeData(STORAGE_KEYS.scraps, SAMPLE_DATA.scraps);

  return true;
}
