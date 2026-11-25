// STEP 7-29: 온보딩과 마이페이지가 공유하는 사용자 상세 정보 입력 필드
// 원래 user의 nickname, userType, interestTags, targetJob 필드는 변경하지 않습니다.
(function () {
  "use strict";

  // 경력·활동은 별도의 '경험 기록'에서 관리합니다.
  // 이전 버전 user.profile에 저장된 경력 데이터는 지우지 않고 유지합니다.
  const FIELDS = ["fullName", "email", "school", "major", "educationStatus"];

  function field(id, label, placeholder, options) {
    const props = options || {};
    const type = props.type || "text";
    const maxLength = props.maxLength || 80;
    return `<div class="field myfo-profile-field">
      <label class="label" for="${id}">${label}</label>
      <input class="input" id="${id}" data-profile-key="${props.key}" type="${type}"
        placeholder="${placeholder}" maxlength="${maxLength}" autocomplete="${props.autocomplete || "off"}">
    </div>`;
  }

  function render(mount, prefix) {
    if (!mount) return;
    const id = key => `${prefix}-${key}`;
    mount.classList.add("myfo-profile-fields");
    mount.innerHTML = `
      <section class="myfo-profile-section" aria-labelledby="${id("basic-title")}">
        <div class="myfo-profile-section-heading"><h3 id="${id("basic-title")}">기본 정보</h3>
          <p>닉네임과 사용자 유형은 이전 단계 또는 위의 항목에서 관리해요.</p></div>
        <div class="myfo-profile-grid">
          ${field(id("fullName"), "이름 (선택)", "이름을 입력해 주세요", {key:"fullName", maxLength:40, autocomplete:"name"})}
          ${field(id("email"), "이메일 (선택)", "example@email.com", {key:"email", type:"email", maxLength:100, autocomplete:"email"})}
        </div>
      </section>
      <section class="myfo-profile-section" aria-labelledby="${id("education-title")}">
        <div class="myfo-profile-section-heading"><h3 id="${id("education-title")}">학력</h3>
          <p>학교와 전공을 입력할 수 있어요. 아직 정해지지 않았다면 비워 두세요.</p></div>
        <div class="myfo-profile-grid">
          ${field(id("school"), "학교명 (선택)", "예: ○○대학교", {key:"school"})}
          ${field(id("major"), "전공·학과 (선택)", "예: 소프트웨어학과", {key:"major"})}
          <div class="field myfo-profile-field">
            <label class="label" for="${id("educationStatus")}">학적 상태 (선택)</label>
            <select class="input" id="${id("educationStatus")}" data-profile-key="educationStatus">
              <option value="">선택하지 않음</option>
              <option value="재학">재학</option><option value="휴학">휴학</option>
              <option value="졸업">졸업</option><option value="수료">수료</option><option value="기타">기타</option>
            </select>
          </div>
        </div>
      </section>`;
  }

  function read(mount, previousProfile) {
    // 표시하지 않는 기존 profile 필드는 보존합니다.
    // 특히 이전 버전에서 저장한 경력·활동 값은 폼 수정 후에도 삭제되지 않습니다.
    const result = previousProfile && typeof previousProfile === "object" && !Array.isArray(previousProfile)
      ? { ...previousProfile } : {};
    FIELDS.forEach(function (key) {
      const input = mount.querySelector(`[data-profile-key="${key}"]`);
      if (input) result[key] = String(input.value || "").trim();
    });
    return result;
  }

  function fill(mount, profile) {
    const saved = profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
    FIELDS.forEach(function (key) {
      const input = mount.querySelector(`[data-profile-key="${key}"]`);
      if (input) input.value = typeof saved[key] === "string" ? saved[key] : "";
    });
  }

  function firstInvalid(mount) {
    return mount.querySelector(":invalid");
  }

  window.MyfoProfile = {render, read, fill, firstInvalid};
})();
