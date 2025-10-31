document.addEventListener('DOMContentLoaded', function(){
  function mask(el, type){
    if(el && typeof el.addEventListener === 'function'){ el.addEventListener('input', function(e){
      let v=e.target.value.replace(/\D/g,'');
      if(type==='cpf'){ v=v.slice(0,11); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
      if(type==='tel'){ v=v.slice(0,11); if(v.length>10){ v=v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3'); } else { v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'); } }
      if(type==='cep'){ v=v.slice(0,8); v=v.replace(/(\d{5})(\d{1,3})/,'$1-$2'); }
      e.target.value=v;
    }); }
  }
  mask(document.getElementById('cpf'),'cpf');
  mask(document.getElementById('telefone'),'tel');
  mask(document.getElementById('cep'),'cep');

  const btnFiltrar=document.getElementById('btnFiltrar');
  if(btnFiltrar){
    btnFiltrar.addEventListener('click', function(){
      const cat=(document.getElementById('categoria')||{}).value||'';
      const q=(document.getElementById('q')||{}).value?.toLowerCase()||'';
      document.querySelectorAll('.projeto-card').forEach(card=>{
        const okCat=!cat || card.dataset.categoria===cat;
        const okQ=!q || card.textContent.toLowerCase().includes(q);
        card.style.display=(okCat && okQ)?'':'none';
      });
    });
  }

  const form=document.getElementById('cadastroForm');
if(form){

  // Torna todos os campos obrigatórios no carregamento
  form.querySelectorAll('input, select, textarea').forEach(el=>{
    el.setAttribute('required','required');
  });

  // Funções auxiliares para validar CPF
  function somenteDigitos(str){
    return (str||'').replace(/\D/g,'');
  }

  function cpfEhValido(strCPF){
    const cpf=somenteDigitos(strCPF);
    if(cpf.length!==11) return false;
    if(/^(\d)\1+$/.test(cpf)) return false;

    let soma=0;
    for(let i=0;i<9;i++){
      soma+=parseInt(cpf[i],10)*(10-i);
    }
    let resto=soma%11;
    const dig1=(resto<2)?0:(11-resto);

    soma=0;
    for(let i=0;i<10;i++){
      soma+=parseInt(cpf[i],10)*(11-i);
    }
    resto=soma%11;
    const dig2=(resto<2)?0:(11-resto);

    return (dig1===parseInt(cpf[9],10) && dig2===parseInt(cpf[10],10));
  }

  const campoCPF=document.getElementById('cpf');
  if(campoCPF){
    campoCPF.addEventListener('blur', function(){
      const slotCPF=document.getElementById('cpf-error');
      if(!cpfEhValido(campoCPF.value)){
        if(slotCPF){ slotCPF.textContent='CPF inválido. Confira os dígitos.'; }
        campoCPF.dataset.valid='false';
      } else {
        if(slotCPF){ slotCPF.textContent=''; }
        campoCPF.dataset.valid='true';
      }
    });
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    let valid=true;

    // limpa mensagens anteriores
    document.querySelectorAll('.error').forEach(el=>el.textContent='');

    // 1. Campos vazios
    form.querySelectorAll('input, select, textarea').forEach(el=>{
      const valor=(el.value||'').trim();
      const slot=document.getElementById(el.id+'-error');
      if(valor===''){
        if(slot){ slot.textContent='Preencha este campo.'; }
        valid=false;
      }
    });

    // 2. CEP precisa ter 8 dígitos
    const cepEl=document.getElementById('cep');
    if(cepEl){
      const onlyCep=(cepEl.value||'').replace(/\D/g,'');
      if(onlyCep.length!==8){
        const slotCep=document.getElementById('cep-error');
        if(slotCep){ slotCep.textContent='CEP inválido. Use 8 dígitos.'; }
        valid=false;
      }
    }

    // 3. CPF válido (dígitos verificadores)
    if(campoCPF && !cpfEhValido(campoCPF.value)){
      const slotCPF=document.getElementById('cpf-error');
      if(slotCPF){ slotCPF.textContent='CPF inválido. Confira os dígitos.'; }
      valid=false;
    }

    if(valid){
      // monta o payload para simular envio
      const payload=Object.fromEntries(new FormData(form).entries());
      try{
        localStorage.setItem('cadastro_jpt', JSON.stringify(payload));
        alert('Cadastro enviado! (simulado)');
        form.reset();
      }catch(_){
        alert('Cadastro enviado! (simulado)');
        form.reset();
      }
    }
  });
}
});

