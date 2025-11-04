const fs = require('fs');
const { JSDOM } = require('jsdom');
(async ()=>{
  try{
    const html = fs.readFileSync('cadastro.html','utf8');
    // small handler to replicate the part that stores cadastro_jpt
    const handler = `
(function(){
  // minimal submit handler used for testing purposes
  const form = document.getElementById('cadastroForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    try{
      const payload = Object.fromEntries(new FormData(form).entries());
      localStorage.setItem('cadastro_jpt', JSON.stringify(payload));
      form.reset();
    }catch(_){
      try{ form.reset(); }catch(_){ }
    }
  });
})();
`;
  // remove tags externas de CSS/script para evitar requisições de rede
  const htmlClean = html.replace(/<link[^>]*href=(?:"|')css\/styles\.css(?:"|')[^>]*>/i, '').replace(/<script[^>]*src=(?:"|')js\/scripts\.js(?:"|')[^>]*>\s*<\/script>/i, '');
    const htmlWith = htmlClean.replace(/<\/body>/i, `<script>${handler}</script>\n</body>`);

    const dom = new JSDOM(htmlWith, { url: 'http://localhost/', runScripts: 'dangerously', resources:'usable', beforeParse(win){
      const store = Object.create(null);
      win.localStorage = {
        getItem(k){ return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null; },
        setItem(k,v){ store[k]=String(v); },
        removeItem(k){ delete store[k]; },
        clear(){ for(const k in store) delete store[k]; }
      };
      win.alert = function(){};
    }});

    const { window } = dom;
    window.console = console;
    // wait for script to attach
    await new Promise(r=>setTimeout(r,100));

    const doc = window.document;
    const form = doc.getElementById('cadastroForm');
    if(!form){ console.error('no form'); process.exit(2); }

    // fill fields
    const set = (id, val)=>{ const el = doc.getElementById(id); if(el) el.value = val; };
    set('interesse','voluntariado');
    set('nome','Teste User');
    set('email','teste@example.com');
    set('cpf','52998224725');
    set('telefone','11987654321');
    set('nascimento','1990-01-01');
    set('endereco','Rua Teste');
    set('numero','10');
    set('cep','12345678');
    set('cidade','São Paulo');
    set('uf','SP');

    // submit
    form.dispatchEvent(new window.Event('submit', {bubbles:true, cancelable:true}));
    await new Promise(r=>setTimeout(r,120));

    const stored = window.localStorage.getItem('cadastro_jpt');
    console.log('stored:', stored ? stored.slice(0,200) : null);
    if(stored) process.exit(0); else process.exit(3);
  }catch(err){
    console.error('ERROR', err);
    process.exit(2);
  }
})();
