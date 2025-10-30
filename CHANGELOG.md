# Changelog (resumo)

## [Unreleased] - 2025-10-30
- a2bc843 | Aline Rodrigues | 2025-10-30 | Adiciona template básico CHANGELOG.md

Este arquivo contém um changelog básico por versão. O formato é intencionalmente simples para facilitar atualizações rápidas:

- Cabeçalho de versão: `## [vX.Y.Z] - YYYY-MM-DD`
- Entradas: `- <hash curto> | <autor> | <date> | <mensagem de commit>`

Exemplo:

## [v2.1.0] - 2025-10-30
- a8bc1dd | Aline Rodrigues | 2025-10-30 | Reestrutura HTML das páginas principais (index, cadastro, projetos)
- f5435a7 | Aline Rodrigues | 2025-10-30 | v2 — Atualiza layout, estilos e funcionalidades

Como usar (recomendado):
1. Ao finalizar alterações que formam uma versão, execute um `git log --pretty=format:"%h | %an | %ad | %s" --date=short <old_tag>..HEAD` e cole as entradas sob a nova seção de versão.
2. Atualize a data e o número da versão conforme necessário.

Notas:
- Mantenha somente o histórico de versões relevantes (ex.: releases). Para mudanças menores, apenas adicione um item rápido.
- Não é necessário incluir diffs completos aqui; foque em mensagens concisas.

-- Gerado automaticamente em 2025-10-30
