// 경험 채우기 화면을 myfo 공통 저장 함수에 연결하는 호환 계층입니다.
// 원본 'record'/'scrap' 데이터는 삭제하지 않으며, 처음 연결할 때만 안전하게 가져옵니다.
window.StorageAPI = (() => {
  const LEGACY_RECORD_KEY = 'record';
  const RECORD_IMPORT_KEY = 'myfo-fill-records-imported-v1';
  const SCRAP_IMPORT_KEY = 'myfo-fill-scraps-imported-v1';

  function read(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return parsed ?? fallback;
    } catch (error) {
      console.warn('이전 데이터 읽기 실패:', key, error);
      return fallback;
    }
  }

  // 반복 클릭으로 생성된 동일한 기록은 한 건으로 취급합니다.
  // 제목만 같은 서로 다른 기록은 합치지 않습니다.
  function signature(record) {
    return JSON.stringify([
      record.contestId || '',
      record.title || '',
      record.content || '',
      record.role || '',
      record.result || '',
      record.date || '',
      Array.isArray(record.tags) ? [...new Set(record.tags)].sort() : []
    ]);
  }

  function migrateLegacyRecords() {
    const legacy = read(LEGACY_RECORD_KEY, []);
    if (!Array.isArray(legacy) || !legacy.length) return;

    const processed = new Set(read(RECORD_IMPORT_KEY, []));
    const current = getRecords();
    const fingerprints = new Set(current.map(signature));
    const knownIds = new Set(current.map(row => row.id));
    let changed = false;

    legacy.forEach((oldRecord, index) => {
      if (!oldRecord || typeof oldRecord !== 'object') return;
      const legacyId = String(oldRecord.id || `legacy-row-${index}`);
      if (processed.has(legacyId)) return;

      const tags = Array.isArray(oldRecord.tags)
        ? [...new Set(oldRecord.tags.filter(tag => TAGS.includes(tag)))]
        : [];
      const normalized = {
        ...oldRecord,
        source: '공모전',
        template: null,
        category: null,
        title: String(oldRecord.title || '').trim(),
        tags,
        // 이전 데이터에 날짜가 없다면 원본을 보존한 채 오늘 날짜로 연결합니다.
        date: oldRecord.date || today(),
        id: oldRecord.id || makeId('record')
      };
      const fingerprint = signature(normalized);
      if (fingerprints.has(fingerprint)) {
        processed.add(legacyId);
        changed = true;
        return;
      }
      if (!normalized.title || !normalized.tags.length) {
        console.warn('공통 형식으로 옮길 수 없는 참여 기록은 원본에 보존했습니다:', legacyId);
        return;
      }
      if (knownIds.has(normalized.id)) normalized.id = makeId('record');
      try {
        const saved = window.saveRecord(normalized);
        knownIds.add(saved.id);
        fingerprints.add(fingerprint);
        processed.add(legacyId);
        changed = true;
      } catch (error) {
        // 저장에 실패한 기록은 원본 키에 그대로 남기고 나중에 재시도할 수 있게 합니다.
        console.warn('기존 참여 기록 연결 실패:', legacyId, error);
      }
    });
    if (changed) localStorage.setItem(RECORD_IMPORT_KEY, JSON.stringify([...processed]));
  }

  function migrateLegacyScraps() {
    if (localStorage.getItem(SCRAP_IMPORT_KEY) !== null) return;
    const legacy = read('scrap', []);
    if (!Array.isArray(legacy)) return;
    const current = new Set(window.getScraps());
    legacy.forEach(id => {
      if (typeof id !== 'string' || current.has(id)) return;
      window.toggleScrap(id);
      current.add(id);
    });
    // 삭제 후 예전 스크랩이 다시 나타나지 않도록 한 번만 가져옵니다.
    localStorage.setItem(SCRAP_IMPORT_KEY, 'true');
  }

  const getUser = () => {
    const user = window.getUser() || {
      nickname: '', userType: null, interestTags: [], targetJob: null
    };
    const existing = user.testResult?.tempTags;
    return {
      ...user,
      testResult: {
        ...(user.testResult || {}),
        tempTags: Array.isArray(existing) && existing.length
          ? existing
          : (Array.isArray(user.interestTags) ? user.interestTags : [])
      }
    };
  };

  const getRecords = () => window.getRecords();
  const saveRecord = record => window.saveRecord(record);
  const getScraps = () => window.getScraps();
  const toggleScrap = id => {
    const result = window.toggleScrap(id);
    return result.includes(id);
  };

  migrateLegacyRecords();
  migrateLegacyScraps();

  return {
    getUser,
    saveUser: changes => window.saveUser(changes),
    getRecords,
    saveRecord,
    getProjects: () => window.getProjects(),
    saveProject: project => window.saveProject(project),
    getScraps,
    toggleScrap,
    getTagCounts: () => window.getTagCounts()
  };
})();
