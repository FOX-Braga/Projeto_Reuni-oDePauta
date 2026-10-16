# Status de implementação

Checkpoint local — 16/10/2026. Estados: NÃO INICIADO, EM DESENVOLVIMENTO, IMPLEMENTADO, TESTADO, APROVADO, BLOQUEADO. TESTADO indica somente o escopo coberto explicitamente; não certifica todo o módulo do PRD.

| Módulo / fase | Status | Entregue | Pendências reais |
|---|---|---|---|
| Auditoria inicial | IMPLEMENTADO | Inventário do repositório, fontes, logs iniciais e matriz com 726 trechos PRD + 12 controles | Reavaliar matriz a cada checkpoint |
| Fundação / Design System | EM DESENVOLVIMENTO | Next/React/TS, shell, navegação por capability, formulários, diálogo nativo, estados, badges, botões, foco e layout responsivo | Componentes avançados, paginação visual, testes individuais e auditoria de todos os breakpoints |
| Autenticação / RBAC | EM DESENVOLVIMENTO | Login/logout, sessão opaca, expiração, revogação, scrypt, limite de tentativas, autorização contextual no servidor | SSO, MFA, step-up, alteração/recuperação de senha e painel de sessões |
| Dashboard | EM DESENVOLVIMENTO | Pautas, matérias, entregas e atividades reais e filtradas por acesso | Carga da equipe, alertas de risco, configuração de widgets e métricas totais paginadas |
| Pautas / agenda | EM DESENVOLVIMENTO | Criar/editar/atribuir, briefing, editoria, prazo, prioridade, lista, agrupamento por status/data, arquivamento com motivo e histórico, concorrência | Calendário visual, drag-and-drop, dependências, templates e campos adicionais do PRD |
| Apuração | EM DESENVOLVIMENTO | Caderno de notas por pauta com autor e data | Entrevistas, evidências, checklist factual e vínculo de fontes |
| Fontes | EM DESENVOLVIMENTO | Cadastro, busca local, criptografia AES-GCM, confidencialidade por proprietário e auditoria de visualização sensível | Editar, retenção, escopo configurável, compartilhamento contextual e gestão de consentimento |
| Editor | EM DESENVOLVIMENTO | Texto simples, metadados, autosave, contador, recuperação na mesma sessão, preview e conflito explícito | Editor rico, mídia, blocos, embeds, atalhos, links, undo/redo remoto e offline persistente seguro |
| Versões / colaboração | EM DESENVOLVIMENTO | Snapshots, restauração como nova versão e histórico preservado | Diff por bloco, presença, sugestões e CRDT/OT |
| Workflow | EM DESENVOLVIMENTO | Transições permitidas no servidor, motivos, versão aprovada, embargo e gate de editor-chefe para sensível | Configuração dinâmica, jurídico completo, múltiplas aprovações, checklists e overrides |
| Mídia | NÃO INICIADO | Tela identifica a indisponibilidade | Upload seguro, scan, multipart, derivados, recortes, direitos e armazenamento |
| Breaking / live blog | NÃO INICIADO | Sem implementação | Fluxo urgente, cobertura e eventos em tempo real |
| Publicação local | EM DESENVOLVIMENTO | Página pública com snapshot aprovado, agendamento por worker, despublicação auditada, nenhuma alteração privada vaza no site | CMS externo, CDN, destinos, fila robusta, rollback formal e reconciliação |
| SEO | EM DESENVOLVIMENTO | Title/description/canonical, OG/Twitter básicos e NewsArticle | Imagens sociais, sitemap, feeds, checklist completo, redirecionamento e auditoria Lighthouse |
| Distribuição | NÃO INICIADO | Sem simulação de envio | Home, vitrines, social, push, newsletters e integrações |
| Busca | EM DESENVOLVIMENTO | Pautas/matérias autorizadas, query e offset na API | Fontes/mídia/documentos, acentos, filtros avançados, índice e saved searches |
| Notificações / tarefas | EM DESENVOLVIMENTO | Atribuição/revisão/publicação, leitura individual/em lote e tarefas pessoais | Preferências, canais, dependências, SLA e realtime |
| Correções / direito de resposta | NÃO INICIADO | Versões e motivos oferecem base, sem fluxo formal | Solicitação, evidências, nota pública, aprovação e propagação |
| Analytics | NÃO INICIADO | Estado indisponível explícito | Integração com dados reais e indicadores editoriais |
| IA assistiva | NÃO INICIADO | Nenhum envio a provedor ou publicação por IA | Módulo opcional e aprovação de provedor |
| PWA / offline | NÃO INICIADO | Aviso de conexão e recuperação limitada de rascunho de sessão | Service worker, IndexedDB, criptografia, fila e reconciliação |
| API / banco | EM DESENVOLVIMENTO | REST, schemas Zod, erros, request ID, migrations, índices, FKs, idempotência e auditoria imutável por triggers | OpenAPI, retenção da idempotência, paginação completa e migração de escala |
| Segurança / privacidade | EM DESENVOLVIMENTO | Cookie HttpOnly, CSRF por origem, SQL parametrizado, texto renderizado sem HTML e contatos criptografados | CSP com nonce, MFA, pentest, gestão externa de chave, políticas de retenção e restauração |
| Acessibilidade | EM DESENVOLVIMENTO | Labels/descrições separados, foco, skip link, estados sem depender apenas de cor e diálogo nativo | Axe completo e testes manuais de teclado/leitor de tela |
| Observabilidade / performance | EM DESENVOLVIMENTO | Health check, logs sem payload sensível, IDs de requisição e limites de coleção | Traces, métricas, alertas, carga e SLO |
| Administração | EM DESENVOLVIMENTO | Criar usuários, papéis, editoria, desativação e revogação de sessão com auditoria | Workflows, taxonomia, integrações, templates, flags e políticas |
| DevOps | EM DESENVOLVIMENTO | Lockfile, scripts reais, CI de qualidade e orientação de backup local | Docker/IaC, ambientes, deploy/CD, restauração e contingência |
| Homologação de produção | BLOQUEADO | Não declarada | Todos os requisitos obrigatórios pendentes e verificações operacionais |

Nenhum módulo completo do PRD está APROVADO. A entrega é um núcleo local executável em evolução, respeitando checkpoints. Não confundir agrupamento por data com calendário completo, texto simples com editor rico, nem sessionStorage com PWA offline.