// ====== Sistema (abas e interações completas) ======
(function(){
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
// Abas
const tabs = $$('.tabs .tab');
const panels = $$('.tab-panel');

function activateTab(tabId){
  tabs.forEach(function(t){
    const on = (t.id === tabId);
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });

  panels.forEach(function(p){
    const show = (p.id === tabId.replace(/^tb-/, 'pane-'));
    p.classList.toggle('hidden', !show);
  });
}

function activateFromHash(){
  var hash = window.location.hash || '#pane-vol';
  var tabId = 'tb-' + hash.replace(/^#pane-/, '');
  activateTab(tabId);
  if (typeof highlightActiveUserMenu === 'function') {
    highlightActiveUserMenu();
  }
}

function initTabs(){
  if(!tabs.length) return;

  tabs.forEach(function(tabBtn){
    tabBtn.addEventListener('click', function(){
      var tabId = tabBtn.id;
      activateTab(tabId);

      var newHash = '#'+ tabId.replace(/^tb-/, 'pane-');
      if(window.location.hash !== newHash){
        window.location.hash = newHash;
      }

      if (typeof highlightActiveUserMenu === 'function') {
        highlightActiveUserMenu();
      }
    });
  });

  // ativa a aba correta quando a página carrega
  activateFromHash();
}

// inicializa e mantém sincronizado com o hash
initTabs();
window.addEventListener('hashchange', activateFromHash);

  // Storage helpers
  const S = {
    get(k,d){ try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d));}catch(_){return d} },
    set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  };

  // Seeds
  const seedProjects = S.get('projects', [
    {id:'p1',nome:'Projeto Alfabetização',cat:'educacao',meta:20000},
    {id:'p2',nome:'Projeto Saúde Comunitária',cat:'saude',meta:35000},
    {id:'p3',nome:'Projeto Tecendo Futuro',cat:'capacitacao',meta:25000},
  ]);
  S.set('projects', seedProjects);
  S.set('applications', S.get('applications', []));
  S.set('donations', S.get('donations', []));

  // Admin login
  const adminArea = $('#adminArea');
  const btnLogin = $('#btnAdminLogin');
  if(btnLogin){
    btnLogin.addEventListener('click', ()=>{
      const u = ($('#adminUser')||{}).value?.trim(); const p = ($('#adminPass')||{}).value?.trim();
      if(u==='admin' && p==='admin'){ adminArea && adminArea.classList.remove('hidden'); renderAll(); }
      else alert('Credenciais inválidas (admin/admin)');
    });
  }

  function renderAll(){ renderProjetos(); renderInscricoes(); renderDoacoes(); renderInst(); renderSelects(); renderHistoricoVol(); renderMinhasDoacoes(); }

  function renderProjetos(){
    const tb = $('#tblProjetos tbody'); if(!tb) return;
    tb.innerHTML = '';
    S.get('projects',[]).forEach(p=>{
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>'+p.nome+'</td><td>'+p.cat+'</td><td>'+Number(p.meta||0).toLocaleString('pt-BR')+'</td>' +
                     '<td><button class="btn btn-sm" data-ed="'+p.id+'">Editar</button> <button class="btn btn-sm" data-del="'+p.id+'">Excluir</button></td>';
      tb.appendChild(tr);
    });
    tb.querySelectorAll('[data-ed]').forEach(b=>b.addEventListener('click',()=>{
      const id = b.getAttribute('data-ed'); const p = S.get('projects',[]).find(x=>x.id===id); if(!p) return;
      ($('#p-id')||{}).value = p.id; ($('#p-nome-s')||{}).value=p.nome; ($('#p-cat-s')||{}).value=p.cat; ($('#p-meta-s')||{}).value=p.meta;
    }));
    tb.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{
      const id = b.getAttribute('data-del');
      S.set('projects', S.get('projects',[]).filter(x=>x.id!==id));
      renderProjetos(); renderSelects();
    }));
  }

  const btnSaveInst = $('#btnSalvarInst');
  if(btnSaveInst){
    btnSaveInst.addEventListener('click', ()=>{
      S.set('institucional_jpt', {missao:($('#i-missao')||{}).value||'', visao:($('#i-visao')||{}).value||'', ts:Date.now()});
      alert('Informações institucionais salvas!');
    });
  }
  function renderInst(){
    const i = S.get('institucional_jpt', {missao:'',visao:''});
    if($('#i-missao')) $('#i-missao').value=i.missao||'';
    if($('#i-visao')) $('#i-visao').value=i.visao||'';
  }

  const btnSaveProj = $('#btnSalvarProjeto');
  if(btnSaveProj){
    btnSaveProj.addEventListener('click', ()=>{
      let id = ($('#p-id')||{}).value?.trim()||'';
      const nome=($('#p-nome-s')||{}).value?.trim()||''; const cat=($('#p-cat-s')||{}).value||''; const meta=Number((($('#p-meta-s')||{}).value||0));
      if(!nome){ alert('Informe o nome do projeto.'); return; }
      let list=S.get('projects',[]);
      if(id){ const i=list.findIndex(x=>x.id===id); if(i>-1) list[i]={id,nome,cat,meta}; }
      else { id='p'+Date.now(); list.push({id,nome,cat,meta}); }
      S.set('projects',list); renderProjetos(); renderSelects(); (document.getElementById('btnLimparProjeto')||{}).click?.();
    });
  }

  function renderInscricoes(){
    const tb=$('#tblInscricoes tbody'); if(!tb) return; tb.innerHTML='';
    S.get('applications',[]).forEach((a,idx)=>{
      const tr=document.createElement('tr');
      tr.innerHTML='<td>'+a.nome+'</td><td>'+projName(a.pid)+'</td><td>'+a.status+'</td>' +
                   '<td><button class="btn btn-sm" data-apr="'+idx+'">Aprovar</button> <button class="btn btn-sm" data-rec="'+idx+'">Recusar</button></td>';
      tb.appendChild(tr);
    });
    tb.querySelectorAll('[data-apr]').forEach(b=>b.addEventListener('click',()=>updIns(b,'Aprovado')));
    tb.querySelectorAll('[data-rec]').forEach(b=>b.addEventListener('click',()=>updIns(b,'Recusado')));
  }
  function updIns(btn, status){
    const idx=Number(btn.getAttribute('data-apr')||btn.getAttribute('data-rec'));
    const arr=S.get('applications',[]); if(arr[idx]){ arr[idx].status=status; S.set('applications',arr); renderInscricoes(); renderHistoricoVol(); }
  }

  function renderDoacoes(){
    const tb=$('#tblDoacoes tbody'); if(!tb) return; tb.innerHTML='';
    let total=0;
    S.get('donations',[]).forEach(d=>{
      total+=d.valor||0;
      const tr=document.createElement('tr');
      tr.innerHTML='<td>'+new Date(d.ts).toLocaleDateString()+'</td><td>'+projName(d.pid)+'</td><td>'+(d.nome||'Anônimo')+'</td><td>'+d.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})+'</td>';
      tb.appendChild(tr);
    });
    const out=$('#totalArrecadado'); if(out) out.textContent=total.toLocaleString('pt-BR',{minimumFractionDigits:2});
  }

  function projName(id){ const p=S.get('projects',[]).find(x=>x.id===id); return p?p.nome:'—'; }

  // Voluntário
  function renderSelects(){
    const opts=S.get('projects',[]).map(p=>`<option value="${p.id}">${p.nome}</option>`).join('');
    const sv=$('#v-projeto'); if(sv) sv.innerHTML=opts;
    const sd=$('#d-projeto-s'); if(sd) sd.innerHTML=opts;
    const sc=$('#cert-projeto'); if(sc) sc.innerHTML=opts;
  }
  renderSelects();

  const formCand=$('#formCandidatura');
  if(formCand){
    formCand.addEventListener('submit', e=>{
      e.preventDefault();
      const nome=($('#v-nome')||{}).value?.trim()||''; const pid=($('#v-projeto')||{}).value||'';
      if(!nome){ alert('Informe seu nome.'); return; }
      const arr=S.get('applications',[]); arr.push({nome,pid,status:'Pendente',ts:Date.now()}); S.set('applications',arr);
      alert('Candidatura registrada!'); renderHistoricoVol(); renderInscricoes();
    });
  }
  function renderHistoricoVol(){
    const tb=$('#tblHistorico tbody'); if(!tb) return; tb.innerHTML='';
    const nome=(($('#v-nome')||{}).value||'').trim();
    S.get('applications',[]).filter(a=>!nome || a.nome===nome).forEach(a=>{
      const tr=document.createElement('tr');
      tr.innerHTML='<td>'+projName(a.pid)+'</td><td>'+a.status+'</td><td>'+new Date(a.ts).toLocaleDateString()+'</td>';
      tb.appendChild(tr);
    });
  }
  renderHistoricoVol();

  const btnCert=$('#btnCertificado');
  if(btnCert){
    btnCert.addEventListener('click', ()=>{
      const nome=(($('#v-nome')||{}).value||'').trim()||'Voluntário(a)';
      const pid=(($('#cert-projeto')||{}).value||'');
      const ok=S.get('applications',[]).some(a=>a.pid===pid && a.status==='Aprovado' && a.nome===nome);
      if(!ok){ alert('É necessário ter inscrição APROVADA neste projeto.'); return; }
      const titulo='Certificado de Participação — Juntos por Todos'; const projeto=projName(pid);
      const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>'+titulo+'</title><style>body{font-family:Arial;padding:40px}h1{color:#0f4c81}.box{border:2px solid #1e88e5;padding:24px;border-radius:12px}</style><div class="box"><h1>'+titulo+'</h1><p>Certificamos que <b>'+nome+'</b> participou do projeto <b>'+projeto+'</b>.</p><p>Data: '+new Date().toLocaleDateString()+'</p><p>Ass.: Coordenação — Juntos por Todos</p></div></html>';
      const blob=new Blob([html],{type:'text/html'}); const url=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download='certificado.html'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500);
    });
  }

  // Doador
  const btnDoar=$('#btnDoarSist');
  if(btnDoar){
    btnDoar.addEventListener('click', ()=>{
      const pid=(($('#d-projeto-s')||{}).value||''); const nome=(($('#d-nome-s')||{}).value||'').trim()||'Anônimo'; const valor=Number((($('#d-valor-s')||{}).value||0));
      if(!pid || !(valor>0)){ alert('Informe projeto e valor.'); return; }
      const arr=S.get('donations',[]); arr.push({pid,nome,valor,ts:Date.now()}); S.set('donations',arr);
      alert('Doação registrada!'); renderMinhasDoacoes(nome); renderDoacoes();
    });
  }
  function renderMinhasDoacoes(nomeAtual){
    const tb=$('#tblMinhasDoacoes tbody'); if(!tb) return; tb.innerHTML='';
    const nome=nomeAtual || (($('#d-nome-s')||{}).value||'').trim() || 'Anônimo'; let total=0;
    S.get('donations',[]).filter(d=>(d.nome||'Anônimo')===nome).forEach(d=>{
      total+=d.valor||0; const tr=document.createElement('tr');
      tr.innerHTML='<td>'+new Date(d.ts).toLocaleDateString()+'</td><td>'+projName(d.pid)+'</td><td>'+d.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})+'</td>';
      tb.appendChild(tr);
    });
    const out=$('#totalDoador'); if(out) out.textContent=total.toLocaleString('pt-BR',{minimumFractionDigits:2});
  }
  renderMinhasDoacoes();
})();

