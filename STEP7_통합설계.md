# STEP 7-5. 기능 보존 중심 통합 설계 (실행 가능한 1차 준비본)

## 이번 결과의 범위

- 기존 STEP 1~6 원본 프로젝트를 **수정하거나 덮어쓰지 않음**.
- 네 ZIP에서 웹소스만 추출했으며, 원본 소스 파일 내용을 **1바이트도 수정하지 않고** 별도 경로에 복사함.
- `경험 채우기`의 `.venv` Python 가상환경은 웹 실행과 무관하므로 제외함.
- `step7-preview.html`은 원본 기능을 개별 확인하기 위한 **테스트용 허브**. 전체 서비스의 데이터·화면 연동은 아직 완료되지 않음.
- 실제 브라우저 상호작용 테스트, GitHub PR 생성, STEP 1~6 회귀 테스트는 사용자의 로컬 저장소에서 진행해야 함.

## 1. 선택한 설계: 폴더 격리 → 데이터 어댑터 → 디자인 통일 → 메뉴 연결

기능을 그대로 보존해야 하는 상황이므로 **원본 파일명부터 일괄 변경하거나 `storage.js`를 덮어쓰는 방식은 사용하지 않는다**.

| 원본 파트 | 이 준비본에서의 경로 | 현재 테스트 진입 주소 |
|---|---|---|
| 경험 기록 | `modules/record/` | `modules/record/index.html` |
| 직무 연결 | `modules/job/` | `modules/job/index.html` |
| 포트폴리오 | `portfolio/` | `portfolio/index.html`, `portfolio/star.html`, `portfolio/export.html` |
| 경험 채우기 | `modules/fill/` | `modules/fill/index.html`, `modules/fill/fill-recommend.html` |

특히 `portfolio/`는 원본에서 `../common/storage.js`, `../common/header.js` 등을 참조하므로 **프로젝트 루트 바로 아래에 배치**했다. 다른 파트는 내부 상대경로를 보존할 수 있도록 분리했다.

### 오염 방지 확인

`STEP7_SHA256.json`에 각 팀원 소스 파일의 SHA-256을 기록했다. 준비본 생성 시 추출본과 최종 복사본을 바이트 비교해 모두 일치함을 확인했다. 팀원 코드 함수·이벤트·스타일은 한 글자도 변경하지 않았다.

## 2. 파일명 충돌 처리 방침

- 루트 `index.html`: **우리 STEP 4~6 온보딩/메인 홈만 사용**. 팀원의 각 `index.html`은 자기 폴더에 둔다.
- 루트 `common/storage.js`: **절대 덮어쓰지 않는다**. 직무 연결과 경험 채우기의 동명 `storage.js`는 격리 폴더에서만 독립 실행용으로 남겨둔다.
- `data/jobs.js`: 직무 연결(6개, `OPSJOB.data.jobs`)과 경험 채우기(5개, 전역 `JOBS`)가 별개. 단순히 두 파일을 합치거나 하나를 덮어쓰지 않는다.
- `data/contests.js`: 직무 연결의 예시 데이터와 경험 채우기 실제 시연 데이터를 별도로 유지한다.
- 루트 `js/home.js`, `js/dashboard.js`, `mypage.html` 및 공통 CSS: **수정 없음**.

## 3. 데이터 계약 — 통합 전 반드시 해결할 문제

| 구분 | 공통 STEP 1~6 | 경험 기록 | 직무 연결 | 포트폴리오 | 경험 채우기 |
|---|---|---|---|---|---|
| 사용자 | `user` | (직접 사용 거의 없음) | `user` | `user` | `user` |
| 경험 | `records` | `growpath-records` | `records` | `records` | `record` |
| 프로젝트 | `projects` | 선택 기록으로 이동 UI | - | `projects` | `project` |
| 스크랩 | `scraps` | - | - | - | `scrap` + `scrapStatus` |
| 관심 태그 | `interestTags` | 분류 및 자체 태그 | `testResult.tempTags` | 기록의 `tags` | `testResult.tempTags` |

**해결 우선순위**: 원본 저장 데이터 백업 → 읽기 전용 호환 데이터 모델 설계 → 경험 기록 태그·템플릿 매핑 검증 → 원본과 공통 데이터 동기화 방법 결정 → 이중 저장/중복 생성 방지 → 저장·수정·삭제 회귀 테스트.

### 절대 하지 말아야 할 것

- `localStorage.clear()`로 기존 데이터를 지우지 않기.
- `record`와 `records`를 이름만 같게 바꿔 덮어쓰지 않기.
- 기존 경험 ID를 임의로 재부여하지 않기(프로젝트 `recordIds` 및 링크 손상).
- 별도 검증 없이 비표준 역량 태그(`팀워크`, `UI/UX`, `Git` 등)를 기존 공통 TAGS에 그대로 저장하지 않기.
- 팀원의 STAR·KPT·자유 기록의 `fields`, `summary` 등 원본 정보를 누락해 단순화하지 않기.
- 샘플 데이터로 실제 기존 데이터를 덮어쓰거나 테스트 원본 사용자 정보를 초기화하지 않기.

### 안전한 어댑터 전략 (다음 작업)

