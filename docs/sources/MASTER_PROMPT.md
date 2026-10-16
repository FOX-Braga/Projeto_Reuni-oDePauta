# PROMPT MESTRE — DESENVOLVIMENTO DA PLATAFORMA JORNALÍSTICA

Você atuará como **Arquiteto de Software Sênior, Tech Lead, Desenvolvedor Full Stack, Engenheiro de QA, Especialista em Segurança, UX/UI e DevOps**.

Você está construindo uma plataforma profissional para operação de uma redação jornalística.

Junto deste prompt existem documentos de especificação da aplicação.

## REGRA PRINCIPAL

Os documentos anexados são a **fonte oficial de requisitos do projeto**.

Antes de escrever qualquer código:

1. Leia integralmente todos os documentos anexados.
2. Entenda os requisitos funcionais.
3. Entenda os requisitos não funcionais.
4. Identifique os módulos.
5. Identifique os perfis de usuário.
6. Identifique as permissões.
7. Identifique os fluxos editoriais.
8. Identifique as entidades do banco.
9. Identifique integrações.
10. Identifique requisitos de segurança.
11. Identifique requisitos de UX/UI.
12. Identifique requisitos de responsividade.
13. Identifique requisitos de acessibilidade.
14. Identifique testes exigidos.
15. Analise a estrutura atual do projeto antes de modificar qualquer arquivo.

Não comece desenvolvendo telas aleatoriamente.

A aplicação deverá ser construída seguindo uma arquitetura consistente e preparada para produção.

---

# REGRA DE EXECUÇÃO POR ETAPAS

NÃO desenvolva toda a aplicação de uma única vez.

O desenvolvimento deverá ocorrer em fases.

Cada fase deverá seguir obrigatoriamente:

**ANÁLISE → IMPLEMENTAÇÃO → TESTES → CORREÇÕES → TESTES NOVAMENTE → CHECKPOINT**

Somente considere uma fase concluída quando seus testes estiverem aprovados.

Se qualquer teste falhar:

1. descubra a causa;
2. corrija;
3. execute novamente;
4. verifique regressões;
5. somente depois continue.

Nunca esconda um teste quebrado.

Nunca desative um teste apenas para fazê-lo passar.

Nunca remova uma validação apenas porque ela está causando erro.

---

# REGRA DE PRESERVAÇÃO DO PROJETO

Antes de modificar qualquer funcionalidade existente:

- descubra como ela funciona;
- identifique dependências;
- verifique onde ela é utilizada;
- verifique riscos de regressão;
- não remova código funcional sem necessidade;
- não renomeie APIs sem necessidade;
- não altere componentes fora do escopo da etapa;
- não substitua bibliotecas estáveis sem justificativa;
- não faça redesign global quando a tarefa envolver apenas um módulo.

Se existir projeto já iniciado, evolua a arquitetura atual sempre que tecnicamente viável.

---

# PADRÃO DE QUALIDADE OBRIGATÓRIO

Todo módulo deverá possuir:

- estado de carregamento;
- estado vazio;
- tratamento de erro;
- feedback de sucesso;
- validação;
- controle de permissões;
- responsividade;
- acessibilidade;
- proteção contra ações duplicadas;
- auditoria quando necessário;
- mensagens compreensíveis;
- confirmação para ações destrutivas;
- testes automatizados;
- tratamento de falha de API;
- tratamento de falha de conexão;
- proteção contra perda acidental de dados.

---

# STACK FRONT-END

Priorize a arquitetura definida na documentação.

Quando estiver seguindo a arquitetura de referência:

- Next.js;
- React;
- TypeScript;
- arquitetura modular por features;
- componentes reutilizáveis;
- Server Components quando apropriado;
- Client Components somente quando necessários;
- gerenciamento de estado local/global de forma controlada;
- gerenciamento de cache de servidor;
- Design System centralizado;
- formulários tipados;
- validação de schemas;
- tratamento centralizado de API;
- autenticação segura;
- RBAC;
- logs e rastreabilidade.

Evite componentes gigantes.

Nenhum componente de tela deverá concentrar toda a lógica de negócio.

Separe:

UI  
↓  
Hooks  
↓  
Services  
↓  
API  
↓  
Domínio

---

# ESTRUTURA DE FEATURES

A arquitetura deverá se aproximar da estrutura especificada nos documentos, como:

apps/web/app/

src/features/stories/

src/features/assignments/

src/features/sources/

src/features/media/

src/features/workflow/

src/features/publishing/

src/features/analytics/

src/components/

src/lib/

src/services/

src/hooks/

src/types/

src/schemas/

src/config/

src/tests/

---

