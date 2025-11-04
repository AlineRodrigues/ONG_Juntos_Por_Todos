const fs = require('fs');
const { JSDOM } = require('jsdom');
(async ()=>{
  const results = [];
  try{
  // Carrega HTML e script
    const sistemaHtml = fs.readFileSync('sistema.html','utf8');
    const cadastroHtml = fs.readFileSync('cadastro.html','utf8');
    const scriptContent = fs.readFileSync('js/scripts.js','utf8');

    // Auxiliar para executar um teste DOM
    async function testDom(html, actions){
      // Inclui o script no HTML para que execute durante o parse (garante execução dos handlers de DOMContentLoaded)
      const pre = `window.localStorage = (function(){const _s={};return {getItem:function(k){return Object.prototype.hasOwnProperty.call(_s,k)?_s[k]:null;},setItem:function(k,v){_s[k]=String(v);},removeItem:function(k){delete _s[k];},clear:function(){for(const k in _s) delete _s[k];}}})(); window.alert=function(msg){};`;
  const htmlWithScript = html.replace(/<script\s+src="js\/scripts\.js"\s*><\/script>/i, `<script>(function(){ ${pre}\n${scriptContent}\n})();</script>`);

      const dom = new JSDOM(htmlWithScript, { 
        url: 'http://localhost/',
        runScripts: 'dangerously', 
        resources: 'usable',
        beforeParse(win){
    // fornece localStorage simples e alert como fallback (o script também os define)
          const store = Object.create(null);
          win.localStorage = {
            getItem(key){ return Object.prototype.hasOwnProperty.call(store,key)?store[key]:null; },
            setItem(key,val){ store[key]=String(val); },
            removeItem(key){ delete store[key]; },
            clear(){ for(const k in store) delete store[k]; }
          };
          win.alert = function(msg) { /* noop for tests */ };
        }
      });
      const { window } = dom;
      // expõe console para capturar logs
      window.console = console;
      // aguarda brevemente para que scripts rodem e listeners sejam anexados
      await new Promise(r=>setTimeout(r,120));
      // executa as ações
      return await actions(window, dom);
    }

  // Teste: login admin em sistema.html
    const adminRes = await testDom(sistemaHtml, async (window, dom)=>{
      const doc = window.document;
      const adminUser = doc.getElementById('adminUser');
      const adminPass = doc.getElementById('adminPass');
      const btn = doc.getElementById('btnAdminLogin');
      const adminArea = doc.getElementById('adminArea');
      if(!btn) return {ok:false, reason:'btnAdminLogin not found'};
      adminUser.value='admin'; adminPass.value='admin';
  // dispara clique
  btn.dispatchEvent(new window.Event('click'));
  // aguarda
  await new Promise(r=>setTimeout(r,50));
      const visible = adminArea && !adminArea.classList.contains('hidden');
      return {ok: !!visible, adminAreaClass: adminArea ? adminArea.className : null};
    });
    results.push({test:'adminLogin', result: adminRes});

  // Teste: envio de cadastro em cadastro.html
    const cadRes = await testDom(cadastroHtml, async (window, dom)=>{
      const doc = window.document; const local = window.localStorage;
      const form = doc.getElementById('cadastroForm');
      if(!form) return {ok:false, reason:'cadastroForm not found'};
  // preenche campos obrigatórios
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
  // dispara submit
  form.dispatchEvent(new window.Event('submit', {bubbles:true, cancelable:true}));
      await new Promise(r=>setTimeout(r,50));
      const stored = local.getItem('cadastro_jpt');
  // coleta quaisquer mensagens de erro presentes no formulário
      const errors = Array.from(doc.querySelectorAll('.error')).map(e=>e.textContent.trim()).filter(Boolean);
      const cpfValid = (doc.getElementById('cpf')||{}).dataset && (doc.getElementById('cpf')||{}).dataset.valid || null;
      return {ok: !!stored, storedSample: stored ? stored.slice(0,200) : null, errors, cpfValid};
    });
    results.push({test:'cadastroSubmit', result: cadRes});

    fs.writeFileSync('/tmp/jsdom-test-results.json', JSON.stringify(results,null,2));
    console.log('RESULTS', JSON.stringify(results,null,2));
    process.exit(0);
  }catch(err){
    fs.writeFileSync('/tmp/jsdom-test-error.txt', String(err));
    console.error('ERROR', err);
    process.exit(2);
  }
})();
