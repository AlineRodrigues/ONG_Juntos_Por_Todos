// ===== Validador genérico + persistência em localStorage/sessionStorage =====
export const Validator = (() => {

  function tryReadStorage(storage) {
    try {
      const raw = storage.getItem('cadastros');
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (_) {
      return [];
    }
  }

  function tryWriteStorage(storage, list) {
    try {
      storage.setItem('cadastros', JSON.stringify(list));
      return true;
    } catch (_) {
      return false;
    }
  }

  // Lê todos os cadastros já salvos
  function getList() {
    // tenta localStorage primeiro
    let data = tryReadStorage(localStorage);
    if (data.length) return data;

    // fallback: sessionStorage
    data = tryReadStorage(sessionStorage);
    return data;
  }

  // Escreve lista atualizada de cadastros
  function saveList(list) {
    // tenta salvar no localStorage
    if (!tryWriteStorage(localStorage, list)) {
      // fallback: sessionStorage
      tryWriteStorage(sessionStorage, list);
    }
  }

  const rules = {
    required: (v) => (v != null && String(v).trim().length > 0) || "Campo obrigatório.",
    email: (v) => /^\S+@\S+\.\S+$/.test(String(v)) || "E-mail inválido.",
    phone: (v) => v === "" || /^(\(\d{2}\)\s?)?\d{4,5}-\d{4}$/.test(String(v)) || "Telefone inválido. Ex: (11) 99999-9999",
    cep: (v) => v === "" || /^\d{5}-?\d{3}$/.test(String(v)) || "CEP inválido. Ex: 00000-000",
    min: (v, n) => (String(v).trim().length >= Number(n)) || `Mínimo de ${n} caracteres.`
  };

  function apply(input) {
    const conf = (input.getAttribute('data-validate') || "").split('|').filter(Boolean);
    let firstError = null;
    for (const c of conf) {
      const [rule, arg] = c.split(':');
      const fn = rules[rule];
      if (!fn) continue;
      const okOrMsg = fn(input.value, arg);
      const ok = okOrMsg === true || okOrMsg === undefined;
      const msg = ok ? "" : okOrMsg;
      if (!ok && !firstError) firstError = msg;
    }
    const errBox = document.querySelector(`.error-text[data-error-for="${input.name}"]`);
    if (firstError) {
      input.setAttribute('aria-invalid', 'true');
      if (errBox) errBox.textContent = firstError;
    } else {
      input.setAttribute('aria-invalid', 'false');
      if (errBox) errBox.textContent = "";
    }
    return !firstError;
  }

  function bind(form) {
    // Validação em tempo real
    form.querySelectorAll('[data-validate]').forEach((el) => {
      el.addEventListener('input', () => apply(el));
      el.addEventListener('blur', () => apply(el));
    });

    // Integração com biblioteca externa IMask
    try {
      if (window.IMask) {
        const telInput = form.querySelector('#telefone');
        if (telInput) {
          IMask(telInput, { mask: '(00) 00000-0000' });
        }
        const cepInput = form.querySelector('#cep');
        if (cepInput) {
          IMask(cepInput, { mask: '00000-000' });
        }
      }
    } catch (_) {
      // se a lib externa não carregar, segue sem quebrar
    }

    // Submit do formulário
    form.addEventListener('submit', (e) => {
      const all = Array.from(form.querySelectorAll('[data-validate]'));
      const results = all.map(apply);
      const ok = results.every(Boolean);
      const feedback = document.getElementById('form-feedback');

      if (!ok) {
        e.preventDefault();
        if (feedback) {
          feedback.innerHTML = '<div class="error-banner">Verifique os campos destacados e tente novamente.</div>';
        }
      } else {
        e.preventDefault();
        // Monta payload
        const payload = {
          nome: form.nome.value.trim(),
          email: form.email.value.trim(),
          telefone: form.telefone.value.trim(),
          papel: form.papel.value.trim(),
          endereco: form.endereco.value.trim(),
          numero: form.numero.value.trim(),
          cep: form.cep.value.trim(),
          cidade: form.cidade.value.trim(),
          uf: form.uf.value.trim(),
          timestamp: Date.now()
        };

        // Salva no storage
        const lista = getList();
        lista.push(payload);
        saveList(lista);

        // Feedback visual
        if (feedback) {
          feedback.innerHTML = '<div class="success-banner">Cadastro enviado com sucesso! Obrigado pela sua participação.</div>';
        }

        // Limpa campos/erros
        form.reset();
        form.querySelectorAll('[aria-invalid]').forEach(el => el.setAttribute('aria-invalid','false'));
        form.querySelectorAll('.error-text').forEach(box => { box.textContent = ''; });

        // Volta para Home pra já mostrar em "Cadastros Recentes"
        setTimeout(() => {
          window.location.hash = '#/home';
        }, 300);
      }
    });
  }

  return { bind, getList };
})();
