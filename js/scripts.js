// Máscaras e validação (resumido)
document.addEventListener('DOMContentLoaded',function(){
 function maskCPF(e){let v=e.target.value.replace(/\D/g,'').slice(0,11);v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d)/,'$1.$2');v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2');e.target.value=v;}
 function maskTel(e){let v=e.target.value.replace(/\D/g,'').slice(0,11);if(v.length>10){v=v.replace(/(\d{2})(\d{5})(\d{4})/,'($1) $2-$3');}else{v=v.replace(/(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3');}e.target.value=v;}
 function maskCEP(e){let v=e.target.value.replace(/\D/g,'').slice(0,8);v=v.replace(/(\d{5})(\d{1,3})/,'$1-$2');e.target.value=v;}
 var cpf=document.getElementById('cpf'),tel=document.getElementById('telefone'),cep=document.getElementById('cep');
 if(cpf) cpf.addEventListener('input',maskCPF);
 if(tel) tel.addEventListener('input',maskTel);
 if(cep) cep.addEventListener('input',maskCEP);
 var form=document.getElementById('cadastroForm'); if(form){form.addEventListener('submit',function(e){e.preventDefault(); if(form.checkValidity()){alert('Enviado (simulação)'); form.reset();} else { [...form.elements].forEach(function(el){ if(el.willValidate && !el.checkValidity()){ var err=document.getElementById(el.id+'-error'); if(err) err.textContent=el.validationMessage; } }); } }); }
});