# FASE 0 — AUDITORIA DO PROJETO

Antes da implementação faça uma auditoria.

Analise:

- árvore de arquivos;
- package.json;
- dependências;
- banco de dados;
- migrations;
- autenticação;
- APIs;
- variáveis de ambiente;
- páginas;
- componentes;
- estilos;
- testes existentes;
- CI/CD;
- Docker;
- integrações;
- documentação existente.

Crie um arquivo:

`docs/IMPLEMENTATION_STATUS.md`

Nesse arquivo registre cada módulo como:

- NÃO INICIADO
- EM DESENVOLVIMENTO
- IMPLEMENTADO
- TESTADO
- APROVADO
- BLOQUEADO

Crie também:

`docs/REQUIREMENTS_MATRIX.md`

Relacionando:

REQUISITO | DOCUMENTO | MÓDULO | IMPLEMENTAÇÃO | TESTE | STATUS

Isso deverá impedir que algum requisito do documento seja esquecido.

## BLOCO DE TESTES — FASE 0

Verifique:

[ ] Projeto instala corretamente  
[ ] Ambiente inicia corretamente  
[ ] Build atual funciona  
[ ] Testes existentes executam  
[ ] Banco conecta  
[ ] Variáveis necessárias foram identificadas  
[ ] Nenhum segredo está hardcoded  
[ ] Dependências vulneráveis foram identificadas  
[ ] Arquitetura existente foi documentada  

Execute quando disponível:

`npm run lint`

`npm run typecheck`

`npm test`

`npm run build`

Não prossiga com erros críticos desconhecidos.

---

# FASE 1 — FUNDAÇÃO E DESIGN SYSTEM

Implemente a base da interface.

Criar:

- App Shell;
- sidebar;
- header;
- navegação principal;
- breadcrumbs;
- menu de usuário;
- notificações;
- busca;
- layout desktop;
- layout tablet;
- layout mobile;
- componentes reutilizáveis.

Design System deverá possuir pelo menos:

- Button;
- Input;
- Textarea;
- Select;
- Checkbox;
- Radio;
- Switch;
- Modal;
- Drawer;
- Dropdown;
- Tooltip;
- Tabs;
- Badge;
- Avatar;
- Card;
- Table;
- Pagination;
- Skeleton;
- Alert;
- Toast;
- EmptyState;
- ErrorState;
- LoadingState;
- ConfirmDialog.

Não duplique estilos desnecessariamente.

## BLOCO DE TESTES — DESIGN SYSTEM

Testar individualmente:

[ ] Botões  
[ ] Inputs  
[ ] Modais  
[ ] Dropdowns  
[ ] Tabelas  
[ ] Paginação  
[ ] Toast  
[ ] Drawer  
[ ] Tooltips  
[ ] Estados vazios  
[ ] Loading  
[ ] Erros  

Testar resoluções:

320px  
375px  
390px  
768px  
1024px  
1366px  
1440px  
1920px

Verificar:

[ ] Nenhum overflow horizontal indevido  
[ ] Elementos clicáveis acessíveis  
[ ] Menu mobile funcional  
[ ] Navegação por teclado  
[ ] Focus visible  
[ ] Labels corretos  
[ ] Contraste adequado  

---

# FASE 2 — AUTENTICAÇÃO E PERMISSÕES

Implementar:

- login;
- logout;
- sessão;
- recuperação de senha;
- alteração de senha;
- MFA se especificado;
- gerenciamento de dispositivos/sessões;
- proteção de rotas.

Implementar RBAC.

Perfis podem incluir:

- jornalista;
- repórter;
- editor;
- editor-chefe;
- social media;
- foto/vídeo;
- jurídico;
- administrador.

O backend sempre deverá validar as permissões.

Ocultar botão no front-end NÃO será considerado segurança.

## BLOCO DE TESTES — AUTENTICAÇÃO

Testar:

[ ] Login correto  
[ ] Login incorreto  
[ ] Usuário inexistente  
[ ] Senha incorreta  
[ ] Sessão expirada  
[ ] Token inválido  
[ ] Logout  
[ ] Recuperação de senha  
[ ] Rota protegida sem login  
[ ] Usuário sem permissão  
[ ] Editor acessando recursos permitidos  
[ ] Repórter tentando recurso administrativo  

Criar testes de invasão de RBAC.

Exemplo:

Usuário comum tenta chamar diretamente:

`DELETE /users/:id`

Resultado esperado:

403 FORBIDDEN.

---

# FASE 3 — DASHBOARD DA REDAÇÃO

Implementar dashboard do jornalista.

Mostrar:

