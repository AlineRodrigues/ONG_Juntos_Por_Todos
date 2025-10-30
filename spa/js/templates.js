// ===== Template Engine simples (interpolação {{chave}}) =====
export const Template = {
  render(tpl, data = {}) {
    return tpl.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
      const parts = key.split('.');
      let val = data;
      for (const p of parts) val = (val && p in val) ? val[p] : '';
      return (val ?? '').toString();
    });
  }
};

// ===== Templates =====
export const Templates = {
  home: `
    <section class="spa-container">
      <h1 style="font-size: var(--spa-font-xl); margin-bottom: var(--spa-space-16);">Bem-vindo(a) à Plataforma</h1>
      <p style="max-width: 60ch; color: var(--spa-neutral-600);">
        Esta é uma versão SPA básica para navegação rápida, com templates JS,
        armazenamento local e um sistema de validação de formulários.
      </p>

      <div class="card-grid" id="grid-projetos"></div>

      <section style="margin-top:var(--spa-space-32);">
        <h2 style="font-size: var(--spa-font-lg); margin-bottom: var(--spa-space-16);">
          Cadastros Recentes
        </h2>
        <div id="cadastros-recentes" class="recent-list"></div>
      </section>
    </section>
  `,

  projetosCard: `
    <article class="card">
      <h3>{{titulo}}</h3>
      <p>{{descricao}}</p>
      <div style="margin-top: 12px;">
        <a href="{{link}}" class="spa-btn">Quero participar</a>
      </div>
    </article>
  `,

  recentItem: `
    <div class="recent-card" style="background:white;border:1px solid var(--spa-neutral-300); border-radius:12px; padding:12px 16px; margin-bottom:12px;">
      <div style="font-size:var(--spa-font-md); font-weight:600; color:var(--spa-neutral-900);">
        {{nome}} <span style="font-size:var(--spa-font-sm); font-weight:400; color:var(--spa-neutral-600);">({{papelLabel}})</span>
      </div>
      <div style="font-size:var(--spa-font-sm); color:var(--spa-neutral-600); line-height:1.4;">
        {{email}} · {{telefone}} <br/>
        {{endereco}}, {{numero}} · CEP {{cep}} · {{cidade}}/{{uf}} <br/>
        <span style="font-size: var(--spa-font-xs); color: var(--spa-neutral-600);">Enviado em {{data}}</span>
      </div>
    </div>
  `,

  recentEmpty: `
    <p style="font-size:var(--spa-font-sm); color:var(--spa-neutral-600);">
      Nenhum cadastro enviado ainda.
    </p>
  `,

  cadastro: `
    <section class="spa-container">
      <h1 style="font-size: var(--spa-font-xl); margin-bottom: var(--spa-space-16);">Cadastro</h1>

      <div id="form-feedback"></div>

      <form id="form-cadastro" class="form" novalidate>
        <div class="row two">
          <div>
            <label class="label" for="nome">Nome completo *</label>
            <input class="input" id="nome" name="nome" type="text" required minlength="3"
                   data-validate="required|min:3" placeholder="Ex: Aline Rodrigues" />
            <div class="error-text" data-error-for="nome"></div>
          </div>

          <div>
            <label class="label" for="email">E-mail *</label>
            <input class="input" id="email" name="email" type="email" required
                   data-validate="required|email" placeholder="exemplo@dominio.com" />
            <div class="error-text" data-error-for="email"></div>
          </div>
        </div>

        <div class="row two">
          <div>
            <label class="label" for="telefone">Telefone (WhatsApp)</label>
            <input class="input" id="telefone" name="telefone" type="tel"
                   data-validate="phone" placeholder="(11) 99999-9999" />
            <div class="error-text" data-error-for="telefone"></div>
          </div>

          <div>
            <label class="label" for="papel">Como deseja contribuir?</label>
            <select class="select" id="papel" name="papel">
              <option value="">Selecione</option>
              <option>Voluntário(a)</option>
              <option>Doador(a)</option>
              <option>Divulgador(a)</option>
            </select>
          </div>
        </div>

        <div class="row two">
<div style="grid-column:1 / -1;">
            <div class="row two">
  <div style="grid-column:1 / -1;">
    <div style="grid-column:1 / -1;">
            <!-- Linha 1 - Endereço -->
    <div class="row two">
      <div style="grid-column:1 / -1;">
        <label class="label" for="endereco">Endereço *</label>
            <input class="input" id="endereco" name="endereco" type="text"
                   data-validate="required" required placeholder="Rua, Av., etc." />
            <div class="error-text" data-error-for="endereco"></div>
      </div>
    </div>

    <!-- Linha 2 - Número e CEP -->
    <div class="row two">
      <div>
        <label class="label" for="numero">Número *</label>
            <input class="input" id="numero" name="numero" type="text"
                   data-validate="required" required placeholder="123" />
            <div class="error-text" data-error-for="numero"></div>
      </div>
      <div>
        <label class="label" for="cep">CEP</label>
            <input class="input" id="cep" name="cep" type="text"
                   data-validate="cep" placeholder="00000-000" />
            <div class="error-text" data-error-for="cep"></div>
      </div>
    </div>

    <!-- Linha 3 - Cidade e UF -->
    <div class="row two">
      <div>
        <label class="label" for="cidade">Cidade *</label>
        <select class="select" id="cidade" name="cidade" data-validate="required" required>
<option value="">Selecione</option>
      <option value="Rio Branco">Rio Branco</option>
      <option value="Maceió">Maceió</option>
      <option value="Macapá">Macapá</option>
      <option value="Manaus">Manaus</option>
      <option value="Salvador">Salvador</option>
      <option value="Fortaleza">Fortaleza</option>
      <option value="Brasília">Brasília</option>
      <option value="Vitória">Vitória</option>
      <option value="Goiânia">Goiânia</option>
      <option value="São Luís">São Luís</option>
      <option value="Cuiabá">Cuiabá</option>
      <option value="Campo Grande">Campo Grande</option>
      <option value="Belo Horizonte">Belo Horizonte</option>
      <option value="Belém">Belém</option>
      <option value="João Pessoa">João Pessoa</option>
      <option value="Curitiba">Curitiba</option>
      <option value="Recife">Recife</option>
      <option value="Teresina">Teresina</option>
      <option value="Rio de Janeiro">Rio de Janeiro</option>
      <option value="Natal">Natal</option>
      <option value="Porto Alegre">Porto Alegre</option>
      <option value="Porto Velho">Porto Velho</option>
      <option value="Boa Vista">Boa Vista</option>
      <option value="Florianópolis">Florianópolis</option>
      <option value="São Paulo">São Paulo</option>
      <option value="Aracaju">Aracaju</option>
      <option value="Palmas">Palmas</option>
        </select>
        <div class="error-text" data-error-for="cidade"></div>
      </div>
      <div>
        <label class="label" for="uf">Estado (UF) *</label>
        <select class="select" id="uf" name="uf" data-validate="required" required>
<option value="">Selecione</option>
      <option value="AC">AC</option><option value="AL">AL</option><option value="AP">AP</option>
      <option value="AM">AM</option><option value="BA">BA</option><option value="CE">CE</option>
      <option value="DF">DF</option><option value="ES">ES</option><option value="GO">GO</option>
      <option value="MA">MA</option><option value="MT">MT</option><option value="MS">MS</option>
      <option value="MG">MG</option><option value="PA">PA</option><option value="PB">PB</option>
      <option value="PR">PR</option><option value="PE">PE</option><option value="PI">PI</option>
      <option value="RJ">RJ</option><option value="RN">RN</option><option value="RS">RS</option>
      <option value="RO">RO</option><option value="RR">RR</option><option value="SC">SC</option>
      <option value="SP">SP</option><option value="SE">SE</option><option value="TO">TO</option>
        </select>
        <div class="error-text" data-error-for="uf"></div>
      </div>
    </div>
      </div>
      <div>
        <label class="label" for="uf">Estado (UF)</label>
    <select class="select" id="uf" name="uf" data-validate="required">
      <option value="">Selecione</option>
      <option>AC</option><option>AL</option><option>AP</option><option>AM</option><option>BA</option>
      <option>CE</option><option>DF</option><option>ES</option><option>GO</option><option>MA</option>
      <option>MT</option><option>MS</option><option>MG</option><option>PA</option><option>PB</option>
      <option>PR</option><option>PE</option><option>PI</option><option>RJ</option><option>RN</option>
      <option>RS</option><option>RO</option><option>RR</option><option>SC</option><option>SP</option>
      <option>SE</option><option>TO</option>
    </select>
    <div class="error-text" data-error-for="uf"></div>
      </div>
    </div><div class="row">
          <button class="input" type="submit" style="cursor:pointer; background:var(--spa-primary); color:white; border-color: var(--spa-primary);">
            Enviar cadastro
          </button>
        </div>

        <p style="margin-top: 8px; font-size: var(--spa-font-sm); color: var(--spa-neutral-600)">
          Campos marcados com * são obrigatórios.
        </p>
      </form>
    </section>
  `,

  notfound: `
    <section class="spa-container">
      <h1 style="font-size: var(--spa-font-xl); margin-bottom: var(--spa-space-16);">Página não encontrada</h1>
      <p>Tente navegar pelo menu acima.</p>
    </section>
  `
};
