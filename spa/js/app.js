import { Templates, Template } from './templates.js';
import { projetosDestaque } from './data.js';
import { Validator } from './validate.js';

const App = (() => {
  const routes = {
    '': renderHome,
    '#/': renderHome,
    '#/home': renderHome,
    '#/cadastro': renderCadastro,
  };

  function setActive(link) {
    document.querySelectorAll('.spa-nav a').forEach(a => a.classList.remove('active'));
    const anchor = document.querySelector(`.spa-nav a[href="${link}"]`);
    if (anchor) anchor.classList.add('active');
  }

  function getCadastros() {
    try {
      if (Validator && typeof Validator.getList === 'function') {
        return Validator.getList();
      }
    } catch (_) {}
    return [];
  }

  function renderHome() {
    const root = document.getElementById('app');
    root.innerHTML = Templates.home;

    // Renderiza cards de projetos
    const grid = document.getElementById('grid-projetos');
    if (grid) {
      grid.innerHTML = projetosDestaque
        .map(p => Template.render(Templates.projetosCard, p))
        .join('');
    }

    // Renderiza cadastros recentes
    const recentBox = document.getElementById('cadastros-recentes');
    if (recentBox) {
      const cadastros = getCadastros().slice().reverse().slice(0, 5);
      if (!cadastros.length) {
        recentBox.innerHTML = Templates.recentEmpty;
      } else {
        recentBox.innerHTML = cadastros.map(c => {
          return Template.render(Templates.recentItem, {
            ...c,
            papelLabel: c.papel || "Não informado",
            data: new Date(c.timestamp || Date.now()).toLocaleString('pt-BR')
          });
        }).join('');
      }
    }

    setActive('#/home');
  }

  function renderCadastro() {
    const root = document.getElementById('app');
    root.innerHTML = Templates.cadastro;
    const form = document.getElementById('form-cadastro');
    if (form) Validator.bind(form);
    setActive('#/cadastro');
  }

  function renderNotFound() {
    const root = document.getElementById('app');
    root.innerHTML = Templates.notfound;
  }

  function router() {
    const hash = window.location.hash || '#/home';
    const fn = routes[hash] || (hash.startsWith('#/cadastro') ? renderCadastro : routes['#/home']);
    try { fn(); } catch (_) { renderNotFound(); }
  }

  function init() {
    window.addEventListener('hashchange', router);
    router();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
