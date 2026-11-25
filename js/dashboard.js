
// ==========================================
// STEP 5: 메인 홈 확장 기능
// STEP 4의 home.js는 수정하지 않습니다.
// ==========================================

(function () {
  "use strict";

  const dashboard = document.getElementById("home-dashboard");
  const host = dashboard?.querySelector(".container");
  const form = document.getElementById("home-onboarding-form");

  if (!dashboard || !host || !form) {
    console.error(
      "STEP 5: 메인 홈 또는 온보딩 요소를 찾지 못했습니다."
    );
    return;
  }

  // 사용자 데이터가 아닌 고정 HTML만 추가합니다.
  const section = document.createElement("section");

  section.id = "dash5";
  section.className = "dash5";
  section.setAttribute("aria-label", "메인 홈 대시보드");

  section.innerHTML = `
    <div class="dash5-grid">

      <article class="dash5-card"
               aria-labelledby="dash5-question-title">

        <div class="dash5-card-top">
          <span class="dash5-kicker">
            <i data-lucide="calendar-days"></i>
            오늘의 질문
          </span>
          <span id="dash5-date" class="dash5-muted"></span>
        </div>

        <h2 id="dash5-question-title" class="dash5-question">
          오늘의 질문을 준비 중이에요.
        </h2>

        <a id="dash5-question-link"
           class="dash5-link"
           href="modules/record/index.html?tab=write">
          질문으로 경험 기록하기
        </a>

      </article>

      <article class="dash5-card"
               aria-labelledby="dash5-pending-title">

        <div class="dash5-card-top">
          <span class="dash5-kicker">
            <i data-lucide="folder-clock"></i>
            정리 대기 경험
          </span>
        </div>

        <h2 id="dash5-pending-title" class="dash5-count">
          <span id="dash5-pending">0</span><small>개</small>
        </h2>

        <p class="dash5-muted">
          아직 포트폴리오 프로젝트로 묶지 않은 경험이에요.
        </p>

        <a class="dash5-link" href="portfolio/index.html">
          프로젝트로 정리하기
        </a>

      </article>

    </div>

    <section class="dash5-section"
             aria-labelledby="dash5-recent-title">

      <div class="dash5-section-head">
        <div>
          <h2 id="dash5-recent-title">최근 경험 기록</h2>
          <p class="dash5-muted">
            최근 작성한 경험 3개를 보여줘요.
          </p>
        </div>

        <a class="dash5-link" href="modules/record/index.html?tab=list">
          전체 기록 보기
        </a>
      </div>

      <div id="dash5-records" class="dash5-records"></div>

    </section>

    <div class="dash5-grid">

      <article class="dash5-card"
               aria-labelledby="dash5-job-title">

        <span class="dash5-kicker">
          <i data-lucide="briefcase-business"></i>
          직무 연결
        </span>

        <h2 id="dash5-job-title">목표 직무 매칭</h2>

        <p id="dash5-job-status" class="dash5-muted"></p>

        <a class="dash5-link" href="modules/job/index.html">
          직무 연결 페이지
        </a>

      </article>

      <article class="dash5-card"
               aria-labelledby="dash5-recommend-title">

        <span class="dash5-kicker">
          <i data-lucide="compass"></i>
          경험 채우기
        </span>

        <h2 id="dash5-recommend-title">
          나를 위한 맞춤 추천
        </h2>

        <p id="dash5-recommend-status" class="dash5-muted"></p>

        <a class="dash5-link" href="modules/fill/fill-recommend.html">
          추천 활동 살펴보기
        </a>

      </article>

    </div>
  `;

  host.appendChild(section);

  // ID로 HTML 요소를 찾습니다.
  function byId(id) {
    return document.getElementById(id);
  }

  // ========================================
  // 1. 오늘의 질문
  // ========================================

  function renderQuestion() {
    const questionList =
      typeof QUESTIONS !== "undefined" &&
      Array.isArray(QUESTIONS.daily)
        ? QUESTIONS.daily
        : [];

    const link = byId("dash5-question-link");
    const now = new Date();

    const hasDayjs = typeof window.dayjs === "function";

    // Day.js가 로드되면 날짜 표시와 계산에 사용합니다.
    const dateLabel = hasDayjs
      ? window.dayjs().format("M월 D일")
      : `${now.getMonth() + 1}월 ${now.getDate()}일`;

    byId("dash5-date").textContent = dateLabel;

    if (questionList.length === 0) {
      byId("dash5-question-title").textContent =
        "질문 데이터가 아직 없어요.";

      link.hidden = true;
      return;
    }

    // 오늘 날짜에 해당하는 질문을 하나 선택합니다.
    const elapsedDays = hasDayjs
      ? window.dayjs()
          .startOf("day")
          .diff(window.dayjs("2026-01-01"), "day")
      : Math.floor(
          Date.UTC(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ) / 86400000
        );

    const index =
      ((elapsedDays % questionList.length) + questionList.length)
      % questionList.length;

    const question = questionList[index];

    byId("dash5-question-title").textContent = question;

    // 경험 기록 담당 페이지에 질문을 전달할 URL입니다.
    // 실제 경험 기록 화면으로 이동하고 오늘의 질문을 전달합니다.
    link.href =
      `modules/record/index.html?tab=write&question=${encodeURIComponent(question)}`;

    link.hidden = false;
  }

  // ========================================
  // 2. 최근 경험 기록
  // ========================================

  function renderRecent(records) {
    const list = byId("dash5-records");

    list.replaceChildren();

    if (records.length === 0) {
      const empty = document.createElement("p");

      empty.className = "dash5-empty";
      empty.textContent =
        "아직 기록이 없어요. 첫 번째 경험을 남겨 보세요.";

      list.appendChild(empty);
      return;
    }

    // 저장된 경험 중 최대 3개를 표시합니다.
    records.slice(0, 3).forEach(function (record) {
      const card = document.createElement("article");
      card.className = "dash5-record";

      const title = document.createElement("h3");
      title.textContent = record.title || "제목 없는 경험";

      const date = document.createElement("p");
      date.className = "dash5-muted";

      if (
        record.date &&
        typeof window.dayjs === "function"
      ) {
        const parsed = window.dayjs(record.date);

        date.textContent = parsed.isValid()
          ? parsed.format("YYYY.MM.DD")
          : "날짜 미설정";
      } else {
        date.textContent = record.date || "날짜 미설정";
      }

      const content = document.createElement("p");
      content.className = "dash5-record-content";

      content.textContent =
        typeof record.content === "string" && record.content
          ? record.content
          : "아직 내용이 없어요.";

      // 저장한 역량 태그를 표시합니다.
      const tags = document.createElement("div");
      tags.className = "dash5-tags";

      const recordTags = Array.isArray(record.tags)
        ? record.tags
        : [];

      recordTags.slice(0, 3).forEach(function (tag) {
        const chip = document.createElement("span");
        chip.className = "dash5-tag";
        chip.textContent = String(tag);

        tags.appendChild(chip);
      });

      card.append(title, date, content, tags);
      list.appendChild(card);
    });
  }

  // ========================================
  // 3. 대시보드 전체 표시
  // ========================================

  function render() {
    const user = getUser();

    section.hidden = !user;

    if (!user) {
      return;
    }

    const records = getRecords();
    const pending = getUngroupedRecords();

    renderQuestion();

    byId("dash5-pending").textContent =
      String(pending.length);

    renderRecent(records);

    byId("dash5-job-status").textContent =
      records.length < 3
        ? `현재 기록 ${records.length}개. 경험을 더 모으면 직무 분석이 구체적이 돼요.`
        : `경험 ${records.length}개를 바탕으로 직무 추천과 역량 분석을 확인해 보세요.`;

    // 현재 사용자의 관심 태그를 추천 기준으로 안내합니다.
    const interests = Array.isArray(user.interestTags)
      ? user.interestTags
      : [];

    byId("dash5-recommend-status").textContent =
      interests.length
        ? `관심 분야: ${interests.join(", ")}. 나에게 맞는 활동을 확인해 보세요.`
        : "목표 직무와 부족한 역량을 기준으로 추천 활동을 확인해 보세요.";
  }

  // STEP 4의 home.js가 온보딩 저장을 먼저 처리합니다.
  // 그다음 이번 대시보드만 새로 그립니다.
  form.addEventListener("submit", function () {
    if (!dashboard.hidden && getUser()) {
      render();
    }
  });

  // 뒤로 가기 등으로 돌아올 때 화면을 갱신합니다.
  window.addEventListener("pageshow", render);

  // 개발자 도구에서 테스트 데이터를 추가한 뒤 사용할 함수
  window.refreshStep5Dashboard = render;

  // 첫 화면 표시
  render();

  // 새로 추가한 Lucide 아이콘 적용
  if (
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {
    window.lucide.createIcons();
  }

})();