// === Equaliza alturas dos cards entre as duas seções da Home ===
function equalizeHomeCards(){
  const cardsTop = Array.from(document.querySelectorAll('.cards-grid .card'));
  const cardsBottom = Array.from(document.querySelectorAll('.features-grid .feature-card'));
  const allCards = cardsTop.concat(cardsBottom);
  if (!allCards.length) return;

  allCards.forEach(card => { card.style.minHeight = ''; });

  let maxH = 0;
  allCards.forEach(card => {
    const h = card.offsetHeight;
    if (h > maxH) maxH = h;
  });

  allCards.forEach(card => {
    card.style.minHeight = maxH + 'px';
  });
}
window.addEventListener('load', equalizeHomeCards);
window.addEventListener('resize', equalizeHomeCards);

// === Navegação responsiva (hambúrguer + dropdown mobile) ===
// === Marcação visual da aba ativa no dropdown de Usuários ===
function highlightActiveUserMenu(){
  var menuLinks = document.querySelectorAll('.dropdown-menu a');
  if(!menuLinks.length) return;

  var loc = window.location;
  var currentHash = loc.hash || '';
  var currentPage = loc.pathname.split('/').pop() || '';

  // Se estamos em sistema.html e não tem hash, padrão é #pane-vol
  var targetHash = currentHash;
  if(currentPage.indexOf('sistema') !== -1){
    if(!targetHash){
      targetHash = '#pane-vol';
    }
  }

  // limpa estado anterior
  menuLinks.forEach(function(a){
    a.classList.remove('active');
  });

  // marca link cujo href termina com o hash atual
  if(targetHash){
    menuLinks.forEach(function(a){
      var href = a.getAttribute('href') || '';
      if(href.endsWith(targetHash)){
        a.classList.add('active');
      }
    });
  }
}

