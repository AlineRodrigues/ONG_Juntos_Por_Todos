# Releases (V2)

Este diretório contém os pacotes ZIP gerados a partir das tags da série V2 do projeto.
Cada pacote corresponde a um snapshot do repositório naquele tag e está disponível também como asset nas Releases do GitHub.

Arquivos disponíveis

- releases/v2.1.0/build_v2.1.0.zip
  - URL: https://github.com/AlineRodrigues/ONG_Juntos_Por_Todos/releases/download/v2.1.0/build_v2.1.0.zip

- releases/v2.1.1/build_v2.1.1.zip
  - URL: https://github.com/AlineRodrigues/ONG_Juntos_Por_Todos/releases/download/v2.1.1/build_v2.1.1.zip

- releases/v2.1.2/build_v2.1.2.zip
  - URL: https://github.com/AlineRodrigues/ONG_Juntos_Por_Todos/releases/download/v2.1.2/build_v2.1.2.zip

Instruções rápidas de uso

1. Baixar o ZIP desejado (link acima ou botão "Assets" na página da Release).
2. Descompactar:

   unzip build_v2.1.2.zip -d build_v2.1.2

3. Testar localmente (recomendado):

   # Usando Python 3 (porta 8000)
   python3 -m http.server 8000

   Em seguida, abra no navegador:
   http://localhost:8000

Observações e boas práticas

- Mantemos os assets também nas Releases do GitHub para facilitar downloads e evitar inflar o histórico do repositório.
- Conservar binários no repositório (`main`) pode aumentar o tamanho do clone ao longo do tempo. Se preferir, posso remover os ZIPs do repositório e mantê-los apenas nas Releases do GitHub.
- Se quiser pacotes contendo apenas os arquivos de produção (sem arquivos de configuração/editor), eu posso gerar esses pacotes e substituí-los nas Releases e/ou no repositório.

Contato

Se precisar de outro formato (tar.gz) ou instruções específicas para Windows, me avise e eu atualizo este README e os assets.
