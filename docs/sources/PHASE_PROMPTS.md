# PROMPTS SEPARADOS POR ETAPAS — PLATAFORMA JORNALÍSTICA

## COMO UTILIZAR

Execute os prompts **na ordem abaixo**.

Não envie todos de uma vez para o agente de programação.

Fluxo recomendado:

PROMPT 01  
↓  
IA implementa  
↓  
IA testa  
↓  
Você verifica  
↓  
PROMPT 02  
↓  
e assim sucessivamente.

Mantenha junto ao projeto:

- documento de especificação;
- arquitetura definida;
- requirements matrix;
- implementation status;
- documentação criada durante o desenvolvimento.

---

# PROMPT 01 — AUDITORIA COMPLETA DO PROJETO

Atue como Arquiteto de Software Sênior e Tech Lead.

Leia integralmente todos os documentos de especificação anexados ao projeto.

Neste momento NÃO implemente novas funcionalidades.

Sua tarefa é compreender completamente:

- arquitetura existente;
- requisitos;
- funcionalidades;
- banco;
- APIs;
- front-end;
- permissões;
- integrações;
- workflow editorial;
- testes;
- segurança.

Analise todo o repositório.

Inspecione:

- package.json;
- arquivos de configuração;
- src;
- app;
- components;
- features;
- services;
- APIs;
- banco;
- schemas;
- migrations;
- autenticação;
- variáveis de ambiente;
- testes;
- Docker;
- CI/CD.

Crie:

`docs/IMPLEMENTATION_STATUS.md`

Utilize os status:

- NÃO INICIADO
- EM DESENVOLVIMENTO
- IMPLEMENTADO
- TESTADO
- APROVADO
- BLOQUEADO

Crie também:

`docs/REQUIREMENTS_MATRIX.md`

Formato:

| ID | Requisito | Origem | Módulo | Implementação | Teste | Status |
|---|---|---|---|---|---|---|

Cada requisito identificado nos documentos deverá aparecer nessa matriz.

Crie:

`docs/ARCHITECTURE_CURRENT.md`

Documente a arquitetura existente.

Crie:

`docs/GAPS.md`

Liste tudo que:

- está faltando;
- está parcialmente implementado;
- precisa ser corrigido;
- apresenta risco técnico.

Execute:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Se algum comando não existir, registre isso.

NÃO crie um script falso para fazê-lo passar.

## TESTES OBRIGATÓRIOS

Verifique:

- projeto instala;
- aplicação inicia;
- build funciona;
- TypeScript funciona;
- lint funciona;
- banco conecta;
- migrations são identificáveis;
- secrets não estão hardcoded;
- testes existentes são executáveis.

## ENTREGA

Apresente:

1. arquitetura encontrada;
2. stack;
3. módulos existentes;
4. funcionalidades existentes;
5. funcionalidades faltantes;
6. problemas;
7. riscos;
8. testes executados;
9. resultado de cada teste;
10. plano recomendado.

NÃO avance para desenvolvimento nesta etapa.

---

# PROMPT 02 — FUNDAÇÃO DA ARQUITETURA FRONT-END

Agora implemente ou organize a arquitetura base do front-end seguindo os documentos.

Antes de alterar arquivos existentes, entenda suas dependências.

Priorize arquitetura modular.

Estrutura conceitual esperada:

```text
src/
  features/
  components/
  services/
  hooks/
  schemas/
  types/
  lib/
  config/
  utils/
  tests/
```

Features principais:

```text
features/
  dashboard/
  assignments/
  stories/
  sources/
  media/
  workflow/
  publishing/
  notifications/
  analytics/
  admin/
```

Implemente:

- layout principal;
- sidebar;
- header;
- navegação;
- breadcrumbs;
- content area;
- menu do usuário;
- estrutura mobile.

Não implemente ainda funcionalidades completas dos módulos.

Crie apenas a fundação correta.

Evite:

- componentes gigantes;
- lógica de API misturada com UI;
- tipos duplicados;
- CSS duplicado;
- dependências desnecessárias.

## TESTES

Execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Teste resoluções:

```text
320px
375px
390px
768px
1024px
1366px
1440px
1920px
```

Verifique:

- sem overflow horizontal;
- sidebar funciona;
- menu mobile funciona;
- navegação funciona;
- rotas funcionam;
- componentes não quebram.

Somente finalize quando tudo estiver funcionando.

Atualize:

`IMPLEMENTATION_STATUS.md`

e

`REQUIREMENTS_MATRIX.md`.

---

# PROMPT 03 — DESIGN SYSTEM

Implemente o Design System da aplicação jornalística.

Não altere funcionalidades fora deste escopo.

Crie componentes reutilizáveis para:

- Button;
- IconButton;
- Input;
- Textarea;
- Select;
- MultiSelect;
- Checkbox;
- Radio;
- Switch;
- DatePicker;
- TimePicker;
- Badge;
- Avatar;
- Card;
- Table;
- Pagination;
- Tabs;
- Accordion;
- Modal;
- Drawer;
- Dropdown;
- Tooltip;
- Popover;
- Toast;
- Alert;
- Skeleton;
- Spinner;
- EmptyState;
- ErrorState;
- ConfirmDialog.

Defina padrões de:

- spacing;
- radius;
- tipografia;
- containers;
- grids;
- breakpoints;
- estados;
- feedback visual.

Todos deverão possuir:

- disabled;
- loading quando aplicável;
- hover;
- focus;
- erro;
- acessibilidade.

## TESTES

Teste cada componente isoladamente.

Testar:

- teclado;
- TAB;
- SHIFT+TAB;
- ENTER;
- SPACE;
- ESC;
- foco;
- labels;
- aria.

Execute testes automatizados quando existentes.

Execute:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Não finalize com warning crítico ou componente quebrado.

---

# PROMPT 04 — AUTENTICAÇÃO, USUÁRIOS E RBAC

Implemente autenticação profissional.

Funcionalidades:

- login;
- logout;
- recuperação de senha;
- alteração de senha;
- sessão;
- sessão expirada;
- proteção de rotas;
- gerenciamento de usuário.

Perfis previstos:

- jornalista;
- repórter;
- editor;
- editor-chefe;
- foto/vídeo;
- social media;
- jurídico;
- administrador.

Implemente RBAC real.

As permissões deverão ser verificadas no BACKEND.

Não confie apenas em:

```text
if role === admin
```

no navegador.

Crie middleware ou mecanismo equivalente de autorização.

Considere permissões como:

- story.create;
- story.edit;
- story.review;
- story.publish;
- story.delete;
- assignment.create;
- assignment.assign;
- source.view;
- source.confidential.view;
- user.manage;
- settings.manage.

## TESTES

Criar usuários de teste:

REPÓRTER

EDITOR

ADMINISTRADOR

Teste:

Repórter tenta entrar no admin.

Esperado:

```text
403
```

Repórter tenta publicar sem permissão.

Esperado:

```text
403
```

Editor revisa matéria.

Esperado:

```text
Permitido
```

Administrador gerencia usuários.

Esperado:

```text
Permitido
```

Teste ainda:

- sessão expirada;
- token inválido;
- usuário inexistente;
- senha incorreta;
- acesso direto por URL;
- acesso direto pela API.

Execute suíte completa.

---

# PROMPT 05 — DASHBOARD DA REDAÇÃO

Implemente o Dashboard.

Dashboard do jornalista:

- minhas pautas;
- minhas matérias;
- deadlines;
- tarefas;
- notificações;
- agenda;
- matérias devolvidas;
- publicações recentes.

Dashboard do editor:

- fila editorial;
- matérias aguardando revisão;
- matérias aguardando aprovação;
- pautas atrasadas;
- jornalistas;
- deadlines;
- breaking news;
- matérias agendadas.

