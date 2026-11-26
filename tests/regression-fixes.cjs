/* Integration repair regression tests: node tests/regression-fixes.cjs
 * Dependency-free (Node built-in VM); verifies shared storage and four patched workflows.
 * These tests do not replace interactive browser/UI checks.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const storageMap = new Map();
const localStorage = {
  getItem(key) { return storageMap.has(key) ? storageMap.get(key) : null; },
  setItem(key, value) { storageMap.set(key, String(value)); },
  removeItem(key) { storageMap.delete(key); }
};
const state = { urls: [], render: 0, header: 0, dashboard: 0, toasts: [] };
const context = vm.createContext({
  localStorage,
  console,
  URLSearchParams,
  window: {
    location: { assign(url) { state.urls.push(url); } },
    scrollTo() {},
    refreshStep5Dashboard() { state.dashboard++; }
  },
  profileError: { hidden: true, textContent: '' },
  renderPage() { state.render++; },
  renderHeader() { state.header++; },
  showToast(message) { state.toasts.push(message); }
});
vm.runInContext(read('data/tags.js'), context);
vm.runInContext(read('common/storage.js'), context);
const run = code => vm.runInContext(code, context);
function functionBlock(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert(start >= 0, `${name} function missing`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw Error(`unable to extract ${name}`);
}

// 1. Onboarding: Type 2 goes directly to experience extraction; Type 1 retains home.
const home = read('js/home.js');
run(`let pendingUserData = null; ${functionBlock(home, 'completeOnboarding')}`);
run('pendingUserData = {nickname:"Type2", userType:2, interestTags:[], targetJob:null}; completeOnboarding({school:"학교"});');
assert.equal(run('getUser().userType'), 2);
assert.equal(run('getUser().profile.school'), '학교');
assert.equal(state.urls.pop(), 'modules/record/index.html?tab=extract');
assert.equal(state.render, 0, 'type 2 should not enter common home');
run('pendingUserData = {nickname:"Type1", userType:1, interestTags:["개발","협업"], targetJob:null}; completeOnboarding({});');
assert.equal(run('getUser().userType'), 1);
assert.equal(state.urls.length, 0, 'type 1 should not be redirected');
assert.equal(state.render, 1, 'type 1 home should render');
assert.equal(state.dashboard, 1, 'type 1 dashboard should refresh');

// 2. Experience extraction: all 3 answers persist as tagged common records; second save idempotent.
const record = read('modules/record/script.js');
run(record.slice(0, record.indexOf('const templateFields =')));
let start = record.indexOf('const extractionTagPatterns =');
let end = record.indexOf('document.getElementById("jobMatchButton").addEventListener', start);
assert(start >= 0 && end > start);
run(`let extractedExperiences = {class:[
"팀 프로젝트에서 자바스크립트 코드를 개발하고 GitHub로 협업했습니다",
"개발한 웹사이트 UI 디자인을 발표했습니다",
"사용자 설문 조사 데이터를 분석해 기능을 기획했습니다"
]};
let extractedTagChoices = {class:[["개발","협업"],["디자인","발표"],["사용자 리서치","데이터 분석","기획"]]};
let extractedRecordIds = {class:[null,null,null]};
function updateExperienceCount(){}; ${record.slice(start, end)}`);
assert.equal(run('saveExtractedExperiences()'), 3);
const records = run('getRecords()');
assert.equal(records.length, 3);
records.forEach(record => {
  assert.equal(record.source, '경험꺼내기');
  assert(record.tags.length > 0);
  assert(record.tags.every(tag => run('TAGS').includes(tag)));
});
assert(run('getTagCounts()["개발"]') > 0);
assert(run('getTagCounts()["협업"]') > 0);
assert.equal(run('saveExtractedExperiences()'), 0, 'duplicate submissions should not add records');
assert.equal(run('getRecords().length'), 3);
// User-selected tags, not re-inferred tags, must persist and change job-match inputs.
assert.equal(run('getRecords().find(r => r.content.includes("자바스크립트")).tags.join(",")'), '개발,협업');
run('extractedTagChoices.class[0] = ["발표"];');
assert.equal(run('saveExtractedExperiences()'), 0);
assert.equal(run('getRecords().find(r => r.content.includes("자바스크립트")).tags.join(",")'), '발표');
assert(run('getTagCounts()["발표"]') >= 2);
// Updating an already saved experience keeps the ID and project references stable.
const savedId = run('extractedRecordIds.class[0]');
run('extractedExperiences.class[0] = "수정된 협업 프로젝트 경험";');
assert.equal(run('saveExtractedExperiences()'), 0);
assert.equal(run('getRecord(extractedRecordIds.class[0]).id'), savedId);
assert.equal(run('getRecords().length'), 3);
run('extractedTagChoices.class[0] = ["개발","협업"]; extractedExperiences.class[0] = "팀 프로젝트에서 자바스크립트 코드를 개발하고 GitHub로 협업했습니다"; saveExtractedExperiences();');

// 3. Project grouping: exactly the chosen IDs are saved, and record data is not removed.
const listeners = {};
context.document = {
  getElementById(id) {
    return { addEventListener(type, listener) { listeners[`${id}:${type}`] = listener; } };
  },
  addEventListener(type, callback) { listeners[`document:${type}`] = callback; },
  querySelector() { return {}; }
};
run(`let selectedRecords = new Set([String(getRecords()[0].id), String(getRecords()[1].id)]);`);
start = record.indexOf('document.getElementById("projectGroupButton").addEventListener');
end = record.indexOf('\n\nlet recordViewTrigger', start);
assert(start >= 0 && end > start);
run(record.slice(start, end));
listeners['projectGroupButton:click']();
assert.equal(run('getProjects().length'), 1);
assert.equal(run('getProjects()[0].recordIds.length'), 2);
assert.equal(run('getRecords().length'), 3, 'grouping must preserve records');
assert(state.urls.pop().startsWith('../../portfolio/index.html?project='));
listeners['projectGroupButton:click']();
assert.equal(run('getProjects().length'), 1, 'already-grouped records must not create duplicates');
assert(state.toasts.some(message => message.includes('이미 묶인 기록')));

// 4. Job module event routing: exact evidence record -> portfolio STAR; extraction navigation works.
const jobHtml = read('modules/job/index.html');
const inline = jobHtml.match(/<script>\s*(\/\/ 팀원 모듈[\s\S]*?)<\/script>/);
assert(inline, 'job routing inline script missing');
context.window.OPSJOB = { mountJobConnection() {} };
run(inline[1]);
const chosenId = records[0].id;
listeners['document:selfdev:navigate']({detail:{destination:'portfolio-star',recordId:chosenId,tag:'개발'}});
assert.equal(state.urls.pop(), `../../portfolio/star.html?record=${encodeURIComponent(chosenId)}`);
listeners['document:selfdev:navigate']({detail:{destination:'experience-extraction'}});
assert.equal(state.urls.pop(), '../record/index.html?tab=extract');

// 5. The STAR page accepts record id and resolves it to the existing project or creates one.
const star = read('portfolio/js/star.js');
start = star.indexOf('  function resolveEntry() {');
end = star.indexOf('  // 현재 프로젝트', start);
assert(start >= 0 && end > start);
context.store = {projects() {return run('getProjects()')}, records() {return run('getRecords()')}, saveProject(p) {return run(`saveProject(${JSON.stringify(p)})`)} };
context.params = new URLSearchParams(`?record=${encodeURIComponent(chosenId)}`);
context.PF = {newId:()=>'p_test'};
context.toast = message => state.toasts.push(message);
context.starStatus = ()=>({key:'none'});
run(star.slice(start,end));
assert.equal(run('resolveEntry()'), run('getProjects()[0].id'), 'an existing project should be reused');
context.params = new URLSearchParams(`?record=${encodeURIComponent(records[2].id)}`);
assert.equal(run('resolveEntry()'), 'p_test', 'an ungrouped record should get its own project');
assert.equal(run('getProjects().length'), 2);
assert.equal(run('getRecords().length'), 3, 'STAR must not delete records');

// Job strengths button must carry the ID of the evidence it displays.
const jobScript = read('modules/job/job-connection.js');
run(`${functionBlock(jobScript, 'escapeHtml')} ${functionBlock(jobScript, 'renderStrengths')}`);
const buttonHtml = run('renderStrengths([{tag:"개발",current:3,required:3}],getRecords())');
assert(buttonHtml.includes('data-record-id='));
assert(buttonHtml.includes('STAR 정리하기'));
assert(buttonHtml.includes(`data-record-id="${records[0].id}"`) || buttonHtml.includes(`data-record-id="${records[1].id}"`) || buttonHtml.includes(`data-record-id="${records[2].id}"`));

// Existing shared record CRUD remains usable and project references remain valid.
const original = run('getRecord(getRecords()[0].id)');
run(`saveRecord({...getRecord(${JSON.stringify(original.id)}), title:"기존 기록 수정 테스트"})`);
assert.equal(run('getRecords().length'), 3);
assert.equal(run(`getRecord(${JSON.stringify(original.id)}).title`), '기존 기록 수정 테스트');
assert.equal(run(`deleteRecord(${JSON.stringify(original.id)})`), true);
assert.equal(run('getRecords().length'), 2);
assert.equal(run(`getProjects().some(p=>p.recordIds.includes(${JSON.stringify(original.id)}))`), false);

// UI files must not be rewritten for these functional fixes.
assert(read('modules/record/index.html').includes('id="jobMatchButton"'));
assert(read('modules/record/index.html').includes('id="projectGroupButton"'));
assert(read('modules/job/job-connection.js').includes('data-record-id='));
console.log('PASS: onboarding type 1/2, extracted records & tag scoring, idempotence, project grouping & duplicate guard, STAR routing and project resolution.');
