# 직무 연결 모듈

팀 사이트의 공통 헤더·내비게이션·색상·폰트를 제공하지 않는 독립 기능 모듈입니다. `job-connection.css`는 `.jc-` 접두사 클래스의 배치와 레이더 차트 크기만 지정합니다. 카드, 버튼, 타이포그래피와 색상 테마는 호스트 사이트가 정할 수 있습니다.

## 명세 구현

- **직무 매칭:** 직무 `skills`의 각 태그에 대해 `min(태그 경험 수 / 필요 수준, 1)`을 구하고 평균합니다. 태그 경험 수는 해당 태그가 포함된 기록의 수이며, 한 기록에 중복 태그가 있어도 한 번만 셉니다. 매칭률 내림차순으로 직무와 보유 역량 2~3개를 표시합니다.
- **유형 1 임시 관심 태그:** `user.userType === 1`일 때 `user.testResult.tempTags`를 매칭 점수에 함께 반영합니다. 명세에는 정확한 가중치가 정의되어 있지 않아, 임시 관심 프로필을 가상 기록 1개로 간주해 `1 / (기록 수 + 1)` 비중으로 계산합니다. 기록이 증가하면 비중이 연속적으로 감소합니다. 유형 2나 임시 태그가 없으면 기록 기반 점수만 사용합니다. 팀이 별도 정책을 정하면 `getInterestWeight()`를 조정하세요.
- **부족 역량 분석:** 매칭 상위 3개 직무 칩과 현재 매칭률, 필요 수준·태그 경험 수, 충분/조금 부족/없음 상태, 필요·현재 수준 레이더 차트를 표시합니다. 부족 역량을 충족도 오름차순으로 정렬해 가장 낮은 태그의 공모전 및 미션을 추천합니다. 강점 역량에는 기록 제목을 근거로 표시하고 STAR 버튼에서 이벤트를 전달합니다.
- **예외:** 기록이 3개 미만이면 경험 꺼내기 안내를 표시합니다. 부족 역량이 없으면 포트폴리오 완성 안내를 표시합니다. 부족 태그의 공모전이 없으면 공모전 카드 없이 미션만 표시합니다. 데이터가 비어 있으면 0% 및 빈 상태를 표시합니다.
- **목표 직무:** 상위 직무를 분석용으로 표시하더라도 목표로 저장하지 않습니다. 사용자가 명시적으로 “목표 직무로 설정”을 눌렀을 때만 선택한 직무 ID를 `user.targetJob`에 저장합니다. 저장된 목표가 매칭 상위 3개에 포함되면 분석 초기 선택으로 표시합니다.
- **직무 탐색 카드:** `id`, `name`, `desc`, `skills`, `tasks` 필드로 직무명·설명·필요 역량·준비 활동을 표시합니다. 명세의 `jobs.js` 구조를 유지하며 `majors`, `certifications`를 카드 추가 정보로 사용합니다.

매칭 화면의 직무별 분석 버튼은 해당 직무 분석 화면으로 이동합니다. 부족 역량 분석의 경험 꺼내기 및 STAR 버튼은 아래 이벤트를 발생시킵니다.

```js
document.addEventListener("selfdev:navigate", (event) => {
  // event.detail.destination: "experience-extraction" | "portfolio-star"
  // STAR 이동에는 jobId, tag도 포함됩니다.
});
```

실제 화면 라우팅은 팀 사이트 통합 시 이벤트 수신부에 연결해야 합니다.

## 데이터 및 통합

고정 직무 데이터는 `data/jobs.js`의 다음 구조를 따릅니다.

```js
{ id, name, desc, skills: { "공통 역량 태그": 필요수준 }, tasks: [], activities: [], majors: [], certifications: [] }
```

공통 태그는 명세 예시인 기획, 디자인, 개발, 영상, 글쓰기, 협업, 사용자 리서치, 데이터 분석, 발표를 사용합니다. `data/contests.js`는 실제 공고가 아닌 `[예시]` 데모 데이터이며, `data/missions.js`도 교체 가능한 예시입니다. 크롤링이나 실제 공모전 데이터 수집은 하지 않습니다.

`mountJobConnection(root, storageApi)`는 아래 함수를 제공하는 저장 어댑터를 받을 수 있습니다.

- `getUser()` — `user` 객체 반환
- `getRecords()` — 명세의 기록 배열 반환
- `getTagCounts()` — 공통 태그별 기록 수 반환
- `saveUser(user)` — `targetJob`을 포함한 사용자 객체 저장