Dashboard do administrador:

- resumo operacional;
- usuários;
- erros importantes;
- saúde das integrações.

Não exiba informações que o usuário não possui permissão para visualizar.

## ESTADOS OBRIGATÓRIOS

Cada widget deverá possuir:

- loading;
- vazio;
- sucesso;
- erro.

## TESTES

Simule:

- API normal;
- API lenta;
- API 500;
- zero registros;
- 1 registro;
- centenas de registros.

Teste:

- filtros;
- navegação;
- links;
- responsividade;
- permissões.

Execute testes anteriores novamente para identificar regressões.

---

# PROMPT 06 — MÓDULO DE PAUTAS

Implemente o módulo completo de pautas.

Campos:

- título;
- descrição;
- briefing;
- editoria;
- prioridade;
- responsável;
- editor;
- prazo;
- localização;
- tags;
- fontes;
- anexos;
- observações;
- status.

Permitir:

- criar;
- editar;
- duplicar quando permitido;
- arquivar;
- atribuir;
- alterar status;
- filtrar;
- buscar.

Visualizações:

- lista;
- tabela;
- kanban;
- calendário.

Cada alteração importante deverá gerar histórico.

## TESTE FUNCIONAL

Execute:

```text
Criar pauta
↓
Atribuir jornalista
↓
Editar
↓
Adicionar prazo
↓
Alterar prioridade
↓
Mover no Kanban
↓
Abrir novamente
```

Verifique persistência de todos os dados.

## TESTE DE CONCORRÊNCIA

Abra a mesma pauta com dois usuários.

Usuário A altera.

Usuário B altera versão antiga.

O sistema não poderá sobrescrever silenciosamente a alteração do usuário A.

Implemente tratamento apropriado de conflito.

---

# PROMPT 07 — APURAÇÃO E FONTES

Implemente o Workspace de Apuração.

Uma pauta poderá possuir:

- notas;
- entrevistas;
- documentos;
- links;
- evidências;
- áudios;
- vídeos;
- fotografias;
- anexos;
- checklist factual.

Crie módulo independente de fontes.

Campos da fonte:

- nome;
- organização;
- cargo;
- telefone;
- e-mail;
- observações;
- relacionamento;
- consentimento;
- confidencialidade.

Classificações:

- pública;
- interna;
- confidencial;
- protegida.

Proteja fontes confidenciais com RBAC.

Registre auditoria de acesso quando necessário.

## TESTES

Criar fonte.

Associar à pauta.

Marcar confidencial.

Usuário comum tenta visualizar.

Esperado:

```text
403
```

Editor autorizado visualiza.

Esperado:

```text
200
```

Verifique auditoria.

---

# PROMPT 08 — EDITOR PROFISSIONAL DE MATÉRIAS

Implemente o principal editor da plataforma.

Campos:

- título;
- subtítulo;
- linha fina;
- slug;
- editoria;
- tags;
- corpo;
- autor;
- coautores;
- imagem principal;
- SEO.

Editor deve permitir:

- texto;
- headings;
- negrito;
- itálico;
- listas;
- links;
- citações;
- tabelas;
- imagens;
- vídeos;
- embeds;
- galerias;
- separadores.

Adicionar:

- autosave;
- indicação "Salvando...";
- indicação "Salvo";
- indicação de erro;
- preview;
- contador de palavras;
- histórico de salvamento.

Não permita perda silenciosa de conteúdo.

## TESTE CRÍTICO

Escreva matéria extensa.

Desconecte internet.

Continue escrevendo.

Reconecte.

Verifique:

- conteúdo continua disponível;
- dados sincronizam;
- conflitos são tratados;
- conteúdo não duplica.

## TESTE DE FORMATAÇÃO

Criar matéria contendo:

- H2;
- lista;
- citação;
- tabela;
- imagem;
- vídeo;
- link.

