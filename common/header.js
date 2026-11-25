
// ==========================================
// 공통 헤더 및 메뉴 관리
// 모든 페이지에서 동일한 헤더를 사용합니다.
// ==========================================

const APP_NAME = "myfo";

(function () {
  "use strict";

  // common/header.js의 위치를 기준으로 프로젝트 루트를 계산합니다.
  // 하위 폴더의 페이지에서도 링크가 잘못된 폴더로 이동하지 않게 합니다.
  const scriptUrl = document.currentScript && document.currentScript.src;
  const siteRoot = scriptUrl
    ? new URL("../", scriptUrl)
    : new URL("./", document.baseURI);

  function siteUrl(relativePath) {
    return new URL(relativePath, siteRoot).href;
  }

  // 실제 통합된 페이지의 주소입니다.
  const MENU_ITEMS = [
    { label: "홈", href: "index.html", icon: "house" },
    { label: "경험 기록", href: "modules/record/index.html", icon: "notebook-pen", section: "modules/record/" },
    { label: "직무 연결", href: "modules/job/index.html", icon: "briefcase-business", section: "modules/job/" },
    { label: "포트폴리오", href: "portfolio/index.html", icon: "folder-open", section: "portfolio/" },
    { label: "경험 채우기", href: "modules/fill/fill-recommend.html", icon: "compass", section: "modules/fill/" },
    { label: "마이페이지", href: "mypage.html", icon: "circle-user-round" }
  ];

  // Lucide 아이콘이 사용할 요소를 생성합니다.
  function createIcon(name) {
    const icon = document.createElement("i");

    icon.setAttribute("data-lucide", name);
    icon.className = "site-header-icon";
    icon.setAttribute("aria-hidden", "true");

    return icon;
  }

  // 프로젝트 루트 기준의 현재 페이지 경로를 반환합니다.
  function getCurrentPage() {
    const rootPath = siteRoot.pathname;
    const currentPath = window.location.pathname;

    if (currentPath === rootPath || currentPath === rootPath.slice(0, -1)) {
      return "index.html";
    }

    return currentPath.startsWith(rootPath)
      ? decodeURIComponent(currentPath.slice(rootPath.length))
      : decodeURIComponent(currentPath.replace(/^\//, ""));
  }

  // 메뉴 링크 하나를 생성합니다.
  function createMenuLink(item, currentPage) {
    const link = document.createElement("a");

    link.href = siteUrl(item.href);
    link.className = "site-header-link";

    link.appendChild(createIcon(item.icon));

    const label = document.createElement("span");
    label.textContent = item.label;

    link.appendChild(label);

    // 현재 페이지와 연결된 메뉴를 강조합니다.
    if (item.href === currentPage || (item.section && currentPage.startsWith(item.section))) {
      link.classList.add("is-current");
      link.setAttribute("aria-current", "page");
    }

    return link;
  }

  // 모바일 메뉴의 열림 상태를 변경합니다.
  function setMobileMenu(nav, button, isOpen) {
    nav.classList.toggle("is-open", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute(
      "aria-label",
      isOpen ? "메뉴 닫기" : "메뉴 열기"
    );
  }

  // 사용자 정보와 현재 페이지에 맞는 헤더를 그립니다.
  function renderHeader() {
    const mount = document.getElementById("header");

    if (!mount) {
      return;
    }

    // 중복으로 그려지지 않도록 기존 헤더를 비웁니다.
    mount.replaceChildren();

    const header = document.createElement("header");
    header.className = "site-header";

    const inner = document.createElement("div");
    inner.className = "container site-header-inner";

    // 서비스 로고를 생성합니다.
    const logo = document.createElement("a");
    logo.href = siteUrl("index.html");
    logo.className = "site-header-brand";
    logo.setAttribute("aria-label", APP_NAME + " 홈으로 이동");

    const brandName = document.createElement("span");
    brandName.textContent = APP_NAME;

    const brandDot = document.createElement("span");
    brandDot.textContent = ".";
    brandDot.className = "site-header-brand-dot";

    logo.appendChild(brandName);
    logo.appendChild(brandDot);
    inner.appendChild(logo);

    // 온보딩 완료 여부를 확인합니다.
    const user =
      typeof getUser === "function" ? getUser() : null;

    if (!user) {
      // 첫 방문 사용자에게는 시작하기 버튼만 표시합니다.
      const startLink = document.createElement("a");

      startLink.href = siteUrl("index.html#onboarding");
      startLink.className = "btn btn-primary site-header-start";
      startLink.textContent = "시작하기";

      inner.appendChild(startLink);
    } else {
      // 온보딩을 마친 사용자에게 전체 메뉴를 표시합니다.
      const nav = document.createElement("nav");

      nav.id = "site-header-nav";
      nav.className = "site-header-nav";
      nav.setAttribute("aria-label", "주 메뉴");

      const currentPage = getCurrentPage();

      MENU_ITEMS.forEach(item => {
        const link = createMenuLink(item, currentPage);
        nav.appendChild(link);
      });

      // 모바일에서 사용할 메뉴 버튼을 생성합니다.
      const menuButton = document.createElement("button");

      menuButton.type = "button";
      menuButton.className = "site-header-menu-button";
      menuButton.setAttribute(
        "aria-controls",
        "site-header-nav"
      );
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "메뉴 열기");

      menuButton.appendChild(createIcon("menu"));

      // 메뉴 버튼을 누르면 열림 상태가 변경됩니다.
      menuButton.addEventListener("click", function () {
        const isOpen = !nav.classList.contains("is-open");

        setMobileMenu(nav, menuButton, isOpen);
      });

      // 메뉴 링크를 선택하면 모바일 메뉴를 닫습니다.
      nav.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          setMobileMenu(nav, menuButton, false);
        }
      });

      // 키보드 ESC 키로도 메뉴를 닫을 수 있습니다.
      header.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          setMobileMenu(nav, menuButton, false);
          menuButton.focus();
        }
      });

      inner.appendChild(menuButton);
      inner.appendChild(nav);
    }

    header.appendChild(inner);
    mount.appendChild(header);

    // Lucide 아이콘을 실제 SVG로 변경합니다.
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  // 저장 완료 등의 메시지를 화면에 잠깐 표시합니다.
  function showToast(message) {
    const existingToast = document.querySelector(".site-toast");

    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = "site-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.textContent = String(message);

    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 3000);
  }

  // 다른 페이지에서도 헤더를 다시 그릴 수 있도록 공개합니다.
  window.renderHeader = renderHeader;
  window.showToast = showToast;

  // HTML이 준비된 후 헤더를 생성합니다.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderHeader);
  } else {
    renderHeader();
  }

})();
