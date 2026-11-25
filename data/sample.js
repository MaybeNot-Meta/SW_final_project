// STEP 7-30: myfo 현재 데이터 구조에 맞춘 발표용 가상 사용자 예시입니다.
// 공고는 실제 공모전이 아닌 서비스 시연용 예시 데이터를 참조합니다.
// 샘플 불러오기는 마이페이지에서 확인을 받은 후에만 실행됩니다.
function sampleDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

const SAMPLE_DATA = {
  user: {
    nickname: "데모사용자",
    userType: 1,
    interestTags: ["기획", "개발", "협업"],
    targetJob: "frontend-developer",
    profile: {
      fullName: "홍길동",
      email: "demo@example.com",
      school: "예시대학교",
      major: "소프트웨어학과",
      educationStatus: "재학"
    }
  },
  records: [
    {
      id: "demo_record_1", title: "교내 행사 안내 웹페이지 제작",
      source: "기록", template: "회고형", recordUiTemplate: "star",
      category: "수업 과제", recordCategory: "class",
      date: sampleDaysAgo(1), tags: ["개발", "기획", "협업"],
      fields: ["학내 행사 신청 절차가 여러 곳에 흩어져 있었어요.", "행사 정보를 한 화면에 모아야 했어요.", "팀원과 화면 흐름을 설계하고 HTML·CSS·JS로 구현했어요.", "정보 접근이 간편해졌고 역할 분담의 중요성을 배웠어요."],
      content: "행사 일정과 신청 과정을 한 화면에서 확인하는 웹페이지를 기획하고 구현했어요."
    },
    {
      id: "demo_record_2", title: "팀 프로젝트 회고 및 발표",
      source: "기록", template: "회고형", recordUiTemplate: "kpt",
      category: "수업 과제", recordCategory: "class",
      date: sampleDaysAgo(3), tags: ["발표", "기획", "협업"],
      fields: ["회의록을 남기고 역할을 구분한 점", "발표 준비 시간이 부족했던 점", "다음에는 중간 점검 일정을 미리 잡기"],
      content: "협업 과정의 유지할 점과 개선할 점을 KPT 방식으로 정리했어요."
    },
    {
      id: "demo_record_3", title: "앱 사용성 인터뷰",
      source: "기록", template: "일기형", recordUiTemplate: "free",
      category: "동아리·대외활동", recordCategory: "club",
      date: sampleDaysAgo(6), tags: ["사용자 리서치", "협업", "기획"],
      fields: ["사용자 다섯 명에게 불편했던 화면을 묻고 메모했어요.", "실제 경험을 먼저 묻는 질문이 더 유용하다는 걸 배웠어요."],
      content: "사용자 인터뷰를 통해 불편한 사용 흐름을 확인하고 개선 의견을 정리했어요."
    },
    {
      id: "demo_record_4", title: "개인 웹사이트 반응형 디자인",
      source: "기록", template: "일기형", recordUiTemplate: "free",
      category: "취미로 만든 것", recordCategory: "hobby",
      date: sampleDaysAgo(10), tags: ["디자인", "개발"],
      fields: ["작은 화면에서 카드가 겹쳐 CSS 그리드를 수정했어요.", "모바일 우선으로 화면을 확인하는 습관을 얻었어요."],
      content: "화면 크기에 따른 카드 배치를 수정하고 가독성을 개선했어요."
    },
    {
      id: "demo_record_5", title: "팀 프로젝트 데이터 시각화",
      source: "기록", template: "회고형", recordUiTemplate: "star",
      category: "수업 과제", recordCategory: "class",
      date: sampleDaysAgo(14), tags: ["데이터 분석", "개발", "발표"],
      fields: ["프로젝트 활동 데이터를 설명해야 했어요.", "복잡한 정보를 읽기 쉬운 차트로 표현해야 했어요.", "핵심 지표를 선정하고 Chart.js로 차트를 만들었어요.", "추세를 쉽게 설명할 수 있었고 시각화의 효과를 배웠어요."],
      content: "활동 데이터를 정리하고 차트를 활용해 결과를 발표했어요."
    },
    {
      id: "demo_record_6", title: "서비스 기획 해커톤 참가",
      source: "공모전", template: null, recordUiTemplate: "free",
      contestId: "contest-05", result: "진행 중", role: "기획 및 프론트엔드",
      category: "대회·공모전", recordCategory: "contest",
      date: sampleDaysAgo(2), tags: ["기획", "개발", "협업"],
      fields: ["팀과 서비스 문제를 정의하고 화면 시제품을 제작했어요.", "역할을 먼저 조율해야 시간을 아낄 수 있다는 점을 배웠어요."],
      content: "무엇을 배웠나요?\n서비스 문제 정의와 빠른 시제품 제작\n\n다음엔 뭘 다르게 할까요?\n기능 우선순위를 더 일찍 정하겠습니다."
    }
  ],
  projects: [
    {
      id: "demo_project_1", title: "교내 행사 안내 서비스",
      recordIds: ["demo_record_1", "demo_record_2"],
      star: {
        s: "행사 안내 정보가 여러 채널에 흩어져 있었어요.",
        t: "학생들이 행사 일정과 신청 방법을 한곳에서 확인하도록 해야 했어요.",
        a: "팀원과 요구사항을 정리하고 HTML·CSS·JS로 반응형 안내 페이지를 구현했어요.",
        r: "행사 정보를 찾아보는 동선이 줄었고 팀 협업과 사용자 중심 설계를 배웠어요."
      }
    },
    {
      id: "demo_project_2", title: "사용성 조사와 화면 개선",
      recordIds: ["demo_record_3", "demo_record_4"],
      star: { s: "", t: "", a: "", r: "" }
    }
  ],
  scraps: ["contest-01", "contest-05", "contest-08"],
  scrapStatus: { "contest-01": "관심", "contest-05": "준비 중", "contest-08": "제출 완료" }
};