Salvar.

Fechar.

Abrir novamente.

Tudo deverá permanecer igual.

---

# PROMPT 09 — VERSIONAMENTO E COLABORAÇÃO

Implemente versionamento de matérias.

Cada versão deverá possuir:

- número;
- data;
- usuário;
- conteúdo;
- alterações;
- motivo quando pertinente.

Permitir:

- visualizar versão;
- comparar versões;
- restaurar versão.

Nunca apague histórico ao restaurar.

Implemente proteção contra edição simultânea.

Mostre quando outro usuário estiver editando.

## TESTE

Criar:

Versão 1: `Título A`

Versão 2: `Título B`

Versão 3: `Título C`

Restaurar versão 1.

Resultado:

`Título A`

Histórico deverá continuar contendo as versões 1, 2 e 3.

---

# PROMPT 10 — WORKFLOW EDITORIAL

Implemente workflow editorial completo.

Fluxo base:

```text
PAUTA
↓
APURAÇÃO
↓
REDAÇÃO
↓
REVISÃO
↓
ALTERAÇÕES
↓
APROVAÇÃO
↓
AGENDAMENTO
↓
PUBLICAÇÃO
```

Status deverão seguir documentação oficial.

Implemente regras de transição.

Exemplo:

Repórter não pode transformar diretamente:

```text
RASCUNHO → PUBLICADO
```

quando a redação exige aprovação.

Implemente:

- enviar para revisão;
- devolver;
- comentar;
- solicitar ajustes;
- aprovar;
- rejeitar;
- agendar;
- publicar.

## TESTES

Execute cenário completo:

Repórter cria matéria.

Repórter envia para editor.

Editor devolve.

Repórter corrige.

Editor aprova.

Editor agenda.

Sistema publica.

Verifique cada status no banco.

---

# PROMPT 11 — BIBLIOTECA DE MÍDIA

Implemente biblioteca profissional de mídia.

Tipos:

- imagem;
- áudio;
- vídeo;
- documento.

Funcionalidades:

- upload;
- upload múltiplo;
- drag-and-drop;
- preview;
- busca;
- filtros;
- crop quando aplicável;
- legenda;
- crédito;
- alt text;
- autor;
- direitos;
- informações técnicas.

Valide arquivo no backend.

Verifique:

- MIME;
- extensão;
- tamanho;
- conteúdo;
- permissões.

## TESTES

Testar:

```text
.jpg
.png
.webp
.mp4
.mp3
.pdf
```

Depois testar:

- executável renomeado para JPG;
- arquivo corrompido;
- arquivo muito grande;
- MIME incorreto;
- upload cancelado.

Arquivos perigosos deverão ser bloqueados.

---

# PROMPT 12 — BREAKING NEWS E LIVE BLOG

Implemente Breaking News.

Campos:

- título;
- texto;
- prioridade;
- horário;
- duração;
- responsável;
- destino.

Implemente Live Blog.

Funcionalidades:

- criar cobertura;
- publicar atualização;
- editar;
- corrigir;
- fixar atualização;
- adicionar mídia;
- ordenar;
- atualizar em tempo real.

Utilize tecnologia realtime adequada à arquitetura existente.

## TESTE REALTIME

Abra dois navegadores.

Browser A publica atualização.

Browser B deverá receber automaticamente.

Sem refresh.

Teste:

- reconexão;
- internet interrompida;
- atualização duplicada;
- ordenação;
- timestamp;
- autoria.

---

# PROMPT 13 — PUBLICAÇÃO E AGENDAMENTO

Implemente o sistema de publicação.

Funcionalidades:

- preview;
- publicar agora;
- agendar;
- cancelar agendamento;
- atualizar;
- despublicar quando permitido;
- rollback;
- histórico.

A publicação deverá respeitar:

- timezone;
- editoria;
- slug;
- autor;
- canonical;
- SEO;
- mídia;
- permissões.