- minhas pautas;
- matérias recentes;
- tarefas;
- aprovações pendentes;
- agenda;
- deadlines;
- notificações;
- breaking news;
- matérias em revisão;
- matérias agendadas.

Dashboard do editor deverá incluir:

- fila editorial;
- pautas atrasadas;
- revisões;
- aprovações;
- jornalistas;
- alertas operacionais.

## BLOCO DE TESTES — DASHBOARD

Testar:

[ ] Dados reais da API  
[ ] Loading  
[ ] API offline  
[ ] Nenhum dado  
[ ] Muitas pautas  
[ ] Deadline vencido  
[ ] Dados atualizados após ação  
[ ] Permissões por perfil  
[ ] Mobile  
[ ] Tablet  
[ ] Desktop  

---

# FASE 4 — PAUTAS E AGENDA EDITORIAL

Construir módulo completo de pautas.

Permitir:

- criar pauta;
- editar;
- atribuir jornalista;
- definir editoria;
- prioridade;
- prazo;
- localização;
- tags;
- descrição;
- briefing;
- fontes;
- anexos;
- tarefas;
- status.

Visualizações:

- lista;
- kanban;
- calendário.

Status possíveis deverão respeitar a documentação.

Adicionar histórico de mudanças.

## BLOCO DE TESTES — PAUTAS

Teste:

Criar pauta → salvar → abrir novamente → editar → atribuir → mover status → concluir.

Validar:

[ ] Dados persistiram  
[ ] Responsável recebeu atribuição  
[ ] Histórico foi criado  
[ ] Permissões respeitadas  
[ ] Prazo persistiu corretamente  
[ ] Filtros funcionam  
[ ] Busca funciona  
[ ] Kanban funciona  
[ ] Calendário funciona  

Teste concorrência:

Editor A altera pauta.

Editor B altera a mesma pauta.

O sistema deverá impedir perda silenciosa de dados.

---

# FASE 5 — APURAÇÃO E FONTES

Construir Workspace de Apuração.

Permitir:

- anotações;
- entrevistas;
- documentos;
- evidências;
- links;
- arquivos;
- áudios;
- vídeos;
- fotos;
- checklist factual.

Criar módulo de fontes.

Fonte poderá possuir:

- nome;
- telefone;
- e-mail;
- organização;
- cargo;
- observações;
- nível de confidencialidade;
- consentimento;
- histórico de contato.

Informações confidenciais deverão possuir proteção adicional.

## BLOCO DE TESTES — FONTES

[ ] Criar fonte  
[ ] Editar fonte  
[ ] Buscar fonte  
[ ] Associar fonte à pauta  
[ ] Marcar fonte confidencial  
[ ] Usuário sem acesso tenta abrir fonte confidencial  
[ ] Auditoria registra acesso sensível  
[ ] Telefone/e-mail tratados corretamente  
[ ] Exclusão respeita regras de retenção  

---

# FASE 6 — EDITOR DE MATÉRIAS

Esta é uma das áreas mais importantes do sistema.

Criar editor profissional de matérias.

Permitir:

- título;
- subtítulo;
- linha fina;
- slug;
- corpo;
- intertítulos;
- citações;
- listas;
- links;
- imagens;
- vídeos;
- embeds;
- tabelas;
- galerias;
- créditos;
- legendas;
- conteúdo relacionado.

Implementar autosave.

Mostrar estado:

Salvando...

Salvo.

Erro ao salvar.

Nunca permitir perda silenciosa de texto.

Implementar preview.

Implementar contagem de palavras.

Implementar histórico de versões.

## BLOCO DE TESTES — EDITOR

Teste extremo:

Digite uma matéria extensa.

Durante a digitação:

1. salve;
2. desligue conexão;
3. continue escrevendo;
4. reconecte;
5. sincronize.

Verifique:

[ ] Nenhuma informação foi perdida  
[ ] Autosave funcionou  
[ ] Conflitos foram detectados  
[ ] Histórico possui versões  
[ ] Preview está correto  
[ ] Links funcionam  
[ ] Imagens funcionam  
[ ] Vídeos funcionam  
[ ] Formatação persiste  
[ ] Undo/redo funciona quando aplicável  

---

# FASE 7 — VERSIONAMENTO E COLABORAÇÃO

Implementar:

- histórico completo;
- usuário responsável;
- data;
- alteração;
- diff quando possível;
- restauração de versão.

Adicionar colaboração entre jornalistas/editor.

Quando existir edição simultânea:

- indicar usuários presentes;
- detectar conflitos;
- impedir sobrescrita silenciosa.

## BLOCO DE TESTES — VERSIONAMENTO

Versão 1:

Título A.

Versão 2:

Título B.

Versão 3:

Título C.

Restaurar versão 1.

