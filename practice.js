/* Static child navigation; legacy deep links keep their intended destinations. */
(() => {
 const path = location.pathname.split('/').pop();
 const legacy = {
  'ai-training':'practice-training.html#training-ai',
  'training-ai':'practice-training.html#training-ai',
  'training-workflow':'practice-training.html#training-workflow',
  'training-work-model':'practice-training.html#training-work-model',
  'mentoring':'practice-training.html#team',
  'source-ai-training':'practice-training.html#source-ai-training',
  'source-women-main':'practice-standards.html#source-women-main',
  'source-women-detail':'practice-standards.html#source-women-detail',
  'source-work-model':'practice-training.html#training-work-model',
  'source-production-workflow':'practice-delivery.html#workflow'
 };
 const reveal = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  // This old collaboration-page source link now belongs to the training model.
  if (path === 'practice-delivery.html' && id === 'source-work-model') {
   location.replace('practice-training.html#training-work-model');
   return;
  }
  if (path === 'practice.html' && legacy[id]) {
   location.replace(legacy[id]);
   return;
  }
  const target = document.getElementById(id);
  if (!target) return;
  let parent = target;
  let disclosed = false;
  while (parent) {
   if (parent.tagName === 'DETAILS') { parent.open = true; disclosed = true; }
   parent = parent.parentElement;
  }
  if (disclosed) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
 };
 window.addEventListener('hashchange',reveal);
 reveal();
})();
