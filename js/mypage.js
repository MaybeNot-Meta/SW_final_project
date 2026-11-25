// ==========================================
// STEP 6: 마이페이지 동작
// STEP 1~5 공통 파일을 수정하지 않고 기능을 연결합니다.
// ==========================================

(function () {
  "use strict";

  const form = document.getElementById("mp-form");
  const nicknameInput = document.getElementById("mp-nickname");
  const typeInputs = document.querySelectorAll('input[name="mp-user-type"]');
  const tagsSection = document.getElementById("mp-tags-section");
  const tagsContainer = document.getElementById("mp-tags");
  const tagCount = document.getElementById("mp-tag-count");
  const errorElement = document.getElementById("mp-form-error");
  const clearJobButton = document.getElementById("mp-clear-job");
  const selectedTags = new Set();
  const profileFields = document.getElementById("mp-profile-fields");

  // 가입하지 않은 상태에서는 온보딩으로 이동합니다.
  if (!getUser()) {
    window.location.replace("index.html#onboarding");
    return;
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function showError(message) {
    errorElement.textContent = message;
    errorElement.hidden = !message;
  }

  function notify(message) {
    if (typeof window.showToast === "function") {
      window.showToast(message);
    } else {
      window.alert(message);
    }
  }

  function selectedType() {
    const selected = document.querySelector('input[name="mp-user-type"]:checked');
    return selected ? Number(selected.value) : null;
  }

  // 샘플 데이터 교체와 초기화는 반드시 확인을 받습니다.
  async function confirmAction(title, message, confirmText) {
    if (window.Swal && typeof window.Swal.fire === "function") {
      const result = await window.Swal.fire({
        title,
        text: message,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: "취소",
        confirmButtonColor: "#B63F57",
        reverseButtons: true,
        focusCancel: true
      });
      return result.isConfirmed;
    }

    // CDN을 읽지 못한 경우에도 확인 없이 삭제하지 않습니다.
    return window.confirm(`${title}\n\n${message}`);
  }

  function updateTagButtons() {
    tagsContainer.querySelectorAll("button").forEach(function (button) {
      const active = selectedTags.has(button.dataset.tag);
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    tagCount.textContent = `${selectedTags.size} / 3개 선택`;
  }

  function renderTagOptions() {
    tagsContainer.replaceChildren();

    TAGS.forEach(function (tag) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip-outline mp-tag";
      button.dataset.tag = tag;
      button.textContent = tag;
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", function () {
        showError("");
        if (selectedTags.has(tag)) {
          selectedTags.delete(tag);
        } else if (selectedTags.size < 3) {
          selectedTags.add(tag);
        } else {
          showError("관심 분야는 최대 3개까지 선택할 수 있어요.");
          return;
        }
        updateTagButtons();
      });
      tagsContainer.appendChild(button);
    });
    updateTagButtons();
  }

  function updateTypeView() {
    // 유형 2에서도 이미 선택한 관심 분야는 보존합니다.
    tagsSection.hidden = selectedType() !== 1;
    showError("");
  }

  function fillProfile(user) {
    nicknameInput.value = user.nickname || "";
    MyfoProfile.fill(profileFields, user.profile);
    typeInputs.forEach(function (input) {
      input.checked = Number(input.value) === user.userType;
    });

    selectedTags.clear();
    (Array.isArray(user.interestTags) ? user.interestTags : []).forEach(function (tag) {
      if (TAGS.includes(tag)) selectedTags.add(tag);
    });

    updateTypeView();
    updateTagButtons();

    const hasTarget = typeof user.targetJob === "string" && user.targetJob.length > 0;
    const sharedJobs = window.OPSJOB?.data?.jobs || [];
    const matchingJob = sharedJobs.find(job => job.id === user.targetJob);
    byId("mp-job-value").textContent = hasTarget
      ? (matchingJob ? matchingJob.name : `선택한 직무: ${user.targetJob}`)
      : "설정된 목표 직무가 없어요.";
    clearJobButton.hidden = !hasTarget;
  }

  function renderStats() {
    const records = getRecords();
    byId("mp-records").textContent = String(records.length);
    byId("mp-projects").textContent = String(getProjects().length);
    byId("mp-pending").textContent = String(getUngroupedRecords().length);
    byId("mp-scraps").textContent = String(getScraps().length);

    const tagCounts = Object.entries(getTagCounts())
      .filter(function (entry) { return entry[1] > 0; })
      .sort(function (a, b) { return b[1] - a[1]; });

    byId("mp-top-tag").textContent = tagCounts.length
      ? `가장 많이 기록한 역량: ${tagCounts[0][0]} (${tagCounts[0][1]}개 경험)`
      : "아직 기록한 역량이 없어요. 경험을 추가하면 여기에 표시돼요.";
  }

  function refreshPage() {
    const user = getUser();
    if (!user) {
      window.location.replace("index.html#onboarding");
      return;
    }
    fillProfile(user);
    renderStats();
    if (typeof window.renderHeader === "function") {
      window.renderHeader();
    }
  }

  // 기존 사용자 정보는 필요한 항목만 변경합니다.
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showError("");

    const nickname = nicknameInput.value.trim();
    const type = selectedType();

    if (!nickname) {
      showError("닉네임을 입력해 주세요.");
      nicknameInput.focus();
      return;
    }
    if (!type) {
      showError("사용자 유형을 선택해 주세요.");
      typeInputs[0].focus();
      return;
    }
    if (type === 1 && (selectedTags.size < 2 || selectedTags.size > 3)) {
      showError("유형 1은 관심 분야를 2~3개 선택해야 해요.");
      tagsContainer.querySelector("button")?.focus();
      return;
    }

    const invalid = MyfoProfile.firstInvalid(profileFields);
    if (invalid) {
      showError("입력 형식을 확인해 주세요. 이메일 주소가 올바른지 확인해 주세요.");
      invalid.focus();
      return;
    }

    try {
      saveUser({
        nickname,
        userType: type,
        interestTags: Array.from(selectedTags),
        profile: MyfoProfile.read(profileFields, (getUser() || {}).profile)
        // targetJob과 기록·프로젝트 등 다른 정보는 건드리지 않습니다.
      });
      refreshPage();
      notify("사용자 정보를 저장했어요.");
    } catch (error) {
      showError(error.message || "정보를 저장하지 못했어요.");
    }
  });

  typeInputs.forEach(function (input) {
    input.addEventListener("change", updateTypeView);
  });

  clearJobButton.addEventListener("click", async function () {
    const ok = await confirmAction(
      "목표 직무 설정을 해제할까요?",
      "경험 기록이나 포트폴리오 데이터는 삭제되지 않습니다.",
      "목표 직무 해제"
    );
    if (!ok) return;

    try {
      saveUser({ targetJob: null });
      refreshPage();
      notify("목표 직무 설정을 해제했어요.");
    } catch (error) {
      notify(error.message || "목표 직무 설정을 해제하지 못했어요.");
    }
  });

  // STEP 7-30: 백업 범위를 현재 myfo 저장 데이터에 맞게 확장합니다.
  // 기존 JSON의 최상위 user/records/projects/scraps 키는 호환을 위해 유지합니다.
  function readOptionalJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      console.warn("선택 데이터 읽기 실패:", key, error);
      return fallback;
    }
  }

  let backupDownloadedThisPage = false;

  byId("mp-backup").addEventListener("click", function () {
    const backup = {
      app: "myfo",
      backupVersion: 2,
      exportedAt: new Date().toISOString(),
      user: getUser(),
      records: getRecords(),
      projects: getProjects(),
      scraps: getScraps(),
      scrapStatus: readOptionalJson("scrapStatus", {}),
      recordDraft: readOptionalJson("growpath-draft", null)
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `myfo-backup-${today()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    backupDownloadedThisPage = true;
    notify("사용자·경험·프로젝트·스크랩 진행 상태를 백업했어요. 다운로드 폴더를 확인해 주세요.");
  });

  byId("mp-sample").addEventListener("click", async function () {
    // 이미 저장한 데이터가 있는 사용자가 실수로 샘플로 덮어쓰지 않도록
    // 같은 화면에서 먼저 백업 버튼을 누르도록 요구합니다.
    const hasExistingData = !!getUser() || !!getRecords().length ||
      !!getProjects().length || !!getScraps().length ||
      !!Object.keys(readOptionalJson("scrapStatus", {}) || {}).length;
    if (hasExistingData && !backupDownloadedThisPage) {
      notify("기존 데이터를 보호하려면 먼저 '데이터 JSON 백업'을 눌러 파일을 저장해 주세요.");
      return;
    }

    const ok = await confirmAction(
      "발표용 샘플 데이터를 불러올까요?",
      "현재 사용자·경험·프로젝트·스크랩·진행 상태가 샘플 데이터로 교체됩니다. 백업 파일을 보관했는지 확인해 주세요.",
      "샘플 데이터로 교체"
    );
    if (!ok) return;

    // 교체 중 저장 오류가 발생할 경우 원래 네 개 저장 키와 진행 상태를 복구합니다.
    const keys = ["user", "records", "projects", "scraps", "scrapStatus"];
    const previous = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
    try {
      if (typeof SAMPLE_DATA === "undefined" ||
          !SAMPLE_DATA.user || !Array.isArray(SAMPLE_DATA.records) ||
          !Array.isArray(SAMPLE_DATA.projects) || !Array.isArray(SAMPLE_DATA.scraps) ||
          !SAMPLE_DATA.scrapStatus || typeof SAMPLE_DATA.scrapStatus !== "object") {
        notify("샘플 데이터 형식이 올바르지 않아요.");
        return;
      }
      const result = loadSampleData();
      if (!result) throw new Error("샘플 데이터를 불러오지 못했어요.");
      localStorage.setItem("scrapStatus", JSON.stringify(SAMPLE_DATA.scrapStatus));
      backupDownloadedThisPage = false;
      refreshPage();
      notify("발표용 샘플 데이터를 불러왔어요.");
    } catch (error) {
      try {
        keys.forEach(key => {
          if (previous[key] === null) localStorage.removeItem(key);
          else localStorage.setItem(key, previous[key]);
        });
        refreshPage();
      } catch (restoreError) {
        console.error("샘플 적용 중 오류 후 데이터 복구 실패:", restoreError);
      }
      notify(error.message || "샘플 데이터를 불러오지 못했어요. 기존 정보를 복구했습니다.");
    }
  });

  byId("mp-reset").addEventListener("click", async function () {
    const ok = await confirmAction(
      "전체 데이터를 초기화할까요?",
      "닉네임과 관심 태그를 포함하여 경험·프로젝트·스크랩이 모두 삭제되며, 되돌릴 수 없습니다.",
      "모두 삭제"
    );
    if (!ok) return;

    try {
      resetAllData();
      window.location.replace("index.html#onboarding");
    } catch (error) {
      notify(error.message || "데이터 초기화에 실패했어요.");
    }
  });

  MyfoProfile.render(profileFields, "mp");
  renderTagOptions();
  refreshPage();
})();
