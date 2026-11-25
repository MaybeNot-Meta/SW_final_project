
// ==========================================
// 온보딩 및 메인 홈 기능
// 공통 storage.js와 tags.js를 사용합니다.
// ==========================================

(function () {
  "use strict";

  // ========================================
  // 1. HTML 요소 가져오기
  // ========================================

  const onboarding = document.getElementById("onboarding");
  const dashboard = document.getElementById("home-dashboard");
  const profileStep = document.getElementById("home-profile-step");
  const profileForm = document.getElementById("home-profile-form");
  const profileFields = document.getElementById("home-profile-fields");
  const profileError = document.getElementById("home-profile-error");
  let pendingUserData = null;

  const form = document.getElementById("home-onboarding-form");
  const nicknameInput = document.getElementById("home-nickname");

  const typeInputs = document.querySelectorAll(
    'input[name="home-user-type"]'
  );

  const typeCards = document.querySelectorAll(".home-type-card");

  const tagStep = document.getElementById("home-tag-step");
  const tagList = document.getElementById("home-tag-list");
  const tagCount = document.getElementById("home-tag-count");

  const submitLabel = document.getElementById("home-submit-label");

  const nicknameError = document.getElementById(
    "home-nickname-error"
  );

  const typeError = document.getElementById("home-type-error");
  const tagError = document.getElementById("home-tag-error");
  const formError = document.getElementById("home-form-error");

  const dashboardTitle = document.getElementById(
    "home-dashboard-title"
  );

  const userSummary = document.getElementById(
    "home-user-summary"
  );

  // 사용자가 선택한 관심 태그를 저장합니다.
  const selectedTags = new Set();

  // ========================================
  // 2. 공통 입력 오류 표시
  // ========================================

  // 오류 메시지를 표시하거나 숨깁니다.
  function setError(element, message) {
    element.textContent = message;
    element.hidden = !message;
  }

  // 온보딩의 모든 오류 메시지를 초기화합니다.
  function clearErrors() {
    setError(nicknameError, "");
    setError(typeError, "");
    setError(tagError, "");
    setError(formError, "");

    nicknameInput.removeAttribute("aria-invalid");
  }

  // ========================================
  // 3. 사용자 유형 선택
  // ========================================

  // 현재 선택된 사용자 유형을 숫자로 반환합니다.
  function getSelectedType() {
    const selected = document.querySelector(
      'input[name="home-user-type"]:checked'
    );

    return selected ? Number(selected.value) : null;
  }

  // 유형에 맞게 선택 카드와 태그 영역을 업데이트합니다.
  function updateTypeSelection() {
    const userType = getSelectedType();

    typeCards.forEach(function (card) {
      const radio = card.querySelector(".home-type-input");

      card.classList.toggle(
        "is-selected",
        radio.checked
      );
    });

    // 유형 1만 관심 분야를 선택합니다.
    tagStep.hidden = userType !== 1;

    if (userType === 1) {
      submitLabel.textContent = "다음: 사용자 정보 입력";
    } else if (userType === 2) {
      submitLabel.textContent = "다음: 사용자 정보 입력";
    } else {
      submitLabel.textContent = "시작하기";
    }

    if (userType !== null) {
      setError(typeError, "");
    }
  }

  // 사용자가 유형을 변경하면 화면을 갱신합니다.
  typeInputs.forEach(function (radio) {
    radio.addEventListener("change", updateTypeSelection);
  });

  // ========================================
  // 4. 관심 태그 선택
  // ========================================

  // 선택한 태그 개수와 버튼 상태를 업데이트합니다.
  function updateTags() {
    const buttons = tagList.querySelectorAll(
      ".home-tag-button"
    );

    buttons.forEach(function (button) {
      const tag = button.dataset.tag;
      const isSelected = selectedTags.has(tag);

      button.classList.toggle(
        "is-selected",
        isSelected
      );

      button.setAttribute(
        "aria-pressed",
        String(isSelected)
      );
    });

    tagCount.textContent =
      `${selectedTags.size} / 3개 선택`;

    if (selectedTags.size >= 2) {
      setError(tagError, "");
    }
  }

  // 관심 태그를 선택하거나 해제합니다.
  function toggleTag(tag) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      if (selectedTags.size >= 3) {
        setError(
          tagError,
          "관심 분야는 최대 3개까지 선택할 수 있어요."
        );

        return;
      }

      selectedTags.add(tag);
    }

    updateTags();
  }

  // 공통 TAGS 데이터로 관심 태그 버튼을 생성합니다.
  function renderTags() {
    tagList.replaceChildren();

    TAGS.forEach(function (tag) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "chip-outline home-tag-button";

      button.textContent = tag;
      button.dataset.tag = tag;

      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", function () {
        toggleTag(tag);
      });

      tagList.appendChild(button);
    });

    updateTags();
  }

  // ========================================
  // 5. 온보딩 입력 검사
  // ========================================

  // 닉네임, 유형 및 관심 태그 입력을 검사합니다.
  function validateForm() {
    clearErrors();

    const nickname = nicknameInput.value.trim();
    const userType = getSelectedType();

    if (!nickname) {
      setError(
        nicknameError,
        "닉네임을 입력해 주세요."
      );

      nicknameInput.setAttribute("aria-invalid", "true");
      nicknameInput.focus();

      return null;
    }

    if (userType === null) {
      setError(
        typeError,
        "현재 상황에 가까운 유형을 선택해 주세요."
      );

      typeInputs[0].focus();

      return null;
    }

    // 유형 1은 관심 분야 2~3개가 필수입니다.
    if (
      userType === 1 &&
      (selectedTags.size < 2 || selectedTags.size > 3)
    ) {
      setError(
        tagError,
        "관심 분야를 2~3개 선택해 주세요."
      );

      const firstTag = tagList.querySelector("button");

      if (firstTag) {
        firstTag.focus();
      }

      return null;
    }

    return {
      nickname: nickname,
      userType: userType,
      interestTags: userType === 1
        ? Array.from(selectedTags)
        : [],
      targetJob: null
    };
  }

  // ========================================
  // 6. 메인 홈 사용자 정보 표시
  // ========================================

  // 사용자 정보 한 항목을 화면에 추가합니다.
  function addSummaryItem(label, value) {
    const item = document.createElement("div");
    item.className = "home-summary-item";

    const labelElement = document.createElement("span");
    labelElement.className = "home-summary-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("strong");
    valueElement.className = "home-summary-value";
    valueElement.textContent = value;

    item.appendChild(labelElement);
    item.appendChild(valueElement);

    userSummary.appendChild(item);
  }

  // 사용자 정보에 따라 온보딩 또는 메인 홈을 표시합니다.
  function renderPage() {
    const user = getUser();

    if (!user) {
      onboarding.hidden = false;
      profileStep.hidden = true;
      dashboard.hidden = true;

      document.title = "시작하기 · myfo";

      return;
    }

    // 등록된 사용자는 온보딩 대신 홈을 표시합니다.
    onboarding.hidden = true;
    profileStep.hidden = true;
    dashboard.hidden = false;

    document.title = "메인 홈 · myfo";

    dashboardTitle.textContent =
      `${user.nickname}님, 첫걸음을 시작했어요.`;

    // 이전에 표시한 사용자 정보를 지웁니다.
    userSummary.replaceChildren();

    const typeText = user.userType === 1
      ? "해온 게 별로 없어요"
      : "경험은 있는데 정리가 안 돼요";

    const interests = Array.isArray(user.interestTags)
      ? user.interestTags.join(", ")
      : "";

    addSummaryItem("사용자 유형", typeText);

    addSummaryItem(
      "관심 분야",
      interests || "아직 선택하지 않았어요"
    );

    const info = user.profile || {};
    const education = [info.school, info.major, info.educationStatus].filter(Boolean).join(" · ");
    if (education) addSummaryItem("학력", education);
  }

  // ========================================
  // 7. 2단계 온보딩: 기본 정보 → 상세 정보 → 홈
  // ========================================

  function handleSubmit(event) {
    event.preventDefault();
    const userData = validateForm();
    if (!userData) return;

    // 상세 정보 입력이 끝나기 전에는 user 키를 저장하지 않습니다.
    // 그래야 두 유형 모두 홈으로 진입하는 흐름과 기존 사용자 데이터를 보존합니다.
    pendingUserData = userData;
    onboarding.hidden = true;
    profileStep.hidden = false;
    dashboard.hidden = true;
    document.title = "내 정보 등록 · myfo";
    window.scrollTo(0, 0);
    profileFields.querySelector("input")?.focus();
  }

  function completeOnboarding(profile) {
    if (!pendingUserData) return;
    try {
      saveUser({ ...pendingUserData, profile: profile || {} });
      pendingUserData = null;
      renderPage();
      if (typeof renderHeader === "function") renderHeader();
      // STEP 5 대시보드도 새 사용자의 데이터를 즉시 표시합니다.
      if (typeof window.refreshStep5Dashboard === "function") {
        window.refreshStep5Dashboard();
      }
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("사용자 정보 저장 실패:", error);
      profileError.textContent = error.message || "사용자 정보를 저장하지 못했어요.";
      profileError.hidden = false;
    }
  }

  function handleProfileSubmit(event) {
    event.preventDefault();
    profileError.hidden = true;
    const invalid = MyfoProfile.firstInvalid(profileFields);
    if (invalid) {
      profileError.textContent = "입력 형식을 확인해 주세요. 이메일 주소가 올바른지 확인해 주세요.";
      profileError.hidden = false;
      invalid.focus();
      return;
    }
    completeOnboarding(MyfoProfile.read(profileFields));
  }

  // ========================================
  // 8. 초기 실행
  // ========================================

  // 온보딩 이벤트를 등록하고 초기 화면을 표시합니다.
  function initialize() {
    renderTags();
    MyfoProfile.render(profileFields, "ob");
    updateTypeSelection();
    renderPage();

    form.addEventListener("submit", handleSubmit);
    profileForm.addEventListener("submit", handleProfileSubmit);
    document.getElementById("home-profile-back").addEventListener("click", function () {
      profileError.hidden = true;
      profileStep.hidden = true;
      onboarding.hidden = false;
      document.title = "시작하기 · myfo";
      window.scrollTo(0, 0);
    });
    document.getElementById("home-profile-skip").addEventListener("click", function () {
      completeOnboarding({});
    });
  }

  initialize();

})();