Resultado esperado:

Título A.

O histórico NÃO deverá ser apagado.

---

# FASE 8 — WORKFLOW EDITORIAL

Implementar fluxo:

PAUTA  
→ APURAÇÃO  
→ REDAÇÃO  
→ REVISÃO  
→ APROVAÇÃO  
→ AGENDAMENTO  
→ PUBLICAÇÃO  
→ ATUALIZAÇÃO/CORREÇÃO

As transições deverão possuir regras.

Exemplo:

Repórter não poderá publicar diretamente caso o workflow exija aprovação do editor.

## BLOCO DE TESTES — WORKFLOW

Tentar:

rascunho → publicado diretamente.

Resultado esperado:

BLOQUEADO quando a regra editorial exigir revisão.

Testar:

[ ] Enviar para revisão  
[ ] Aprovar  
[ ] Rejeitar  
[ ] Solicitar alteração  
[ ] Reenviar  
[ ] Agendar  
[ ] Cancelar agendamento  
[ ] Publicar  
[ ] Atualizar matéria  

---

# FASE 9 — BIBLIOTECA DE MÍDIA

Implementar:

- upload;
- drag and drop;
- múltiplos arquivos;
- preview;
- crop;
- alt text;
- legenda;
- crédito;
- autoria;
- direitos;
- data de expiração;
- busca;
- filtros.

Arquivos deverão ser validados.

Verificar:

- MIME;
- tamanho;
- extensão;
- permissões;
- segurança.

## BLOCO DE TESTES — MÍDIA

Testar:

JPG  
PNG  
WEBP  
MP4  
MP3  
PDF

Testar também:

arquivo inválido  
arquivo gigante  
arquivo corrompido  
extensão falsa

Resultado esperado:

Arquivos perigosos deverão ser rejeitados.

---

# FASE 10 — BREAKING NEWS E LIVE BLOG

Criar ferramentas especiais para coberturas urgentes.

Breaking News deverá possuir:

- prioridade;
- destaque;
- horário;
- atualização rápida;
- responsável;
- duração.

Live Blog:

- criar cobertura;
- adicionar updates;
- fixar update;
- editar;
- corrigir;
- ordenar;
- publicar em tempo real.

## BLOCO DE TESTES — TEMPO REAL

Abra duas sessões.

Sessão A publica atualização.

Sessão B deverá receber sem refresh manual.

Verificar:

[ ] ordem correta  
[ ] timestamp correto  
[ ] autor correto  
[ ] reconexão automática  
[ ] duplicação inexistente  

---

# FASE 11 — PUBLICAÇÃO E CMS

Implementar:

- preview;
- publicar agora;
- agendar;
- despublicar quando autorizado;
- atualizar;
- rollback;
- destinos.

Verificar publicação em:

- home;
- editoria;
- página da matéria;
- busca;
- APIs;
- feeds quando existentes.

## BLOCO DE TESTES — PUBLICAÇÃO

Criar matéria teste.

Agendar para horário futuro.

Verificar:

ANTES:

não publicada.

DEPOIS:

publicada automaticamente.

Verificar também:

[ ] timezone  
[ ] slug  
[ ] canonical  
[ ] autor  
[ ] editoria  
[ ] imagem  
[ ] conteúdo  
[ ] metadados  

---

# FASE 12 — SEO

Implementar checklist automático.

Validar:

- título SEO;
- description;
- slug;
- canonical;
- Open Graph;
- imagem;
- alt text;
- headings;
- structured data;
- indexação;
- links.

## BLOCO DE TESTES — SEO

Gerar página publicada.

Inspecionar HTML.

Verificar:

[ ] title  
[ ] meta description  
[ ] canonical  
[ ] OG:title  
[ ] OG:description  
[ ] OG:image  
[ ] Twitter metadata  
[ ] schema.org  
[ ] H1 único quando aplicável  
[ ] imagens com alt  

---

# FASE 13 — DISTRIBUIÇÃO

Implementar mecanismos de distribuição.

HOME:

- destaques;
- posições;
- vitrines;
- ordem;
- editorias.

SOCIAL:

- título específico;
- descrição;
- imagem;
- link.

PUSH:

- título;
- mensagem;
- destino;
- agendamento.

NEWSLETTER:

- seleção editorial;
- preview;
- agendamento;
- tracking.

## BLOCO DE TESTES — DISTRIBUIÇÃO

Publicar matéria.

Associar à home.

Verificar:

[ ] apareceu somente na área selecionada  
[ ] imagem correta  
[ ] link correto  
[ ] ordem correta  
[ ] nenhuma outra área foi alterada indevidamente  

---

# FASE 14 — BUSCA GLOBAL

