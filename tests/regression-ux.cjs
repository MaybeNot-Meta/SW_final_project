/** UX additions, focused tests. Run: node tests/regression-ux.cjs
 * No UI browser claim: this validates render structures, tagged records,
 * status text, draft persistence, protection rules, and compatibility hooks.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const src = read('modules/record/script.js');
function fn(name) {
  const at = src.indexOf(`function ${name}(`);
  assert(at>=0, `${name} missing`);
  const brace=src.indexOf('{',at); let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{') depth++;
    if(src[i]==='}' && --depth===0) return src.slice(at,i+1);
  }
  throw Error(`unterminated function: ${name}`);
}
const vmCtx = more => vm.createContext({console, ...more});
// 1. All nine shared tags are rendered as manual choices in extraction cards.
assert(src.includes('class="skill-tag-choice experience-tag-choice"'));
assert(src.includes('TAGS.map(tag =>'));
assert(src.includes("input.addEventListener('change'"));
assert(src.includes("if (!wrapper.dataset.tagsEdited && !extractedRecordIds[category]?.[inputIndex])"));
assert(read('modules/record/index.html').includes('각 경험에서 직접 선택·수정'));

// 2. Three experiences alone are not enough if a tag has been manually deselected.
const countNode={textContent:''}, jobButton={disabled:true,title:''};
const answerText=[{value:'경험 A'},{value:'경험 B'},{value:'경험 C'}];
const wc=vmCtx({
  selectedCategory:'class',
  extractedExperiences:{class:answerText.map(x=>x.value)},
  extractedTagChoices:{class:[['기획'],['개발'],['협업']]},
  document:{querySelectorAll:()=>answerText,getElementById:id=>id==='experienceCount'?countNode:jobButton}
});
vm.runInContext(fn('updateExperienceCount'),wc);
vm.runInContext('updateExperienceCount()',wc);
assert.equal(jobButton.disabled,false);
vm.runInContext('extractedTagChoices.class[2] = []; updateExperienceCount()',wc);
assert.equal(jobButton.disabled,true);
assert.match(countNode.textContent,/태그 미선택 1개/);
vm.runInContext('extractedTagChoices.class[2] = ["협업"]; extractedExperiences.class[2] = "";',wc);
answerText[2].value='';
vm.runInContext('updateExperienceCount()',wc);
assert.equal(jobButton.disabled,true);
answerText[2].value='경험 C';
vm.runInContext('updateExperienceCount()',wc);
assert.equal(jobButton.disabled,false);

// 3. Deleted records disappear from the cached extraction screen.
const dc=vmCtx({extractedExperiences:{class:['a','b']},extractedTagChoices:{class:[['기획'],['개발']]},extractedRecordIds:{class:['id-a','id-b']}});
vm.runInContext(fn('removeExtractedCacheById'),dc);
vm.runInContext('removeExtractedCacheById("id-a")',dc);
assert.equal(vm.runInContext('extractedRecordIds.class.join(",")',dc),'id-b');
assert.equal(vm.runInContext('extractedExperiences.class.join(",")',dc),'b');
assert.equal(vm.runInContext('extractedTagChoices.class[0][0]',dc),'개발');

// 4. Draft save writes every chosen tag and reports accurate status;
//    reloading restores the same edit ID, fields, and tag set.
const saved=new Map();
const status={textContent:'임시저장 전'}, title={value:''},category={value:'class'}, editorTitle={textContent:''};
const elements={saveStatus:status,recordForm:{},editorTitle,recordCategory:category,
 recordDate:{value:''},recordTitle:title,recordSummary:{value:''}};
const restored=[];
const fields={'field0':{value:''},'field1':{value:''}};
const draftCtx=vmCtx({
  editingId:'r1', selectedTemplate:'star', recordForm:elements.recordForm,
  templateFields:{star:[['S',''],['T','']]},
  localStorage:{setItem:(k,v)=>saved.set(k,v),getItem:k=>saved.get(k)||null},
  getSelectedSkillTags:()=>['기획','협업'],
  getRecord:id=>id==='r1'?{id:'r1'}:null,
  setSelectedSkillTags:tags=>restored.push(tags),
  renderTemplateFields:()=>{}, updateTitlePlaceholder:()=>{},
  FormData:class {entries(){return [['title','임시저장 제목'],['category','class'],['field0','내용'],['date','2026-11-26']][Symbol.iterator]();}},
  document:{getElementById:id=>elements[id],querySelectorAll:()=>[],querySelector:selector=>fields[selector.match(/field\d+/)?.[0]]||null}
});
vm.runInContext(fn('setRecordSaveStatus')+fn('saveDraft')+fn('restoreDraft'),draftCtx);
vm.runInContext('saveDraft()',draftCtx);
assert.equal(status.textContent,'임시저장 완료');
const draft=JSON.parse(saved.get('growpath-draft'));
assert.deepEqual(draft.skillTags,['기획','협업']);
assert.equal(draft.editingId,'r1');
vm.runInContext('restoreDraft()',draftCtx);
assert.equal(title.value,'임시저장 제목');
assert.equal(status.textContent,'임시저장본 불러옴');
assert.equal(editorTitle.textContent,'기록 수정');
assert.deepEqual(JSON.parse(JSON.stringify(restored[0])),['기획','협업']);
assert.equal(fields.field0.value,'내용');

// 5. Feedback, info, and protections are present and wired to the old actions.
assert(src.includes('window.confirm(`'));
assert(src.includes('if (!deleteRecord(realId))'));
assert(src.includes('const savedRecord = saveRecord('));
assert(src.includes('syncExtractedCacheRecord(savedRecord)'));
assert(src.includes('editingId = null;\n  recordForm.reset()'));
assert(read('js/home.js').includes('저장하고 경험 꺼내기'));
assert(read('js/home.js').includes('if (completedType === 2)'));
assert(read('modules/job/job-connection.js').includes('매칭률 안내:'));
assert(read('portfolio/js/projects.js').includes('pf-created-notice'));
assert(read('portfolio/js/projects.js').includes('store.saveProject(p)'));
assert(read('modules/record/script.js').includes('window.location.assign("../job/index.html")'));
assert(read('modules/record/script.js').includes('window.location.assign(`../../portfolio/index.html?project='));
assert(read('common/tokens.css').includes('--color-text-muted: #66758E'));

console.log('PASS: per-experience tag UI & validation, deleted cache cleanup, complete draft restore, edit safety, UX feedback, unchanged routing hooks.');
