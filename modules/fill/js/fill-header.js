/* 경험 채우기 하위 메뉴: 공통 myfo 헤더와는 별개이며 링크 경로를 유지합니다. */
(function () {
  const container = document.getElementById('fill-local-nav');
  if (!container) return;
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const items = [
    ['fill-recommend.html', '맞춤 추천'],
    ['fill-scrap.html', '스크랩']
  ];
  container.innerHTML = '<nav class="fill-view-nav" aria-label="경험 채우기 메뉴">' +
    items.map(([href, name]) =>
      `<a href="${href}"${current === href ? ' aria-current="page"' : ''}>${name}</a>`
    ).join('') + '</nav>';
})();
