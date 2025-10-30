document.addEventListener('DOMContentLoaded', function(){
  function mask(el, type){
    el&&el.addEventListener('input', function(e){
      let v=e.target.value.replace(/\D/g,'');
      if(type==='cpf'){ v=v.slice(0,11); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
      if(type==='tel'){ v=v.slice(0,11); if(v.length>10){ v=v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3'); } else { v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3'); } }
      if(type==='cep'){ v=v.slice(0,8); v=v.replace(/(\d{5})(\d{1,3})/,'$1-$2'); }
      e.target.value=v;
    });
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
    form.addEventListener('submit', function(e){
      e.preventDefault();
      let valid=true;
      document.querySelectorAll('.error').forEach(el=>el.textContent='');
      if(!form.checkValidity()){
        Array.from(form.elements).forEach(el=>{
          if(el.willValidate && !el.checkValidity()){
            const slot=document.getElementById(el.id+'-error');
            if(slot) slot.textContent=el.validationMessage;
            valid=false;
          }
        });
      }
      const cpfEl=document.getElementById('cpf');
      if(cpfEl){ const d=cpfEl.value.replace(/\D/g,''); if(d.length!==11){ const s=document.getElementById('cpf-error'); if(s) s.textContent='CPF inválido (11 dígitos).'; valid=false; } }
      if(valid){
        const payload=Object.fromEntries(new FormData(form).entries());
        try{ localStorage.setItem('cadastro_jpt', JSON.stringify(payload)); alert('Cadastro enviado! (simulado)'); form.reset(); } catch{};
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
  function activate(id){
    tabs.forEach(t=>{ const on = t.id===id; t.classList.toggle('active', on); t.setAttribute('aria-selected', on?'true':'false'); });
    panels.forEach(p=>{ p.classList.toggle('hidden', p.id !== id.replace('tb-','pane-')); });
  }
  tabs.forEach(t=>t.addEventListener('click', ()=>activate(t.id)));
  if(tabs.length) activate('tb-vol');

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