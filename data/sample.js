// STEP 6 발표용 예시 데이터입니다. 실제 사용자 데이터가 아닙니다.
// 기존 common/storage.js의 loadSampleData() 형식에 맞췄습니다.

function sampleDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const SAMPLE_DATA = {
  user: {
    nickname: "데모사용자",
    userType: 1,
    interestTags: ["기획", "개발", "협업"],
    targetJob: null
  },
  records: [
    {
      id: "demo_record_1",
      title: "교내 행사 안내 웹페이지 제작",
      source: "기록",
      template: "회고형",
      category: "수업 과제",
      content: "행사 일정과 신청 절차를 쉽게 확인할 수 있도록 화면을 기획하고 구현했다.",
      date: sampleDaysAgo(1),
      tags: ["개발", "기획", "협업"]
    },
    {
      id: "demo_record_2",
      title: "팀 프로젝트 발표 자료 구성",
      source: "기록",
      template: "회고형",
      category: "수업 과제",
      content: "팀원 의견을 모아 핵심 내용을 정리하고 발표 흐름을 설계했다.",
      date: sampleDaysAgo(3),
      tags: ["발표", "기획", "협업"]
    },
    {
      id: "demo_record_3",
      title: "사용자 인터뷰 진행",
      source: "기록",
      template: "일기형",
      category: "동아리·대외활동",
      content: "사용자가 불편해하는 지점을 조사하고 개선 의견을 도출했다.",
      date: sampleDaysAgo(7),
      tags: ["사용자 리서치", "협업"]
    },
    {
      id: "demo_record_4",
      title: "개인 웹사이트 디자인 개선",
      source: "기록",
      template: "일기형",
      category: "취미로 만든 것",
      content: "색상과 간격을 조정하고 모바일 화면을 개선했다.",
      date: sampleDaysAgo(10),
      tags: ["디자인", "개발"]
    }
  ],
  projects: [
    {
      id: "demo_project_1",
      title: "교내 행사 안내 서비스",
      recordIds: ["demo_record_1", "demo_record_2"],
      star: null
    }
  ],
  scraps: []
};
