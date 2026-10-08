(() => {
  const brands = window.PORTFOLIO_BRANDS || {};
  const params = new URLSearchParams(location.search);
  const key = document.body.dataset.brand || params.get('case') || 'urban';
  const brand = brands[key];
  const $ = selector => document.querySelector(selector);
  const make = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  if (!brand) {
    document.querySelectorAll('.brand-hero,.category-landing,.case-browser').forEach(n => n.hidden = true);
    $('[data-not-found]').hidden = false;
    return;
  }
  const all = [
    ...(key === 'sweetheart' ? window.SWEETHEART_CASES || [] : []),
    ...(window.PORTFOLIO_CASES || []).filter(c => c.brand === key)
  ].filter(c => c.listed !== false);
  const categories = brand.categories.filter(c => c.destination || all.some(i => i.category === c.id));
  const order = c => categories.findIndex(x => x.id === c.category);
  all.sort((a, b) => order(a) - order(b) || (a.priority ?? 20) - (b.priority ?? 20));
  const resourceKinds = new Set(['standard', 'module']);
  const browsing = all.filter(c => !resourceKinds.has(c.kind));
  const ordered = [{id:'全部', name:'全部案例'}, ...categories];
  let type = params.get('type') || '全部形式';
  let layoutFrame = 0;
  let restoring = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let resultTransition;
  function showUpdate() {
    resultTransition?.cancel();
    if (restoring || reducedMotion.matches || !grid.animate) return;
    // Opacity only: preserve masonry geometry and its return anchor.
    resultTransition = grid.animate([{opacity:.55}, {opacity:1}], {duration:220, easing:'cubic-bezier(.16,1,.3,1)'});
  }
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) resultTransition?.cancel(); });
  const stateKey = 'portfolio-catalog:' + key;
  const pendingKey = stateKey + ':return';
  const entryKey = stateKey + ':entry';
  let savedState;
  let pendingReturn = false;
  try { pendingReturn = sessionStorage.getItem(pendingKey) === '1'; } catch {}
  try { savedState = JSON.parse((pendingReturn && sessionStorage.getItem(entryKey)) || sessionStorage.getItem(stateKey) || 'null'); } catch {}
  history.scrollRestoration = 'manual';
  document.title = brand.name + ' — 涂昊作品集';
  document.body.classList.add('has-selection', 'catalog-page');
  if (key === 'ai') document.body.classList.add('ai-catalog');
  $('[data-brand-title]').textContent = brand.name;
  $('[data-brand-kicker]').textContent = brand.date;
  $('.brand-hero-copy').append($('[data-brand-kicker]'));
  $('[data-brand-contribution]').textContent = brand.contribution;
  $('[data-brand-statement]').hidden = true;
  $('[data-brand-description]').hidden = true;
  $('[data-overview-label]').hidden = true;
  brand.role.forEach(role => $('[data-brand-roles]').append(make('li', '', role)));
  $('.category-landing').hidden = true;
  $('.category-back').hidden = true;
  $('[data-list-kicker]').hidden = true;
  $('[data-browser-note]').hidden = true;
  const tabs = $('[data-category-tabs]');
  const resourceTabs = make('div', 'resource-tab-options');
  resourceTabs.hidden = true;
  tabs.after(resourceTabs);
  const grid = $('[data-grid]');
  grid.className = 'masonry';
  const resourceNav = make('nav', 'brand-resource-links');
  resourceNav.setAttribute('aria-label', '专题资料');
  const tools = make('div', 'catalog-tools');
  const formatControl = make('div', 'format-control');
  const formatLabel = make('span', 'format-label', '作品形式');
  const formatOptions = make('div', 'format-options');
  formatOptions.setAttribute('role', 'group');
  formatOptions.setAttribute('aria-label', '作品形式筛选');
  formatControl.append(formatLabel, formatOptions);
  const resourceControl = make('div', 'resource-control');
  resourceControl.append(make('span', 'catalog-secondary-label', '更多作品'), resourceNav);
  formatOptions.addEventListener('click', event => {
    const button = event.target.closest('button[data-format]');
    if (!button) return;
    if (button.getAttribute('aria-pressed') !== 'true') {
      type = button.dataset.format;
      syncUrl(selected().id, true); render(); showUpdate(); saveState();
    }
  });
  formatOptions.addEventListener('keydown', event => {
    const buttons = [...formatOptions.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next === undefined) return;
    event.preventDefault(); buttons[next].focus({preventScroll:true}); buttons[next].click();
  });
  const resultCount = $('[data-count-label]');
  resultCount.setAttribute('role', 'status');
  resultCount.setAttribute('aria-live', 'polite');
  resultCount.setAttribute('aria-atomic', 'true');
  const navigation = make('div', 'catalog-navigation');
  tabs.before(navigation);
  navigation.append(tabs, resourceTabs, resultCount);
  const relatedResources = make('nav', 'catalog-related-resources');
  relatedResources.setAttribute('aria-label', '相关设计模块');
  tools.append(formatControl, resourceControl, relatedResources);
  $('.category-tabs').append(tools);

  function selected() {
    let raw = '';
    try { raw = decodeURIComponent(location.hash.replace(/^#(?:cases|module)-/, '')); } catch {}
    return ordered.find(c => c.id === raw && !c.destination) || ordered[0];
  }
  function syncUrl(category, push = false) {
    const url = new URL(location.href);
    if (type === '全部形式') url.searchParams.delete('type');
    else url.searchParams.set('type', type);
    url.hash = 'cases-' + category;
    history[push ? 'pushState' : 'replaceState'](history.state, '', url.pathname + url.search + url.hash);
  }
  function saveState() {
    if (restoring) return;
    const cards = [...grid.querySelectorAll('.product-card')];
    const anchor = cards.find(c => c.getBoundingClientRect().bottom > 0);
    const state = {category:selected().id, type, y:scrollY, anchor:anchor?.dataset.caseId, offset:anchor?.getBoundingClientRect().top, width:innerWidth};
    try {sessionStorage.setItem(stateKey, JSON.stringify(state));} catch {}
  }
  function rememberCatalogEntry() {
    saveState();
    try {
      const entry = sessionStorage.getItem(stateKey);
      if (entry) sessionStorage.setItem(entryKey, entry);
      sessionStorage.setItem(pendingKey, '1');
    } catch {}
  }
  function layoutNow() {
    const style = getComputedStyle(grid);
    const unit = parseFloat(style.gridAutoRows) || 8;
    const gap = parseFloat(style.getPropertyValue('--masonry-gap')) || 40;
    grid.querySelectorAll('.product-card').forEach(card => {
      card.style.gridRowEnd = 'span ' + Math.ceil((card.getBoundingClientRect().height + gap) / unit);
    });
  }
  function layout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(() => {layoutFrame = 0; layoutNow();});
  }
  function categoryButton(category, returnToCases = false) {
    const button = make('button', returnToCases ? 'category-reset' : '');
    button.type = 'button'; button.dataset.category = category.id;
    button.setAttribute('aria-pressed', 'false');
    const count = category.id === '全部' ? browsing.length : all.filter(x => x.category === category.id).length;
    const name = returnToCases ? '商品案例' : category.name;
    button.setAttribute('aria-label', name + '，' + count + ' 项作品');
    if (returnToCases) {
      const icon = make('i', 'icon-arrow icon-left');
      icon.setAttribute('aria-hidden', 'true');
      button.append(icon);
    }
    button.append(make('span', '', name));
    button.addEventListener('click', () => {
      type = '全部形式'; syncUrl(category.id, true); render(); showUpdate();
      if (button.closest('[hidden]')) {
        const visibleRail = resourceTabs.hidden ? tabs : resourceTabs;
        visibleRail.querySelector('[data-category="' + CSS.escape(category.id) + '"]')?.focus({preventScroll:true});
      }
      if ($('#cases').getBoundingClientRect().top < 0) $('#cases').scrollIntoView({block:'start', behavior:'auto'});
      saveState();
    });
    return button;
  }
  resourceTabs.append(categoryButton(ordered[0], true));
  ordered.forEach(category => {
    if (category.destination) {
      const link = make('a', 'category-external', category.name);
      link.href = 'case.html?case=' + category.destination;
      link.append(make('i', 'icon-arrow'));
      resourceNav.append(link);
      return;
    }
    const isResource = resourceKinds.has(category.kind);
    (isResource ? resourceNav : tabs).append(categoryButton(category));
    if (isResource) resourceTabs.append(categoryButton(category));
  });
  resourceNav.hidden = !resourceNav.childElementCount;
  [tabs, resourceTabs].forEach(rail => rail.addEventListener('keydown', event => {
    const buttons = [...rail.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next === undefined) return;
    event.preventDefault(); buttons[next].focus({preventScroll:true}); buttons[next].click();
  }));
  function card(item, category, index) {
    const link = make('a', 'product-card');
    link.dataset.caseId = item.id;
    link.href = 'product.html?brand=' + encodeURIComponent(key) + '&id=' + encodeURIComponent(item.id) + '&from=' + encodeURIComponent(category.id) + (type !== '全部形式' ? '&fromType=' + encodeURIComponent(type) : '');
    link.setAttribute('aria-label', '查看' + item.product + '案例');
    link.addEventListener('click', rememberCatalogEntry);
    const frame = make('div', 'image-wrap'); frame.dataset.kind = item.kind || 'product';
    const img = make('img');
    // Catalog composition is independent of the approved homepage covers.
    const preview = item.catalogPreview || {src: item.cover, width: item.coverWidth || 800, height: item.coverHeight || 800};
    Object.assign(img, {src: preview.src, width: preview.width, height: preview.height, alt: item.product + ' · 完整作品预览', loading: index < 6 ? 'eager' : 'lazy', decoding: 'async'});
    frame.style.aspectRatio = preview.width + '/' + preview.height;
    if (item.coverBackground) frame.style.background = item.coverBackground;
    img.addEventListener('load', layout, {once: true});
    frame.append(img);
    const caption = make('div', 'product-caption');
    const title = make('h3');
    const lines = item.titleLines?.length === 2 ? item.titleLines : [item.product];
    lines.forEach(line => title.append(make('span', '', line)));
    const arrow = make('span', 'product-view-arrow'); arrow.setAttribute('aria-hidden', 'true'); arrow.append(make('i', 'icon-arrow'));
    const meta = make('p', 'case-card-meta');
    const categoryLabel = item.sourceCategory || item.category;
    const formatLabel = item.formatLabel || item.group || '作品';
    meta.append(make('span', 'case-category', categoryLabel));
    if (formatLabel !== categoryLabel) meta.append(make('span', 'case-format', formatLabel));
    caption.append(title, meta, arrow); link.append(frame, caption); return link;
  }
  function render() {
    const category = selected();
    const base = category.id === '全部' ? browsing : all.filter(c => c.category === category.id);
    const groups = [...new Set(base.map(c => c.group))];
    if (type !== '全部形式' && !groups.includes(type)) type = '全部形式';
    syncUrl(category.id);
    const shown = type === '全部形式' ? base : base.filter(c => c.group === type);
    $('[data-selected-title]').textContent = category.name;
    resultCount.replaceChildren(make('span', 'catalog-total', shown.length + ' 项'));
    resultCount.setAttribute('aria-label', category.name + '，' + (type === '全部形式' ? '' : type + '，') + shown.length + ' 项作品');
    document.querySelectorAll('[data-category]').forEach(button => {
      const active = button.dataset.category === category.id;
      button.classList.toggle('active', active);button.setAttribute('aria-pressed', String(active));
    });
    const isResource = resourceKinds.has(category.kind);
    document.body.classList.toggle('resource-mode', isResource);
    tabs.hidden = isResource;
    resourceTabs.hidden = !isResource;
    resourceNav.hidden = isResource || !resourceNav.childElementCount;
    resourceControl.hidden = resourceNav.hidden;
    $('.category-tabs').setAttribute('aria-label', isResource ? '资料类型筛选' : '作品分类筛选');
    const formats = ['全部形式', ...groups];
    const formatKey = JSON.stringify(formats);
    // Preserve focused buttons when only the selected format changes.
    if (formatOptions.dataset.options !== formatKey) {
      formatOptions.replaceChildren(...formats.map(group => {
        const button = make('button', 'format-option', group);
        button.type = 'button'; button.dataset.format = group;
        return button;
      }));
      formatOptions.dataset.options = formatKey;
    }
    formatOptions.querySelectorAll('button').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.format === type));
    });
    // A one-to-one category/format partition is not a second useful filter.
    // Keep the controls for an explicit format URL so its state can be reset.
    const repeatsCategories = category.id === '全部' && groups.length > 1 && groups.every(group => {
      const members = base.filter(item => item.group === group);
      const sourceCategory = members[0].category;
      return members.every(item => item.category === sourceCategory)
        && base.filter(item => item.category === sourceCategory).every(item => item.group === group);
    });
    const showFormats = groups.length > 1 && (!repeatsCategories || type !== '全部形式');
    formatControl.hidden = !showFormats;
    if (!showFormats && formatControl.contains(document.activeElement)) {
      (isResource ? resourceTabs : tabs).querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
    }
    const related = all.filter(entry => entry.kind === 'module' && entry.catalogCategoryEntry && entry.sourceCategory === category.id);
    relatedResources.replaceChildren();
    if (related.length === 1) {
      const item = related[0];
      const link = make('a', 'catalog-related-link');
      // Keep a module in its own collection, not duplicated among product cases.
      link.href = 'product.html?brand=' + encodeURIComponent(key) + '&id=' + encodeURIComponent(item.id) + '&from=' + encodeURIComponent(category.id) + (type !== '全部形式' ? '&fromType=' + encodeURIComponent(type) : '');
      link.addEventListener('click', rememberCatalogEntry);
      link.append(make('span', '', item.product), make('i', 'icon-arrow'));
      link.querySelector('i').setAttribute('aria-hidden', 'true');
      relatedResources.append(link);
    }
    relatedResources.hidden = !relatedResources.childElementCount;
    const hasSecondary = showFormats || !resourceNav.hidden || !relatedResources.hidden;
    tools.hidden = !hasSecondary;

    grid.replaceChildren(...shown.map((item, index) => card(item, category, index)));
    layoutNow();
    if (!shown.length) grid.append(make('p', 'empty-state', '当前筛选暂无作品，请选择其他品类。'));

  }
  function restorePosition(state) {
    restoring = true; layoutNow();
    const anchor = state?.anchor && grid.querySelector('[data-case-id="' + CSS.escape(state.anchor) + '"]');
    const top = anchor && state.width === innerWidth ? scrollY + anchor.getBoundingClientRect().top - state.offset : state?.y || 0;
    scrollTo({top, behavior:'auto'}); restoring = false;
    grid.setAttribute('aria-busy', 'false');
  }
  const initialReturn = pendingReturn && savedState && savedState.category === selected().id && savedState.type === type;
  render();
  grid.setAttribute('aria-busy', 'false');
  new ResizeObserver(layout).observe(grid);
  document.fonts?.ready.then(layout);
  window.addEventListener('scroll', saveState, {passive:true});
  window.addEventListener('pagehide', saveState);
  window.addEventListener('hashchange', () => {if (['#top','#main'].includes(location.hash)) return;render();});
  window.addEventListener('popstate', () => {type = new URLSearchParams(location.search).get('type') || '全部形式';render();});
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      try {const state = JSON.parse(sessionStorage.getItem(entryKey) || sessionStorage.getItem(stateKey) || 'null'); if (state) requestAnimationFrame(() => restorePosition(state));sessionStorage.removeItem(pendingKey);} catch {}
    }
  });
  if (initialReturn) {
    restoring = true;
    grid.setAttribute('aria-busy', 'true');
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once:true}));
    Promise.all([loaded, document.fonts?.ready, ...[...grid.querySelectorAll('img')].slice(0,6).map(img => img.decode().catch(() => {}))]).then(() => {
      // Restore after the browser's initial fragment jump and the masonry layout.
      requestAnimationFrame(() => requestAnimationFrame(() => restorePosition(savedState)));
      try {sessionStorage.removeItem(pendingKey);} catch {}
    });
  }
})();
