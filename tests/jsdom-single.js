const fs = require('fs');
const { JSDOM } = require('jsdom');
(async ()=>{
  try{
    const htmlPath = process.argv[2];
    if(!htmlPath) throw new Error('usage: node jsdom-single.js <html-file>');
    const html = fs.readFileSync(htmlPath,'utf8');
    const scriptContent = fs.readFileSync('js/scripts.js','utf8');

    const pre = `window.localStorage = (function(){const _s={};return {getItem:function(k){return Object.prototype.hasOwnProperty.call(_s,k)?_s[k]:null;},setItem:function(k,v){_s[k]=String(v);},removeItem:function(k){delete _s[k];},clear:function(){for(const k in _s) delete _s[k];}}})(); window.alert=function(msg){};`;
  // torna o script inline mais seguro para reavaliação no JSDOM
  // convertendo declarações top-level `const $ =` / `const $$ =` para `var $ =` / `var $$ =`
    const safeScript = scriptContent.replace(/const\s+\$\s*=/g, 'var $ =').replace(/const\s+\$\$\s*=/g, 'var $$ =');
  // protege contra scripts que chamem addEventListener em não-elementos no ambiente JSDOM
    try{
  const guardRegex = /if\s*\(\s*btnLogin\s*\)\s*\{\s*btnLogin\.addEventListener\(/g;
      if(guardRegex.test(safeScript)){
        safeScript = safeScript.replace(guardRegex, "if(btnLogin && typeof btnLogin.addEventListener === 'function'){ btnLogin.addEventListener(");
      }
    }catch(e){ /* ignore - defensive */ }
    let htmlWithScript = html.replace(/<script\s+src="js\/scripts\.js"\s*><\/script>/i, `<script>(function(){ ${pre}\n${safeScript}\n})();</script>`);
  // remove link CSS externo para evitar que o JSDOM tente buscar http://localhost/css/styles.css
    htmlWithScript = htmlWithScript.replace(/<link[^>]*href=(?:"|')css\/styles\.css(?:"|')[^>]*>/i, '');

    const dom = new JSDOM(htmlWithScript, { url: 'http://localhost/', runScripts:'dangerously', resources:'usable', beforeParse(win){
      const store = Object.create(null);
      win.localStorage = {
        getItem(key){ return Object.prototype.hasOwnProperty.call(store,key)?store[key]:null; },
        setItem(key,val){ store[key]=String(val); },
        removeItem(key){ delete store[key]; },
        clear(){ for(const k in store) delete store[k]; }
      };
      win.alert = function(){};
    }});

    const { window } = dom;
    window.console = console;
  // aguarda brevemente para execução dos scripts
  await new Promise(r=>setTimeout(r,150));

    const doc = window.document;
  // Detecta e executa o teste apropriado
    if(doc.getElementById('adminUser')){
      const adminUser = doc.getElementById('adminUser');
      const adminPass = doc.getElementById('adminPass');
      const btn = doc.getElementById('btnAdminLogin');
      const adminArea = doc.getElementById('adminArea');
      adminUser.value='admin'; adminPass.value='admin';
      if(btn){ btn.dispatchEvent(new window.Event('click')); }
      await new Promise(r=>setTimeout(r,80));
      const visible = adminArea && !adminArea.classList.contains('hidden');
      console.log(JSON.stringify({test:'adminLogin', ok:!!visible, adminAreaClass: adminArea ? adminArea.className : null}));
      process.exit(0);
    }

    if(doc.getElementById('cadastroForm')){
      const form = doc.getElementById('cadastroForm');
      const local = window.localStorage;
      const set = (id,val)=>{ const el=doc.getElementById(id); if(el) el.value=val; };
      set('interesse','voluntariado');
      set('nome','Fulano de Tal');
      set('email','fulano@example.com');
      set('cpf','52998224725');
      set('telefone','11987654321');
      set('nascimento','1990-01-01');
      set('endereco','Rua Teste');
      set('numero','10');
      set('cep','12345678');
      set('cidade','São Paulo');
      set('uf','SP');

      form.dispatchEvent(new window.Event('submit', {bubbles:true, cancelable:true}));
      await new Promise(r=>setTimeout(r,120));
      const stored = local.getItem('cadastro_jpt');
      const errors = Array.from(doc.querySelectorAll('.error')).map(e=>e.textContent.trim()).filter(Boolean);
      const cpfValid = (doc.getElementById('cpf')||{}).dataset && (doc.getElementById('cpf')||{}).dataset.valid || null;
      console.log(JSON.stringify({test:'cadastroSubmit', ok:!!stored, storedSample: stored? stored.slice(0,200):null, errors, cpfValid}));
      process.exit(0);
    }

    console.log(JSON.stringify({test:'unknown', reason:'no known test target found'}));
    process.exit(0);
  }catch(err){
    console.error('ERROR', err);
    process.exit(2);
  }
})();