function initNav(){
  var navToggle=document.querySelector('.nav-toggle');
  var navList=document.querySelector('.nav-list');
  if(navToggle && navList){
    navToggle.addEventListener('click',function(){
      var isOpen=navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.nav-has-dropdown').forEach(function(item){
    var trigger=item.querySelector('.nav-link-with-dropdown');
    var submenu=item.querySelector('.dropdown-menu');
    if(trigger && submenu){
      trigger.addEventListener('click',function(e){
        // Em desktop o hover já abre; no mobile a gente controla aqui
        if(window.matchMedia('(max-width:768px)').matches){
          e.preventDefault();
          var expanded = trigger.getAttribute('aria-expanded')==='true';
          trigger.setAttribute('aria-expanded', expanded ? 'false':'true');
          submenu.classList.toggle('open');
        }
      });
    }
  });
}
window.addEventListener('load', highlightActiveUserMenu);
window.addEventListener('hashchange', highlightActiveUserMenu);
window.addEventListener('load', initNav);

/* === Mantém o dropdown aberto tempo suficiente no desktop === */
function initDesktopDropdownHold(){
  var dd = document.querySelector('.nav-has-dropdown');
  if(!dd) return;

  var trigger = dd.querySelector('.nav-link-with-dropdown');
  var menu    = dd.querySelector('.dropdown-menu');
  if(!trigger || !menu) return;

  var hideTimeout;

  function openMenu(){
    clearTimeout(hideTimeout);
    if(window.matchMedia('(min-width:769px)').matches){
      dd.classList.add('dropdown-open');
    }
  }

  function scheduleClose(){
    if(window.matchMedia('(min-width:769px)').matches){
      hideTimeout = setTimeout(function(){
        dd.classList.remove('dropdown-open');
      }, 200);
    }
  }

  trigger.addEventListener('mouseenter', openMenu);
  trigger.addEventListener('mouseleave', scheduleClose);

  menu.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', scheduleClose);
}
window.addEventListener('load', initDesktopDropdownHold);

/* === Sombra dinâmica do cabeçalho fixo === */
function initHeaderShadow(){
  var header = document.querySelector('.site-header');
  if(!header) return;

  function applyShadow(){
    // se rolou mais de 4px, aplica classe "header-scrolled"
    if(window.scrollY > 4){
      header.classList.add('header-scrolled');
    }else{
      header.classList.remove('header-scrolled');
    }
  }

  applyShadow(); // estado inicial
  window.addEventListener('scroll', applyShadow);
}
window.addEventListener('load', initHeaderShadow);

/* === Modal helper / fechar modal em [data-close-modal] === */
document.addEventListener('click', function(e){
  if(e.target.matches('[data-close-modal]')){
    var backdrop = e.target.closest('.modal-backdrop');
    if(backdrop){ backdrop.classList.remove('is-open'); }
  }
});