## TESTE DE AGENDAMENTO

Criar matéria.

Agendar para alguns minutos no futuro.

Antes:

```text
Não publicada
```

Após horário:

```text
Publicada
```

Verifique que não houve publicação duplicada.

---

# PROMPT 14 — SEO E METADADOS

Implemente módulo SEO.

Campos:

- SEO title;
- description;
- slug;
- canonical;
- Open Graph title;
- Open Graph description;
- Open Graph image.

Gerar quando apropriado:

- schema.org;
- Article;
- NewsArticle;
- breadcrumbs estruturados.

Criar checklist SEO.

Alertar:

- título excessivo;
- description ausente;
- slug ruim;
- imagem sem alt;
- ausência de imagem social;
- H1 inadequado.

## TESTES

Inspecione HTML final.

Verifique:

```text
<title>
meta description
canonical
og:title
og:description
og:image
twitter metadata
structured data
```

Executar auditoria Lighthouse quando possível.

---

# PROMPT 15 — HOME, EDITORIAS E DISTRIBUIÇÃO

Implemente gerenciamento editorial da Home.

Permitir:

- selecionar matérias;
- ordenar;
- destacar;
- remover;
- definir posições;
- separar por editoria.

Uma matéria colocada em uma área não poderá aparecer em outra sem configuração explícita.

Implementar distribuição para:

- Home;
- editorias;
- social;
- push;
- newsletter quando previsto.

## TESTE

Colocar matéria na área Economia.

Verificar:

- aparece em Economia;
- não aparece automaticamente em Mundo;
- não altera outras áreas.

Colocar matéria na Home.

Verificar posição e ordem.

---

# PROMPT 16 — BUSCA GLOBAL

Implemente busca global.

Buscar:

- matérias;
- pautas;
- fontes autorizadas;
- mídia;
- usuários quando permitido;
- documentos.

Filtros:

- data;
- autor;
- editoria;
- status;
- tipo;
- tags.

Proteja resultados por permissão.

Uma busca nunca poderá revelar o nome ou conteúdo de uma fonte confidencial para usuário sem autorização.

## TESTES

Teste:

- palavra completa;
- palavra parcial;
- acentos;
- caracteres especiais;
- nenhuma ocorrência;
- milhares de registros;
- filtros combinados.

Avalie performance.

---

# PROMPT 17 — NOTIFICAÇÕES E TAREFAS

Implemente central de notificações.

Eventos:

- pauta atribuída;
- prazo próximo;
- matéria devolvida;
- comentário;
- aprovação;
- publicação;
- erro de publicação;
- breaking news.

Funcionalidades:

- marcar como lida;
- marcar todas;
- abrir origem;
- filtro;
- paginação.

Criar sistema de tarefas.

Campos:

- título;
- responsável;
- prazo;
- prioridade;
- status;
- referência.

## TESTE

Pauta atribuída ao jornalista A.

Apenas jornalista A deverá receber a notificação correspondente.

Não gerar notificações duplicadas.

---

# PROMPT 18 — CORREÇÕES, DIREITO DE RESPOSTA E AUDITORIA

Implemente sistema formal de correções.

Registrar:

- matéria;
- versão anterior;
- alteração;
- motivo;
- autor da correção;
- data.

Implementar direito de resposta quando definido pela documentação.

Criar audit log.

Auditar ações críticas:

- login administrativo;
- publicação;
- exclusão;
- alteração de permissão;
- visualização sensível;
- correção;
- mudanças de configuração.

Auditoria não deverá ser editável por usuário comum.

## TESTE

Publique matéria.

Faça correção.

Verifique:

- nova versão publicada;
- antiga preservada;
- auditoria criada;
- usuário registrado;
- data registrada.

---

# PROMPT 19 — ANALYTICS EDITORIAL

Implemente painel de desempenho.

Métricas quando disponíveis:

- pageviews;
- usuários;
- sessões;
- origem;
- CTR;
- tempo;
- matéria;
- autor;
- editoria.