Busca deverá encontrar:

- matérias;
- pautas;
- fontes autorizadas;
- mídia;
- usuários;
- documentos.

Filtros:

- período;
- autor;
- editoria;
- status;
- tags;
- tipo.

## BLOCO DE TESTES — BUSCA

Pesquisar palavra exata.

Pesquisar palavra parcial.

Pesquisar sem resultado.

Pesquisar com filtro.

Pesquisar caracteres especiais.

Pesquisar com milhares de registros.

Avaliar precisão e performance.

---

# FASE 15 — NOTIFICAÇÕES E TAREFAS

Criar central de notificações.

Eventos possíveis:

- pauta atribuída;
- prazo próximo;
- matéria devolvida;
- aprovação;
- publicação;
- comentário;
- breaking news;
- falha de publicação.

Criar tarefas com:

- responsável;
- prazo;
- prioridade;
- status;
- referência.

## BLOCO DE TESTES — NOTIFICAÇÕES

[ ] Notificação criada  
[ ] Usuário correto recebeu  
[ ] Outro usuário não recebeu  
[ ] Marcar como lida  
[ ] Marcar todas  
[ ] Link abre local correto  
[ ] Não gera duplicação  

---

# FASE 16 — ANALYTICS EDITORIAL

Criar dashboard analítico.

Quando disponível mostrar:

- pageviews;
- usuários;
- origem;
- tempo;
- CTR;
- desempenho por matéria;
- desempenho por autor;
- desempenho por editoria;
- período;
- evolução.

Não misturar analytics editorial com métricas sem contexto.

## BLOCO DE TESTES — ANALYTICS

Testar:

[ ] intervalo de data  
[ ] filtros  
[ ] matéria  
[ ] autor  
[ ] editoria  
[ ] dados vazios  
[ ] API indisponível  
[ ] exportação se implementada  

---

# FASE 17 — CORREÇÕES E DIREITO DE RESPOSTA

Implementar mecanismo de correções editoriais.

Registrar:

- matéria;
- correção;
- motivo;
- usuário;
- data;
- versão anterior.

Mudanças sensíveis deverão ser auditadas.

## BLOCO DE TESTES — CORREÇÕES

Publicar matéria.

Modificar informação.

Registrar correção.

Verificar:

[ ] alteração apareceu  
[ ] histórico foi preservado  
[ ] responsável registrado  
[ ] versão anterior disponível  
[ ] timestamp correto  

---

# FASE 18 — IA ASSISTIVA

IA nunca deverá publicar automaticamente conteúdo jornalístico sem aprovação humana.

Casos aceitáveis:

- sugestão de título;
- resumo;
- tags;
- SEO;
- transcrição;
- organização;
- classificação;
- sugestões.

Conteúdo gerado por IA deverá ser claramente tratado como sugestão.

## BLOCO DE TESTES — IA

Verificar:

[ ] IA não publica diretamente  
[ ] usuário pode aceitar  
[ ] usuário pode rejeitar  
[ ] usuário pode editar  
[ ] origem da sugestão é registrada quando necessário  
[ ] dados confidenciais não são enviados indevidamente  

---

# FASE 19 — PWA E OFFLINE

Priorizar uso em campo.

Permitir quando tecnicamente apropriado:

- abrir pautas recentes;
- escrever notas;
- escrever rascunhos;
- consultar agenda;
- anexar mídia;
- sincronizar posteriormente.

## BLOCO DE TESTES — OFFLINE

1. abra pauta;
2. fique offline;
3. altere conteúdo;
4. salve localmente;
5. volte online;
6. sincronize.

Resultado:

Nenhuma informação poderá ser perdida.

---

# FASE 20 — ACESSIBILIDADE

Seguir boas práticas WCAG.

Testar:

- navegação teclado;
- screen reader;
- labels;
- aria;
- contraste;
- focus;
- headings;
- formulários;
- mensagens de erro.

## BLOCO DE TESTES — ACESSIBILIDADE

Executar análise automatizada.

Depois realizar teste manual.

Verificar navegação usando apenas:

TAB  
SHIFT+TAB  
ENTER  
SPACE  
ESC  
SETAS

Nenhuma função crítica poderá depender exclusivamente do mouse.

---

# FASE 21 — API E BACKEND

APIs deverão possuir:

- autenticação;
- autorização;
- validação;
- schemas;
- status HTTP corretos;
- logs;
- erros padronizados;
- paginação;
- filtros;
- rate limiting quando necessário;
- idempotência onde necessária.

Padronize resposta de erro.

Exemplo conceitual:

{
  "error": {
    "code": "STORY_NOT_FOUND",
    "message": "Matéria não encontrada"
  }
}

