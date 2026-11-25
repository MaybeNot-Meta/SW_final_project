(function () {
  const id = new URLSearchParams(location.search).get('contest');
  const c = window.RecommendAPI.getContest(id);
  const S = window.StorageAPI;
  const form = document.getElementById('recordForm');
  const submitButton = form.querySelector('button[type="submit"]');
  let savedRecordId = null;
  let isSaving = false;

  document.getElementById('contestName').textContent = c
    ? `공모전: ${c.title}` : '공모전 참여 기록';

  const tags = ['기획', '디자인', '개발', '영상', '글쓰기', '협업', '사용자 리서치', '데이터 분석', '발표'];
  document.getElementById('tagOptions').innerHTML = tags.map(t =>
    `<label><input type="checkbox" name="tag" value="${t}" ${c && c.tags.includes(t) ? 'checked' : ''}> ${t}</label>`
  ).join('');

  document.querySelectorAll('input[name="tag"]').forEach(input => {
    input.addEventListener('change', () =>
      document.querySelector('.tag-options').removeAttribute('aria-invalid'));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (isSaving) return;

    const selected = [...form.querySelectorAll('input[name="tag"]:checked')].map(x => x.value);
    if (!selected.length) {
      document.querySelector('.tag-options').setAttribute('aria-invalid', 'true');
      alert('역량 태그를 1개 이상 선택해주세요.');
      return;
    }

    isSaving = true;
    submitButton.disabled = true;
    try {
      // 첫 저장 후 같은 화면에서 다시 저장하면 같은 ID를 갱신합니다.
      // 여러 번 클릭해도 같은 경험 기록이 여러 개 생기지 않습니다.
      const record = S.saveRecord({
        ...(savedRecordId ? { id: savedRecordId } : {}),
        source: '공모전',
        template: null,
        contestId: id,
        result: document.getElementById('result').value,
        role: document.getElementById('role').value.trim(),
        title: c ? c.title : '공모전 참여',
        content: `무엇을 배웠나요?\n${document.getElementById('learned').value.trim()}\n\n다음엔 뭘 다르게 할까요?\n${document.getElementById('next').value.trim()}`,
        tags: selected
      });
      savedRecordId = record.id;
      submitButton.textContent = '수정 내용 저장';
      const matches = typeof window.calcJobMatches === 'function' ? window.calcJobMatches() : [];
      document.getElementById('saved').style.display = 'block';
      document.getElementById('matchText').textContent = matches[0]
        ? `바뀐 매칭률: ${matches[0].job.name} ${matches[0].rate}%`
        : '매칭률을 다시 계산했어요.';
      document.getElementById('portfolioLink').href =
        `portfolio-star.html?record=${encodeURIComponent(record.id)}`;
    } catch (error) {
      console.error('참여 기록 저장 실패:', error);
      alert(`기록을 저장하지 못했어요. ${error.message}`);
    } finally {
      submitButton.disabled = false;
      isSaving = false;
    }
  });
})();