Filtros:

- período;
- matéria;
- autor;
- editoria.

Nunca invente dados.

Se integração estiver indisponível, apresente estado adequado.

## TESTES

Simule:

- dados normais;
- zero dados;
- API fora;
- grande volume;
- intervalo inválido.

---

# PROMPT 20 — IA ASSISTIVA

Implemente recursos de IA somente como assistência editorial.

Possíveis funções:

- sugestão de título;
- linha fina;
- resumo;
- tags;
- SEO;
- transcrição;
- revisão gramatical;
- classificação.

A IA NÃO poderá publicar matéria automaticamente.

Toda saída será uma sugestão.

Usuário deverá:

```text
ACEITAR
EDITAR
REJEITAR
```

Proteja informações confidenciais.

Não envie dados sensíveis para provedores externos sem autorização.

## TESTES

Peça à IA título.

Aceitar.

Verifique aplicação.

Gerar outro.

Rejeitar.

Nada deverá ser modificado.

Teste usuário tentando fazer IA publicar diretamente.

Bloquear.

---

# PROMPT 21 — PWA, MOBILE E OFFLINE

Torne a aplicação apropriada para jornalistas em campo.

Priorize mobile.

Quando tecnicamente possível permitir offline:

- pautas recentes;
- notas;
- rascunhos;
- agenda;
- tarefas.

Crie mecanismo seguro de sincronização.

## TESTE

Abra pauta.

Desligue internet.

Adicione nota.

Edite rascunho.

Reconecte.

Verifique sincronização.

Nenhum dado deverá ser perdido.

Teste conflito entre alteração offline e alteração feita por outro usuário.

---

# PROMPT 22 — ACESSIBILIDADE

Faça auditoria completa de acessibilidade.

Seguir boas práticas WCAG.

Corrigir:

- labels;
- aria;
- contraste;
- foco;
- headings;
- modais;
- formulários;
- tabelas;
- mensagens de erro.

Teste tudo apenas com teclado.

Use:

```text
TAB
SHIFT+TAB
ENTER
SPACE
ESC
SETAS
```

Nenhuma funcionalidade essencial deverá exigir mouse.

Execute ferramenta automática de acessibilidade quando disponível.

Documente resultados.

---

# PROMPT 23 — API E PADRONIZAÇÃO DO BACKEND

Audite e padronize APIs.

Todos endpoints deverão possuir quando aplicável:

- autenticação;
- autorização;
- validação;
- schema;
- status HTTP;
- paginação;
- filtros;
- erros;
- logs;
- idempotência.

Padronize erro.

Exemplo:

```json
{
  "error": {
    "code": "STORY_NOT_FOUND",
    "message": "Matéria não encontrada"
  }
}
```

Nunca envie stack trace para o cliente.

## TESTES DE API

Para cada endpoint relevante teste:

```text
200
201
400
401
403
404
409
422
429
500
```

Valide corpo da resposta.

---

# PROMPT 24 — BANCO DE DADOS

Audite todo o schema.

Entidades principais poderão incluir:

- User;
- Role;
- Permission;
- Assignment;
- Story;
- StoryVersion;
- Source;
- Media;
- Task;
- Notification;
- Approval;
- Publication;
- AuditLog.

Revise:

- relacionamentos;
- foreign keys;
- índices;
- unique constraints;
- cascade;
- timestamps.

Crie migrations adequadas.

Não destrua dados existentes desnecessariamente.

## TESTE DE BANCO

Suba banco vazio.

Execute todas migrations.

Execute seeds de desenvolvimento.

Inicie aplicação.

Execute testes.

Se suportado, teste rollback.

Nenhuma migration poderá depender de alteração manual.

---

# PROMPT 25 — SEGURANÇA

Execute auditoria específica de segurança.

Verifique:

- XSS;
- CSRF;
- SQL Injection;
- IDOR;
- SSRF quando aplicável;
- CORS;
- rate limit;
- brute force;
- sessão;
- tokens;
- upload;
- headers;
- permissions.

Teste manipulação manual de IDs.

Usuário A tenta acessar recurso privado de B.

Esperado:

```text
403
```

Teste payload:

```html
<script>alert(1)</script>
```

Ele não poderá ser executado.

Teste SQL malicioso.

Teste arquivo malicioso.

Corrija vulnerabilidades encontradas.

---

# PROMPT 26 — LGPD E DADOS SENSÍVEIS

Faça auditoria LGPD.

Classifique dados:

- público;
- interno;
- pessoal;
- sensível;
- confidencial.

Verifique:

- finalidade;
- retenção;
- acesso;
- exclusão;
- anonimização;
- exportação;
- auditoria.

Garanta que logs não contenham:

- senha;
- token;
- cookie;
- segredo.

Revise especialmente módulo de fontes.

---

# PROMPT 27 — OBSERVABILIDADE E TRATAMENTO DE ERROS

Implemente observabilidade.

Adicionar:

- logs estruturados;
- error tracking;
- correlation/request ID;
- métricas;
- health check;
- monitoring.

Tratamento do frontend:

- erro de API;
- timeout;
- offline;
- 401;
- 403;
- 404;
- 429;
- 500.

Nunca deixar loading infinito.

## TESTE

Force erro 500.

Verifique:

- usuário recebeu mensagem;
- sistema não quebrou;
- log foi criado;
- request ID existe;
- senha/token não aparece.

---

# PROMPT 28 — PERFORMANCE

Faça auditoria completa de performance.

Frontend:

- bundle;
- dynamic imports;
- imagens;
- cache;
- renderização;
- listas.

Backend:

- queries;
- N+1;
- índices;
- cache;
- paginação.

Teste volumes:

```text
100 registros
1.000 registros
10.000 registros
```

Não carregue milhares de itens de uma vez na interface.

Executar Lighthouse.

Registrar antes e depois das otimizações.

---

# PROMPT 29 — PAINEL ADMINISTRATIVO

Implemente módulo Admin.

Permitir conforme permissão:

- usuários;
- roles;
- permissões;
- editorias;
- categorias;
- tags;
- workflows;
- integrações;
- configurações;
- feature flags;
- auditoria.

Ações destrutivas deverão possuir confirmação.

Mudança de permissões deverá ser auditada.

## TESTE

Usuário comum:

```text
/admin
```

Esperado:

```text
403
```

Admin:

Permitido.

Teste alteração de role e atualização efetiva das permissões.

---

# PROMPT 30 — TESTES E2E COMPLETOS

Agora NÃO implemente novas funcionalidades.

Concentre-se em testes E2E.

Criar cenário 1:

```text
Login jornalista
↓
Recebe pauta
↓
Abre pauta
↓
Adiciona fonte
↓
Escreve matéria
↓
Adiciona mídia
↓
Envia para revisão
```

Cenário 2:

```text
Login editor
↓
Abre fila
↓
Revisa matéria
↓
Solicita alteração
↓
Repórter corrige
↓
Editor aprova
↓
Agenda
↓
Publicação ocorre
```

Cenário 3:

```text
Matéria publicada
↓
Correção
↓
Nova versão
↓
Histórico mantido
```

Cenário 4:

```text
Repórter tenta acessar admin
↓
403
```

Cenário 5:

```text
Usuário tenta publicar duas vezes rapidamente
↓
Apenas uma publicação
```

Todos deverão ser automatizados quando tecnicamente possível.

---

# PROMPT 31 — TESTES DE RESPONSIVIDADE

Não implemente novas features.

Faça auditoria visual completa.

Testar:

```text
320×568
375×667
390×844
768×1024
1024×768
1366×768
1440×900
1920×1080
```

Percorra:

- login;
- dashboard;
- pauta;
- editor;
- mídia;
- fontes;
- workflow;
- busca;
- admin.

Verifique:

- overflow;
- texto cortado;
- modal;
- tabela;
- sidebar;
- dropdown;
- editor;
- botões.

Corrija tudo encontrado.

Depois execute testes anteriores.

---

# PROMPT 32 — TESTE DE REGRESSÃO TOTAL

Execute regressão completa.

Não implemente novos recursos.

Rode:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

Execute testes:

- autenticação;
- RBAC;
- pauta;
- fontes;
- matéria;
- mídia;
- workflow;
- publicação;
- SEO;
- busca;
- notificações;
- admin.

Qualquer teste quebrado deverá ser corrigido.

Não marque como concluído enquanto houver teste obrigatório falhando.

---

# PROMPT 33 — AUDITORIA FINAL CONTRA O DOCUMENTO

Leia novamente TODOS os documentos de especificação fornecidos no início do projeto.

Abra:

`docs/REQUIREMENTS_MATRIX.md`

Compare requisito por requisito com a aplicação.

Classifique cada item:

```text
IMPLEMENTADO
TESTADO
PARCIAL
NÃO IMPLEMENTADO
NÃO APLICÁVEL
```

Todo item PARCIAL ou NÃO IMPLEMENTADO deverá possuir justificativa.

Para requisito obrigatório, implemente o que estiver faltando.

Execute novamente testes relacionados.

Não considere a aplicação concluída até terminar essa auditoria.

---

# PROMPT 34 — RELATÓRIO FINAL DO SISTEMA

Crie:

`docs/FINAL_IMPLEMENTATION_REPORT.md`

Documente:

## Visão geral

Descrição final da aplicação.

## Arquitetura

Frontend.

Backend.

Banco.

Infraestrutura.

## Tecnologias

Liste versões utilizadas.

## Módulos

Liste todos.

## Perfis

Descreva permissões.

## APIs

Liste principais endpoints.

## Banco

Liste entidades principais.

## Segurança

Descreva controles.

## Testes

Inclua:

- unitários;
- integração;
- E2E;
- segurança;
- acessibilidade;
- performance.

## Deploy

Explique como publicar.

## Variáveis

Liste variáveis necessárias SEM valores secretos.

## Backup

Explique estratégia.

## Rollback

Explique estratégia.

## Monitoramento

Explique observabilidade.

## Pendências

Declare explicitamente qualquer pendência real.

Não esconda limitações.

---

# PROMPT 35 — VALIDAÇÃO FINAL DE PRODUÇÃO

Faça uma última validação pensando como:

- jornalista;
- editor;
- administrador;
- QA;
- hacker;
- usuário mobile;
- DevOps.

Não implemente novas funcionalidades opcionais.

Teste o sistema como se a redação fosse começar a utilizá-lo hoje.

Execute novamente:

```text
LINT
TYPECHECK
UNIT
INTEGRATION
E2E
BUILD
SECURITY
ACCESSIBILITY
RESPONSIVE
PERFORMANCE
DATABASE
```

Confirme:

[ ] login funcionando  
[ ] permissões funcionando  
[ ] pauta funcionando  
[ ] matéria funcionando  
[ ] autosave funcionando  
[ ] mídia funcionando  
[ ] workflow funcionando  
[ ] publicação funcionando  
[ ] agendamento funcionando  
[ ] SEO funcionando  
[ ] histórico funcionando  
[ ] fontes protegidas  
[ ] auditoria funcionando  
[ ] admin protegido  
[ ] mobile funcionando  
[ ] erros tratados  
[ ] nenhuma informação crítica sendo perdida  

Apresente ao final:

# RESULTADO

## APROVADO PARA PRODUÇÃO

ou

## NÃO APROVADO PARA PRODUÇÃO

Se não aprovado, liste exatamente os bloqueadores.

Nunca declare a aplicação pronta apenas porque o build passou.