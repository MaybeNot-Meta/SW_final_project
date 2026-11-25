/* ==========================================================
   포트폴리오 슬라이드 만들기 (PPT)
   - 직무에 어울리는 테마 5종
   - 슬라이드 구성: 표지 → 한눈에 보기 → 목차 → 프로젝트(1장씩) → 그 밖의 경험 → 마무리
   - 하나의 배치(인치 좌표)로 화면 미리보기(HTML)와 .pptx(PptxGenJS)를 똑같이 그림
   ========================================================== */
(function () {
  'use strict';

  const W = 13.333; // 16:9 슬라이드 가로(인치)
  const H = 7.5;
  const M = 0.7; // 바깥 여백
  const PX = 96; // 미리보기: 1인치 = 96px → 1280 x 720

  /* ---------- 1. 직무별 테마 ---------- */
  // style: clean(깔끔) / bold(대담) / dark(어두운 화면)
  const THEMES = {
    plan: { id: 'plan', name: '기획', label: '신뢰감 있는 블루', fit: '기획 · PM · 리서치', style: 'clean',
      bg: 'FFFFFF', surface: 'F4F7FE', ink: '15213B', sub: '5B6478', accent: '2F5BE0', soft: 'E3EAFD', onAccent: 'FFFFFF', line: 'DDE3F0' },
    data: { id: 'data', name: '데이터', label: '차분한 틸', fit: '데이터 분석', style: 'clean',
      bg: 'FFFFFF', surface: 'F0F8F6', ink: '0E2B2F', sub: '4E6A6D', accent: '0E9384', soft: 'D9F2EE', onAccent: 'FFFFFF', line: 'D3E5E1' },
    design: { id: 'design', name: '디자인', label: '대담한 코랄', fit: 'UX · UI · 그래픽', style: 'bold',
      bg: 'F7F4EE', surface: 'FFFFFF', ink: '141414', sub: '67625A', accent: 'FF5A36', soft: 'FFE1D8', onAccent: 'FFFFFF', line: 'E4DED3' },
    content: { id: 'content', name: '콘텐츠', label: '따뜻한 오렌지', fit: '영상 · 글쓰기 · 마케팅', style: 'bold',
      bg: 'FFF8EE', surface: 'FFFFFF', ink: '2A1A0D', sub: '7A6450', accent: 'E8820C', soft: 'FFE8C4', onAccent: 'FFFFFF', line: 'EFDDC4' },
    dev: { id: 'dev', name: '개발', label: '다크 터미널', fit: '개발 · 엔지니어링', style: 'dark',
      bg: '0F172A', surface: '1E293B', ink: 'F1F5F9', sub: '94A3B8', accent: '34D399', soft: '173B35', onAccent: '0F172A', line: '334155' },
  };
  // 역량 태그 → 어울리는 테마
  const TAG_THEME = { 기획: 'plan', '사용자 리서치': 'plan', 협업: 'plan', 발표: 'content', 글쓰기: 'content', 영상: 'content', 디자인: 'design', 개발: 'dev', '데이터 분석': 'data' };

  // 직무가 가장 많이 요구하는 역량으로 테마 결정
  function themeForJob(job) {
    if (!job || !job.skills) return 'plan';
    const top = Object.entries(job.skills).sort((a, b) => (Number(b[1]) || 0) - (Number(a[1]) || 0))[0];
    return (top && TAG_THEME[top[0]]) || 'plan';
  }

  /* ---------- 2. 글자 크기 맞추기 (화면·PPT 공통 추정) ---------- */
  function emWidth(str) {
    let w = 0;
    for (const ch of String(str)) {
      const c = ch.charCodeAt(0);
      if ((c >= 0xac00 && c <= 0xd7a3) || (c >= 0x3130 && c <= 0x318f)) w += 1.0;
      else if (ch === ' ') w += 0.3;
      else if (/[A-Z0-9%@#]/.test(ch)) w += 0.66;
      else if (/[il.,:;'|!]/.test(ch)) w += 0.3;
      else w += 0.56;
    }
    return w;
  }
  const textWidthIn = (str, pt) => (emWidth(str) * pt) / 72;
  // 단어 단위로 줄바꿈을 흉내 내서 줄 수 세기 (한국어는 단어째로 넘어감)
  function lineCount(text, pt, wIn) {
    const maxEm = (wIn * 72) / pt;
    let lines = 0;
    String(text).split('\n').forEach((para) => {
      let cur = 0; let n = 1;
      para.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        const ww = emWidth(word);
        if (/^\s+$/.test(word)) { cur += ww; return; }
        if (cur > 0 && cur + ww > maxEm) {
          n += 1; cur = ww;
          while (cur > maxEm) { n += 1; cur -= maxEm; } // 한 줄보다 긴 단어
        } else {
          cur += ww;
          while (cur > maxEm) { n += 1; cur -= maxEm; }
        }
      });
      lines += n;
    });
    return lines;
  }
  // 상자에 들어가는 가장 큰 글자 크기
  function fitSize(text, wIn, hIn, maxPt, minPt, ls = 1.25) {
    for (let s = maxPt; s >= minPt; s -= 1) {
      if ((lineCount(text, s, wIn) * s * ls * 1.2) / 72 <= hIn) return s; // 줄 간격 1.0 ≈ 글자 크기의 1.2배
    }
    return minPt;
  }
  // 가장 작은 크기로도 넘치면 뒤를 잘라 "…"
  function clamp(text, wIn, hIn, pt, ls = 1.25) {
    let t = String(text);
    while (t.length > 4 && (lineCount(t, pt, wIn) * pt * ls * 1.2) / 72 > hIn) t = t.slice(0, Math.floor(t.length * 0.92));
    return t === String(text) ? t : `${t.replace(/\s+\S*$/, '')}…`;
  }
  function fitText(text, wIn, hIn, maxPt, minPt, ls = 1.25) {
    const size = fitSize(text, wIn, hIn, maxPt, minPt, ls);
    return { size, text: clamp(text, wIn, hIn, size, ls) };
  }

  /* ---------- 3. 내용 다듬기 ---------- */
  const txt = (s) => String(s || '').trim();
  const NUM = /(\d+(?:[.,]\d+)?\s?(?:%p|%|명|회|개|점|배|위|건|시간|주|개월|만|천)?(?:\s?(?:→|->|에서)\s?\d+(?:[.,]\d+)?\s?(?:%p|%|명|회|개|점)?)?)/g;
  const BIG = /\d+(?:[.,]\d+)?\s?(?:%p|%|명|회|개|점|배|위|건)/g;

  // 숫자만 굵게·포인트 색으로 나눈 글 조각
  function numRuns(text, color, numColor) {
    const out = [];
    let last = 0;
    String(text).replace(NUM, (m, _g, i) => {
      if (i > last) out.push({ t: text.slice(last, i), c: color });
      out.push({ t: m, c: numColor, b: true });
      last = i + m.length;
      return m;
    });
    if (last < text.length) out.push({ t: text.slice(last), c: color });
    return out.length ? out : [{ t: text, c: color }];
  }
  // 결과에서 숫자가 든 첫 구절
  function keyResult(r) {
    const part = txt(r).split(/,\s*|\.(?!\d)\s*|그리고\s/).find((x) => /\d/.test(x)); // 4.6점 같은 소수점은 안 자름
    return part ? part.trim() : '';
  }
  // 크게 띄울 숫자 (구절의 마지막 숫자: "30%에서 55%" → 55%)
  // 크게 띄울 숫자: "30%에서 55%"처럼 바뀐 값이 있으면 바뀐 뒤 값, 아니면 첫 숫자
  function bigNumber(r) {
    const key = keyResult(r);
    const range = key.match(/\d+(?:[.,]\d+)?\s?(?:%p|%|명|회|개|점)?\s?(?:→|->|에서)\s?(\d+(?:[.,]\d+)?\s?(?:%p|%|명|회|개|점|배|위|건))/);
    if (range) return range[1].replace(/\s/g, '');
    const m = key.match(BIG);
    return m ? m[0].replace(/\s/g, '') : '';
  }
  // 행동을 단계로 (최대 4개)
  function steps(a) {
    let list = txt(a).split(/\n+|(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
    if (list.length > 4) list = list.slice(0, 3).concat(list.slice(3).join(' '));
    return list;
  }

  /* ---------- 4. 슬라이드 부품 ---------- */
  const rect = (x, y, w, h, fill, o = {}) => ({ k: 'rect', x, y, w, h, fill, ...o });
  const oval = (x, y, w, h, fill, o = {}) => ({ k: 'ellipse', x, y, w, h, fill, ...o });
  const line = (x, y, w, h, color, lw = 1) => ({ k: 'line', x, y, w, h, color, lw });
  // runs: 문자열 또는 [{t, c, b}] / o: size, color, bold, align, valign, font, ls
  const text = (x, y, w, h, runs, o = {}) => ({ k: 'text', x, y, w, h, runs: typeof runs === 'string' ? [{ t: runs }] : runs, size: 14, align: 'left', valign: 'top', ls: 1.25, ...o });

  // 태그 칩 여러 개를 한 줄로 (넘치면 자름)
  function chips(x, y, tags, t, o = {}) {
    const size = o.size || 12;
    const h = o.h || 0.36;
    const els = [];
    let cx = x;
    tags.forEach((tag) => {
      const w = textWidthIn(tag, size) + 0.34;
      if (o.maxX && cx + w > o.maxX) return;
      els.push(text(cx, y, w, h, tag, {
        size, bold: true, align: 'center', valign: 'middle',
        color: o.color || t.accent, fill: o.fill === undefined ? t.soft : o.fill, line: o.line, r: h / 2, font: o.font,
      }));
      cx += w + 0.1;
    });
    return els;
  }

  // 안쪽 슬라이드 공통 틀 (작은 제목 + 큰 제목 + 쪽번호)
  function frame(t, d, kicker, title, no) {
    const mono = t.style === 'dark' ? 'mono' : undefined;
    const els = [];
    const tt = fitText(title, 9.4, 0.6, 30, 18, 1.1); // 한 줄에 맞추고 넘치면 …
    if (t.style === 'bold') {
      els.push(rect(M, 0.6, 0.3, 0.3, t.accent));
      els.push(text(M + 0.45, 0.55, 6, 0.4, kicker, { size: 13, bold: true, color: t.accent, valign: 'middle' }));
      els.push(text(M, 1.0, 9.4, 0.8, tt.text, { size: tt.size + 2, bold: true, color: t.ink, ls: 1.1 }));
      els.push(text(W - M - 1.2, H - 0.75, 1.2, 0.4, String(no).padStart(2, '0'), { size: 16, bold: true, color: t.accent, align: 'right' }));
    } else {
      els.push(text(M, 0.5, 6, 0.35, t.style === 'dark' ? `// ${kicker.toLowerCase()}` : kicker, { size: 12, bold: true, color: t.accent, font: mono }));
      els.push(text(M, 0.85, 9.4, 0.8, tt.text, { size: tt.size, bold: true, color: t.ink, ls: 1.1 }));
      els.push(line(M, H - 0.62, W - 2 * M, 0, t.line, 0.75));
      els.push(text(M, H - 0.52, 6, 0.3, t.style === 'dark' ? `~/portfolio/${d.name}` : `${d.name} 포트폴리오`, { size: 10, color: t.sub, font: mono }));
      els.push(text(W - M - 2, H - 0.52, 2, 0.3, `${String(no).padStart(2, '0')} / ${String(d.total).padStart(2, '0')}`, { size: 10, color: t.sub, align: 'right', font: mono }));
    }
    return els;
  }

  /* ---------- 5. 슬라이드 종류별 배치 ---------- */
  function cover(t, d) {
    const els = [];
    const nameFit = fitText(d.name, 7.2, 1.3, 64, 40, 1.05);
    const josa = (w) => (window.PF && PF.eulReul ? PF.eulReul(w) : '을(를)');
    const intro = d.intro || (d.job ? `${d.job.name}${josa(d.job.name)} 꿈꾸는 ${d.name}입니다` : `${d.name}의 포트폴리오입니다`);
    const introFit = fitText(intro, 7.2, 1.0, 22, 15);
    const year = new Date().getFullYear();

    if (t.style === 'clean') {
      els.push(rect(8.55, 0, W - 8.55, H, t.accent));
      els.push(oval(10.2, -1.2, 4.6, 4.6, null, { line: t.onAccent, lw: 1.25, alpha: 70 }));
      els.push(oval(9.1, 4.3, 3.2, 3.2, null, { line: t.onAccent, lw: 1.25, alpha: 70 }));
      els.push(text(9.2, 4.9, 3.6, 0.35, 'TARGET', { size: 12, bold: true, color: t.onAccent }));
      els.push(text(9.2, 5.25, 3.7, 1.2, d.job ? d.job.name : '나의 경험 포트폴리오', { size: 26, bold: true, color: t.onAccent, ls: 1.1 }));
      els.push(rect(M, 1.65, 0.12, 0.42, t.accent));
      els.push(text(M + 0.28, 1.62, 6, 0.48, `PORTFOLIO ${year}`, { size: 14, bold: true, color: t.accent, valign: 'middle' }));
      els.push(text(M, 2.3, 7.4, 1.4, nameFit.text, { size: nameFit.size, bold: true, color: t.ink, ls: 1.05 }));
      els.push(text(M, 3.75, 7.4, 1.0, introFit.text, { size: introFit.size, color: t.sub }));
      els.push(...chips(M, 4.95, d.strengths, t, { size: 13, h: 0.42, maxX: 8.1 }));
      if (d.contact) els.push(text(M, 6.45, 7, 0.35, d.contact, { size: 12, color: t.sub }));
    } else if (t.style === 'bold') {
      els.push(oval(8.0, 1.3, 7.2, 7.2, t.accent));
      els.push(oval(10.9, 0.6, 1.3, 1.3, t.ink));
      els.push(text(M, 0.7, 6, 0.4, `PORTFOLIO — ${year}`, { size: 13, bold: true, color: t.ink }));
      els.push(line(M, 1.2, 1.6, 0, t.ink, 2));
      const bigName = fitText(d.name, 8.6, 1.7, 88, 44, 1.0);
      els.push(text(M, 2.0, 8.6, 1.7, bigName.text, { size: bigName.size, bold: true, color: t.ink, ls: 1.0 }));
      els.push(text(M, 3.75, 7.2, 1.0, introFit.text, { size: introFit.size, color: t.ink }));
      if (d.job) els.push(...chips(M, 4.95, [d.job.name], t, { size: 14, h: 0.46, fill: t.ink, color: t.bg }));
      els.push(...chips(M, d.job ? 5.55 : 4.95, d.strengths, t, { size: 12, h: 0.38, fill: null, line: t.ink, color: t.ink, maxX: 7.8 }));
      if (d.contact) els.push(text(9.4, 6.5, 3.3, 0.4, d.contact, { size: 12, bold: true, color: t.onAccent, align: 'right' }));
    } else {
      els.push(text(M, 1.55, 7, 0.4, '> portfolio --open', { size: 14, bold: true, color: t.accent, font: 'mono' }));
      els.push(text(M, 2.1, 7.2, 1.4, nameFit.text, { size: nameFit.size, bold: true, color: t.ink, ls: 1.05 }));
      els.push(rect(M, 3.55, 1.1, 0.07, t.accent));
      els.push(text(M, 3.85, 7.0, 1.0, introFit.text, { size: introFit.size, color: t.sub }));
      els.push(...chips(M, 5.0, d.strengths, t, { size: 12, h: 0.38, fill: t.surface, color: t.accent, font: 'mono', maxX: 7.6 }));
      if (d.contact) els.push(text(M, 6.45, 7, 0.35, d.contact, { size: 12, color: t.sub, font: 'mono' }));
      // 오른쪽 코드 창
      const cx = 8.25; const cy = 1.45; const cw = 4.4; const ch = 4.6;
      els.push(rect(cx, cy, cw, ch, t.surface, { r: 0.14, line: t.line, lw: 0.75 }));
      ['F87171', 'FBBF24', '34D399'].forEach((c, i) => els.push(oval(cx + 0.28 + i * 0.26, cy + 0.24, 0.15, 0.15, c)));
      const lines = [
        [['const ', t.sub], ['me', t.accent], [' = {', t.ink]],
        [['  name: ', t.sub], [`'${d.name}'`, 'FBBF24'], [',', t.ink]],
        [['  target: ', t.sub], [`'${d.job ? d.job.name : '-'}'`, 'FBBF24'], [',', t.ink]],
        [['  skills: [', t.sub]],
        ...d.strengths.map((s, i) => [[`    '${s}'`, 'FBBF24'], [i < d.strengths.length - 1 ? ',' : '', t.ink]]),
        [['  ],', t.sub]],
        [['  projects: ', t.sub], [String(d.projectCount), t.accent]],
        [['};', t.ink]],
      ].slice(0, 11);
      lines.forEach((ln, i) => els.push(text(cx + 0.3, cy + 0.6 + i * 0.33, cw - 0.5, 0.32, ln.map(([s, c]) => ({ t: s, c })), { size: 12, font: 'mono' })));
    }
    return { bg: t.bg, els };
  }

  function about(t, d, no) {
    const els = frame(t, d, 'ABOUT ME', '한눈에 보기', no);
    const top = 2.0;
    const mono = t.style === 'dark' ? 'mono' : undefined;
    // 왼쪽: 강점 역량 3개
    els.push(text(M, top, 5.4, 0.35, '강점 역량', { size: 13, bold: true, color: t.sub }));
    const cardH = 1.2;
    d.strengthInfo.slice(0, 3).forEach((s, i) => {
      const y = top + 0.5 + i * (cardH + 0.18);
      els.push(rect(M, y, 5.6, cardH, t.surface, { r: 0.12, line: t.style === 'bold' ? t.line : undefined, lw: 0.75 }));
      els.push(text(M + 0.25, y + 0.22, 0.6, 0.6, String(i + 1), { size: 18, bold: true, color: t.onAccent, fill: t.accent, r: 0.3, align: 'center', valign: 'middle' }));
      els.push(text(M + 1.05, y + 0.16, 3.0, 0.45, s.tag, { size: 19, bold: true, color: t.ink }));
      els.push(text(M + 4.1, y + 0.2, 1.3, 0.4, `경험 ${s.count}개`, { size: 12, bold: true, color: t.accent, align: 'right', font: mono }));
      const ev = fitText(s.evidence ? `근거 · ${s.evidence}` : '관련 기록에서 자주 나타난 역량', 4.3, 0.42, 12, 10);
      els.push(text(M + 1.05, y + 0.65, 4.3, 0.45, ev.text, { size: ev.size, color: t.sub }));
    });
    if (!d.strengthInfo.length) els.push(text(M, top + 0.6, 5.4, 0.5, '프로젝트에 묶인 기록이 쌓이면 강점 역량이 나타나요.', { size: 13, color: t.sub }));

    // 오른쪽: 목표 직무 적합도 (없으면 역량 분포)
    const rx = 6.85; const rw = W - M - rx; const ry = top; const rh = 4.55;
    els.push(rect(rx, ry, rw, rh, t.style === 'clean' ? t.soft : t.surface, { r: 0.16, line: t.style === 'bold' ? t.line : undefined, lw: 0.75 }));
    let rows;
    if (d.job && d.fit) {
      els.push(text(rx + 0.35, ry + 0.3, 3.4, 0.3, '목표 직무', { size: 12, bold: true, color: t.sub }));
      const jn = fitText(d.job.name, 3.6, 0.55, 24, 16, 1.1);
      els.push(text(rx + 0.35, ry + 0.62, 3.6, 0.6, jn.text, { size: jn.size, bold: true, color: t.ink, ls: 1.1 }));
      els.push(text(rx + rw - 2.1, ry + 0.25, 1.8, 0.3, '필요 역량 충족', { size: 11, color: t.sub, align: 'right' }));
      els.push(text(rx + rw - 2.1, ry + 0.5, 1.8, 0.75, `${d.fit.rate}%`, { size: 40, bold: true, color: t.accent, align: 'right', font: mono, ls: 1 }));
      rows = d.fit.rows.slice(0, 5).map((r) => ({ label: r.tag, ratio: r.ratio, note: `${r.have} / ${r.need}` }));
    } else {
      els.push(text(rx + 0.35, ry + 0.3, 4, 0.3, '역량 분포', { size: 12, bold: true, color: t.sub }));
      els.push(text(rx + 0.35, ry + 0.62, 5, 0.6, '기록에 남은 역량 태그', { size: 22, bold: true, color: t.ink }));
      const max = Math.max(1, ...d.allTags.map(([, n]) => n));
      rows = d.allTags.slice(0, 5).map(([tag, n]) => ({ label: tag, ratio: n / max, note: `${n}개` }));
    }
    rows.forEach((r, i) => {
      const y = ry + 1.65 + i * 0.52;
      els.push(text(rx + 0.35, y, 1.55, 0.32, r.label, { size: 12, bold: true, color: t.ink, valign: 'middle' }));
      els.push(rect(rx + 1.95, y + 0.1, rw - 3.15, 0.14, { clean: 'FFFFFF', bold: t.soft, dark: t.bg }[t.style], { r: 0.07 }));
      if (r.ratio > 0) els.push(rect(rx + 1.95, y + 0.1, Math.max(0.14, (rw - 3.15) * r.ratio), 0.14, t.accent, { r: 0.07 }));
      els.push(text(rx + rw - 1.1, y, 0.8, 0.32, r.note, { size: 11, color: t.sub, align: 'right', valign: 'middle', font: mono }));
    });
    return { bg: t.bg, els };
  }

  function contents(t, d, no) {
    const els = frame(t, d, 'CONTENTS', '프로젝트 목차', no);
    const list = d.projects.slice(0, 6);
    const two = list.length > 3;
    const colW = two ? (W - 2 * M - 0.4) / 2 : W - 2 * M;
    const mono = t.style === 'dark' ? 'mono' : undefined;
    list.forEach((p, i) => {
      const col = two ? Math.floor(i / 3) : 0;
      const row = two ? i % 3 : i;
      const x = M + col * (colW + 0.4);
      const y = 2.05 + row * 1.42;
      els.push(line(x, y, colW, 0, t.line, 0.75));
      els.push(text(x, y + 0.2, 1.0, 0.8, String(i + 1).padStart(2, '0'), { size: 30, bold: true, color: t.accent, font: mono, ls: 1 }));
      const tt = fitText(p.title, colW - 1.2, 0.45, 19, 13, 1.1);
      els.push(text(x + 1.15, y + 0.2, colW - 1.2, 0.45, tt.text, { size: tt.size, bold: true, color: t.ink, ls: 1.1 }));
      els.push(text(x + 1.15, y + 0.66, 2.2, 0.3, p.period || '', { size: 11, color: t.sub, font: mono }));
      els.push(...chips(x + 1.15 + (p.period ? 1.9 : 0), y + 0.64, p.tags.slice(0, 3), t, { size: 10, h: 0.3, maxX: x + colW, fill: t.style === 'dark' ? t.surface : t.soft }));
    });
    return { bg: t.bg, els };
  }

  // 프로젝트 1장
  function project(t, d, p, idx, no) {
    const els = [];
    const mono = t.style === 'dark' ? 'mono' : undefined;
    const label = (x, y, w, s) => text(x, y, w, 0.3, s, { size: 12, bold: true, color: t.accent, font: mono });
    const key = keyResult(p.star.r);
    const big = bigNumber(p.star.r);
    const problem = [txt(p.star.s), txt(p.star.t)].filter(Boolean).join('\n');
    const st = steps(p.star.a);
    const hasStar = !!(problem || st.length || txt(p.star.r));

    // 관련 기록 목록 (STAR가 없을 때)
    function recordList(x, y, w, h) {
      const out = [label(x, y, w, '관련 기록')];
      const rows = p.records.slice(0, 6);
      const rh = Math.min(0.62, (h - 0.45) / Math.max(1, rows.length));
      rows.forEach((r, i) => {
        const yy = y + 0.45 + i * rh;
        out.push(line(x, yy, w, 0, t.line, 0.5));
        out.push(text(x, yy + 0.12, 1.3, 0.35, r.date || '', { size: 11, color: t.sub, font: mono, valign: 'middle' }));
        const tt = fitText(r.title, w - 1.5, 0.38, 14, 11);
        out.push(text(x + 1.4, yy + 0.1, w - 1.5, 0.4, tt.text, { size: tt.size, bold: true, color: t.ink, valign: 'middle' }));
      });
      return out;
    }

    if (t.style === 'bold') {
      // 왼쪽 색 면 + 오른쪽 내용
      const lw = 5.0;
      els.push(rect(0, 0, lw, H, t.accent));
      els.push(text(M, 0.6, 3, 0.9, String(idx + 1).padStart(2, '0'), { size: 54, bold: true, color: t.onAccent, ls: 1 }));
      const tt = fitText(p.title, lw - 2 * M + 0.2, 1.3, 30, 20, 1.1);
      els.push(text(M, 1.65, lw - 2 * M + 0.2, 1.3, tt.text, { size: tt.size, bold: true, color: t.onAccent, ls: 1.1 }));
      els.push(text(M, 3.0, lw - M, 0.3, p.period || '', { size: 12, color: t.onAccent }));
      if (big) els.push(text(M, 3.55, lw - M, 0.95, big, { size: 46, bold: true, color: t.onAccent, ls: 1 }));
      const hl = fitText(key || txt(p.star.r) || `기록 ${p.records.length}개로 정리한 프로젝트`, lw - 2 * M + 0.2, 1.1, 16, 11);
      els.push(text(M, big ? 4.55 : 3.6, lw - 2 * M + 0.2, 1.1, hl.text, { size: hl.size, color: t.onAccent }));
      els.push(...chips(M, H - 1.05, p.tags.slice(0, 3), t, { size: 11, h: 0.34, fill: t.onAccent, color: t.accent, maxX: lw - 0.3 }));
      const x = lw + 0.65; const w = W - M - x;
      if (!hasStar) { els.push(...recordList(x, 0.8, w, H - 1.6)); return { bg: t.bg, els }; }
      let y = 0.75;
      const sec = (title, h, body) => {
        els.push(label(x, y, w, title));
        body(y + 0.38, h - 0.5);
        y += h;
        els.push(line(x, y - 0.12, w, 0, t.line, 0.75));
      };
      sec('문제', 1.55, (yy, hh) => { const f = fitText(problem || '—', w, hh, 15, 10); els.push(text(x, yy, w, hh, f.text, { size: f.size, color: t.ink })); });
      sec('내가 한 일', 2.75, (yy, hh) => stepList(els, t, st, x, yy, w, hh, mono));
      sec('결과', 1.75, (yy, hh) => { const f = fitText(txt(p.star.r) || '—', w, hh, 15, 10); els.push(text(x, yy, w, hh, numRuns(f.text, t.ink, t.accent), { size: f.size })); });
      return { bg: t.bg, els };
    }

    // clean / dark: 위 제목, 핵심 성과 띠, 3칸
    els.push(...frame(t, d, `PROJECT ${String(idx + 1).padStart(2, '0')}`, p.title, no));
    els.push(text(W - M - 3, 0.5, 3, 0.35, p.period || '', { size: 12, color: t.sub, align: 'right', font: mono }));
    els.push(...chips(M, 1.72, p.tags.slice(0, 4), t, { size: 11, h: 0.32, fill: t.style === 'dark' ? t.surface : t.soft, font: mono, maxX: W - M }));
    if (!hasStar) { els.push(...recordList(M, 2.4, W - 2 * M, 4.3)); return { bg: t.bg, els }; }

    const bandY = 2.3;
    const headline = key || txt(p.star.r).split(/,|\.(?!\d)/)[0] || '';
    if (headline) {
      els.push(rect(M, bandY, W - 2 * M, 0.72, t.style === 'dark' ? t.surface : t.soft, { r: 0.1 }));
      els.push(text(M + 0.25, bandY + 0.17, 1.15, 0.38, '핵심 성과', { size: 11, bold: true, color: t.onAccent, fill: t.accent, r: 0.19, align: 'center', valign: 'middle' }));
      const hl = fitText(headline, W - 2 * M - 1.8, 0.5, 18, 12);
      els.push(text(M + 1.6, bandY + 0.1, W - 2 * M - 1.8, 0.52, numRuns(hl.text, t.ink, t.accent), { size: hl.size, valign: 'middle', bold: true }));
    }
    const colY = headline ? 3.25 : 2.4;
    const colH = H - 0.85 - colY;
    const gap = 0.28;
    const cw = (W - 2 * M - 2 * gap) / 3;
    const cardFill = t.surface;
    const cols = [M, M + cw + gap, M + 2 * (cw + gap)];
    cols.forEach((cx, i) => els.push(rect(cx, colY, cw, colH, i === 2 && t.style === 'clean' ? t.soft : cardFill, { r: 0.12, line: t.style === 'dark' && i === 2 ? t.accent : undefined, lw: 1 })));
    const pad = 0.28; const iw = cw - 2 * pad;
    els.push(label(cols[0] + pad, colY + 0.25, iw, '문제'));
    const pf = fitText(problem || '—', iw, colH - 0.8, 15, 10);
    els.push(text(cols[0] + pad, colY + 0.65, iw, colH - 0.8, pf.text, { size: pf.size, color: t.ink }));
    els.push(label(cols[1] + pad, colY + 0.25, iw, '내가 한 일'));
    stepList(els, t, st, cols[1] + pad, colY + 0.65, iw, colH - 0.8, mono);
    els.push(label(cols[2] + pad, colY + 0.25, iw, '결과'));
    let ry = colY + 0.65;
    if (big) {
      els.push(text(cols[2] + pad, ry, iw, 0.85, big, { size: 40, bold: true, color: t.accent, ls: 1, font: mono }));
      ry += 0.95;
    }
    const rf = fitText(txt(p.star.r) || '—', iw, colY + colH - 0.2 - ry, 14, 10);
    els.push(text(cols[2] + pad, ry, iw, colY + colH - 0.2 - ry, numRuns(rf.text, t.ink, t.accent), { size: rf.size }));
    return { bg: t.bg, els };
  }

  // 번호 동그라미 + 단계 글
  function stepList(els, t, st, x, y, w, h, mono) {
    if (!st.length) { els.push(text(x, y, w, 0.4, '—', { size: 14, color: t.sub })); return; }
    const each = h / st.length;
    const base = Math.min(...st.map((s) => fitSize(s, w - 0.5, each - 0.08, 14, 10)));
    st.forEach((s, i) => {
      const yy = y + i * each;
      els.push(text(x, yy + 0.02, 0.3, 0.3, String(i + 1), { size: 11, bold: true, color: t.onAccent, fill: t.accent, r: 0.15, align: 'center', valign: 'middle', font: mono }));
      const f = clamp(s, w - 0.5, each - 0.08, base);
      els.push(text(x + 0.45, yy, w - 0.45, each - 0.05, numRuns(f, t.ink, t.accent), { size: base }));
    });
  }

  function others(t, d, no) {
    const els = frame(t, d, 'EXPERIENCE', '그 밖의 경험', no);
    const list = d.otherRecords.slice(0, 7);
    const mono = t.style === 'dark' ? 'mono' : undefined;
    const lx = M + 1.75;
    els.push(line(lx, 2.1, 0, Math.max(0.6, list.length * 0.64 - 0.1), t.line, 1.5));
    list.forEach((r, i) => {
      const y = 2.0 + i * 0.64;
      els.push(text(M, y, 1.5, 0.4, r.date || '', { size: 12, color: t.sub, align: 'right', valign: 'middle', font: mono }));
      els.push(oval(lx - 0.09, y + 0.11, 0.18, 0.18, t.accent));
      const srcW = textWidthIn(r.source, 10) + 0.3;
      els.push(text(lx + 0.3, y + 0.05, srcW, 0.3, r.source, { size: 10, bold: true, color: t.accent, fill: t.style === 'dark' ? t.surface : t.soft, r: 0.15, align: 'center', valign: 'middle' }));
      const tt = fitText(r.title, W - M - (lx + 0.45 + srcW), 0.4, 16, 11);
      els.push(text(lx + 0.45 + srcW, y, W - M - (lx + 0.45 + srcW), 0.4, tt.text, { size: tt.size, bold: true, color: t.ink, valign: 'middle' }));
    });
    return { bg: t.bg, els };
  }

  function closing(t, d) {
    const els = [];
    const sub = [d.name, d.job ? d.job.name : '', d.contact].filter(Boolean).join('   ·   ');
    if (t.style === 'clean') {
      els.push(rect(0, 0, W, H, t.accent));
      els.push(oval(-1.6, 4.2, 5, 5, null, { line: t.onAccent, lw: 1.25, alpha: 70 }));
      els.push(oval(10.6, -1.8, 4.4, 4.4, null, { line: t.onAccent, lw: 1.25, alpha: 70 }));
      els.push(text(0, 2.6, W, 1.2, '감사합니다', { size: 56, bold: true, color: t.onAccent, align: 'center', valign: 'middle' }));
      els.push(text(0, 3.95, W, 0.5, sub, { size: 16, color: t.onAccent, align: 'center' }));
      return { bg: t.accent, els };
    }
    if (t.style === 'bold') {
      els.push(oval(-2.2, 3.6, 6.4, 6.4, t.accent));
      els.push(text(M + 3.4, 2.2, 9, 1.6, [{ t: 'Thank you', c: t.ink }, { t: '.', c: t.accent }], { size: 80, bold: true, ls: 1 }));
      els.push(line(M + 3.5, 4.1, 1.6, 0, t.ink, 2));
      els.push(text(M + 3.4, 4.35, 8.5, 0.5, sub, { size: 16, bold: true, color: t.ink }));
      return { bg: t.bg, els };
    }
    els.push(text(0, 2.2, W, 0.5, '$ exit 0', { size: 18, bold: true, color: t.accent, align: 'center', font: 'mono' }));
    els.push(text(0, 2.85, W, 1.1, '감사합니다', { size: 54, bold: true, color: t.ink, align: 'center', valign: 'middle' }));
    els.push(text(0, 4.1, W, 0.5, sub, { size: 15, color: t.sub, align: 'center', font: 'mono' }));
    return { bg: t.bg, els };
  }

  /* ---------- 6. 전체 슬라이드 목록 ---------- */
  // d: { name, intro, contact, job, fit, strengths, strengthInfo, allTags, projects, otherRecords, sections }
  function build(themeId, d) {
    const t = THEMES[themeId] || THEMES.plan;
    const plan = [{ type: 'cover' }];
    if (d.sections.about) plan.push({ type: 'about' });
    if (d.sections.contents && d.projects.length > 1) plan.push({ type: 'contents' });
    d.projects.forEach((p, i) => plan.push({ type: 'project', p, i }));
    if (d.sections.others && d.otherRecords.length) plan.push({ type: 'others' });
    if (d.sections.closing) plan.push({ type: 'closing' });
    const data = { ...d, total: plan.length, projectCount: d.projects.length };
    return plan.map((s, i) => {
      const no = i + 1;
      const slide = s.type === 'cover' ? cover(t, data)
        : s.type === 'about' ? about(t, data, no)
          : s.type === 'contents' ? contents(t, data, no)
            : s.type === 'project' ? project(t, data, s.p, s.i, no)
              : s.type === 'others' ? others(t, data, no)
                : closing(t, data);
      slide.type = s.type;
      slide.label = { cover: '표지', about: '한눈에 보기', contents: '목차', others: '그 밖의 경험', closing: '마무리' }[s.type] || s.p.title;
      return slide;
    });
  }

  /* ---------- 7. 화면에 그리기 (HTML) ---------- */
  // style="..." 안에 들어가므로 글꼴 이름은 작은따옴표로
  const FONT = { main: "'Pretendard Variable', Pretendard, 'Malgun Gothic', sans-serif", mono: "'JetBrains Mono', Consolas, 'D2Coding', monospace" };
  const px = (v) => `${(v * PX).toFixed(2)}px`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function toHTML(slide) {
    let html = `<div class="pf-slide" style="position:relative;width:${W * PX}px;height:${H * PX}px;overflow:hidden;background:#${slide.bg};font-family:${FONT.main};">`;
    slide.els.forEach((e) => {
      const box = `position:absolute;left:${px(e.x)};top:${px(e.y)};width:${px(Math.max(e.w, 0))};height:${px(Math.max(e.h, 0))};`;
      if (e.k === 'rect' || e.k === 'ellipse') {
        const radius = e.k === 'ellipse' ? '50%' : e.r ? px(e.r) : '0';
        const fill = e.fill ? `background:#${e.fill};` : '';
        const border = e.line ? `border:${(e.lw || 1) * 1.333}px solid #${e.line};box-sizing:border-box;` : '';
        const op = e.alpha ? `opacity:${(100 - e.alpha) / 100};` : '';
        html += `<div style="${box}${fill}${border}border-radius:${radius};${op}"></div>`;
      } else if (e.k === 'line') {
        const lw = (e.lw || 1) * 1.333;
        const st = e.h === 0 ? `left:${px(e.x)};top:${px(e.y)};width:${px(e.w)};height:${lw}px;` : `left:${px(e.x)};top:${px(e.y)};width:${lw}px;height:${px(e.h)};`;
        html += `<div style="position:absolute;${st}background:#${e.color};"></div>`;
      } else if (e.k === 'text') {
        const just = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[e.valign];
        const fill = e.fill ? `background:#${e.fill};` : '';
        const border = e.line ? `border:1.33px solid #${e.line};box-sizing:border-box;` : '';
        const runs = e.runs.map((r) => `<span style="color:#${r.c || e.color};${r.b || e.bold ? 'font-weight:800;' : 'font-weight:500;'}">${esc(r.t)}</span>`).join('');
        html += `<div style="${box}${fill}${border}border-radius:${e.r ? px(e.r) : 0};display:flex;flex-direction:column;justify-content:${just};">`
          + `<div style="font-family:${FONT[e.font || 'main']};font-size:${(e.size * 4) / 3}px;line-height:${e.ls * 1.2};text-align:${e.align};white-space:pre-wrap;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-0.01em;">${runs}</div></div>`;
      }
    });
    return `${html}</div>`;
  }

  /* ---------- 8. PPTX 만들기 (PptxGenJS) ---------- */
  const PPT_FONT = { main: 'Malgun Gothic', mono: 'Consolas' };
  async function toPptx(slides, meta) {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5
    pptx.author = meta.name;
    pptx.title = `${meta.name} 포트폴리오`;
    slides.forEach((s) => {
      const sl = pptx.addSlide();
      sl.background = { color: s.bg };
      s.els.forEach((e) => {
        if (e.k === 'rect' || e.k === 'ellipse') {
          sl.addShape(e.k === 'ellipse' ? pptx.ShapeType.ellipse : (e.r ? pptx.ShapeType.roundRect : pptx.ShapeType.rect), {
            x: e.x, y: e.y, w: e.w, h: e.h,
            fill: e.fill ? { color: e.fill } : { type: 'none' },
            line: e.line ? { color: e.line, width: e.lw || 1, transparency: e.alpha || 0 } : { type: 'none' },
            ...(e.r ? { rectRadius: e.r } : {}),
          });
        } else if (e.k === 'line') {
          sl.addShape(pptx.ShapeType.line, { x: e.x, y: e.y, w: e.w, h: e.h, line: { color: e.color, width: e.lw || 1 } });
        } else if (e.k === 'text') {
          const runs = [];
          e.runs.forEach((r) => {
            const parts = String(r.t).split('\n');
            parts.forEach((part, i) => {
              runs.push({ text: part, options: { color: r.c || e.color, bold: !!(r.b || e.bold), breakLine: i < parts.length - 1 } });
            });
          });
          sl.addText(runs, {
            x: e.x, y: e.y, w: e.w, h: e.h,
            fontFace: PPT_FONT[e.font || 'main'], fontSize: e.size, align: e.align, valign: e.valign,
            lineSpacingMultiple: e.ls, margin: 0, wrap: true, fit: 'none',
            ...(e.fill ? { fill: { color: e.fill } } : {}),
            ...(e.line ? { line: { color: e.line, width: 1 } } : {}),
            ...(e.r ? { shape: pptx.ShapeType.roundRect, rectRadius: e.r } : {}),
          });
        }
      });
    });
    await pptx.writeFile({ fileName: `${meta.fileName}.pptx` });
  }

  window.PFSlides = { THEMES, W, H, PX, themeForJob, build, toHTML, toPptx };
})();
