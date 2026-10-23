# DECISOES

As respostas ao desafio estão reunidas em [Perguntas técnicas obrigatórias](#perguntas-técnicas-obrigatórias). Os detalhes adicionais ficam em [Decisões complementares da implementação](#decisões-complementares-da-implementação). Para executar o projeto e identificar o que é real ou simulado, veja o [README.md](README.md).

## Perguntas técnicas obrigatórias

Esta seção responde diretamente às sete perguntas do `project.md`.

### 1. Arquitetura

**Pergunta:** por que escolheu essa stack e como front-end, backend e banco se comunicam?

**Resposta:**

Tratei web + backend como a entrega principal do desafio, com o fluxo obrigatório funcionando e os dados persistidos. O app nativo não era exigido: decidi entregar o fluxo mobile como um extra para demonstrar meus conhecimentos fullstack em web, mobile e backend, integrando os dois clientes à mesma API e ao mesmo banco.

Escolhi TypeScript no monorepo para compartilhar contratos e regras entre a web React com Vite+, o app Expo/React Native e a API. Workers com Hono e tRPC reduzem a infraestrutura a operar e mantêm os contratos tipados; D1 com Drizzle oferece persistência relacional e migrações; Clerk cuida da identidade e das sessões.

App e web chamam a API por HTTPS/tRPC com o token do Clerk. O Worker verifica o token, valida a entrada, obtém o usuário autenticado e consulta ou grava no D1. TanStack Query gerencia cache, carregamento e erros nos clientes.

### 2. Modelagem

**Pergunta:** quais entidades/tabelas criou? Como representaria diferentes usuários, check-ins e evolução nos planos?

**Resposta:**

Criei `check_ins`, `daily_keys`, `practices`, `plans`, `plan_days`, `verses`, `plan_enrollments`, `day_completions`, `practice_completions` e `conversation_messages`. A identidade fica no Clerk; os registros da pessoa guardam seu `user_id`, obtido do token e usado para isolar as consultas.

O cadastro é livre na web e no Android: cada pessoa pode criar seu próprio usuário e testar o fluxo com um histórico individual. A conta de demonstração é opcional, e a mesma conta criada pelo usuário funciona nos dois clientes.

Cada check-in registra estado, data local e instante de criação. A inscrição relaciona usuário e plano; cada conclusão relaciona usuário, plano e dia. A chave composta impede conclusões duplicadas, e o progresso é calculado a partir dos dias concluídos. As mensagens da conversa também guardam o idioma.

### 3. Segurança

**Pergunta:** o que mudaria para armazenar dados emocionais de usuários reais com privacidade e conformidade à LGPD?

**Resposta:**

A demonstração usa dados fictícios. Antes de receber dados reais, validaria a base legal e os consentimentos aplicáveis, documentaria finalidades e retenção e implementaria exportação e exclusão de dados. Também reforçaria controles de acesso, auditoria, remoção de conteúdo sensível dos logs e proteção de textos livres.

Usaria a configuração de produção do Clerk, revisaria a segurança do armazenamento no dispositivo e os contratos com fornecedores e definiria um processo de resposta a incidentes. A adequação à LGPD precisaria de revisão jurídica e operacional, além das mudanças de código.

### 4. Operação

**Pergunta:** como faria deploy, observaria erros e recuperaria um serviço que parou?

**Resposta:**

A web é publicada na Vercel; a API de demonstração roda em um Worker de staging da Cloudflare com D1 isolado. O comando de deploy da API aplica as migrações pendentes antes de publicar. O APK aponta para esse staging e está salvo em `mobile/releases/` com checksum. O CI executa lint, typecheck e testes.

Hoje acompanho a API por Workers Logs, logs estruturados dos erros inesperados do tRPC e `/health`. Para produção, eu acrescentaria o seguinte, que ainda não está implementado:

- **PostHog ou Sentry:** usaria uma das duas ferramentas, com preferência pelo PostHog por reunir acompanhamento de erros e analytics. Isso ajudaria a entender tanto as falhas quanto o uso do fluxo, como quantas pessoas concluem o check-in e o primeiro dia de um plano. Eu testaria a integração no app, na web e na API antes de decidir. O Sentry seria a alternativa caso atendesse melhor à investigação dos erros e crashes.
- **Grafana:** usaria dashboards para acompanhar disponibilidade, tempo de resposta, volume de requisições, erros e consumo das cotas. Também conectaria logs e traces para investigar onde uma requisição falhou ou ficou lenta.
- **Alertas do Grafana:** configuraria avisos para indisponibilidade da API, aumento de erros, lentidão persistente e cotas próximas do limite. Ajustaria o tempo de espera para não alertar por qualquer pico e enviaria as notificações por email, Slack ou ao responsável pelo plantão, conforme a gravidade. Cada alerta teria um responsável e um roteiro para investigar e recuperar o serviço.

Em toda a telemetria, removeria tokens, email, estado emocional e textos de check-in, reflexão e conversa; os eventos de produto teriam propriedades mínimas e coleta compatível com o consentimento aplicável. Autocapture e gravação de sessão ficariam desabilitados por padrão nas telas sensíveis.

Ao receber um alerta, verificaria os dashboards, logs, erros e versão implantada, além do status dos provedores. Reverteria um deploy defeituoso e, se necessário, recuperaria o banco por backup/Time Travel ou aplicaria uma migração corretiva. Confirmaria a recuperação pelo fluxo principal e pelos indicadores antes de encerrar o incidente.

### 5. Evolução

**Pergunta:** quais seriam suas 3 prioridades para transformar este teste em uma primeira versão utilizável por clientes?

**Resposta:**

1. **Preparar o uso com dados reais.** Completar os cuidados de privacidade e de conta: consentimento, retenção, exportação e exclusão dos dados, verificação de email e recuperação de acesso. Revisaria também o isolamento entre contas e o que é enviado aos serviços externos.
2. **Validar o fluxo diário com usuários.** Substituir o conteúdo fictício por reflexões, práticas e planos revisados e testar o percurso de check-in, atividade e Jornada com um grupo pequeno. Usaria esse retorno para corrigir dificuldades de navegação e acessibilidade e entender se o progresso apresentado faz sentido para quem usa.
3. **Garantir uma operação confiável.** Acompanhar erros com PostHog ou Sentry, tendendo ao PostHog, e configurar métricas e alertas no Grafana. Testaria backup, restauração, rollback e o fluxo principal em dispositivos reais antes de liberar versões para mais pessoas.

Eu priorizaria essas três frentes antes de investir em IA real ou assinatura, depois de entender o que os primeiros usuários precisam.

### 6. Integrações

**Pergunta:** como adicionaria IA com segurança e, futuramente, acesso por assinatura/Kiwify (webhooks e controle de acesso)?

**Resposta:**

Para adicionar IA, trocaria as respostas simuladas por uma chamada feita pelo backend a um provedor de modelos. A chave ficaria protegida no servidor, e enviaria apenas o contexto necessário, com cuidado para não expor dados pessoais. Definiria limites de uso, tamanho da resposta e tempo de espera. Manteria as regras de crise antes da chamada ao modelo e o aviso de que a conversa não é atendimento clínico.

Para a Kiwify, criaria um endpoint de webhook que valida a autenticidade e o payload dos eventos e os processa de forma idempotente. Os eventos atualizariam uma tabela de permissões de assinatura vinculada ao usuário. A API verificaria essa permissão antes de liberar conteúdo pago, com reconciliação periódica; a decisão de acesso ficaria no servidor.

### 7. Decisões

**Pergunta:** o que você deliberadamente deixou de fora e por quê? Onde usou IA no desenvolvimento?

**Resposta:**

O foco da entrega principal foi web + backend. Acrescentei o app Android por decisão própria, como um extra para demonstrar o fluxo fullstack também no mobile, usando a mesma autenticação, API e persistência da web. Mantive como prioridade terminar e testar o caminho completo de check-in, atividade e progresso salvo. A partir disso, deixei algumas partes para depois:

- **Publicação nas lojas:** a web e o APK já permitem ao avaliador testar a aplicação. Preparar a distribuição e passar pela aprovação das lojas acrescentaria trabalho sem ser necessário para demonstrar o fluxo pedido.
- **IA real:** a conversa é opcional no desafio. Usei um simulador para testar a interação e o histórico sem depender de um provedor externo. Uma integração real exigiria avaliar qualidade das respostas, privacidade, custo e limites de uso.
- **Pagamentos e assinatura:** o teste não precisa cobrar nem restringir conteúdo por compra. Isso acrescentaria conciliação de pagamentos, cancelamentos e regras de acesso antes de validar a experiência principal.
- **Push, administração e comunidade:** cada um abre uma frente própria, como permissões e agendamento, edição de conteúdo ou moderação. Para este teste, o conteúdo carregado pelas migrações atende ao fluxo, e o uso individual já permite demonstrar a proposta.
- **Conteúdo e mídia definitivos:** mantive textos fictícios identificados como demonstração, capa de vídeo e áudio ambiente de exemplo. Assim, a validação do funcionamento não depende da produção, revisão e licenciamento de um acervo de conteúdo.
- **Tratamento de dados reais:** mantive a demonstração com dados fictícios. Consentimento, retenção, exportação e exclusão precisam acompanhar as definições de privacidade do produto antes de receber registros pessoais de clientes; descrevi essa preparação na resposta 3.
- **Telemetria adicional e testes de carga:** priorizei os testes do fluxo, o CI, os logs da API e o `/health`. Configurar novas ferramentas e dimensionar capacidade é o próximo passo para um piloto, com metas de disponibilidade e uma estimativa de uso que orientem os alertas e a carga a testar.

Usei Claude Code e Codex no desenvolvimento. O Claude foi o principal apoio no planejamento de todo o projeto, desde a arquitetura e a organização das tarefas até as decisões de implementação, e também ajudou no design, na implementação e nas revisões. O Codex foi usado principalmente para pequenas funcionalidades, ajustes pontuais e correções, além de apoiar testes, deploys e a validação do APK. Um script gerou o áudio de exemplo.

## Decisões complementares da implementação

Os registros abaixo detalham escolhas, limitações e propostas futuras que complementam as respostas da seção anterior.

### Arquitetura e comunicação

**Por que essa stack.** O desafio exige persistência real, deploy público e prioriza o celular. Escolhi o que entrega isso com pouca infraestrutura para operar:

- **Expo / React Native (Android):** escolhido para a entrega mobile extra, além da web e do backend que atendem ao fluxo obrigatório. Permite demonstrar a integração de um cliente nativo à mesma API. Uso dev build porque o app depende de módulos nativos (Skia, áudio, Clerk).
- **Web em Vite+ (React, TanStack Router, shadcn/ui):** uma SPA que fala com a mesma API. Vite+ (`vp`) reúne build, dev server e testes (Vitest) numa ferramenta só; como a web não precisa de renderização no servidor (tudo depois do login), uma SPA estática publicada na Vercel dispensa servidor próprio para o front-end.
- **Cloudflare Workers + Hono + tRPC:** a API roda na borda, sem servidor para manter. O tRPC dá tipos de ponta a ponta: o app importa só o **tipo** do router (`@clavis-via/api/router`), então uma mudança de contrato quebra o `tsc` do app em vez de quebrar em produção.
- **Cloudflare D1 + Drizzle:** SQL relacional (check-ins, planos e progresso são dados relacionais) com migrações versionadas, sem conexão para gerenciar, no mesmo provedor do Worker.
- **Clerk:** login real (cadastro, sessão, foto de perfil) sem escrever autenticação própria. O token de sessão é verificado no Worker com a chave pública PEM (`CLERK_JWT_KEY`), sem chamada de rede a cada requisição.
- **Monorepo pnpm** (`mobile/`, `web/`, `api/`, `packages/shared/`, `infra/`): tipos compartilhados e um único conjunto de comandos de qualidade.
- **`packages/shared`:** app e web precisam das mesmas regras (tipos, constantes de design, hooks de dados sobre tRPC + TanStack Query, i18n, validação, utilitários de data e de erros do Clerk); manter duas cópias faz o comportamento divergir sem aviso. O pacote não contém componentes de plataforma (nem React Native, nem DOM), só React como peer, e é consumido como código-fonte TypeScript, sem etapa de build. Tem cobertura de 100% por conta própria.

**Como o app, a web e a API se comunicam.**

```text
App (Expo) / Web (SPA)  ── HTTPS, tRPC, Authorization: Bearer <token de sessão do Clerk> ──►  Worker (Hono)
                                                                                    │ verifica o token (CLERK_JWT_KEY)
                                                                                    │ valida a entrada (zod)
                                                                                    ▼
                                                                          D1 (Drizzle), sempre filtrando por user_id
```

O app e a web pedem o token ao Clerk, enviam em cada chamada tRPC e usam TanStack Query para cache e estados de carregamento/erro. O Worker aplica, nesta ordem: logger, security headers, CORS (a web, de outra origem, precisa estar em `CORS_ALLOWED_ORIGINS`), rate limit (100 requisições por minuto por IP) e o router. Toda rota de dados é `protectedProcedure`: sem token válido responde `UNAUTHORIZED`. O `user_id` vem do token, nunca da entrada do cliente.

O idioma acompanha a preferência do dispositivo ou navegador (`pt-BR`, `en`, `es`) e é enviado à API em `Accept-Language`. A API localiza chaves do dia, práticas, planos, dias, versículos e respostas da conversa. O cache dos clientes é renovado quando o idioma muda.

**Escolhas minhas, fora do enunciado.**

- Fonte travada em `maxFontSizeMultiplier` 1 no componente `AppText`: o layout é medido contra a referência visual e a escala do sistema o quebraria (custo: não respeita o tamanho de fonte ampliado do Android).
- APK `arm64-v8a` para celulares Android e uma versão `x86_64` para os emuladores do Appetize e do Ramus. Os arquivos separados reduzem o tamanho de cada download e evitam depender da tradução de bibliotecas nativas entre arquiteturas.
- Escala de layout por largura (`largura da tela / 266`) para repetir o design em qualquer celular.
- O fluxo mobile foi uma entrega extra que decidi fazer para demonstrar conhecimentos fullstack em web, mobile e backend. A entrega principal é a web integrada ao backend; o APK de staging está salvo em `mobile/releases/` e a web está publicada na Vercel.
- Instância de **desenvolvimento** do Clerk: não há domínio próprio. Trocar para produção muda chaves e configuração, não código.
- Versículos em português na NVI, com a tradução exibida junto da referência e o aviso da Biblica no README; inglês e espanhol usam versões adaptadas identificadas na interface.
- Na Jornada, linha de progresso do plano ("1 de 3 dias") junto aos dias consecutivos, para o requisito "ver a conclusão do plano".
- O E2E roda contra a API e o D1 **locais** com uma conta de teste própria.

### Modelo de dados

Entidades no D1 (`api/src/database`, migrações em `api/migrations`). Datas "locais" são `yyyy-MM-dd` calculadas no fuso do aparelho; instantes são inteiros (milissegundos).

| Tabela | Chave | Colunas principais | Tipo |
| --- | --- | --- | --- |
| `check_ins` | `id` | `user_id`, `state`, `other_text`, `local_date`, `created_at`; índice (`user_id`, `local_date`, `created_at`) | dado da pessoa |
| `daily_keys` | `state` | `title`, `text`, `practice_id` (FK `practices`) | conteúdo |
| `practices` | `id` | `title`, `duration_seconds`, `description` | conteúdo |
| `plans` | `id` | `position` (único), `title`, `category`, `description` | conteúdo |
| `plan_days` | (`plan_id`, `day_number`) | `title`, `summary`, `message`, `reflection`, `action`, `tip`, `prayer`, `video_duration_seconds` | conteúdo |
| `verses` | `position` | `text`, `reference` | conteúdo |
| `plan_enrollments` | (`user_id`, `plan_id`) | `started_at` | dado da pessoa |
| `day_completions` | (`user_id`, `plan_id`, `day_number`) | `reflection`, `completed_at`; FK composta para `plan_days` | dado da pessoa |
| `practice_completions` | `id` | `user_id`, `practice_id`, `local_date`, `completed_at` | dado da pessoa |
| `conversation_messages` | `id` | `user_id`, `role`, `language`, `text`, `created_at`; índice (`user_id`, `created_at`) | dado da pessoa |

**Usuários.** O cadastro é livre, com nome, email e senha, tanto na web quanto no Android. Não há tabela de usuários: a identidade é o id do Clerk (`user_…`), guardado em `user_id` de cada tabela da pessoa. Nome e foto ficam no Clerk. Isolar contas é filtrar toda consulta por `ctx.userId`, que vem do token verificado.

**Check-ins.** Uma linha por check-in; pode haver mais de um por dia e o último do dia vale para o Início. O estado é um de 8 valores; "Outro" guarda o texto em `other_text`. O histórico para o gráfico é a leitura por intervalo de `local_date`.

**Conversa.** Cada mensagem pertence ao usuário e ao idioma em que foi enviada. O histórico é filtrado pelos dois campos, para que a mudança de idioma não misture respostas automáticas de idiomas diferentes.

**Evolução nos planos.** `plan_enrollments` diz que a pessoa começou o plano; `day_completions` guarda cada dia concluído, com a reflexão. A chave primária composta torna "concluir o dia" idempotente (`onConflictDoNothing`): dois toques não duplicam. O progresso ("1 de 3") é a contagem de `day_completions` do plano; "plano concluído" é contagem igual ao total de `plan_days`. Nada de progresso é guardado como número derivado, então não há como divergir.

**Para vários usuários reais.** O modelo já funciona: tudo da pessoa tem `user_id` e índice por ele. Falta, em produção, uma tabela `users` própria (consentimento, criação, exclusão) e as tabelas de assinatura da pergunta 6.

### Segurança e preparação para dados reais

O protótipo usa só dados fictícios e deixa a LGPD fora do escopo (decisão registrada). Para guardar dados emocionais de pessoas reais, eu mudaria:

- **Dado sensível.** Dados sobre estado emocional e de saúde mental são dados pessoais sensíveis (LGPD, art. 11). Base legal explícita, **consentimento específico e destacado**, finalidade declarada e minimização: coletar só o que o produto usa.
- **Direitos do titular.** Exportação e exclusão de conta e dados pela própria pessoa (hoje inexistem): apagar linhas de todas as tabelas por `user_id` e a conta no Clerk. Política de retenção com prazo. Registro do consentimento (versão do texto, data).
- **Isolamento e acesso.** Manter o filtro por `user_id` do token em toda consulta, com testes que provem que uma conta não lê a outra. Acesso interno ao banco só por papéis mínimos e com trilha de auditoria; nada de dado emocional em logs (hoje `logTrpcError` só registra falhas inesperadas, e o formatter de erro esconde SQL e parâmetros).
- **Criptografia.** Em trânsito, HTTPS da Cloudflare. Em repouso, o D1 já é cifrado pelo provedor; para o texto livre ("Outro", reflexões, conversa) eu avaliaria cifra em nível de campo com chave própria (secret do Worker) para que um vazamento do banco não exponha os textos.
- **Autenticação.** Instância de **produção** do Clerk com domínio próprio, verificação de email, senha forte, recuperação de senha, MFA opcional e login social. Hoje o cadastro é sem verificação, de propósito, para a demo.
- **Aplicativo.** Token só em armazenamento seguro (`expo-secure-store`), sem dado emocional em cache local persistente, backup do Android desligado para os dados do app, e certificate pinning se o risco justificar.
- **Operadores e terceiros.** Contratos de operador (Cloudflare, Clerk, PostHog, provedor de IA), registro das operações de tratamento, relatório de impacto (RIPD) e um encarregado (DPO). Dados fora do Brasil exigem base para a transferência internacional.
- **IA.** Nada de dado pessoal nos prompts (pergunta 6) e aviso claro de que não é atendimento clínico. O app já avisa isso na Conversa.
- **Incidentes.** Plano de resposta com comunicação à ANPD e aos titulares no prazo legal.
- **Produto.** Linguagem sem promessa de diagnóstico, terapia ou cura, e um caminho de ajuda em crise (hoje o simulador aponta CVV 188 e SAMU 192).

### Operação e recuperação

**Deploy.** A API de produção está configurada para **Workers Builds** da Cloudflare: na `main`, `pnpm run deploy` na pasta `api` aplica as migrações do D1 e publica o Worker. O deploy ativo da API de demonstração é o staging `https://clavis-via-api-staging.celsodias129.workers.dev`, com D1 e rate limiter isolados; para atualizá-lo, `pnpm --filter @clavis-via/api deploy:staging` aplica as migrações pendentes e publica o Worker. O GitHub Actions (`.github/workflows/ci.yml`) roda lint, typecheck e testes com cobertura, sem deploy. A web está publicada na Vercel no projeto `clavis-via-web`, em `https://clavis-via-web.vercel.app`, com raiz `web`, build do workspace e saída `dist`; `web/vercel.json` mantém o fallback da SPA para rotas internas. As variáveis `VITE_API_BASE_URL` e `VITE_CLERK_PUBLISHABLE_KEY` são configuradas no projeto Vercel. O deploy está com Vercel Authentication habilitado. O APK do app é gerado localmente, aponta para a API de staging e está salvo com checksum SHA-256 em `mobile/releases/`; a publicação em Release do GitHub é uma etapa de distribuição posterior.

**Observar erros (hoje).** `observability.enabled` no `wrangler.jsonc` liga o **Workers Logs**; o logger do Hono registra cada requisição e erros inesperados do tRPC saem estruturados (`console.error` com evento, rota, mensagem e stack). Erros esperados (entrada inválida, não autenticado) não são logados. O endpoint `/health` serve para checagem externa.

**Observabilidade proposta, ainda não implementada.** Minha preferência seria usar o PostHog para acompanhar erros e uso do produto. Eu avaliaria o Sentry como alternativa, depois de testar o que cada um atende no app, na web e na API. O Grafana entraria como complemento para métricas, logs, traces e alertas. Para isso, seria preciso configurar a coleta e o envio dos dados; os logs da Cloudflare não aparecem automaticamente nele. Uma opção seria usar métricas compatíveis com Prometheus, Loki para logs e Tempo para traces. Identificaria ambiente, serviço, versão e requisição nos registros para cruzar as informações, sem incluir dados emocionais. Também definiria retenção, amostragem e limites de custo, mantendo as credenciais de exportação em secrets.

**Alertas do Grafana.** Começaria com os exemplos abaixo e ajustaria os limites ao tráfego observado e aos objetivos de disponibilidade e latência. São configurações propostas, não regras já ativas:

| Sinal | Exemplo inicial de regra | Encaminhamento |
| --- | --- | --- |
| Disponibilidade | Checagem externa do `/health` falhando por 3 minutos | Crítico: plantão e canal operacional |
| Erros da API | Mais de 5% de respostas 5xx nos últimos 5 minutos, com pelo menos 100 requisições na janela | Crítico se persistente: investigar erros, logs e último deploy |
| Latência | p95 acima de 1 segundo por 10 minutos, nas rotas interativas sem atraso simulado | Aviso: investigar rota, dependências e consultas |
| Cotas | Consumo acima de 80% de uma cota coletada do provedor | Aviso: avaliar limite, tráfego e capacidade |
| Coleta de telemetria | Ausência inesperada de dados ou falha persistente na fonte de monitoramento | Aviso ao responsável pela observabilidade |

Agruparia os alertas por serviço e ambiente, com tempo de espera e intervalo entre notificações para evitar avisos repetidos. Também trataria a falta de dados e as falhas na própria coleta: o monitoramento ficar sem informação não significa que o serviço está saudável. Testaria o envio e a recuperação dos alertas antes de depender deles no plantão. Cada aviso teria um roteiro de diagnóstico, rollback e confirmação da recuperação. Uma restauração do banco dependeria da avaliação do incidente, em vez de acontecer automaticamente por causa de um alerta.

**Recuperar um serviço que parou.**

1. **Diagnosticar:** `GET /health`; Workers Logs no painel da Cloudflare; status da Cloudflare e do Clerk.
2. **Deploy ruim:** reverter para a versão anterior do Worker (rollback de versão no painel ou `wrangler rollback`); é imediato e não toca no banco.
3. **Dados:** D1 **Time Travel** restaura o banco para um ponto dos últimos 30 dias no plano Workers Paid (7 dias no Workers Free) (`wrangler d1 time-travel restore`); antes de uma migração arriscada, exportar com `wrangler d1 export`.
4. **Migração com problema:** corrigir com uma nova migração (as existentes não se reescrevem) e reaplicar: `wrangler d1 migrations apply DB --remote` aplica só o que falta.
5. **Cota ou limite:** o rate limit de 100 requisições por minuto por IP e o limite diário da Conversa protegem a cota; ajustar em `wrangler.jsonc` e nas constantes.

### Prioridades de evolução

1. **Uso com dados reais.** Implementar os controles descritos na pergunta 3, configurar a autenticação de produção e revisar acesso, retenção e exclusão em todas as tabelas da pessoa. O objetivo é que cada usuário tenha controle sobre a própria conta e seus registros antes da abertura para clientes.
2. **Validação do fluxo principal.** Revisar o conteúdo com quem tenha responsabilidade editorial sobre o produto e observar um grupo pequeno usando check-in, prática, plano e Jornada. Corrigir os problemas encontrados, incluindo o suporte a fontes ampliadas e a legibilidade, e verificar se as pessoas conseguem concluir o fluxo e entender o próprio progresso.
3. **Confiabilidade e liberação gradual.** Adotar PostHog (preferência) ou Sentry, Grafana e seus alertas, conforme a pergunta 4. Testar restauração de backup, rollback e o fluxo completo em dispositivos reais, além de acompanhar as primeiras versões com um grupo limitado antes de ampliar o acesso.

IA, assinatura e publicação nas lojas seriam avaliadas a partir desse uso inicial. As propostas de integração estão descritas abaixo, mas não seriam pré-requisitos para validar a primeira versão com clientes.

### Integrações futuras

#### IA com segurança

Hoje a Conversa usa respostas simuladas por regras. A parte que gera essas respostas fica separada do código que recebe e salva as mensagens. Para integrar IA, substituiria essa parte por uma chamada ao modelo, mantendo o fluxo do app, o histórico e o limite diário:

- O backend chamaria o **OpenRouter** no lugar do simulador, a partir da rota de conversa (`api/src/routes/conversation.route.ts`).
- A chamada sai **só do Worker**; a chave do OpenRouter é um **secret do Worker** (`wrangler secret put`), nunca vai ao app nem ao repositório.
- **Limite diário** por pessoa: o já existente (30 mensagens por 24 horas, `CONVERSATION_LIMITS`), mais um teto de tokens por resposta e timeout; o rate limit da API continua valendo.
- **Regras de segurança:** instruções de sistema com tom acolhedor e adulto, sem diagnóstico, terapia ou promessa de cura; a **regra de crise continua rodando antes do modelo** (CVV 188, SAMU 192) e vence qualquer resposta; a saída passa por checagem simples (tamanho, ausência de aconselhamento clínico).
- **Sem dado pessoal no prompt:** envia-se o primeiro nome opcional, o estado do check-in do dia, o título do plano em andamento e as últimas mensagens; não vão email, id do Clerk, textos livres de reflexão nem o campo "Outro". Escolher um provedor com retenção de dados desligada.
- **Falhas:** modelo indisponível devolve erro tratado e o app já mostra "tentar de novo"; limite atingido já mostra aviso gentil.
- Aviso permanente na tela de que não é serviço médico ou psicológico (já existe).

#### Assinatura / Kiwify

Acesso por assinatura com **webhooks assinados** e **controle de acesso** no Worker:

- **Webhook:** rota pública `POST /webhooks/kiwify` fora do tRPC. Verifica a **assinatura** do corpo (HMAC com o token do webhook, guardado como secret) antes de qualquer coisa, valida o payload com zod e rejeita fora da janela de tempo. Processamento **idempotente**: tabela de eventos recebidos com o id do evento (chave única), para que reenvios da Kiwify não repitam efeitos.
- **Entitlements:** tabela `entitlements` (`user_id`, `status`, `plan`, `expires_at`, `updated_at`) atualizada pelos eventos (compra aprovada, renovação, atraso, reembolso, cancelamento). Casar o comprador com a conta pelo email verificado do Clerk; compra sem conta fica pendente até o cadastro.
- **Controle de acesso:** um middleware do tRPC (`subscribedProcedure`) consulta o entitlement do `user_id` do token e responde `FORBIDDEN` quando não há assinatura ativa. Conteúdo gratuito continua em `protectedProcedure`. O app lê o estado de acesso e mostra a tela de assinatura; a verdade fica sempre no servidor.
- **Operação:** reconciliar periodicamente com a API da Kiwify (cron trigger do Worker), prazo de tolerância configurável e alertas para eventos rejeitados.

### Escopo, limitações e uso de IA

**Deixado de fora, de propósito.**

- Publicação em loja (Play Store, App Store): o desafio aceita uma aplicação responsiva e não exige publicação em loja. A web e o APK de staging salvo em `mobile/releases/` permitem testar a entrega sem depender dessa etapa de distribuição.
- Preparação para dados reais, verificação de email e recuperação de senha: a demo usa dados fictícios para validar o fluxo. Os cuidados da pergunta 3 e esses recursos de conta precisam ser concluídos antes de um piloto com registros reais. Login social também ficou para depois, porque o acesso por email e senha já atende ao teste.
- Telas adicionais de busca, notificações, configurações, assinatura e ajuda: não são necessárias para concluir check-in, atividade e Jornada. Os respectivos botões mostram "Em breve", evitando ampliar os fluxos antes de validar o principal.
- IA de verdade na Conversa: ficou simulada e declarada porque é opcional e permite testar interação e histórico sem custo por chamada ou dependência de disponibilidade e comportamento de um modelo externo.
- Vídeo e áudio definitivos: ficaram como demonstração para que a entrega técnica não dependesse da produção e do licenciamento de mídia.
- Kiwify e assinatura: exigem eventos de pagamento, conciliação e controle de acesso que não são necessários ao fluxo gratuito de demonstração. Push, painel administrativo e comunidade também exigem fluxos próprios de permissão, edição ou moderação.
- PostHog ou Sentry (com preferência pelo PostHog), Grafana e seus alertas: ficaram como evolução para um piloto; a entrega atual usa Workers Logs e `/health`. Testes de carga dependem de metas e volume de uso definidos. Statsig e SBOM ficaram para uma etapa de operação com necessidades de liberação gradual e inventário de dependências mais bem estabelecidas.

**Compromissos conhecidos.** As capas de 4 planos são miniaturas ampliadas, mais suaves; a instância do Clerk é de desenvolvimento; o simulador responde por regras e não entende texto livre além de palavras-chave.
