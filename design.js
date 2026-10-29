
(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const glow = document.createElement('div');
  glow.className = 'studio-glow';
  glow.setAttribute('aria-hidden','true');
  document.body.prepend(glow);
  let frame = 0, x = 0, y = 0;
  document.addEventListener('pointermove', event => {
    if (!fine.matches || motion.matches || document.body.classList.contains('paused')) return;
    x = event.clientX; y = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      glow.style.transform = 'translate3d(' + (x - 250) + 'px,' + (y - 250) + 'px,0)';
      glow.classList.add('visible');
      frame = 0;
    });
  }, {passive:true});
  document.documentElement.addEventListener('pointerleave', () => glow.classList.remove('visible'));
  // Animate real content changes without replacing the original tabs or translations.
  const targets = document.querySelectorAll('.career-body,.project-layout .detail,.skill-detail,.edu-detail');
  const animations = new WeakMap();
  const observer = new MutationObserver(records => {
    if (motion.matches || document.body.classList.contains('paused')) return;
    const changed = new Set();
    for (const record of records) {
      const element = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      for (const target of targets) if (target.contains(element)) changed.add(target);
    }
    for (const target of changed) {
      if (!target.getClientRects().length || typeof target.animate !== 'function') continue;
      animations.get(target)?.cancel();
      const animation = target.animate(
        [{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:320,easing:'cubic-bezier(.22,1,.36,1)'}
      );
      animations.set(target,animation);
    }
  });
  targets.forEach(target => observer.observe(target,{childList:true,subtree:true,characterData:true}));
  const stop = () => {
    glow.classList.remove('visible');
    targets.forEach(target => animations.get(target)?.cancel());
  };
  motion.addEventListener('change',stop);
  new MutationObserver(() => {if(document.body.classList.contains('paused'))stop()})
    .observe(document.body,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
})();