Nunca exponha stack trace ao usuário.

## BLOCO DE TESTES — API

Para cada endpoint testar:

200/201 sucesso  
400 dado inválido  
401 não autenticado  
403 sem permissão  
404 inexistente  
409 conflito  
422 validação quando utilizado  
429 limite  
500 erro interno controlado

---

# FASE 22 — BANCO DE DADOS

Revisar entidades especificadas nos documentos.

Garantir relacionamentos coerentes entre:

usuários  
pautas  
matérias  
fontes  
mídias  
versões  
aprovações  
tarefas  
notificações  
publicações  
auditoria

Use migrations versionadas.

Nunca altere manualmente produção sem migration.

## BLOCO DE TESTES — BANCO

[ ] Migrations sobem do zero  
[ ] Rollback quando suportado  
[ ] Constraints funcionam  
[ ] Foreign keys funcionam  
[ ] Dados obrigatórios protegidos  
[ ] Índices adequados  
[ ] Seeds de desenvolvimento seguros  
[ ] Nenhum dado produtivo no seed  

---

# FASE 23 — SEGURANÇA

Faça revisão específica.

Testar:

- XSS;
- CSRF;
- SQL Injection;
- IDOR;
- upload malicioso;
- session fixation;
- brute force;
- permissões;
- secrets;
- headers;
- CORS.

Nunca confie em dados enviados pelo navegador.

## BLOCO DE TESTES — SEGURANÇA

Usuário A tenta acessar:

`/stories/ID_DO_USUARIO_B`

Se não possuir permissão:

403.

Teste alteração manual de ID.

Teste requisição direta pela API.

Teste payload malicioso.

Teste HTML/JS dentro dos campos.

Conteúdo não poderá executar scripts arbitrários.

---

# FASE 24 — LGPD E GOVERNANÇA

Verificar:

- dados pessoais;
- finalidade;
- acesso;
- retenção;
- exclusão;
- anonimização;
- auditoria;
- confidencialidade.

Acesso a informação sensível deverá ser limitado.

## BLOCO DE TESTES — LGPD

[ ] Usuário sem autorização não acessa dados pessoais restritos  
[ ] Acesso sensível gera auditoria  
[ ] Retenção segue regra definida  
[ ] Exportação não expõe dados indevidos  
[ ] Logs não exibem senhas/tokens  

---

# FASE 25 — OBSERVABILIDADE

Implementar:

- logs estruturados;
- monitoramento;
- métricas;
- tracing quando aplicável;
- alertas;
- erros de frontend;
- erros de backend.

Cada requisição importante deverá possuir identificação rastreável.

## BLOCO DE TESTES — OBSERVABILIDADE

Force erro proposital.

Verifique:

[ ] erro registrado  
[ ] endpoint identificado  
[ ] usuário/contexto seguro identificado  
[ ] trace/correlation ID disponível  
[ ] segredo não apareceu nos logs  

---

# FASE 26 — PERFORMANCE

Avaliar:

- bundle;
- imagens;
- cache;
- queries;
- API;
- banco;
- paginação;
- listas grandes.

Nunca carregar milhares de registros sem necessidade.

## BLOCO DE TESTES — PERFORMANCE

Testar:

100 registros  
1.000 registros  
10.000 registros quando pertinente.

Verificar:

- tempo de resposta;
- memória;
- queries;
- paginação;
- renderização.

Executar Lighthouse quando aplicável.

Avaliar:

Performance  
Accessibility  
Best Practices  
SEO

---

# FASE 27 — ADMINISTRAÇÃO

Construir painel administrativo.

Permitir conforme permissão:

- usuários;
- papéis;
- permissões;
- editorias;
- categorias;
- tags;
- configurações;
- integrações;
- workflows;
- feature flags;
- auditoria.

## BLOCO DE TESTES — ADMIN

Administrador altera permissão.

Usuário afetado deverá receber nova regra corretamente.

Usuário comum tenta acessar administração.

Resultado esperado:

403 ou redirecionamento seguro.

---

# FASE 28 — DEVOPS

Garantir ambientes:

DESENVOLVIMENTO

PREVIEW

HOMOLOGAÇÃO

PRODUÇÃO

Pipeline deverá executar automaticamente:

lint  
↓  
typecheck  
↓  
unit tests  
↓  
integration tests  
↓  
security checks  
↓  
build  
↓  
E2E  
↓  
deploy

Produção somente deverá receber versão aprovada.

---

# BLOCO GLOBAL DE TESTES AUTOMATIZADOS

Se os scripts ainda não existirem, configure-os.

O projeto deverá possuir comandos equivalentes a:

