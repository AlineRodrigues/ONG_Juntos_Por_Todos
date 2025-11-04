
// A11Y helper: theme toggles + generic fixes (with DOMContentLoaded)
document.addEventListener('DOMContentLoaded', function(){
  const root = document.documentElement;

  function setTheme(cls){
    root.classList.remove('theme-dark','theme-hc');
    if(cls) root.classList.add(cls);
    localStorage.setItem('pref-theme', cls || '');
    updatePressed(cls);
  }

  function updatePressed(cls){
    const dark = document.querySelector('#btn-theme-dark');
    const hc = document.querySelector('#btn-theme-hc');
    const reset = document.querySelector('#btn-theme-reset');
    if(dark) dark.setAttribute('aria-pressed', cls === 'theme-dark' ? 'true':'false');
    if(hc) hc.setAttribute('aria-pressed', cls === 'theme-hc' ? 'true':'false');
    if(reset) reset.setAttribute('aria-pressed', !cls ? 'true':'false');
  }

  const saved = localStorage.getItem('pref-theme');
  if(saved){ setTheme(saved); }

  document.addEventListener('click', (e)=>{
    const t = e.target.closest('button');
    if(!t) return;
    if(t.id === 'btn-theme-dark'){ e.preventDefault(); setTheme('theme-dark'); }
    if(t.id === 'btn-theme-hc'){ e.preventDefault(); setTheme('theme-hc'); }
    if(t.id === 'btn-theme-reset'){ e.preventDefault(); setTheme(''); }
  });

  document.addEventListener('keydown', (e)=>{
    const isMenu = e.target && e.target.closest && e.target.closest('[data-dropdown]');
    if(!isMenu) return;
    const items = Array.from(isMenu.querySelectorAll('[role="menuitem"], a, button')).filter(i=>!i.disabled);
    const idx = items.indexOf(document.activeElement);
    if(e.key === 'ArrowDown'){ e.preventDefault(); items[(idx+1)%items.length]?.focus();}
    if(e.key === 'ArrowUp'){ e.preventDefault(); items[(idx-1+items.length)%items.length]?.focus();}
    if(e.key === 'Home'){ e.preventDefault(); items[0]?.focus();}
    if(e.key === 'End'){ e.preventDefault(); items[items.length-1]?.focus();}
    if(e.key === 'Escape'){ e.preventDefault(); isMenu.blur && isMenu.blur(); }
  });

  document.querySelectorAll('input, textarea, select').forEach((el)=>{
    if(el.id){
      const lbl = document.querySelector('label[for="'+el.id+'"]');
      if(lbl) return;
    }
    if(!el.getAttribute('aria-label')){
      const txt = el.getAttribute('placeholder') || el.name || el.id || el.type || 'campo';
      el.setAttribute('aria-label', txt);
    }
  });

  // Ensure skip link target
  let target = document.getElementById('conteudo');
  if(!target){
    target = document.querySelector('main') || document.body;
    if(target && !target.id) target.id = 'conteudo';
  }
});
