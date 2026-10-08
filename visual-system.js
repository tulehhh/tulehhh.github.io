/* In-place document reading shares the gallery's rail and keyboard behavior. */
(() => {
 const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
 const readers = document.querySelectorAll('.evidence-reader,.guideline-original-reader');
 readers.forEach((reader,index) => {
  reader.id ||= `document-reader-${index + 1}`;
  const label = reader.getAttribute('aria-label') || '原稿';
  const rail = document.createElement('div');
  rail.className = 'reading-rail';
  rail.hidden = true;
  const range = document.createElement('input');
  range.type = 'range'; range.min = '0'; range.max = '1000'; range.step = '1'; range.value = '0';
  range.className = 'reading-scrub';
  range.setAttribute('aria-label', label + '横向位置');
  range.setAttribute('aria-controls', reader.id);
  const progress = document.createElement('span');
  progress.className = 'reading-position'; progress.setAttribute('aria-hidden','true');
  const controls = document.createElement('div'); controls.className = 'reading-controls';
  const prev = document.createElement('button'), next = document.createElement('button');
  for (const [button,direction,text] of [[prev,'left','向左阅读'],[next,'right','向右阅读']]) {
   button.type = 'button'; button.setAttribute('aria-label',text); button.setAttribute('aria-controls',reader.id);
   const icon = document.createElement('i'); icon.className = 'icon-arrow icon-' + direction; icon.setAttribute('aria-hidden','true');
   button.append(icon); controls.append(button);
  }
  rail.append(range,progress,controls); reader.after(rail);
  const disclosure = reader.closest('details');
  const maximum = () => Math.max(0,reader.scrollWidth - reader.clientWidth);
  const update = () => {
   const max = maximum(), ratio = max ? Math.min(1,Math.max(0,reader.scrollLeft / max)) : 0;
   rail.hidden = (disclosure && !disclosure.open) || !reader.clientWidth || max < 2;
   range.value = String(Math.round(ratio * 1000));
   range.setAttribute('aria-valuetext',Math.round(ratio * 100) + '%');
   progress.textContent = Math.round(ratio * 100) + '%';
   prev.disabled = reader.scrollLeft < 2;
   next.disabled = reader.scrollLeft >= max - 2;
  };
  const move = delta => reader.scrollBy({left:delta * reader.clientWidth * .8,behavior:reducedMotion.matches ? 'auto' : 'smooth'});
  prev.addEventListener('click',() => move(-1)); next.addEventListener('click',() => move(1));
  range.addEventListener('input',() => {reader.scrollLeft = Number(range.value) / 1000 * maximum(); update();});
  range.addEventListener('pointerdown',() => range.classList.add('is-dragging'));
  const endDrag = () => range.classList.remove('is-dragging');
  range.addEventListener('blur',endDrag);
  for (const event of ['pointerup','pointercancel']) window.addEventListener(event,endDrag);
  range.addEventListener('keydown',event => {
   if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) return;
   event.preventDefault();
   if (event.key === 'Home' || event.key === 'End') reader.scrollTo({left:event.key === 'Home' ? 0 : maximum(),behavior:'auto'});
   else move(['ArrowLeft','ArrowDown','PageUp'].includes(event.key) ? -1 : 1);
  });
  reader.addEventListener('keydown',event => {
   if (event.target !== reader || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
   event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  reader.addEventListener('scroll',update,{passive:true});
  const observer = new ResizeObserver(update); observer.observe(reader);
  reader.querySelectorAll('img').forEach(img => {observer.observe(img); img.addEventListener('load',update,{once:true});});
  disclosure?.addEventListener('toggle',update);
  update();
 });
})();

/* A single short transition explains navigation and tab state, including wrapped rows. */
(() => {
 document.querySelectorAll('.category-tab-options,.resource-tab-options,.practice-nav,.u-method-nav,.u-standard-tabs,.u-stage-tabs').forEach(rail => {
  if (rail.closest('.catalog-page')) return;
  const marker = document.createElement('span');
  marker.className = 'selection-marker'; marker.setAttribute('aria-hidden','true');
  rail.append(marker); rail.classList.add('has-selection-marker');
  let frame = 0, ready = false;
  const update = () => {
   frame = 0;
   const active = rail.querySelector('[aria-pressed="true"],[aria-current],[aria-selected="true"]');
   if (!active || !rail.clientWidth) { marker.hidden = true; return; }
   const box = active.getBoundingClientRect(), parent = rail.getBoundingClientRect();
   marker.hidden = false;
   marker.style.width = box.width + 'px';
   marker.style.transform = `translate(${box.left - parent.left + rail.scrollLeft - rail.clientLeft}px,${box.bottom - parent.top + rail.scrollTop - rail.clientTop - 2}px)`;
   if (!ready) requestAnimationFrame(() => {rail.classList.add('selection-ready'); ready = true;});
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  new MutationObserver(records => { if (records.some(record => record.target !== marker)) schedule(); }).observe(rail,{subtree:true,attributes:true,attributeFilter:['aria-pressed','aria-current','aria-selected','hidden']});
  const resize = new ResizeObserver(schedule);
  resize.observe(rail);
  rail.querySelectorAll('a,button').forEach(item => resize.observe(item));
  document.fonts?.ready.then(schedule);
  window.addEventListener('pageshow',schedule);
  update();
 });
})();