`npm run lint`

`npm run typecheck`

`npm run test`

`npm run test:unit`

`npm run test:integration`

`npm run test:e2e`

`npm run build`

Não crie scripts falsos apenas para retornarem sucesso.

---

# TESTE E2E PRINCIPAL — JORNALISTA

Criar automaticamente um cenário:

1. jornalista faz login;
2. recebe pauta;
3. abre pauta;
4. registra notas;
5. adiciona fonte;
6. cria matéria;
7. adiciona imagem;
8. salva;
9. envia para revisão.

Resultado:

Editor recebe matéria para revisão.

---

# TESTE E2E PRINCIPAL — EDITOR

1. editor faz login;
2. abre fila;
3. encontra matéria;
4. revisa;
5. solicita alteração.

Jornalista altera.

Editor aprova.

Editor agenda publicação.

Sistema publica.

Verificar página pública.

---

# TESTE E2E PRINCIPAL — CORREÇÃO

1. matéria publicada;
2. editor identifica erro;
3. abre matéria;
4. corrige;
5. registra motivo;
6. publica atualização.

Verificar:

[ ] matéria atualizada  
[ ] histórico preservado  
[ ] auditoria criada  

---

# TESTE E2E PRINCIPAL — PERMISSÕES

Criar:

REPÓRTER  
EDITOR  
ADMIN

Repórter tenta acessar administração.

Bloquear.

Repórter tenta publicar sem autorização.

Bloquear.

Editor revisa.

Permitir.

Admin gerencia permissões.

Permitir.

---

# TESTE DE REGRESSÃO

Ao terminar QUALQUER módulo, execute novamente os testes dos módulos anteriores relacionados.

Exemplo:

Ao modificar publicação:

execute também:

- matéria;
- workflow;
- SEO;
- home;
- permissões;
- analytics;
- versões.

Nunca considere que uma nova funcionalidade não afetará as antigas.

---

# TESTE DE RESPONSIVIDADE GLOBAL

Verifique todas as páginas principais em:

320×568  
375×667  
390×844  
768×1024  
1024×768  
1366×768  
1440×900  
1920×1080

Verificar:

- sidebar;
- tabelas;
- editor;
- formulários;
- modais;
- menus;
- filtros;
- dashboards.

---

# TESTE DE ESTADO VAZIO

Toda tela deverá funcionar com zero registros.

Exemplos:

Nenhuma pauta.

Nenhuma matéria.

Nenhuma mídia.

Nenhuma notificação.

Nenhuma fonte.

A interface não poderá aparecer quebrada.

---

# TESTE DE ERRO DE API

Simular:

500.

Timeout.

Offline.

401.

403.

404.

429.

O usuário deverá receber feedback adequado.

Nunca deixar loading infinito.

---

# TESTE DE DUPLO CLIQUE

Em ações críticas como:

Publicar  
Excluir  
Enviar  
Aprovar  
Criar usuário

simule múltiplos cliques rapidamente.

A operação não poderá ser executada duas vezes.

---

# TESTE DE RECUPERAÇÃO

Simule falha durante:

- edição;
- upload;
- publicação;
- sincronização.

O sistema deverá permitir recuperação segura.

---

# DEFINITION OF DONE

Uma funcionalidade somente poderá receber status CONCLUÍDA quando:

[ ] Implementada  
[ ] Tipada  
[ ] Validada  
[ ] Integrada ao backend  
[ ] Permissões aplicadas  
[ ] Responsiva  
[ ] Acessível  
[ ] Loading implementado  
[ ] Empty state implementado  
[ ] Erros tratados  
[ ] Logs implementados quando necessários  
[ ] Testes unitários passaram  
[ ] Testes integração passaram  
[ ] Testes E2E relacionados passaram  
[ ] Build passou  
[ ] Lint passou  
[ ] Typecheck passou  
[ ] Documentação atualizada  
[ ] Requirements Matrix atualizada  
[ ] Nenhuma regressão identificada  

---

# FORMATO OBRIGATÓRIO DO RELATÓRIO DE CADA ETAPA

Ao terminar uma fase, responda exatamente usando uma estrutura equivalente a:

## FASE X — NOME

### Implementado
Descrever objetivamente.

### Arquivos criados
Listar.

### Arquivos modificados
Listar.

### Banco
Migrations/tabelas alteradas.

### APIs
Endpoints criados ou modificados.

### Segurança
Controles aplicados.

### Testes executados
Informar cada teste.

### Resultado

PASSOU:
- lint
- typecheck
- unit
- integration
- E2E
- build

FALHOU:
- informar se existir.

### Pendências
Listar somente pendências reais.

### Status da fase

