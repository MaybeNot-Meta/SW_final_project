# 포트폴리오 메뉴

기능 명세 「포트폴리오」의 1차 기능 세 가지를 구현했습니다.

| 화면 | 파일 | 하는 일 | 저장 |
|---|---|---|---|
| 프로젝트 묶기 | `index.html` | 정리 안 된 기록을 끌어다 프로젝트로 묶고, 묶인 기록의 태그를 대표 역량으로 표시 | `project.recordIds` |
| STAR 정리 | `star.html` | 상황 → 과제 → 행동 → 결과 질문, 묶인 기록 참고 패널, 문장 틀 미리보기(자소서 문장형 / STAR 항목형) | `project.star` |
| 포트폴리오 만들기 | `export.html` | 프로젝트로 발표용 슬라이드(16:9)를 만듦. 목표 직무에 어울리는 디자인 테마 자동 선택, .pptx(파워포인트)·PDF 저장, 발표 모드 | 저장 없음 |

2차 기능인 「PDF 불러오기」는 포함하지 않았습니다.

## 폴더 구조

```
portfolio/
├── index.html          프로젝트 묶기 (헤더의 "포트폴리오" 메뉴가 연결할 주소)
├── star.html           STAR 정리
├── export.html         포트폴리오 만들기 (PPT 슬라이드)
├── css/portfolio.css   클래스 이름에 모두 pf- 접두사가 붙어 다른 CSS와 겹치지 않음
└── js/
    ├── portfolio-common.js   세 화면 공통 도우미 + 단독 실행용 대체 코드
    ├── projects.js
    ├── star.js
    ├── slides.js             슬라이드 테마·배치, 미리보기·PPTX 그리기
    └── export.js             포트폴리오 만들기 화면
```

`portfolio/` 폴더를 저장소 루트의 `common/`, `data/` 옆에 그대로 넣으면 됩니다.

## 팀 공통 파일과 연결되는 방식

- **저장**: 모든 읽기·쓰기를 `common/storage.js` 함수로 합니다. 쓰는 함수는 `getUser()`, `getRecords()`, `saveRecord()`, `getProjects()`, `saveProject()`이고, localStorage를 직접 건드리지 않습니다.
- **헤더**: 각 페이지에 `<div id="header"></div>`가 있고 `../common/header.js`를 불러옵니다.
- **직무 데이터**: `export.html`이 `../data/jobs.js`를 불러옵니다. 그 파일의 `const jobs = [...]` 또는 `const JOBS = [...]` 배열을 사용합니다.
- **목표 직무**: `user.targetJob`이 id 또는 직무 이름이면 자동으로 찾아서 표시합니다.

### 혼자 테스트할 때 (합치기 전)
`common/storage.js`가 없으면 `portfolio-common.js` 안의 **단독 실행용 저장 함수**가 대신 동작합니다. 직무 데이터가 없으면 테스트용 직무 3개를 씁니다. 공통 파일이 생기면 대체 코드는 자동으로 꺼집니다. 이때 콘솔에 404 오류(`common/storage.js`, `common/header.js`, `data/jobs.js`)가 뜨는 것은 정상입니다.
기록이 하나도 없으면 「시연용 샘플 기록 넣기」 버튼이 나옵니다. 이 버튼도 `saveRecord()`로 저장합니다.

로컬 서버로 여는 것을 권장합니다. 예: VS Code의 Live Server, 또는 저장소 루트에서 `python -m http.server`를 실행한 뒤 `http://localhost:8000/portfolio/`로 접속합니다.

## 다른 팀원에게 부탁할 것

1. **`common/storage.js`에 `deleteProject(id)` 추가**
   공통 함수 목록에 삭제 함수가 없습니다. 이 함수가 없으면 프로젝트 「삭제」 버튼이 자동으로 숨겨집니다.
2. **`saveProject(project)`는 id가 같으면 덮어쓰기(upsert)** 로 동작해야 합니다.
3. **STAR 정리로 들어오는 주소** (부족 역량 분석 「STAR 정리하기」, 참여 기록 「포트폴리오로 보내기」)
   - `portfolio/star.html?project=프로젝트ID` : 그 프로젝트를 엽니다.
   - `portfolio/star.html?record=기록ID` : 그 기록이 든 프로젝트를 엽니다. 그런 프로젝트가 없으면 그 기록으로 새 프로젝트를 만들어 엽니다. 쉼표로 여러 개를 넘길 수 있습니다(`record=a,b`).
4. **포트폴리오 만들기 주소**: `portfolio/export.html?theme=dev` 처럼 테마를 정해서 열 수 있습니다(`plan`, `data`, `design`, `content`, `dev`).

## 사용한 오픈소스 (CDN)
- Pretendard v1.3.9, Lucide 1.77.0
- SortableJS 1.15.7 (끌어다 놓기)
- PptxGenJS 4.0.1 (.pptx 파일 만들기) — 기능 명세 오픈소스 목록에 없어서 새로 추가했습니다
- html2pdf.js 0.14.0 (슬라이드를 PDF로 저장)

## 참고
- 「한눈에 보기」 슬라이드의 「필요 역량 충족 %」는 직무 매칭과 같은 방식으로 계산합니다. 역량별 충족도(내 경험 수 ÷ 필요 수준, 최대 1)를 구한 뒤 평균을 냅니다.
- STAR 문장은 AI 없이 답변을 문장 틀에 끼워 넣어 만듭니다. 을/를 같은 조사와 "~했다 → ~했습니다" 같은 어미는 자동으로 맞춥니다.
- 역량 태그 목록은 `portfolio-common.js` 맨 위의 `TAGS`에 있습니다. 1주차 회의에서 태그가 확정되면 이 목록만 바꾸면 됩니다.

## 포트폴리오 슬라이드 구성
표지 → 한눈에 보기(강점 역량·직무 적합도) → 목차 → 프로젝트 1장씩 → 그 밖의 경험 → 마무리 순서입니다. 표지 외에는 화면에서 켜고 끌 수 있습니다.

| 테마 | 어울리는 직무 (직무가 가장 많이 요구하는 역량 기준) | 느낌 |
|---|---|---|
| 기획 | 기획 · 사용자 리서치 · 협업 | 흰 바탕 + 블루, 깔끔한 카드 |
| 데이터 | 데이터 분석 | 흰 바탕 + 틸 |
| 디자인 | 디자인 | 크림 바탕 + 코랄, 큰 글씨·큰 도형 |
| 콘텐츠 | 영상 · 글쓰기 · 발표 | 크림 바탕 + 오렌지 |
| 개발 | 개발 | 어두운 바탕 + 초록, 코드 창 느낌 |

화면 미리보기와 .pptx는 같은 배치값(js/slides.js)으로 그려서 모양이 같습니다. .pptx 글꼴은 대부분의 컴퓨터에 있는 맑은 고딕을 씁니다.
