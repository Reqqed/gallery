/* Page-wide magnifier. The inert iframe reproduces this page without scripts. */
(() => {
  'use strict';
  const zoom = 2;
  const button = document.createElement('button');
  button.className = 'page-zoom-toggle';
  button.type = 'button';
  button.textContent = '⊕ Лупа';
  button.setAttribute('aria-pressed', 'false');
  button.title = 'Лупа всей страницы. Выключить: Escape. Также удерживайте правую кнопку мыши.';
  const lens = document.createElement('div');
  lens.className = 'page-zoom-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.hidden = true;
  const mirror = document.createElement('iframe');
  mirror.title = 'Увеличенная область';
  mirror.tabIndex = -1;
  mirror.setAttribute('sandbox', 'allow-same-origin');
  lens.append(mirror);
  document.body.append(button, lens);
  let enabled = false, held = false, dirty = true, pending = false;
  let x = innerWidth / 2, y = innerHeight / 2;
  const isUI = node => node instanceof Element && !!node.closest('.page-zoom-toggle, .page-zoom-lens');

  function copyPage() {
    const copy = document.documentElement.cloneNode(true);
    copy.querySelectorAll('script, .page-zoom-toggle, .page-zoom-lens').forEach(el => el.remove());
    copy.querySelectorAll('link[href]').forEach(el => {el.href = new URL(el.getAttribute('href'), document.baseURI).href;});
    copy.querySelectorAll('img[src]').forEach(el => {el.src = new URL(el.getAttribute('src'), document.baseURI).href; el.loading = 'eager';});
    const sourceFields = document.querySelectorAll('input, textarea, select');
    copy.querySelectorAll('input, textarea, select').forEach((el, i) => {
      if (el.tagName === 'TEXTAREA') el.textContent = sourceFields[i].value;
      else if (el.type !== 'file') el.setAttribute('value', sourceFields[i].value);
    });
    const style = document.createElement('style');
    style.textContent = 'html{scroll-behavior:auto!important;scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}*{animation:none!important;transition:none!important;caret-color:transparent!important}';
    copy.querySelector('head').append(style);
    const doc = mirror.contentDocument;
    doc.open(); doc.write('<!DOCTYPE html>' + copy.outerHTML); doc.close();
    dirty = false;
  }
  function paint() {
    pending = false;
    const active = enabled || held;
    lens.hidden = !active;
    button.setAttribute('aria-pressed', String(enabled));
    if (!active) return;
    const size = Math.min(230, innerWidth * .55);
    lens.style.width = lens.style.height = size + 'px';
    const left = Math.max(0, Math.min(innerWidth - size, x - size / 2));
    const top = Math.max(0, Math.min(innerHeight - size, y - size / 2));
    lens.style.left = left + 'px'; lens.style.top = top + 'px';
    mirror.style.width = document.documentElement.clientWidth + 'px';
    mirror.style.height = innerHeight + 'px';
    if (dirty) copyPage();
    mirror.contentWindow.scrollTo(scrollX, scrollY);
    // Keep the selected point underneath the pointer, including at screen edges.
    mirror.style.transform = `translate(${x - left - x * zoom}px, ${y - top - y * zoom}px) scale(${zoom})`;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(paint); } }
  button.addEventListener('click', () => {enabled = !enabled; dirty = true; schedule();});
  document.addEventListener('pointermove', e => {x = e.clientX; y = e.clientY; if (enabled || held) schedule();}, {passive:true});
  document.addEventListener('pointerdown', e => {
    if (e.button === 2 && e.pointerType === 'mouse') {e.preventDefault(); held = true; x = e.clientX; y = e.clientY; dirty = true; schedule();}
  });
  document.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener('pointerup', e => {if(e.button === 2){held = false; schedule();}});
  window.addEventListener('pointercancel', () => {held = false; schedule();});
  window.addEventListener('blur', () => {held = false; enabled = false; schedule();});
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){held = false; enabled = false; schedule();}
  });
  document.addEventListener('focusin', e => {
    if(!enabled || isUI(e.target)) return;
    const bounds = e.target.getBoundingClientRect();
    x = bounds.left + bounds.width / 2; y = bounds.top + Math.min(bounds.height / 2, 40); schedule();
  });
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', () => {dirty = true; schedule();});
  document.addEventListener('input', () => {dirty = true; schedule();});
  new MutationObserver(records => {
    if(records.some(record => !isUI(record.target))){dirty = true; if(enabled || held) schedule();}
  }).observe(document.body, {subtree:true, childList:true, attributes:true, characterData:true});
})();
