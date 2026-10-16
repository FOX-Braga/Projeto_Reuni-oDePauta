# API do núcleo local

Base `/api/v1`. Respostas privadas usam Cache-Control: no-store e X-Request-Id. Erros: `{ "error": { "code": "...", "message": "...", "requestId": "..." } }`. Sem stack trace no cliente.

Todas as mutações enviam `Content-Type: application/json` e `Origin` igual a APP_ORIGIN; a autenticação usa cookie HttpOnly. Mutações autenticadas exigem `Idempotency-Key` alfanumérica/UUID de 16–100 caracteres. Reusar a mesma chave com payload diferente retorna 409. Use a mesma chave ao repetir uma operação cujo resultado ficou desconhecido. Publicação crítica só é considerada concluída após confirmação do servidor.

| Endpoint | Comportamento |
|---|---|
| GET /auth/setup | Indica necessidade de provisionamento inicial |
| POST /auth/setup | Cria primeira conta administrativa; bloqueia após configuração |
| POST /auth/login | Cria sessão; resposta genérica para credenciais inválidas; limite por conta |
| POST /auth/logout | Revoga sessão atual |
| GET /me | Perfil autenticado |
| GET /people | Diretório limitado ao papel/editoria |
| POST /users | Administrador cria conta |
| PATCH /users/{id} | Administrador muda role/desk/active; revoga sessões |
| GET/POST /assignments | Lista/cria pauta |
| GET/PATCH /assignments/{id} | Detalhe/edição com version obrigatório |
| GET/POST /assignments/{id}/notes | Notas contextualizadas |
| GET/POST /stories | Lista/cria matéria |
| GET/PATCH /stories/{id} | Detalhe/edição com version; capabilities editable/transitions |
| POST /stories/{id}/transition | target, version, reason e scheduled_at quando aplicável |
| GET /stories/{id}/versions | Snapshots e responsáveis |
| POST /stories/{id}/restore | version a restaurar e base atual |
| GET/POST /sources | Fontes autorizadas/cadastro criptografado |
| GET/POST /tasks | Tarefas autorizadas/criação |
| PATCH /tasks/{id} | completed boolean |
| GET /notifications | Notificações do usuário |
| PATCH /notifications/{id ou all} | Marcar leitura |
| GET /audit/{entityId} | Atividade de pauta/matéria autorizada |
| GET /audit | Auditoria global somente admin/chief |
| GET /search?q= | Busca de pautas e matérias autorizadas |

Listas de pautas/matérias e auditoria global aceitam `offset`, limitado a 1.000.000, em lotes de 100. Pautas e matérias aceitam `q` de até 200 caracteres. Outras coleções são limitadas a 100; a interface ainda não oferece navegação entre páginas. Contagens do dashboard refletem o lote carregado, não totais globais acima desse limite.

Health check público: GET `/api/health`; conteúdo público: GET `/noticias/{slug}`. Nenhum endpoint de upload, integração social, IA ou analytics foi criado. Os endpoints do PRD são referência de produto; transições deste núcleo são agrupadas em `/transition`, sem alegar compatibilidade completa com o contrato final.
