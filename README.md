# ONG Juntos por Todos
## Visão geral
Juntos por Todos é um protótipo front-end para uma ONG, composto por páginas estáticas (HTML/CSS) e um painel administrativo simulado em JavaScript. A versão v3 foca em acessibilidade, semântica e testes automatizados para garantir comportamento consistente.

## Conteúdo do repositório
- `index.html`, `cadastro.html`, `projetos.html`, `sistema.html` — páginas públicas e painel.
- `css/styles.css` — estilos.
- `js/scripts.js` — lógica do front-end.
- `tests/` — testes com JSDOM e E2E (Puppeteer).

## Principais funcionalidades
- Formulário de cadastro com validação de CPF e CEP.
- Painel administrativo (simulado) para gerenciar projetos, inscrições e doações.
- Máscaras de entrada (CPF, telefone, CEP) e validações no cliente.
- Atenção à acessibilidade: link de pular para conteúdo, labels, atributos ARIA e foco visível.