(() => {
  const entries = [...(window.SWEETHEART_CASES || []).map(item => ({...item, brand:'sweetheart'})), ...(window.PORTFOLIO_CASES || [])];
  const all = entries.filter(item => item.listed !== false);
  const params = new URLSearchParams(location.search);
  const pad = number => String(number).padStart(2, '0');
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const $ = selector => document.querySelector(selector);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';
  const brands = window.PORTFOLIO_BRANDS || {};
  const brandId = params.has('brand') ? params.get('brand') : 'sweetheart';
  const brand = Object.prototype.hasOwnProperty.call(brands, brandId) ? brands[brandId] : null;

  function renderRoles(roles) {
    const target = $('[data-product-role]');
    target.replaceChildren();
    roles.forEach(role => {
      const label = document.createElement('span');
      label.className = 'role-item'; label.textContent = role;
      target.append(label);
    });
  }

  function labelWithArrow(target, text, direction = '', leading = false) {
    const icon = document.createElement('i');
    icon.className = 'icon-arrow' + (direction ? ' icon-' + direction : '');
    icon.setAttribute('aria-hidden', 'true');
    target.replaceChildren();
    if (leading) target.append(icon,document.createTextNode(' ' + text));
    else target.append(document.createTextNode(text + ' '), icon);
  }
  function setContext(brandName, categoryName, back, title) {
    document.title = `${title} — ${brandName}`;
    document.querySelectorAll('[data-brand-back]').forEach(link => link.href = back);
    document.querySelectorAll('[data-brand-name]').forEach(label => label.textContent = brandName);
    document.querySelectorAll('[data-category]').forEach(label => label.textContent = categoryName);
  }
  // Product headings use a deliberate two-line lockup so every case keeps the
  // same visual rhythm. Splits follow the product's semantic phrase boundary;
  // the fallback keeps future titles balanced without breaking markup.
  const PRODUCT_TITLE_LINES = {
    '牛奶蛋白保暖套装':['牛奶蛋白','保暖套装'],
    '羊毛蚕丝高腰提臀裤':['羊毛蚕丝','高腰提臀裤'],
    '羊毛蚕丝钻石领':['羊毛蚕丝','钻石领'],
    '羊毛蚕丝圆领':['羊毛蚕丝','圆领'],
    '椰油桃心领保暖':['椰油桃心领','保暖'],
    '塑型保暖套装':['塑型保暖','套装'],
    '羊羔绒保暖':['羊羔绒','保暖'],
    '安哥拉兔绒保暖':['安哥拉兔绒','保暖'],
    '提臀塑型内裤':['提臀塑型','内裤'],
    'A类医用棉内裤':['A类医用棉','内裤'],
    '3D蜜桃臀内裤':['3D蜜桃臀','内裤'],
    '凉感透气文胸':['凉感透气','文胸'],
    '无痕包容文胸':['无痕包容','文胸']
  };
  function renderProductTitle(title, titleLines) {
    const target = $('[data-title]');
    target.replaceChildren();
    const mapped = titleLines || PRODUCT_TITLE_LINES[title];
    const lines = mapped || [String(title)];
    lines.forEach((line, index) => {
      if (index) target.append(document.createElement('br'));
      const span = document.createElement('span');
      span.textContent = line;
      if (index === lines.length - 1) span.className = 'product-title-last';
      target.append(span);
    });
  }
  function showPendingCase(pendingBrand, category, missing = false) {
    const brandName = pendingBrand?.name || '作品集';
    const categoryName = category?.name || '全部分类';
    const base = pendingBrand ? pendingBrand.id === 'sweetheart' ? 'sweetheart.html' : `case.html?case=${encodeURIComponent(pendingBrand.id)}` : 'index.html#work';
    const back = category ? `${base}#cases-${encodeURIComponent(category.id)}` : base;
    const isStore = category?.kind === 'store';
    const isAI = category?.kind === 'ai' || pendingBrand?.id === 'ai';
    const title = missing ? '案例暂未找到' : `${categoryName}${/[A-Za-z]$/.test(categoryName) ? ' ' : ''}${isAI ? '实践' : '视觉案例'}`;
    setContext(brandName, categoryName, back, title);
    document.body.classList.add('is-pending-product');
    document.body.classList.toggle('is-missing-product', missing);
    renderProductTitle(title);
    $('[data-product-kicker]').textContent = missing ? '案例索引' : `${brandName} / 案例预览`;
    $('[data-product-status]').hidden = false;
    $('[data-product-status]').textContent = missing ? '请返回分类选择案例' : '素材待补充';
    if (!missing && pendingBrand?.role?.length) {
      renderRoles(pendingBrand.role);
      $('[data-product-summary]').textContent = category?.description || pendingBrand.description || '';
    } else {
      $('.product-summary').hidden = true;
    }
    $('[data-main-kicker]').textContent = '视觉作品';
    $('#main-title').textContent = isStore ? '店铺页面' : isAI ? '视觉成果' : '商品主图';
    $('.gallery-controls').hidden = true;
    const track = $('[data-main]');
    track.classList.add('is-pending');
    track.removeAttribute('tabindex');
    track.setAttribute('aria-label', missing ? '案例未找到' : '作品素材占位');
    track.innerHTML = `<figure class="pending-main"><div class="pending-art"><div class="pending-art-meta"><span>${escapeHTML(brandName)}</span><span>${missing ? '未找到案例' : '素材待补充'}</span></div><div class="pending-art-center"><span aria-hidden="true" class="pending-art-mark"></span><strong>${escapeHTML(missing ? '案例暂未找到' : categoryName)}</strong><p>${missing ? '请返回分类，选择其他案例。' : '作品整理中'}</p></div><span class="pending-art-note">${missing ? '案例索引' : '案例预览'}</span></div><figcaption>${escapeHTML(category?.description || '当前地址没有对应案例。')}</figcaption></figure>`;
    $('[data-main-note]').hidden = true;
    if (missing) {
      $('.main-gallery').hidden = true;
      $('.detail-section').hidden = true;
      labelWithArrow($('.header-contact'),'返回作品分类');
    } else {
      $('[data-detail-kicker]').textContent = '案例内容';
      $('#detail-title').textContent = isAI ? '制作过程' : '设计细节';
      $('.detail-toolbar').hidden = true;
      $('[data-read-full]').hidden = true;
      const overview = $('[data-overview]');
      overview.classList.add('is-pending');
      overview.innerHTML = '<div class="pending-detail"><span class="pending-detail-number" aria-hidden="true">02</span><div><h3>完整案例待补充</h3><p>项目图片与设计细节正在整理。</p></div><span class="pending-detail-status">素材整理中</span></div>';
      $('.detail-end').hidden = true;
    }
    const previous = $('.product-bottom [data-brand-back]');
    labelWithArrow(previous,missing ? '返回作品分类' : `返回${categoryName}案例`,'left',true);
    const available = (pendingBrand?.categories || []).filter(entry => !entry.destination);
    const next = category && available.length > 1 ? available[(available.findIndex(entry => entry.id === category.id) + 1) % available.length] : null;
    const nextLink = $('[data-next-case]');
    nextLink.hidden = !next || missing;
    if (next && !missing) {
      nextLink.href = `product.html?brand=${encodeURIComponent(pendingBrand.id)}&category=${encodeURIComponent(next.id)}`;
      labelWithArrow(nextLink,`${next.name}案例预览`);
    }
  }

  // Older category preview links now resolve to an available real case.
  // An explicit invalid id still shows the missing-case state.
  const requested = entries.find(entry => entry.id === params.get('id') && entry.brand === brandId);
  // A retired duplicate returns to its real category, without guessing a product owner.
  if (requested?.listed === false && requested.catalogRedirect) {
    location.replace(requested.catalogRedirect);
    return;
  }
  const caseId = requested?.mergedInto || params.get('id');
  if (requested?.mergedInto) {
    params.set('id', caseId);
    history.replaceState(history.state, '', location.pathname + '?' + params.toString() + location.hash);
  }
  const item = params.has('id')
    ? all.find(entry => entry.id === caseId && entry.brand === brandId)
    : all.find(entry => entry.brand === brandId && entry.category === params.get('category'));
  if (!item) {
    const category = brand?.categories?.find(entry => entry.id === params.get('category') && !entry.destination);
    showPendingCase(brand, category, !brand || params.has('id') || !category);
    return;
  }
  const category = item.category;
  const contextualReturn = item.catalogCategoryEntry && params.get('from') === item.sourceCategory;
  const returnCategory = params.get('from') === '全部' ? '全部' : contextualReturn ? item.sourceCategory : category;
  const requestedType = params.get('fromType');
  const returnType = requestedType && (requestedType === item.group || contextualReturn && all.some(entry => entry.brand === brandId && entry.category === returnCategory && entry.group === requestedType)) ? requestedType : '';
  const base = brandId === 'sweetheart' ? 'sweetheart.html' : `case.html?case=${encodeURIComponent(brandId)}`;
  const back = base + (returnType ? (base.includes('?') ? '&' : '?') + 'type=' + encodeURIComponent(returnType) : '') + '#cases-' + encodeURIComponent(returnCategory);
  setContext(brand.name, returnCategory, back, item.product);
  if (returnCategory === '全部') {
    $('.product-back [data-category]').textContent = '全部作品';
    labelWithArrow($('.product-bottom [data-brand-back]'),'返回全部案例','left',true);
  }
  labelWithArrow($('.product-back'), `返回${brand.name}目录`, 'left', true);
  renderRoles(item.roles || brand.role || []);
  renderProductTitle(item.product, item.titleLines);
  if (item.edition) {
    $('[data-product-status]').hidden = false;
    $('[data-product-status]').textContent = item.edition;
  }
  $('[data-product-summary]').hidden = true; // Publish responsibilities, not inferred design commentary.
  if (item.evidenceNotes?.length) {
    const notes = $('[data-case-notes]');
    notes.hidden = false;
    notes.innerHTML = item.evidenceNotes.map(note => `<article><h2>${escapeHTML(note.title)}</h2><div><p>${escapeHTML(note.text)}</p>${note.link ? `<a class="evidence-related" href="${escapeHTML(note.link.href)}">${escapeHTML(note.link.label)} <i class="icon-arrow" aria-hidden="true"></i></a>` : ''}</div></article>`).join('');
    $('.product-summary').append(notes);
  }
  const isDocument = ['standard','module'].includes(item.kind);
  const sameBrand = all.filter(entry => entry.brand === brandId && entry.listed !== false && (contextualReturn ? entry.category === category : returnCategory === '全部' ? isDocument ? entry.category === category : !['standard','module'].includes(entry.kind) : entry.category === returnCategory) && (contextualReturn || !returnType || entry.group === returnType))
    .sort((a,b) => brand.categories.findIndex(c => c.id === a.category) - brand.categories.findIndex(c => c.id === b.category) || (a.priority ?? 100) - (b.priority ?? 100));
  const nextCase = sameBrand[(sameBrand.indexOf(item) + 1) % sameBrand.length];
  $('[data-next-case]').hidden = sameBrand.length < 2;
  $('[data-next-case]').href = 'product.html?brand=' + encodeURIComponent(brandId) + '&id=' + encodeURIComponent(nextCase.id) + '&from=' + encodeURIComponent(contextualReturn ? category : returnCategory) + (!contextualReturn && returnType ? '&fromType=' + encodeURIComponent(returnType) : '');
  $('[data-next-case]').innerHTML = '<span class="next-case-label">下一案例</span><strong>' + (nextCase.titleLines || [nextCase.product]).map(line => '<span>' + escapeHTML(line) + '</span>').join('') + '</strong><i class="icon-arrow" aria-hidden="true"></i>';

  if (item.kind === 'standard' && item.id !== 'urban-women-guideline') {
    const methodLink = document.createElement('a');
    methodLink.className = 'standard-method-link';
    methodLink.href = 'practice.html#standards';
    methodLink.innerHTML = '查看规范制定与应用方法 <i class="icon-arrow" aria-hidden="true"></i>';
    $('.product-summary').append(methodLink);
  }
  const mainLabel = item.mainLabel || (item.animated ? '动态视觉' : item.kind === 'standard' ? '规范原稿' : item.kind === 'module' ? '独立模块' : item.comparisons ? '制作对照' : item.kind === 'identity' ? '方案页面' : item.kind === 'ai' ? '视觉效果' : item.kind === 'store' ? '活动主视觉' : '商品主图');
  const imageLabel = ['standard','module'].includes(item.kind) ? '画面' : item.kind === 'identity' ? '页面' : item.kind === 'ai' ? '效果' : item.kind === 'store' ? '主视觉' : '主图';
  $('[data-product-kicker]').textContent = `${item.sourceCategory || item.category} / ${item.formatLabel || item.group || '视觉设计'}`;
  $('[data-main-kicker]').textContent = `${item.kind === 'ai' ? 'AI 视觉' : item.kind === 'store' ? '活动视觉' : '商品视觉'}`;
  $('#main-title').textContent = mainLabel;
  $('[data-prev]').setAttribute('aria-label', `向左浏览${imageLabel}`);
  $('[data-next]').setAttribute('aria-label', `向右浏览${imageLabel}`);
  $('[data-main]').setAttribute('aria-label', `${mainLabel}，左右滑动浏览`);
  $('[data-main-note]').textContent = `左右滑动浏览，点击${imageLabel}放大。`;
  if (item.kind === 'store') $('#detail-title').textContent = '店铺页面'; if (item.kind === 'standard') { $('#detail-title').textContent = '规范与说明'; $('[data-detail-kicker]').textContent = '视觉规范'; }
  if (item.detailLabel) $('#detail-title').textContent = item.detailLabel;
  if (item.detailNote) {
    const note = document.createElement('p');
    note.className = 'detail-source-note';
    note.textContent = item.detailNote;
    $('.detail-section .gallery-heading').after(note);
  }
  const mainSources = item.mainSources || (item.main || []).map(src => ({src,width:800,height:800,top:0,visibleHeight:800}));
  const isCollection = item.galleryLayout === 'collection';
  document.body.classList.toggle('is-collection-case', isCollection);
  document.body.classList.toggle('is-comparison-case', Boolean(item.comparisons));
  const isWideOriginal = item.galleryLayout === 'wide-original';
  const isGuidelineStudy = item.id === 'urban-women-guideline';
  const showGallery = mainSources.length > 0 && !item.comparisons && !isGuidelineStudy;
  $('.main-gallery').hidden = !showGallery;
  if (item.evidenceNotes?.length && showGallery) {
    const notes = $('[data-case-notes]');
    const compactViewport = window.matchMedia('(max-width:760px)');
    const placeNotes = () => {
      if (compactViewport.matches) $('.main-gallery').after(notes);
      else $('.product-summary').append(notes);
    };
    placeNotes();
    compactViewport.addEventListener('change', placeNotes);
  }
  document.body.classList.toggle('is-identity-case', ['identity','standard'].includes(item.kind));
  document.body.classList.toggle('is-animated-case', item.animated === true);
  if (!showGallery) $('[data-detail-kicker]').textContent = '页面设计';
  const views = item.views || window.SWEETHEART_VIEWS?.[item.id] || {previews:[], full:null};
  $('.detail-section').hidden = !views.full;
  // Full pages preserve every source pixel. Excerpt windows are only for explicit previews.
  function sourceMarkup(source, alt, eager = false, complete = false) {
    if (complete) {
      if (source.parts) return `<div class="source-sequence">${source.parts.map((part,index) => sourceMarkup(part, `${alt} · ${index+1}`, eager && index === 0, true)).join('')}</div>`;
      return `<div class="source-complete"><img src="${escapeHTML(source.src)}" alt="${escapeHTML(alt)}" width="${source.width}" height="${source.height}" loading="${eager?'eager':'lazy'}" decoding="async"></div>`;
    }
    if (source.parts) return `<div class="source-sequence">${source.parts.filter(part => (part.visibleHeight ?? part.height) > 0).map((part,index) => {
      const label = `${alt} · ${index+1}`;
      if ((part.visibleHeight ?? part.height) < part.height || part.top) return sourceMarkup(part, label, eager && index === 0);
      return `<img src="${escapeHTML(part.src)}" alt="${escapeHTML(label)}" width="${part.width}" height="${part.height}" loading="${eager&&index===0?'eager':'lazy'}" decoding="async">`;
    }).join('')}</div>`;
    const offset = -100 * (source.top || 0) / source.width;
    return `<div class="source-window" style="--source-ratio:${source.width}/${source.visibleHeight ?? source.height};--source-offset:${offset}%"><img src="${escapeHTML(source.src)}" alt="${escapeHTML(alt)}" width="${source.width}" height="${source.height}" loading="${eager?'eager':'lazy'}" decoding="async"></div>`;
  }
  if (isGuidelineStudy) {
    const study = $('[data-guideline-study]');
    study.hidden = false;
    study.innerHTML = `<div class="guideline-spread"><div class="guideline-copy"><h2>主图信息分区</h2><dl class="guideline-rules"><div><dt>品牌与主体</dt><dd>Logo 固定在左上，人物与商品占据主视觉。</dd></div><div><dt>卖点与活动</dt><dd>文案集中呈现，底部预留活动遮挡安全区。</dd></div><div><dt>商品应用</dt><dd>在信息分区内，按材质、功能与款式调整表达。</dd></div></dl><a class="guideline-application" href="product.html?brand=urban&id=urban-shaping&from=女内">查看商品应用 <i class="icon-arrow" aria-hidden="true"></i></a></div><figure><img src="assets/practice/women-safe-area.jpg" width="810" height="1080" alt="女内主图规范原稿节选：Logo、主体、文案与活动安全区" decoding="async"><figcaption>主图安全区 · 历史规范原稿节选</figcaption></figure></div><details class="guideline-original"><summary><span>阅读完整历史规范</span><i class="icon-arrow icon-down" aria-hidden="true"></i></summary><div class="guideline-original-content"><p>历史工作资料 · 已迭代</p><div class="guideline-original-reader" tabindex="0" role="region" aria-label="完整规范原稿，可横向阅读">${mainSources.map((source,index) => `<img src="${escapeHTML(source.src)}" width="${source.width}" height="${source.height}" alt="女内主图视觉规范完整原稿 ${index+1}" loading="lazy" decoding="async">`).join('')}</div></div></details><a class="guideline-method" href="practice.html#standards">继续查看规范制定与工作方法 <i class="icon-arrow" aria-hidden="true"></i></a>`;
  }
  $('.gallery-controls').hidden = isCollection || mainSources.length < 2;
  $('[data-main-note]').hidden = true;
  const track = $('[data-main]');
  track.classList.toggle('is-single-main', mainSources.length === 1);
  track.classList.toggle('is-collection', isCollection);
  track.classList.toggle('is-wide-original', isWideOriginal);
  if (mainSources.length === 1 && !isWideOriginal) track.style.setProperty('--single-source-width', (mainSources[0].width || 780) + 'px');
  if (isWideOriginal) {
    track.style.setProperty('--wide-ratio', String(mainSources[0].width / mainSources[0].height));
    track.setAttribute('aria-label', '系列主视觉完整原稿，可横向阅读');
    $('[data-prev]').setAttribute('aria-label', '向左阅读系列主视觉');
    $('[data-next]').setAttribute('aria-label', '向右阅读系列主视觉');
    $('[data-gallery-scrub]').setAttribute('aria-label', '系列主视觉横向位置');
  }
  if (isCollection) {
    // The project heading already names the collection. Let each subject heading
    // lead its artwork instead of repeating a second large gallery title.
    const gallery = $('.main-gallery');
    gallery.querySelector('.gallery-heading').hidden = true;
    gallery.removeAttribute('aria-labelledby');
    gallery.setAttribute('aria-label', mainLabel);
    track.setAttribute('aria-label',`${mainLabel}合集，点击画面放大`);
    $('[data-main-note]').textContent = '完整模块 · 点击画面放大阅读';
  }
  if (item.kind === 'product' && mainSources.length) track.style.setProperty('--main-ratio', mainSources[0].width / mainSources[0].height < .9 ? '3/4' : '1');
  const renderMainSlide = (source,i) => {
    const image = `<img src="${escapeHTML(source.src)}" width="${source.width}" height="${source.height}" alt="${escapeHTML(item.product)}：${escapeHTML(source.label || imageLabel + ' ' + (i+1))}" loading="${i===0?'eager':'lazy'}" decoding="async">`;
    const frame = isWideOriginal ? `<div class="wide-original-image">${image}</div>` : `<button class="main-image" type="button" data-main-index="${i}" aria-label="放大${mainLabel} ${i+1}">${image}</button>`;
    return `<figure class="main-slide">${frame}${isWideOriginal ? '' : `<figcaption><span>${escapeHTML(source.label || imageLabel + ' ' + pad(i+1))}</span><i class="icon-arrow" aria-hidden="true"></i></figcaption>`}</figure>`;
  };
  if (showGallery && isCollection && item.groupCollection) {
    // Group by the real picture's subject. Keep its original reader index and geometry.
    const groups = [...new Set(mainSources.map(source => source.group || mainLabel))];
    track.classList.add('has-groups');
    track.removeAttribute('tabindex');
    track.innerHTML = groups.map(group => `<section class="collection-group" aria-label="${escapeHTML(group)}"><header class="collection-heading"><h2>${escapeHTML(group)}</h2></header><div class="collection-grid">${mainSources.map((source,i) => (source.group || mainLabel) === group ? renderMainSlide(source,i) : '').join('')}</div></section>`).join('');
  } else {
    track.innerHTML = showGallery ? mainSources.map(renderMainSlide).join('') : '';
  }
  if (isWideOriginal) {
    $('.gallery-rail-tip').textContent = '横向阅读';
    $('[data-gallery-scrub]').setAttribute('aria-label', '横向阅读完整原稿');
    track.setAttribute('aria-label', mainLabel + '完整原稿，左右滑动浏览');
  }
  if (item.comparisons) {
    const section = $('[data-comparisons]');
    section.hidden = false;
    section.innerHTML = `<div class="gallery-heading"><h2>从素材到应用</h2><p class="comparison-role">${item.comparisons.length} 组制作对照</p></div>` + item.comparisons.map((pair,index) => `<article class="comparison"><div class="comparison-copy"><span>${pad(index+1)}</span><h3>${escapeHTML(pair.title)}</h3>${pair.note ? `<p>${escapeHTML(pair.note)}</p>` : ''}</div><div class="comparison-pair">${['before','after'].map(role => {
      const i=pair[role+'Index'], source=mainSources[i], label=role==='before'?'原图':'效果图';
      return `<figure><figcaption>${label}</figcaption><button type="button" data-main-index="${i}" aria-label="放大第 ${index+1} 组${label}"><img src="${escapeHTML(source.src)}" width="${source.width}" height="${source.height}" alt="${escapeHTML(pair.title)} · ${label}" loading="lazy" decoding="async"></button></figure>`;
    }).join('')}</div></article>`).join('');
  }
  if (item.supplements?.length) {
    const section = document.createElement('section');
    section.className = 'supplementary-images';
    section.id = 'supplemental-artwork';
    section.setAttribute('aria-label', item.supplementTitle || '补充画面');
    const groups = [...new Set(item.supplements.map(source => source.group || '补充画面'))];
    section.innerHTML = `<div class="supplement-heading"><h2>${escapeHTML(item.supplementTitle || '补充画面')}</h2><p>${escapeHTML(item.supplementNote || '原尺寸预览')}</p></div>` + groups.map(group => `<div class="snippet-group">${groups.length > 1 ? `<h3>${escapeHTML(group)}</h3>` : ''}<div class="snippet-strip">${item.supplements.filter(source => (source.group || '补充画面') === group).map(source => `<figure><div class="snippet-canvas"><img src="${escapeHTML(source.src)}" width="${source.width}" height="${source.height}" alt="${escapeHTML(source.label)}" loading="lazy" decoding="async" style="width:${source.width}px;max-width:100%;height:auto"></div><figcaption>${escapeHTML(source.label)}</figcaption></figure>`).join('')}</div></div>`).join('');
    $('.main-gallery').after(section);
  }
  const scrub = $('[data-gallery-scrub]');
  const rail = $('[data-gallery-rail]');
  const step = () => isWideOriginal ? track.clientWidth * .8 : (track.querySelector('.main-slide')?.getBoundingClientRect().width || 1) + (parseFloat(getComputedStyle(track).gap) || 0);
  function updateMain() {
    if (isCollection) {rail.hidden = true;return;}
    if (!showGallery || !track.clientWidth) return;
    const bounds = track.getBoundingClientRect();
    const visible = [...track.querySelectorAll('.main-slide')].flatMap((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const overlap = Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left);
      return overlap >= Math.min(rect.width, bounds.width) / 2 ? [index + 1] : [];
    });
    const first = visible[0] || Math.min(mainSources.length, Math.round(track.scrollLeft / step()) + 1);
    const last = visible.at(-1) || first;
    $('[data-main-progress]').textContent = `${pad(first)}${last>first?'–'+pad(last):''} / ${pad(mainSources.length)}`;
    const max = Math.max(0,track.scrollWidth - track.clientWidth);
    rail.hidden = (!isWideOriginal && mainSources.length < 2) || max < 2;
    if (isWideOriginal) $('[data-main-progress]').textContent = Math.round(max ? track.scrollLeft / max * 100 : 0) + '%';
    scrub.value = String(max ? Math.round(track.scrollLeft / max * 1000) : 0);
    scrub.style.setProperty('--scrub-progress', (max ? track.scrollLeft / max * 100 : 0) + '%');
    scrub.setAttribute('aria-valuetext', isWideOriginal ? Math.round(max ? track.scrollLeft / max * 100 : 0) + '%' : `主图 ${first}${last > first ? ' 至 ' + last : ''}，共 ${mainSources.length} 张`);
    $('[data-prev]').disabled = track.scrollLeft < 2;
    $('[data-next]').disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  }
  scrub.addEventListener('pointerdown', () => scrub.classList.add('is-dragging'));
  const endScrubDrag = () => scrub.classList.remove('is-dragging');
  window.addEventListener('pointerup', endScrubDrag);
  window.addEventListener('pointercancel', endScrubDrag);
  scrub.addEventListener('blur', endScrubDrag);
  scrub.addEventListener('input', () => {
    track.style.scrollSnapType = 'none';
    track.scrollTo({left:Number(scrub.value) / 1000 * (track.scrollWidth - track.clientWidth),behavior:'auto'});
    scrub.style.setProperty('--scrub-progress', Number(scrub.value) / 10 + '%');
  });
  scrub.addEventListener('change', () => {track.style.scrollSnapType = '';updateMain();});
  const moveMain = direction => track.scrollBy({left:direction*step(),behavior:scrollBehavior});
  scrub.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') {
      track.scrollTo({left:event.key === 'Home' ? 0 : track.scrollWidth - track.clientWidth,behavior:'auto'});
    } else {
      const direction = ['ArrowLeft','ArrowDown','PageUp'].includes(event.key) ? -1 : 1;
      moveMain(direction);
    }
  });
  $('[data-prev]').addEventListener('click', () => moveMain(-1));
  $('[data-next]').addEventListener('click', () => moveMain(1));
  track.addEventListener('keydown', event => {
    if(event.target !== track)return;
    if (['ArrowLeft','ArrowRight'].includes(event.key)) {event.preventDefault();moveMain(event.key==='ArrowLeft'?-1:1);}
  });
  track.addEventListener('scroll',updateMain,{passive:true});
  new ResizeObserver(updateMain).observe(track);
  updateMain();

  // Keep the case's two media sections and its original return context in reach.
  const contents = document.createElement('nav');
  contents.className = 'case-contents';
  contents.setAttribute('aria-label', '案例内容导航');
  const contentSections = [];
  if (item.comparisons) {
    $('[data-comparisons]').id = 'case-comparisons';
    contentSections.push({id:'case-comparisons', label:'制作对照'});
  } else if (showGallery) {
    $('.main-gallery').id = 'main-artwork';
    contentSections.push({id:'main-artwork', label:mainLabel});
  }
  if (item.supplements?.length) contentSections.push({id:'supplemental-artwork', label:item.supplementTitle || '补充画面'});
  if (views.full) contentSections.push({id:'detail', label:item.detailLabel || (item.kind === 'store' ? '店铺页面' : item.kind === 'standard' ? '规范与说明' : '详情长图')});
  contentSections.forEach((section, index) => {
    if (contentSections.length === 1) return;
    const link = document.createElement('a');
    link.href = '#' + section.id;
    link.textContent = section.label;
    if (index === 0) link.setAttribute('aria-current', 'location');
    contents.append(link);
  });
  // The sticky chapter nav only switches sections. Image counts/arrows stay beside the gallery.
  if (contentSections.length > 1) $('.product-hero').after(contents);
  let contentsFrame = 0;
  function updateContents() {
    contentsFrame = 0;
    const edge = contents.getBoundingClientRect().height + 24;
    const current = contentSections.filter(section => {
      const element = document.getElementById(section.id);
      const arrival = Math.max(edge, parseFloat(getComputedStyle(element).scrollMarginTop) || 0) + 2;
      return element.getBoundingClientRect().top <= arrival;
    }).at(-1) || contentSections[0];
    contentSections.forEach(section => {
      const link = contents.querySelector('a[href="#' + section.id + '"]');
      if (!link) return;
      if (section === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!contentsFrame) contentsFrame = requestAnimationFrame(updateContents);
  }, {passive:true});
  window.addEventListener('hashchange', () => {
    if (!contentsFrame) contentsFrame = requestAnimationFrame(updateContents);
  });
  updateContents();

  // Read supplied artwork continuously in its original order.
  if (views.full) {
    $('[data-full]').innerHTML = sourceMarkup(views.full, item.product + ' 完整页面', true, true);
    $('[data-full]').hidden = false;
    $('[data-overview]').hidden = true;
    $('[data-return-overview]').hidden = true;
    $('.view-switch').hidden = true;
    $('[data-detail-note]').textContent = '';
    $('.detail-end').hidden = true;
  }

  const reader = $('[data-reader]');
  const canvas = $('[data-reader-scroll]');
  let readerKind = 'preview', readerIndex = 0, lastPreview = 0, returnFocus = null;
  let loadVersion = 0;
  const currentSource = () => readerKind==='main' ? mainSources[readerIndex] : readerKind==='full' ? views.full : views.previews[readerIndex];
  const readerTotal = () => readerKind==='main' ? mainSources.length : views.previews.length;
  function updateReadingProgress() {
    const max = canvas.scrollHeight - canvas.clientHeight;
    const progress = max>1 ? Math.min(100,Math.round(canvas.scrollTop/max*100)) : 100;
    $('[data-reader-progress]').style.width = `${progress}%`;
    if (readerKind === 'full') $('[data-reader-position]').textContent = `已读 ${progress}%`;
  }
  function renderReader() {
    const rawSource = currentSource();
    const source = rawSource?.readerSource || rawSource;
    reader.classList.toggle('is-document', Boolean(rawSource?.readerSource) || ['standard','module'].includes(item.kind) || source?.height > source?.width * 2);
    reader.style.setProperty('--reader-native-width', (source?.width || 1100) + 'px');
    if (!source) return;
    const version = ++loadVersion;
    reader.dataset.kind = readerKind;
    reader.style.setProperty('--reader-image-ratio', String(source.width / source.visibleHeight));
    $('[data-reader-title]').textContent = item.product;
    $('[data-reader-caption]').textContent = readerKind==='main'?(source.label || mainLabel):readerKind==='full'?(item.kind === 'store' ? '店铺页面原稿' : item.kind === 'standard' ? '规范原稿' : '完整详情原稿'):`视觉节选 ${pad(readerIndex+1)}`;
    $('[data-reader-prev]').hidden = readerKind==='full';
    $('[data-reader-next]').hidden = readerKind==='full';
    $('[data-reader-top]').hidden = readerKind!=='full';
    $('[data-reader-prev]').disabled = readerIndex===0;
    $('[data-reader-next]').disabled = readerIndex===readerTotal()-1;
    $('[data-reader-switch]').hidden = true;
    $('[data-reader-switch]').textContent = readerKind==='full' ? '返回视觉节选' : '阅读完整详情';
    $('[data-reader-position]').textContent = `${pad(readerIndex+1)} / ${pad(readerTotal())}`;
    $('[data-reader-art]').innerHTML = sourceMarkup(source,`${item.product} ${$('[data-reader-caption]').textContent}`,true,source === views.full);
    $('[data-reader-art]').hidden = false;
    $('[data-reader-error]').hidden = true;
    $('[data-reader-loading]').hidden = false;
    $('[data-reader-art]').setAttribute('aria-busy', 'true');
    canvas.scrollTo({top:0,left:0,behavior:'auto'});
    const image = $('[data-reader-art] img');
    $('[data-reader-art]').querySelectorAll('img').forEach(part => part.addEventListener('error',() => {
      if (version !== loadVersion) return;
      $('[data-reader-art]').hidden = true;
      $('[data-reader-error]').hidden = false;
      $('[data-reader-loading]').hidden = true;
      $('[data-reader-art]').setAttribute('aria-busy', 'false');
      canvas.scrollTo({top:0,left:0,behavior:'auto'});
    }));
    image.decode().then(() => {
      if(version!==loadVersion)return;
      $('[data-reader-loading]').hidden = true;
      $('[data-reader-art]').setAttribute('aria-busy', 'false');
      updateReadingProgress();
    }).catch(()=>{
      if(version!==loadVersion)return;
      $('[data-reader-loading]').hidden = true;
      $('[data-reader-art]').setAttribute('aria-busy', 'false');
    });
    requestAnimationFrame(updateReadingProgress);
  }
  const mobileReading = matchMedia('(max-width:760px)');

  function openReader(kind,index=0) {
    if (mobileReading.matches) return;
    returnFocus = document.activeElement;
    readerKind = kind;readerIndex=index;
    if (kind==='preview') lastPreview=index;
    zoomReader(false);
    renderReader();
    reader.showModal();
    document.body.classList.add('reader-open-body');
    $('[data-reader-close]').focus({preventScroll:true});
    requestAnimationFrame(updateReadingProgress);
  }
  function closeReader() {reader.close();}
  reader.addEventListener('close',()=>{
    document.body.classList.remove('reader-open-body');
    returnFocus?.focus({preventScroll:true});
  });
  $('[data-reader-close]').addEventListener('click',closeReader);
  // Keep keyboard navigation inside the open reader, including its boundaries.
  document.addEventListener('keydown', event => {
    if (!reader.open) return;
    if (event.key === 'Escape') {
      event.preventDefault(); closeReader(); return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...reader.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),[tabindex]:not([tabindex="-1"])')]
      .filter(control => !control.closest('[hidden]') && control.getClientRects().length && getComputedStyle(control).visibility !== 'hidden');
    const first = controls[0], last = controls.at(-1);
    if (!first) {event.preventDefault(); return;}
    const active = document.activeElement;
    if (!reader.contains(active) || (event.shiftKey && active === first) || (!event.shiftKey && active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({preventScroll:true});
    }
  });

  function zoomReader(zoomed) {
    reader.classList.toggle('is-zoomed',zoomed);
    $('[data-reader-zoom]').setAttribute('aria-pressed',String(zoomed));
    $('[data-reader-fit]').setAttribute('aria-pressed',String(!zoomed));
    updateReadingProgress();
  }
  $('[data-reader-fit]').addEventListener('click',()=>zoomReader(false));
  $('[data-reader-zoom]').addEventListener('click',()=>zoomReader(true));
  function moveReader(direction) {
    if (readerKind==='full') return;
    const next=readerIndex+direction;
    if (next<0 || next>=readerTotal()) return;
    readerIndex=next;if(readerKind==='preview')lastPreview=next;
    renderReader();
  }
  $('[data-reader-prev]').addEventListener('click',()=>moveReader(-1));
  $('[data-reader-next]').addEventListener('click',()=>moveReader(1));
  $('[data-reader-switch]').addEventListener('click',()=>{
    readerKind=readerKind==='full'?'preview':'full';readerIndex=lastPreview;renderReader();
  });
  $('[data-reader-top]').addEventListener('click',()=>canvas.scrollTo({top:0,behavior:scrollBehavior}));
  $('[data-reader-retry]').addEventListener('click',renderReader);
  canvas.addEventListener('scroll',updateReadingProgress,{passive:true});
  reader.addEventListener('keydown',event=>{
    if (readerKind === 'full' || (document.activeElement === canvas && canvas.scrollWidth > canvas.clientWidth)) return;
    if (event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();moveReader(event.key==='ArrowLeft'?-1:1);}
  });
  document.addEventListener('click',event=>{
    const main=event.target.closest('[data-main-index]');
    if(main)openReader('main',Number(main.dataset.mainIndex));
    const preview=event.target.closest('[data-preview-index]');
    if(preview)openReader('preview',Number(preview.dataset.previewIndex));
  });
  $('[data-read-full]').addEventListener('click',()=>openReader('full'));
  // On phones images are normal content, with no modal or hidden button semantics.
  function syncReadingAffordances() {
    if (mobileReading.matches && reader.open) closeReader();
    document.querySelectorAll('[data-main-index],[data-preview-index],[data-reader-kind]').forEach(frame => {
      const kind = frame.dataset.readerKind || (frame.hasAttribute('data-main-index') ? 'main' : 'preview');
      const index = frame.dataset.readerIndex || frame.dataset[kind + 'Index'];
      const tag = mobileReading.matches ? 'div' : 'button';
      frame.dataset.readerKind = kind;
      frame.dataset.readerIndex = index;
      frame.dataset.readerLabel ||= frame.getAttribute('aria-label') || frame.querySelector('img')?.alt || '查看原图';
      frame.classList.add('image-frame');
      let next = frame;
      if (frame.tagName.toLowerCase() !== tag) {
        next = document.createElement(tag);
        next.className = frame.className;
        next.dataset.readerKind = kind;
        next.dataset.readerIndex = index;
        next.dataset.readerLabel = frame.dataset.readerLabel || frame.getAttribute('aria-label') || '查看原图';
        while (frame.firstChild) next.append(frame.firstChild);
        frame.replaceWith(next);
      }
      if (mobileReading.matches) {
        next.removeAttribute('data-main-index'); next.removeAttribute('data-preview-index');
        next.removeAttribute('aria-label'); next.removeAttribute('type');
      } else {
        next.type = 'button'; next.dataset[kind + 'Index'] = index;
        next.setAttribute('aria-label',next.dataset.readerLabel || '查看原图');
      }
    });
    if (isCollection) track.setAttribute('aria-label',`${mainLabel}合集${mobileReading.matches ? '' : '，点击画面放大'}`);
  }
  mobileReading.addEventListener('change',syncReadingAffordances);
  syncReadingAffordances();

  // The catalogue stores both the filter and the card's position before entry.
  document.querySelectorAll('[data-brand-back]').forEach(link => link.addEventListener('click', () => {
    try {sessionStorage.setItem('portfolio-catalog:' + brandId + ':return', '1');} catch {}
  }));
})();
