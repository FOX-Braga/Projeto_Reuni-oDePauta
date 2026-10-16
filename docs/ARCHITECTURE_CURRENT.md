# Arquitetura e decisões

## Auditoria inicial — 16/10/2026

O commit inicial `e250f1a` contém somente `.gitattributes` e `LICENSE` (MIT). Não havia código, package.json, dependências, banco, migrations, autenticação, APIs, páginas, componentes, estilos, testes, CI/CD, Docker ou configuração de ambiente. A árvore foi verificada com `git ls-files` e `rg --files --hidden`, excluindo `.git`.

Node 24.19.0 e npm 11.17.0 estão disponíveis. Os comandos npm install, lint, typecheck, test e build foram executados e falharam com ENOENT, pois não havia package.json; evidências em `audit-logs/`. Isso identifica a causa da falha inicial, não um erro desconhecido a ser ocultado. A criação da fundação corrige essa ausência.

## Direção de implementação

Next.js App Router + React + TypeScript strict, UI por features, componentes acessíveis, API REST e domínio no servidor. SQLite local com foreign keys, WAL, migrations versionadas e consultas parametrizadas permite executar o núcleo sem uma conta externa. Este é um monólito modular inicial, não uma implantação distribuída. O banco local exige disco persistente e processo Node; não funciona em hospedagem somente estática ou Workers.

Sessões opacas em cookie HttpOnly, hashes de senha com scrypt, RBAC contextual, separação entre administração técnica e autoridade editorial, versões e auditoria transacional. Aprovação e publicação vinculadas à versão, conflitos retornam 409. Integrações e dados analíticos não são simulados como produtivos.

## Referências

`sources/SPECIFICATION.txt`: texto extraído de todos os parágrafos e tabelas de especificacao_plataforma_jornalistica.docx v1.0. `sources/MASTER_PROMPT.md`: solicitação de execução do usuário. `sources/PHASE_PROMPTS.md`: roteiro enviado anteriormente. O documento define requisitos do produto; instruções operacionais vêm da solicitação do usuário. Exemplos, alternativas e opcionais do PRD não são decisões já implementadas.

Documentação técnica consultada: https://nextjs.org/docs/app/api-reference/functions/cookies e https://nodejs.org/download/release/latest-v24.x/docs/api/sqlite.html.