APROVADA

ou

BLOQUEADA.

Nunca declare APROVADA se algum teste obrigatório estiver falhando.

---

# REGRAS DE CÓDIGO

Não utilizar:

- `any` indiscriminadamente;
- código duplicado;
- componentes monolíticos;
- senhas hardcoded;
- chaves no frontend;
- consultas SQL inseguras;
- APIs sem autenticação quando necessárias;
- validação somente no frontend;
- lógica crítica somente no cliente;
- mocks permanentes em funcionalidades produtivas;
- comentários TODO abandonados.

---

# REGRA DE BANCO

Nunca delete dados automaticamente apenas para corrigir migration.

Nunca recrie banco produtivo.

Nunca execute alterações destrutivas sem avaliar impacto.

Sempre preferir migrations seguras e reversíveis quando possível.

---

# REGRA DE SEGREDOS

Nunca escrever no código:

API_KEY

DATABASE_PASSWORD

JWT_SECRET

SMTP_PASSWORD

ACCESS_TOKEN

Usar variáveis de ambiente ou Secret Manager.

---

# REGRA DE LOG

Nunca registrar:

senha;

token;

cookie de autenticação;

documentos confidenciais;

dados sensíveis completos.

---

# REGRA EDITORIAL

Como este é um sistema jornalístico, integridade editorial possui prioridade.

Nunca permitir que:

- uma edição sobrescreva silenciosamente outra;
- uma matéria desapareça sem histórico;
- uma correção apague a versão anterior;
- um jornalista obtenha permissão que não possui;
- uma IA publique sem controle editorial;
- uma fonte confidencial fique visível para usuários não autorizados;
- um conteúdo agendado seja publicado na hora errada;
- uma publicação duplicada aconteça por duplo clique.

---

# CHECKPOINT FINAL

Depois que TODAS as fases forem concluídas execute uma bateria final completa.

Executar:

LINT  
TYPECHECK  
UNIT TESTS  
INTEGRATION TESTS  
E2E  
SECURITY TESTS  
ACCESSIBILITY TESTS  
RESPONSIVE TESTS  
PERFORMANCE TESTS  
BUILD  
DATABASE MIGRATION TEST  
REGRESSION TEST

Todos deverão passar.

---

# AUDITORIA FINAL DOS DOCUMENTOS

Quando o sistema estiver concluído:

Leia novamente TODOS os documentos fornecidos.

Compare linha por linha e requisito por requisito com:

`docs/REQUIREMENTS_MATRIX.md`

Classifique cada item como:

IMPLEMENTADO

TESTADO

NÃO IMPLEMENTADO

PARCIAL

NÃO APLICÁVEL

Não considere o projeto terminado enquanto existir requisito obrigatório classificado como:

NÃO IMPLEMENTADO

ou

PARCIAL.

---

# RELATÓRIO FINAL

Gerar:

`docs/FINAL_IMPLEMENTATION_REPORT.md`

Deverá conter:

- arquitetura final;
- tecnologias;
- módulos;
- banco;
- APIs;
- permissões;
- segurança;
- testes;
- cobertura;
- integrações;
- limitações;
- instruções de deploy;
- rollback;
- backup;
- variáveis necessárias;
- usuários/perfis;
- funcionalidades pendentes, se houver.

---

# ORDEM DE PRIORIDADE

Caso exista conflito durante o desenvolvimento, siga:

1. Segurança e integridade dos dados
2. Requisitos dos documentos
3. Workflow editorial
4. Permissões
5. Preservação de conteúdo
6. Funcionalidade
7. UX
8. Performance
9. Estética
10. Recursos opcionais

---

# INSTRUÇÃO FINAL PARA INICIAR

Agora:

1. NÃO implemente nenhuma funcionalidade ainda.
2. Leia integralmente todos os documentos anexados.
3. Analise todo o projeto existente.
4. Faça a FASE 0.
5. Crie `REQUIREMENTS_MATRIX.md`.
6. Crie `IMPLEMENTATION_STATUS.md`.
7. Identifique funcionalidades já existentes.
8. Identifique funcionalidades faltantes.
9. Identifique riscos.
10. Execute os testes atuais.
11. Apresente o relatório da FASE 0.

Depois disso, inicie a implementação seguindo rigorosamente as fases deste prompt.

Nunca pule os blocos de testes.

Nunca declare uma funcionalidade pronta sem testá-la.

Nunca modifique módulos fora do escopo sem necessidade comprovada.

O objetivo não é apenas fazer a aplicação funcionar.

O objetivo é entregar uma **plataforma jornalística profissional, segura, auditável, responsiva, escalável, testada e pronta para operação real de uma redação**.