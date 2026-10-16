# Lacunas e riscos

O repositório inicial não possuía qualquer funcionalidade. Todos os módulos do PRD precisavam ser construídos. A situação atual de cada módulo deve ser consultada em IMPLEMENTATION_STATUS.md e REQUIREMENTS_MATRIX.md.

## Limites que impedem homologação de produção

- Provedor SSO OIDC/SAML, MFA e recuperação de senha por e-mail dependem de implementação e configuração segura.
- Armazenamento de mídia com upload multipart, antivírus, transcode, derivados, licenças e CDN exige infraestrutura própria.
- Publicação em CMS externo, canais social/push/newsletter e analytics requerem contratos e credenciais corporativas; ausência deve aparecer como indisponibilidade.
- Coedição CRDT/OT, presença e comentários ancorados exigem evolução do núcleo de versões.
- PWA offline exige revisão de criptografia, retenção local e conflitos; fontes confidenciais não devem ser armazenadas em cache indiscriminadamente.
- SQLite é uma escolha para a operação local inicial. Alta concorrência, múltiplas instâncias e alta disponibilidade requerem avaliação e migração para banco de serviço.
- Retenção, consentimento, jurisdição, SLO, RPO/RTO, políticas de embargo e override precisam ser definidos pela organização. Este documento não certifica conformidade legal.
- Acessibilidade manual com leitor de tela, testes de carga e restauração de backup são necessários para homologação.

## Sequência

Fundação e verificações → autenticação/RBAC → dashboard → pautas → apuração/fontes → editor/autosave → versões → workflow → mídia → tempo real → publicação → SEO/distribuição/busca → notificações/analytics/correções → offline → acessibilidade/segurança/observabilidade → infraestrutura → regressão e auditoria final.

Cada checkpoint registra somente verificações realmente executadas. Build aprovado não equivale a aprovação de produção.