1. 먼저 **읽기 전용** 어댑터에서 원본 경험의 `title`, `date`, `summary`, `fields`, `template`, `tags`, `id`, `category`를 모두 보존한 통합 보기 모델을 생성한다.
2. 필요한 경우에만 역량 태그에 `TAGS` 매핑을 적용하고, 변환 불가능한 원본 태그는 삭제하지 않고 원본 필드에 보존한다.
3. 원본 키(`growpath-records`, `record`)를 그대로 둔 채 공통 `records`에 연결하는 동기화는 **삭제·수정·중복·ID 충돌 시험을 모두 통과한 뒤** 도입한다.
4. 직무 연결의 `OPSJOB.storage`를 바꾸지 않고, 해당 함수가 받는 읽기 데이터의 호환성을 맞춘다. 유형 1은 `interestTags`를 필요한 형태로 전달하되 원본 `user`를 덮어쓰지 않는다.
5. 경험 채우기의 `StorageAPI`는 자신의 `scrapStatus`를 유지해야 한다. `scraps`의 단순 ID 배열과 `scrapStatus` 상태 정보는 성격이 다르므로 별도 관리한다.

## 4. 최종 페이지 주소 목표

| 기능 | 최종 진입 경로로 사용할 주소 | 참고 |
|---|---|---|
| 홈/온보딩 | `index.html` | 기존 유지 |
| 마이페이지 | `mypage.html` | 기존 유지 |
| 경험 기록 | `modules/record/index.html` | 원본 내부 탭 4개 유지; 나중에 필요하면 `?tab=` 지원하는 *별도 작은 어댑터* 추가 |
| 직무 연결 | `modules/job/index.html` | `OPSJOB` 모듈 유지 |
| 포트폴리오 | `portfolio/index.html` | 내부 `star.html`, `export.html` 유지 |
| 경험 채우기 | `modules/fill/fill-recommend.html` | 내부 상세·스크랩·참여 경로 유지 |

기존 STEP 3 헤더는 상대경로(`index.html`, `record-list.html`, `job-match.html` 등)를 사용하므로, **하위 폴더에서 공통 헤더가 오작동할 수 있다**. 추후 저장 기능과 분리된 루트 기준 경로 계산기 또는 `header.js` 증분 패치로 처리한다. `record-write.html?title=...` 등을 단순 리디렉트만 하면 질문·템플릿 데이터 전달 기능이 사라지므로 실제 대응 경로를 확인해야 한다.

## 5. 디자인 통일 전략

- 공통 디자인 `common/tokens.css` 및 `common/base.css`의 값(블루·라일락·Pretendard)을 기준으로 한다.
- 각 팀원 CSS의 **전역 선택자**(`body`, `button`, `input`, `.chip` 등)를 먼저 찾고, 모듈별 범위를 확인한 다음 스타일 충돌을 최소화한다.
- 가능한 한 각 모듈의 기존 클래스명과 HTML `id`, `data-*`, 이벤트를 보존한다.
- 버튼 색상, 배경, 폰트, 둥근 모서리, 여백, 헤더는 수정 가능하되 레이더/히트맵/정렬·드래그 등의 시각화를 깨뜨리지 않는다.
- 포트폴리오 내보내기의 선택 가능한 테마는 기능으로 보고 보존한다(전부 한 색으로 변경하지 않음).

## 6. 안전한 실제 통합 순서

**0차 — Git 작업 공간 고정**
```
git status
git pull --ff-only origin main
git switch -c integration/step7
```
`git status`가 깨끗하지 않다면 먼저 변경사항을 보존한다. 진행 중인 main에는 파일을 덮어쓰지 않는다.

**1차 — 격리된 원본 배치**
- 이 ZIP을 압축 해제하고 루트 프로젝트에 `modules/record`, `modules/job`, `modules/fill`, `portfolio`, `step7-preview.html`, `STEP7_통합설계.md`, `STEP7_SHA256.json`만 추가한다.
- 폴더 전체 교체를 하지 말고 **추가 파일인지 Git 상태에서 확인**한다.
- 시크릿 창에서 `step7-preview.html`을 열어 원본 4개 파트가 각자 동작하는지 재검증한다.
- 이 단계는 **데이터 연동 완료가 아님**. 문제가 있으면 원본은 그대로 두고 실패 원인을 기록한다.

**2차 — 데이터 계약 어댑터**
- 읽기 전용 통합 화면 → 일관된 `records` 사용 → 저장/수정/삭제 동기화 순으로 검증한다.
- 팀원별 샘플 데이터 때문에 다른 파트의 실제 데이터를 지우지 않도록 한다.

**3차 — 페이지 연결**
- 공통 헤더와 메인 홈 버튼의 최종 경로를 수정하되, 기존 온보딩과 마이페이지 이벤트·저장 흐름은 유지한다.
- 세부 화면의 URL 쿼리(`?id`, `?record`, `?project`, `?contest`)를 보존한다.

**4차 — 디자인 통일**
- 글꼴→색상→헤더→카드→버튼 순서로 최소 수정한다. 매 변경 후 해당 모듈 회귀 테스트한다.

**5차 — 전체 검증·최종 병합**
- STEP 1~6 회귀 테스트 + 4개 팀원 원본 기능 체크리스트 통과 후에만 GitHub의 `main` 병합을 진행한다.

## 7. 커밋 단위 추천

- `chore: STEP 7 통합용 원본 파일 격리 배치`
- `feat: 경험 기록 데이터 호환 어댑터 추가`
- `feat: 직무 연결과 경험 데이터 연동`
- `feat: 포트폴리오 프로젝트 및 STAR 통합`
- `feat: 경험 채우기 추천·스크랩 연동`
- `style: 전체 페이지 공통 디자인 통일`
- `test: 전체 기능 회귀 테스트 및 경로 점검`

**성공 기준:** 모든 원본 파일이 남아 있는 것만으로는 충분하지 않다. 기존 버튼·검색·정렬·저장·수정·삭제·그래프·드래그 앤 드롭·PPTX/PDF 내보내기·관심 태그·온보딩이 브라우저에서 같은 방식으로 실제 동작해야 한다.
