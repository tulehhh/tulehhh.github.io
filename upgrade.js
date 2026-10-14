/* Visual upgrade lives in the independent 20261005 copy; source artwork is unchanged. */
(() => {
  'use strict';
  const start = () => {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const make = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    // Catalog and product headings are editorial context, not image containers.
    // Their real work already lives in the catalog and original galleries below.
    // One authored opening, not a repeated reveal on every section.
    const intro = document.querySelector('.u-home-hero');
    const introKey = 'portfolio:home-intro';
    let introduced = false;
    try { introduced = sessionStorage.getItem(introKey) === '1'; if (intro) sessionStorage.setItem(introKey, '1'); } catch {}
    const navigationType = performance.getEntriesByType('navigation')[0]?.type;
    if (intro && !introduced && !location.hash && navigationType !== 'back_forward' && !reducedMotion.matches) {
      requestAnimationFrame(() => intro.classList.add('is-introduced'));
    }
    addEventListener('pageshow', event => { if (event.persisted) intro?.classList.remove('is-introduced'); });

    // Cancel prior transitions. State commits never wait for animation completion.
    const changes = new WeakMap();
    const liveAnimations = new Set();
    const transition = element => {
      changes.get(element)?.cancel();
      if (reducedMotion.matches || !element?.animate) return;
      const animation = element.animate([{opacity:.72, transform:'translateY(3px)'}, {opacity:1, transform:'none'}], {duration:220, easing:'cubic-bezier(.22,1,.36,1)'});
      changes.set(element, animation); liveAnimations.add(animation);
      const release = () => liveAnimations.delete(animation);
      animation.addEventListener('finish', release, {once:true});
      animation.addEventListener('cancel', release, {once:true});
    };
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) { intro?.classList.remove('is-introduced'); liveAnimations.forEach(animation => animation.cancel()); }
    });

    const progress = make('div', 'u-reading-progress');
    progress.setAttribute('aria-hidden', 'true');
    progress.style.setProperty('--u-progress', '0');
    document.body.append(progress);
    // Current home section follows reading, not the unrelated #profile "about" link.
    const homeNav = document.body.classList.contains('home-page') ? [...document.querySelectorAll('.site-header nav a')] : [];
    const homeSections = ['work', 'profile', 'experience', 'contact'].map((id, index) => ({section: document.getElementById(id), link: homeNav[index]})).filter(item => item.section && item.link);
    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const maximum = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--u-progress', String(maximum > 0 ? Math.min(1, Math.max(0, scrollY / maximum)) : 0));
      const readingLine = (document.querySelector('.site-header')?.offsetHeight || 72) + Math.min(innerHeight * .2, 140);
      let current = homeSections.filter(item => item.section.getBoundingClientRect().top <= readingLine).at(-1);
      // A short final section cannot reach the reading line: keep contact current at page end.
      const last = homeSections.at(-1);
      if (last && maximum > 0 && scrollY >= maximum - 2) {
        const bounds = last.section.getBoundingClientRect();
        if (bounds.top < innerHeight && bounds.bottom > readingLine) current = last;
      }
      homeSections.forEach(item => {
        if (item === current) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    };
    const scheduleProgress = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    addEventListener('scroll', scheduleProgress, {passive: true});
    addEventListener('resize', scheduleProgress, {passive: true});
    addEventListener('pageshow', scheduleProgress);
    new ResizeObserver(scheduleProgress).observe(document.body);
    updateProgress();

    document.querySelectorAll('.u-standard-note a[href^="#"], .u-detail-source-link').forEach(link => {
      link.addEventListener('click', () => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        target.open = true;
        requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
      });
    });

    const standardTablist = document.querySelector('.u-standard-tabs');
    if (standardTablist) {
      const tabs = [...standardTablist.querySelectorAll('[role="tab"]')];
      const selectStandard = (index, focus = false) => {
        tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', String(index === i));
          tab.tabIndex = i === index ? 0 : -1;
          const panel = document.getElementById(tab.getAttribute('aria-controls'));
          if (panel) panel.hidden = index !== i;
        });
        if (focus) tabs[index].focus({preventScroll: true});
      };
      const standardFromHash = () => {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        const panel = target?.closest('.u-standard-panel');
        let index = panel ? tabs.findIndex(tab => tab.getAttribute('aria-controls') === panel.id) : tabs.findIndex(tab => tab === target);
        if (index < 0) return;
        let parent = standardTablist.parentElement;
        while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
        selectStandard(index);
      };
      selectStandard(0);
      standardTablist.hidden = false;
      addEventListener('hashchange', standardFromHash);
      standardFromHash();
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectStandard(index));
        tab.addEventListener('keydown', event => {
          const destinations = {ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1};
          if (event.key in destinations) { event.preventDefault(); selectStandard(destinations[event.key], true); }
        });
      });
    }

    const tablist = document.querySelector('.u-stage-tabs');
    if (tablist) {
      const tabs = [...tablist.querySelectorAll('[role="tab"]')];
      let selectedStage = -1;
      const select = (index, focus = false) => {
        tabs.forEach((tab, i) => {
          tab.setAttribute('aria-selected', String(i === index));
          tab.tabIndex = i === index ? 0 : -1;
          const panel = document.getElementById(tab.getAttribute('aria-controls'));
          if (panel) { panel.hidden = i !== index; panel.classList.toggle('is-selected', i === index); }
        });
        const tab = tabs[index];
        if (selectedStage !== -1 && selectedStage !== index) transition(document.getElementById(tab.getAttribute('aria-controls')));
        selectedStage = index;
        if (focus) tab.focus({preventScroll: true});
        const left = tab.offsetLeft - tablist.offsetLeft;
        if (left < tablist.scrollLeft || left + tab.offsetWidth > tablist.scrollLeft + tablist.clientWidth) {
          tablist.scrollTo({left: Math.max(0, left - (tablist.clientWidth - tab.offsetWidth) / 2), behavior: reducedMotion.matches ? 'auto' : 'smooth'});
        }
      };
      select(Math.max(0, tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true')));
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(index));
        tab.addEventListener('keydown', event => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== undefined) { event.preventDefault(); select(next, true); }
        });
      });
    }

    const pair = document.querySelector('.u-ai-pair');
    if (pair) {
      const before = pair.querySelector('[data-compare-before]');
      const after = pair.querySelector('[data-compare-after]');
      const title = document.querySelector('[data-compare-title]');
      const checks = document.querySelector('[data-compare-checks]');
      const buttons = [...document.querySelectorAll('[data-ai-kind]')];
      const applications = {
        model: {index: '01', title: '模特上身核对', checks: ['腰高、裤型与裆线', '商品纹理与边缘', '人体结构、皮肤质感与光影'], label: '模特应用', beforeSize: [1000,1499], afterSize: [1000,1333]},
        still: {index: '04', title: '静物场景核对', checks: ['商品比例、颜色与轮廓', '面料质感和边缘细节', '环境光影与商品的一致性'], label: '静物应用', beforeSize: [1000,1157], afterSize: [1000,1333]}
      };
      let applicationRevision = 0;
      let selectedKind = 'model';
      const comparison = document.querySelector('.u-comparison-layout');
      const selectApplication = async kind => {
        const application = applications[kind];
        if (!application) return;
        const revision = ++applicationRevision;
        comparison.setAttribute('aria-busy', 'true');
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.aiKind === kind)));
        // Preload both images; a late decode must not undo the visitor's latest choice.
        await Promise.all(['before', 'after'].map(async suffix => {
          const image = new Image(); image.src = `assets/catalog/ai-directed/${application.index}-${suffix}.jpg`;
          try { await image.decode(); } catch {}
        }));
        if (revision !== applicationRevision) return;
        for (const [image, suffix, size] of [[before, 'before', application.beforeSize], [after, 'after', application.afterSize]]) {
          image.src = `assets/catalog/ai-directed/${application.index}-${suffix}.jpg`;
          image.alt = application.label + (suffix === 'before' ? '原始商品素材' : '应用效果图');
          [image.width, image.height] = size;
        }
        title.textContent = application.title;
        checks.replaceChildren(...application.checks.map(text => make('li', '', text)));
        comparison.setAttribute('aria-busy', 'false');
        if (selectedKind !== kind) transition(comparison);
        selectedKind = kind;
      };
      buttons.forEach(button => button.addEventListener('click', () => selectApplication(button.dataset.aiKind)));
      const fromHash = () => {
        if (location.hash === '#still-application') selectApplication('still');
        if (location.hash === '#model-application') selectApplication('model');
      };
      addEventListener('hashchange', fromHash);
      fromHash();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();
})();
