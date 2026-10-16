# Newsroom 360

Plataforma local para planejamento e produção jornalística, baseada na especificação fornecida. O núcleo implementa pautas, matérias, revisão, publicação no site local, versões, fontes protegidas, tarefas e administração. **A especificação completa ainda não está concluída e o sistema não está homologado para produção.**

## Executar

Requer Node.js 24 e npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run dev
```

Abra http://localhost:3000. No primeiro acesso, crie sua conta administrativa. Em **Administração**, cadastre editor-chefe, editor e repórteres com suas editorias; saia e entre com uma dessas contas para produzir. O administrador técnico não publica matérias.

Para agendamentos, mantenha um segundo terminal em execução:

```powershell
npm run worker
```

O worker lê variáveis do ambiente do processo. Caso personalize DATABASE_PATH, exporte o mesmo valor nos dois terminais. A data/hora dos formulários segue o fuso do dispositivo, é enviada com offset UTC e aparece no workspace em America/Sao_Paulo.

## Validação

```powershell
npm run lint
npm run typecheck
npm test
npm run test:unit
npm run test:integration
npm run build
npm run test:e2e
```

E2E usa Microsoft Edge instalado no Windows e banco isolado por execução. Em outro ambiente, instale um navegador Playwright e ajuste PLAYWRIGHT_CHANNEL; ver playwright.config.ts. Nenhuma senha de demonstração está embutida no aplicativo.

Alternativa para provisionamento local:

```powershell
$env:INITIAL_PASSWORD = Read-Host 'Senha inicial (mínimo 12 caracteres)' -MaskInput
npm run user:create -- 'Nome' 'email@redacao.com.br' 'chief' 'Política'
Remove-Item Env:INITIAL_PASSWORD
```

Esse comando é de operação local, deve ser restrito ao administrador do servidor e não tem endpoint público.

## Operação

`npm run build` e `npm start` executam o servidor de produção Node. Configure APP_ORIGIN com a origem HTTPS exata; cookies de produção exigem HTTPS. Não exponha a configuração inicial à internet antes de provisionar a primeira conta. Preserve disco persistente para `data/`; mantenha o worker ativo. Não execute como exportação estática.

O banco SQLite e `sources.key` são privados e ignorados no Git. A chave deve ser protegida por ACL do sistema operacional e incluída em backup seguro separado; perder a chave impede recuperar as fontes. Para backup consistente, pare aplicação e worker ou use a API de backup SQLite; nunca copie somente o arquivo principal durante escrita em WAL. Teste restauração antes de uso real.

Autosave guarda conteúdo no servidor e mantém alterações não enviadas no sessionStorage desta aba. Esse mecanismo cobre recarga e reconexão na sessão; não é a PWA offline criptografada do PRD. Não feche a aba com texto pendente. O editor inicial usa texto simples, sem imagens, blocos ricos ou coedição.

## Documentação

- [Arquitetura e auditoria](docs/ARCHITECTURE_CURRENT.md)
- [Status por módulo](docs/IMPLEMENTATION_STATUS.md)
- [Matriz de requisitos](docs/REQUIREMENTS_MATRIX.md)
- [Lacunas e riscos](docs/GAPS.md)
- [Relatório do checkpoint](docs/FINAL_IMPLEMENTATION_REPORT.md)

Os documentos de origem foram preservados em `docs/sources/`. O script `scripts/audit-requirements.ps1` gera o inventário inicial do DOCX; após atualizar evidências manualmente, não o execute sobre a matriz sem preservar essas alterações.
