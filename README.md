# Web Paiva

Fundacao tecnica do MVP Lean v1 para uma plataforma local de divulgacao da Reserva do Paiva.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase: PostgreSQL, Auth, Storage e RLS
- i18n preparado para `pt-BR`, `en`, `es`, `ru` e `zh-CN`

## Escopo da Release 0

Esta release prepara a base tecnica:

- Aplicacao Next.js.
- Layout publico minimo.
- Rotas por idioma.
- Login e dashboard base.
- Helpers Supabase.
- Migracao inicial de banco.
- Seeds basicos.
- Testes iniciais.

## Fora do MVP

Nao implementar nesta fase:

- Pagamentos online.
- Chat interno.
- Aplicativo nativo.
- Microservicos.
- Redis.
- Filas tecnicas.
- Busca externa.
- Traducao automatica de anuncios.

## Espaco em disco

O projeto nao deve exigir muito espaco local.

- Codigo do projeto: menos de 1 GB.
- Dependencias Node/Next.js: entre 500 MB e 2 GB.
- Ferramentas auxiliares e cache: alguns GB adicionais.

Com 10 GB livres o desenvolvimento deve ser viavel. Com 20 GB livres, fica confortavel. Imagens reais de anuncios em producao devem ficar no Supabase Storage.

## Ambiente

Copie `.env.example` para `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

A chave `SUPABASE_SERVICE_ROLE_KEY` e apenas para uso server-side e nunca deve ser exposta no frontend.

Para este workspace, `.env.local` ja esta configurado com a URL do projeto Supabase e a chave publica anon/publishable informadas pelo dono do projeto.

## Banco de dados

A migracao inicial esta em:

```bash
supabase/migrations/0001_initial_schema.sql
```

O seed inicial esta em:

```bash
supabase/seed.sql
```

Para aplicar no Supabase online, use o SQL Editor do painel Supabase ou a Supabase CLI autenticada. A migracao deve ser aplicada antes de testar cadastro/login completo, porque o trigger `handle_new_user()` cria o registro em `profiles`.

## Comandos

```bash
pnpm dev
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## Qualidade, testes e observabilidade

O projeto usa uma base de qualidade com ESLint, Biome, Knip, Commitlint, Stryker, Vitest, Playwright, Codecov, Sentry e OpenTelemetry.

Checks principais:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Sentry, Datadog, New Relic, Codecov, Playwright, Biome, Commitlint, Knip e Stryker devem ser ativados por Issues/PRs proprios, porque dependem de pacotes adicionais, credenciais externas ou configuracao de CI. As chaves reais devem ser configuradas apenas em ambiente seguro de deploy.

Mais detalhes estão em `docs/engineering-quality-observability.md`.

## Textos e corretor nativo

Textos fixos da interface devem ser revisados em acentuação, pontuação e gramática. Campos de texto humano usam `spellCheck` e `lang` de acordo com o idioma atual da página. Campos técnicos, como e-mail, senha, telefone e URL, ficam sem correção ortográfica.

## Segurança de login

O login possui limite de tentativas de senha. Depois de 5 falhas seguidas para o mesmo e-mail no mesmo navegador, novas tentativas são bloqueadas temporariamente por 15 minutos antes de chamar o Supabase Auth.

## Fluxo de trabalho no GitHub

Todo trabalho futuro deve partir de uma GitHub Issue e ser entregue por Pull Request.

- Use Issues para toda `Correção`, `Melhoria` ou `Nova função`.
- Crie uma branch por Issue.
- Mencione a Issue na descrição do PR com `Closes #numero`, `Fixes #numero` ou `Resolves #numero`.
- Inclua no PR as validações executadas: `pnpm test`, `pnpm lint`, `pnpm typecheck` e, quando aplicável, `pnpm build`.
- Deploys devem ser feitos a partir de PRs aprovados/mergeados, não de alterações locais soltas.

As instruções completas para agentes estão em `AGENTS.md`.