현재 `common/storage.js`는 이 디렉터리의 독립 실행용 어댑터이며, `user`, `records` 키와 명세의 `getUser()`, `saveUser()`, `getRecords()`, `getTagCounts()` 함수 계약을 따릅니다. 이전 독립 버전의 `selfdev.user`·`selfdev.records` 데이터는 새 키가 없을 때만 읽도록 호환합니다. 별도의 팀 공통 저장 파일은 이 프로젝트 폴더에 없으므로 팀 저장소와의 실제 연결은 확인할 수 없습니다. 통합 시 기존 팀 구현을 유지하고 동일한 어댑터 API를 주입하세요.

커리어넷 오픈API는 연결되어 있지 않습니다. 현재 프로젝트 자료만으로 승인·인증키 상태는 확인할 수 없습니다. `data/jobs.js`의 설명·업무·준비 활동·학과·자격, `data/contests.js`의 공고, `data/missions.js`의 미션은 교체 가능한 예시 데이터이며 실제 정보로 검증되지 않았습니다.

## 오픈소스

| 이름/버전 | 사용 기능 | 공식 출처 | 라이선스 |
| --- | --- | --- | --- |
| Chart.js 4.4.7 | 부족 역량 분석의 필요 수준·현재 수준 레이더 차트 | [공식 사이트](https://www.chartjs.org/), [v4.4.7 소스](https://github.com/chartjs/Chart.js/tree/v4.4.7) | [MIT](https://github.com/chartjs/Chart.js/blob/v4.4.7/LICENSE.md) |

Chart.js 4.4.7의 UMD 빌드를 일반 `<script>` 태그로 불러옵니다. 부족 역량 분석에서 전역 `Chart`를 사용해 레이더 차트를 그리며, CDN/인터넷을 사용할 수 없으면 차트 영역에 실패 안내를 표시합니다. Chart.js 외에는 별도 오픈소스 라이브러리를 사용하지 않습니다.

## 파일과 실행

- `index.html` — 직접 열어 실행할 수 있는 독립 호스트 페이지
- `job-connection.js` — 세 기능, 점수 계산, 저장 어댑터·라우팅 이벤트 연결
- `job-connection.css` — 접두사 클래스 기반 최소 레이아웃과 차트 크기
- `common/storage.js` — 명세 데이터 키와 호환되는 독립 실행용 localStorage 어댑터
- `data/jobs.js` — 직무 설명 및 필요 역량
- `data/contests.js`, `data/missions.js` — 교체 가능한 예시 추천 데이터

`portfolio.zip`과 `SW_final_project_clean.zip`의 페이지는 모듈 대신 순서가 있는 일반 `<script src>` 태그로 공통 저장 코드·데이터·페이지 스크립트를 로드합니다. OPSJOB도 이 패턴을 사용하며 각 데이터와 로직은 IIFE 안에 두고 `window.OPSJOB` 네임스페이스만 공개합니다.

## 실행

`index.html`을 Chrome에서 직접 열어 실행할 수 있습니다. 서버, Live Server 또는 별도 실행 프로그램은 필요하지 않습니다. 외부 Chart.js CDN은 인터넷 연결이 필요하며, CDN을 사용할 수 없으면 차트 영역에 안내 문구를 표시합니다.

이 모듈은 직접 파일 실행을 위해 ES 모듈의 `import`/`export` 대신 순서가 있는 일반 `<script>` 태그와 `window.OPSJOB` 네임스페이스를 사용합니다. 팀 사이트에 통합할 때도 의존 데이터와 저장 어댑터를 먼저 로드하고, 그다음 `job-connection.js`를 로드해야 합니다.

```powershell
python -m http.server 8000
```

이 경우 브라우저에서 `http://localhost:8000/`을 엽니다. 호스트 페이지에서는 `.jc-shell` 요소를 두고 데이터·저장소 일반 스크립트 다음에 `job-connection.js`를 로드한 뒤 `OPSJOB.mountJobConnection(root, teamStorageAdapter)`를 호출해 삽입할 수 있습니다. 반환된 인스턴스의 `refresh()`는 팀 저장소에서 기록을 추가·수정한 뒤 직무 연결 내용을 다시 읽어 표시할 때, `destroy()`는 페이지를 떠날 때 사용합니다. 이 프로젝트 폴더에는 팀 화면 라우터가 없으므로 `selfdev:navigate` 이벤트를 실제 경험 꺼내기·STAR 화면으로 연결하는 것은 호스트 통합 단계에서 처리해야 합니다.
