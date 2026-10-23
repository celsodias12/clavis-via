# CLAVIS VIA

**Mobile como entrega extra:** tratei web + backend como a entrega principal do desafio. Como o app nativo não era obrigatório, decidi entregar também o fluxo completo em Android com Expo/React Native para demonstrar meus conhecimentos fullstack nas três frentes: **web, mobile e backend**. O app usa a mesma API e o mesmo banco da web, com autenticação, check-in, atividades e progresso persistido.

**Decisões técnicas:** o arquivo [DECISOES.md](DECISOES.md) reúne as respostas às sete perguntas obrigatórias do desafio e explica as escolhas da implementação.

Aplicação de acompanhamento diário, feita como entrega de um desafio técnico: a pessoa registra como está se sentindo (check-in), recebe uma "chave do dia" com uma prática, segue planos temáticos e acompanha a própria jornada. O fluxo principal funciona na web, integrado a uma API própria (Cloudflare Workers) e com dados persistidos no banco (Cloudflare D1).

O aplicativo não oferece diagnóstico, terapia ou tratamento. O conteúdo de planos, chaves e práticas é fictício e de demonstração. Os versículos em português usam a NVI, com atribuição; em inglês e espanhol são versões adaptadas, identificadas na interface.

## Sumário

1. [Demo](#1-demo)
2. [Rodar localmente](#2-rodar-localmente)
3. [Técnico](#3-técnico)
4. [Real × simulado](#4-real--simulado)
5. [Transparência sobre IA](#5-transparência-sobre-ia)
6. [Atribuições e licenças](#6-atribuições-e-licenças)

## 1. Demo

### Acesso

| Opção | Endereço |
| --- | --- |
| Web | [clavis-via-web.vercel.app](https://clavis-via-web.vercel.app/) |
| Mobile no navegador (APK Android) | [Appetize](https://appetize.io/app/b_xzutyh5gv45szrcwxja7hgurfu) · [Ramus](https://ramus.dev/share#rshr_cR4aamXeJgjv5Ud7f8C5IInfD2RqFOfJAEYnldZ1F5w) |
| API de staging | [clavis-via-api-staging.celsodias129.workers.dev](https://clavis-via-api-staging.celsodias129.workers.dev/health) |
| APK Android (celulares ARM64) | [clavis-via-staging-1.0.0-arm64.apk](mobile/releases/clavis-via-staging-1.0.0-arm64.apk) |
| APK Android (Appetize, Ramus e emuladores x86_64) | [clavis-via-staging-1.0.0-x86_64.apk](mobile/releases/clavis-via-staging-1.0.0-x86_64.apk) |

A web abre publicamente, sem exigir conta na Vercel. **O cadastro é livre:** você pode criar seu próprio usuário na web ou no Android e testar todo o fluxo com um histórico individual. A conta de demonstração é apenas uma opção de acesso rápido. A web e o APK entregue apontam para a mesma API de staging.

O endpoint `/health` da API responde `{"status":"ok"}`. As rotas de dados exigem o token de uma sessão do Clerk.

### Abrir a versão web

Abra o link da web em um navegador, no computador ou no celular, e escolha "Começar minha jornada" para criar sua conta. Se já tiver uma conta, use "Já tenho uma conta". Não é necessário instalar Node, Android Studio ou iniciar a API local para testar a versão publicada.

### Testar o mobile pelo navegador

Appetize e Ramus executam o APK nativo do Clavis Via em um emulador Android; não são a versão web adaptada para celular.

1. Abra um dos links em **Mobile no navegador (APK Android)** na tabela acima.
2. No Appetize, clique em **Start** e abra o **menu de aplicativos** do Android; localize **CLAVIS VIA** e toque no ícone para iniciar o app. No Ramus, clique em **Launch app** se esse botão aparecer para iniciar uma cópia do Android com o APK.
3. Crie sua conta ou entre com uma conta existente e siga o roteiro abaixo para testar o fluxo mobile que desejar.

**Appetize e Ramus têm cotas gratuitas de 30 minutos por mês.** No Appetize, a cota é compartilhada entre os acessos e cada sessão dura até 3 minutos. A sessão compartilhada do Ramus usa a cota da conta que a disponibiliza; o link expira em **26/10/2026 às 10h07 (horário de Brasília)**. No Appetize, quando uma sessão terminar, clique em **Start** novamente e entre com a mesma conta; os dados continuam salvos na API. Se as cotas acabarem ou o link do Ramus expirar, instale o APK correspondente à arquitetura de um emulador Android ou o APK `arm64` em um celular Android físico, seguindo as instruções abaixo. A instalação local não tem limite de tempo desses serviços.

### Instalar o APK

1. Baixe o APK `arm64` disponível em `mobile/releases/`. No GitHub, use a opção de baixar o arquivo bruto ("Download raw file"). O [checksum SHA-256](mobile/releases/clavis-via-staging-1.0.0-arm64.apk.sha256) está na mesma pasta.
2. Transfira o APK para um celular Android e abra o arquivo, permitindo a instalação dessa origem quando o Android pedir.
3. O APK é de release para `arm64-v8a`, exige Android 7 ou superior e já está configurado para o staging. Para usá-lo, basta acesso à internet; ele funciona sem Expo Go ou Metro.

Com o Android SDK instalado e um emulador `arm64-v8a` ligado, também é possível instalar pela raiz do repositório:

```bash
adb install -r mobile/releases/clavis-via-staging-1.0.0-arm64.apk
```

Para um emulador `x86_64`, use `clavis-via-staging-1.0.0-x86_64.apk` e seu [checksum SHA-256](mobile/releases/clavis-via-staging-1.0.0-x86_64.apk.sha256). Essa também é a versão usada no Appetize e no Ramus; o APK ARM64 não carrega corretamente as bibliotecas nativas nesses ambientes. Os dois arquivos usam o mesmo código e a mesma API de staging.

Para conferir o checksum no computador:

```bash
cd mobile/releases
shasum -a 256 -c clavis-via-staging-1.0.0-arm64.apk.sha256
```

### Criar sua conta ou entrar

Você pode se cadastrar livremente, sem convite ou liberação manual. Na tela inicial, toque em "Começar minha jornada", informe nome, email e senha e conclua o cadastro. Depois, use essa mesma conta para entrar na web e no app Android. Os check-ins, as atividades e o progresso ficam vinculados ao seu usuário.

**Não há verificação por email nesta demo.** Ao concluir o cadastro, a conta já está pronta para uso: você pode ir direto para o login com o email e a senha cadastrados, sem esperar um email de confirmação.

| Opção | Dados |
| --- | --- |
| Criar sua conta | nome, email e senha com 8+ caracteres; nesta demo não há verificação de email |
| Entrar com sua conta | toque em "Já tenho uma conta" e use o email e a senha do cadastro |
| Conta de demonstração opcional (pública de propósito) | email `ana@example.com`, senha `Jornada-Clavis-2026` |

Para avaliar o fluxo desde o início, recomendo criar sua própria conta e usar dados fictícios nos registros. A conta da Ana é compartilhada e pode conter testes anteriores. O login roda na instância de **desenvolvimento** do Clerk; a API verifica o token de sessão no Worker.

### Roteiro dos seis passos

1. **Abrir o app (ou a web) e criar sua conta:** toque em "Começar minha jornada" e cadastre nome, email e senha. Se já tiver uma conta, entre por "Já tenho uma conta".
2. **Check-in:** escolha "Ansiosa" (ou outro estado) e toque em "Continuar". Estado, data e hora vão para o D1.
3. **Hoje (Início):** o card "Sua chave de hoje" traz a reflexão e a prática do estado escolhido; "Ver prática de hoje" abre a prática com áudio de exemplo.
4. **Plano:** em Planos, abra "Quando o desânimo pesar", toque em "Começar plano", abra o Dia 1, vá à Ação do dia e toque em "Marcar como concluída" (a reflexão "Como foi para você?" é opcional).
5. **Minha jornada:** na aba Jornada veja os dias consecutivos, o progresso do plano ("1 de 3 dias") e as conquistas; em "Minhas emoções" aparecem os check-ins no gráfico e as percepções.
6. **Confirmar a persistência:** na web, recarregue a página; no Android, feche o app e abra novamente. Ao entrar com a mesma conta, o check-in, a conclusão do dia e o progresso continuam lá, porque estão no banco.

O roteiro usa os nomes das telas em português. A interface e o conteúdo acompanham o idioma do dispositivo ou navegador (`pt-BR`, inglês ou espanhol). Também há a aba Conversa, com respostas simuladas; veja a seção 4.

## 2. Rodar localmente

Todos os comandos abaixo partem da raiz do repositório, onde estão `package.json` e `pnpm-workspace.yaml`, depois de clonar ou descompactar o projeto.

### Pré-requisitos

- **Web e API:** Node.js 24.22.0, pnpm 11.28.5 e uma aplicação de desenvolvimento no Clerk. As versões das ferramentas estão em `mise.toml`.
- **Android:** além dos itens acima, Java 17, Android Studio com SDK configurado e um emulador Android ligado. O app usa dev build com módulos nativos.
- **Opcionais:** Maestro para E2E do Android; Docker e SonarQube para os hooks de push. Eles não são necessários para abrir a aplicação.

### Dependências e configuração

Se usa mise, instale as ferramentas com `mise install node npm:pnpm` e mantenha o mise ativado no shell. Depois:

```bash
# Dependências do monorepo
pnpm install --frozen-lockfile

# Exemplos para API e web
cp web/.env.example web/.env.local
cp api/.env.example api/.env
```

Antes de iniciar os processos, preencha os arquivos:

1. Crie uma aplicação de **desenvolvimento** no Clerk e configure o cadastro por email e senha, sem exigir verificação de email para esta demo.
2. Copie a **Publishable Key** dessa aplicação para `VITE_CLERK_PUBLISHABLE_KEY` em `web/.env.local`.
3. Copie a **chave pública JWT em formato PEM**, da mesma aplicação do Clerk, para `CLERK_JWT_KEY` em `api/.env`. Preserve o PEM completo; se usar quebras de linha, envolva o valor em aspas.
4. Mantenha `VITE_API_BASE_URL=http://localhost:8787` e `CORS_ALLOWED_ORIGINS=http://localhost:5173`. A origem do CORS precisa corresponder ao endereço aberto no navegador.

Os exemplos contêm apenas valores locais e campos para preencher. As chaves da instância usada na demo publicada não são necessárias para configurar sua própria instância.

### Banco e API

O D1 local é criado e preenchido pelas migrações, sem precisar criar um banco remoto para esse teste:

```bash
# Aplica esquema e conteúdo demonstrativo no D1 local
pnpm --filter @clavis-via/api database:migrate:local

# Terminal 1: deixe a API rodando
pnpm --filter @clavis-via/api dev
```

A API fica em `http://localhost:8787`; `http://localhost:8787/health` deve responder `{"status":"ok"}`. O D1 local fica em `api/.wrangler/`. Depois de atualizar o projeto, aplique novamente as migrações antes de iniciar a API.

### Web

Com a API rodando, abra outro terminal:

```bash
# Terminal 2
pnpm --filter @clavis-via/web dev
```

Abra `http://localhost:5173` e crie uma conta na sua instância do Clerk. Em uma instância nova, a conta pública da Ana ainda não existe.

### Android

Mantenha a API rodando e abra o emulador no Android Studio. Se usa mise, instale o Java com `mise install java`.

```bash
cp mobile/.env.example mobile/.env.local
```

Preencha `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` com a mesma Publishable Key usada na web. Mantenha `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8787`: esse endereço permite ao emulador acessar a API do computador.

```bash
# Em outro terminal: deixe o Metro rodando
pnpm --filter @clavis-via/mobile start
```

```bash
# Em outro terminal: compila, instala e abre o dev build usando o Metro já iniciado
pnpm --filter @clavis-via/mobile exec expo run:android --no-bundler
```

Depois da primeira instalação, basta manter a API e o Metro rodando e abrir o dev build. Em aparelho físico, troque `10.0.2.2` pelo IP do computador na rede local.

### Conta demo e ferramentas opcionais

Para rodar os scripts de conta demo ou E2E:

```bash
cp infra/.env.example infra/.env.local
```

Preencha `CLERK_SECRET_KEY` com a Secret Key da sua aplicação de desenvolvimento no Clerk. Para criar a Ana nessa instância, preencha também `DEMO_EMAIL` e `DEMO_PASSWORD` e execute `pnpm --filter @clavis-via/infra demo-account`. Essa chave secreta é usada apenas pelos scripts locais; não vai para o app nem para a web.

### Testes e qualidade

```bash
pnpm lint            # Biome
pnpm typecheck       # tsc em todos os pacotes (wrangler types --check na API)
pnpm test:cov        # jest (mobile), vitest (api, web, shared), node:test (infra)
pnpm e2e             # Maestro (app Android), só local (nunca no CI): veja abaixo
pnpm e2e:web         # Playwright (web), só local (nunca no CI): veja abaixo
```

- **E2E (`pnpm e2e`):** exige a API local, o Metro, um emulador ligado com o dev build instalado, Maestro e `infra/.env.local` preenchido, incluindo `E2E_EMAIL`. O script apaga os dados da conta de teste no D1 **local**, roda os fluxos de `mobile/tests/e2e/flows` (cadastro e os seis passos) e remove os usuários de cadastro criados no Clerk. Usa uma conta dedicada ao teste. O Maestro grava em log tudo o que digita, inclusive senhas; por isso o script gera uma senha aleatória a cada execução, a define no usuário de teste pela API do Clerk e a passa ao Maestro. A senha que aparece nos logs perde o valor na execução seguinte.
- **E2E da web (`pnpm e2e:web`):** exige a API local e `infra/.env.local` e `web/.env.local` preenchidos; num clone novo, baixe antes o navegador do Playwright com `pnpm --filter @clavis-via/web exec playwright install chromium`. Sobe a web, apaga os dados da conta de teste no D1 **local**, roda os fluxos Playwright de `web/tests/e2e` (os seis passos em desktop e celular, cadastro e links diretos) com `@clerk/testing` e uma senha aleatória por execução, e remove os usuários de cadastro criados no Clerk. Os E2E são executados localmente, fora do CI.
- **Conta demo (`pnpm --filter @clavis-via/infra demo-account`):** cria a Ana no Clerk de desenvolvimento a partir de `DEMO_EMAIL` e `DEMO_PASSWORD` de `infra/.env.local`.
- **Hooks de push (lefthook):** `pre-push` roda lint, `pnpm audit`, gitleaks, React Doctor (`--blocking warning`), typecheck, cobertura e Sonar (gate com zero tolerância, Sonar local em Docker).
- **CI (GitHub Actions, `.github/workflows/ci.yml`):** lint, typecheck e `test:cov`. Sem deploy pelo Actions e sem E2E.

### Gerar outro APK com EAS (opcional)

O APK entregue já está em `mobile/releases/`. Para gerar um novo APK por EAS, o projeto oferece os perfis de `mobile/eas.json`; esse caminho exige login no Expo e vínculo com um projeto EAS. O build abaixo roda na sua máquina (`--local`), com o `eas-cli` 24.8.0 definido no `mise.toml`, e o perfil `production-apk` gera apenas `arm64-v8a`. O `.easignore` fica na raiz do repositório.

```bash
# Se usa mise, instale também a CLI do EAS
mise install npm:eas-cli

# 1. Uma vez: login e vínculo do projeto no expo.dev
eas login
(cd mobile && eas init)

# 2. Variáveis de produção: copie o exemplo, preencha e envie ao EAS
cp mobile/.env.production.example mobile/.env.production
pnpm --filter @clavis-via/mobile eas:env:push:prod

# 3. Build local do APK
mkdir -p dist
(cd mobile && eas build --profile production-apk --platform android --local \
  --output ../dist/clavis-via-release-arm64.apk)

# 4. Checksum do novo arquivo
(cd dist && shasum -a 256 clavis-via-release-arm64.apk > clavis-via-release-arm64.apk.sha256)
```

O perfil usa o ambiente `production` do EAS, inclusive no build local. Envie as variáveis antes de gerar o APK e confira a URL de `EXPO_PUBLIC_API_BASE_URL` e a instância do Clerk escolhida; para repetir a demo, use a API de staging e a Publishable Key correspondente. O nome do ambiente no EAS não muda qual backend será usado. O script `eas:build:prod-apk` não envia as variáveis sozinho.

Para gerar a versão do Appetize, use o perfil `staging-appetize`, que compila para `x86_64` e fixa a URL da API de staging. Configure a Publishable Key da mesma instância de desenvolvimento do Clerk no ambiente EAS usado acima:

```bash
(cd mobile && eas build --profile staging-appetize --platform android --local \
  --output ../dist/clavis-via-staging-1.0.0-x86_64.apk)
(cd dist && shasum -a 256 clavis-via-staging-1.0.0-x86_64.apk > clavis-via-staging-1.0.0-x86_64.apk.sha256)
```

## 3. Técnico

### Stack

| Camada | Tecnologia |
| --- | --- |
| Web | Vite+, React 19, TanStack Router e Query, Tailwind 4 + shadcn/ui, Recharts, i18next (pt-BR, en, es), Clerk (`@clerk/react`) |
| App | Expo SDK 58, React Native 0.88, Expo Router, Unistyles, TanStack Query, react-hook-form + zod, i18next (pt-BR, en, es), victory-native + Skia, expo-audio |
| Login | Clerk (`@clerk/expo`), telas próprias |
| API | Cloudflare Workers, Hono, tRPC (adapter fetch), zod |
| Banco | Cloudflare D1 via Drizzle ORM, migrações SQL versionadas |
| Testes | jest + Testing Library + MSW (app), vitest + Testing Library + MSW (web e shared), vitest + `@cloudflare/vitest-plugin` (API), `node:test` (infra), Maestro (E2E do app), Playwright (E2E da web) |
| Qualidade | Biome, lefthook, Sonar, React Doctor, GitHub Actions |
| Deploy da API de demonstração | Cloudflare Workers de staging; `pnpm --filter @clavis-via/api deploy:staging` aplica migrações e publica o Worker |
| Deploy da web | Vercel, projeto `clavis-via-web`, com acesso público em `https://clavis-via-web.vercel.app` |

### Estrutura do monorepo

```text
clavis-via/
├── mobile/                 # app Expo (@clavis-via/mobile)
│   ├── src/app/             # rotas do Expo Router (só referenciam as telas)
│   ├── src/screens/         # uma pasta por tela: <nome>.screen.tsx + teste
│   ├── src/components/     # componentes (<nome>.component.tsx + teste)
│   ├── src/{constants,hooks,services,styles,i18n,utils,@types,configs}/
│   ├── assets/             # fontes, imagens, áudio de exemplo
│   ├── releases/           # APK de staging e checksum SHA-256
│   └── tests/e2e/flows/     # fluxos Maestro
├── api/                    # Worker (@clavis-via/api)
│   ├── src/routes/          # routers tRPC (check-in, plan, practice, verse, journey, emotion, conversation) e /health
│   ├── src/services/        # regras de negócio
│   ├── src/schemas/         # validação zod das entradas
│   ├── src/middlewares/     # rate limit, CORS, security headers, erros
│   ├── src/database/        # tabelas Drizzle
│   ├── src/i18n/           # idioma da requisição e conteúdo traduzido
│   ├── migrations/         # 0000 a 0005 (esquema e conteúdo)
│   └── wrangler.jsonc
├── web/                    # versão web (@clavis-via/web): Vite+, TanStack Router, shadcn/ui
│   ├── src/routes/          # rotas (só referenciam as telas)
│   ├── src/screens/         # uma pasta por tela: <nome>.screen.tsx + teste
│   ├── src/components/     # componentes (components/ui é gerado pelo shadcn)
│   ├── tests/e2e/          # specs Playwright
│   ├── vercel.json         # fallback das rotas da SPA no deploy atual
│   └── wrangler.jsonc      # alternativa de hospedagem dos assets na Cloudflare
├── packages/shared/        # @clavis-via/shared: tipos, constantes de design, hooks de dados (tRPC + TanStack Query), i18n, validação e utilitários usados pelo app e pela web
├── infra/                  # ferramentas locais: E2E, conta demo, API do Clerk (@clavis-via/infra)
├── .github/workflows/ci.yml
├── lefthook.yml  sonar-project.properties  mise.toml  pnpm-workspace.yaml
├── README.md  DECISOES.md
```

O app e a web importam só o **tipo** do router da API (`@clavis-via/api/router`), então clientes e servidor compartilham os tipos sem compartilhar código de execução. O que o app e a web repetiriam (tipos, constantes de design, hooks de dados, i18n, validação, utilitários) mora em `packages/shared`.

O idioma acompanha a preferência do dispositivo ou navegador (`pt-BR`, `en`, `es`). App e web enviam `Accept-Language` à API; ela traduz o conteúdo demonstrativo de chaves, práticas, planos, dias, versículos e respostas da conversa. Ao mudar o idioma, os clientes descartam o cache do idioma anterior, e o histórico da conversa é separado por idioma. Português é o padrão quando nenhuma preferência é compatível.

### Variáveis de ambiente (exemplos, sem segredos)

Os modelos para copiar são [api/.env.example](api/.env.example), [web/.env.example](web/.env.example), [mobile/.env.example](mobile/.env.example) e, para os scripts opcionais, [infra/.env.example](infra/.env.example). O build por EAS também tem [mobile/.env.production.example](mobile/.env.production.example).

| Arquivo | Variável | Para quê |
| --- | --- | --- |
| `mobile/.env.local` | `EXPO_PUBLIC_API_BASE_URL` | URL base da API (`http://10.0.2.2:8787` no emulador) |
| `mobile/.env.local` | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | chave pública do Clerk (`pk_test_…`) |
| `web/.env.local` | `VITE_API_BASE_URL` | URL base da API (`http://localhost:8787` local) |
| `web/.env.local` | `VITE_CLERK_PUBLISHABLE_KEY` | chave pública do Clerk (`pk_test_…`) |
| `api/.env` (local) / secret do Worker | `CLERK_JWT_KEY` | chave pública PEM do Clerk, para verificar o token de sessão sem chamada de rede |
| `api/.env` (local) / `api/wrangler.jsonc` (deploy) | `CORS_ALLOWED_ORIGINS` | origens permitidas no CORS; local: `http://localhost:5173`, staging: `https://clavis-via-web.vercel.app` |
| `api/.env` (local) / `api/wrangler.jsonc` (deploy) | `MOCK_REPLY_DELAY_MILLISECONDS` | espera do simulador antes de responder (mostra "digitando…") |
| `infra/.env.local` | `CLERK_SECRET_KEY` | Secret Key do Clerk, só para scripts locais (E2E e conta demo) |
| `infra/.env.local` | `E2E_EMAIL` | e-mail do usuário dedicado ao E2E (a senha é gerada a cada execução) |
| `infra/.env.local` | `DEMO_EMAIL`, `DEMO_PASSWORD` | conta de demonstração |

App, web e API validam suas variáveis com zod em `environment.config.ts`. Os arquivos de ambiente com valores reais estão no `.gitignore`. Mantenha apenas os exemplos no Git; `CLERK_SECRET_KEY` é usada somente em `infra` e não deve ser colocada nas variáveis `EXPO_PUBLIC_*` ou `VITE_*`, que entram nos bundles dos clientes.

### Banco, migrações e conteúdo semeado

O binding `DB` usa o D1 `clavis-via` na configuração padrão e `clavis-via-staging` no ambiente de staging. No desenvolvimento, o Wrangler mantém uma instância local em `api/.wrangler/`. As migrações estão em `api/migrations`:

| Migração | O que faz |
| --- | --- |
| `0000_initial-schema.sql` | `check_ins`, `daily_keys`, `practices` |
| `0001_daily-keys-content.sql` | semeia as 8 chaves do dia (uma por estado) e as práticas |
| `0002_plans-schema.sql` | `plans`, `plan_days`, `plan_enrollments`, `day_completions`, `practice_completions`, `verses` |
| `0003_plans-content.sql` | semeia os 5 planos (29 dias) e os versículos |
| `0004_conversation-messages.sql` | `conversation_messages` |
| `0005_mean_quicksilver.sql` | adiciona `language` às mensagens para separar o histórico da conversa por idioma |

Para preparar ou atualizar o banco local:

```bash
pnpm --filter @clavis-via/api database:migrate:local
```

As migrações também carregam os planos, dias, chaves, práticas e versículos; não há um comando de seed separado. Check-ins e progresso são criados pelo uso da aplicação. O conteúdo em inglês e espanhol fica em `api/src/i18n/locales/` e é escolhido pela API conforme o idioma solicitado.

Para alterar o esquema, edite as tabelas Drizzle e gere uma nova migração com `pnpm --filter @clavis-via/api database:generate`. Os scripts `deploy` e `deploy:staging` da API aplicam as migrações no banco remoto correspondente antes de publicar o Worker.

## 4. Real × simulado

| Real | Simulado |
| --- | --- |
| Persistência no D1 de check-ins, progresso e conclusão de dias de plano, reflexões, práticas feitas e mensagens da Conversa | Vídeo do Dia: imagem de capa, sem reprodução. Play do versículo: mostra "Em breve" |
| Login e cadastro no Clerk (instância de desenvolvimento) | Áudio da prática: só ela toca, com um loop ambiente gerado para o app (placeholder) |
| API própria em Cloudflare Workers + D1, com verificação do token de sessão e dados isolados por usuário | Conteúdo dos 5 planos, das chaves e das práticas: fictício, marcado como demonstração. Versículos em português usam a NVI; inglês e espanhol usam versões adaptadas |
| API de staging e web publicadas; testes unitários e de integração e CI configurado | **Respostas da Conversa:** simulador por regras no Worker, **sem IA**; as mensagens (da pessoa e do simulador) são gravadas de verdade no D1 |

Sobre a Conversa: o simulador responde por palavras-chave e pelo contexto do dia (check-in, plano em andamento, versículo). A regra de crise vem antes de todas as outras e orienta a procurar o CVV (188) e, em emergência, o SAMU (192). Há limite de 30 mensagens por pessoa a cada 24 horas. O app avisa na tela que as respostas são simuladas.

Imagens: as capas dos 4 planos que o design só mostra em miniatura são a própria miniatura ampliada (ficam mais suaves que a capa do primeiro plano, que existe no design).

## 5. Transparência sobre IA

Ferramentas de IA usadas e em quais etapas:

- **Claude Code (Anthropic):** principal apoio no planejamento de todo o projeto, incluindo a arquitetura, a organização das tarefas e os planos de implementação. Também ajudou no design do protótipo, na implementação e nas revisões de código.
- **Codex (OpenAI):** pequenas funcionalidades, ajustes pontuais e correções de fluxo e i18n, além de apoio nos testes, nos deploys e na geração e validação do APK no emulador.
- **Gerador do áudio de exemplo:** o loop ambiente das práticas foi sintetizado por script para o app, sem material de terceiros.

Os commits e os planos de implementação registram as decisões; as escolhas que não vieram do enunciado estão em [DECISOES.md](DECISOES.md).

## 6. Atribuições e licenças

- **Versículos:** o conteúdo em português usa a Nova Versão Internacional (NVI). Aviso exigido: "Texto bíblico da Nova Versão Internacional®, NVI®. Copyright © 1993, 2000, 2011 by Biblica, Inc.®. Used by permission. All rights reserved worldwide." O app mostra "NVI" junto da referência em português (por exemplo, "Jeremias 29:11 (NVI)"). Em inglês e espanhol, os textos são versões adaptadas identificadas como tal na interface.
- **Fontes:** Jost, Petrona e Source Sans 3, sob a SIL Open Font License 1.1. As licenças estão em `mobile/assets/fonts` (`OFL-Jost.txt`, `OFL-Petrona.txt`, `OFL-SourceSans3.txt`).
- **Design:** a direção visual vem da imagem de referência no enunciado do desafio; as imagens do app foram recortadas dela e ampliadas.
