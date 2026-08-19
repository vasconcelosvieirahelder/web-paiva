<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Web Paiva - fluxo obrigatório de trabalho

## Issues, branches, PRs e deploys

Todo trabalho futuro deve ser gerenciado por GitHub Issues e Pull Requests.

- Antes de iniciar qualquer tarefa de produto, correção, melhoria visual, ajuste técnico, segurança, banco de dados ou deploy, deve existir uma GitHub Issue.
- Classifique a Issue com um destes tipos no título ou label:
  - `Correção`: bug, erro visual, falha de comportamento, problema de segurança ou inconsistência.
  - `Melhoria`: refinamento visual, usabilidade, desempenho, texto, i18n ou manutenção sem criar uma capacidade nova.
  - `Nova função`: nova tela, novo fluxo, nova regra de negócio, novo recurso de banco ou nova integração.
- Nenhuma mudança deve ir direto para a branch principal.
- Para cada Issue, criar uma branch própria com nome curto e descritivo, por exemplo:
  - `fix/hydration-warning`
  - `improvement/header-brand`
  - `feature/company-registration`
- Cada Pull Request deve mencionar a Issue relacionada na descrição usando uma palavra-chave do GitHub:
  - `Closes #123`
  - `Fixes #123`
  - `Resolves #123`
- A descrição do PR deve conter:
  - resumo do que mudou;
  - Issue relacionada;
  - evidências de validação, como `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build`;
  - observações sobre banco/Supabase quando houver migração ou seed.
- Deploys devem ser gerenciados a partir de PRs aprovados/mergeados, nunca por mudanças locais soltas.
- Quando houver alteração em SQL, migração, RLS, autenticação, upload ou dados privados, mencionar explicitamente o impacto de segurança no PR.
- Quando houver mudança em interface pública, i18n ou fluxo do usuário, mencionar no PR quais idiomas/telas foram afetados.

## Texto, gramática e campos de entrada

- Todo texto fixo de interface deve ser revisado em acentuação, pontuação, gramática e naturalidade antes de ser entregue.
- Não deixar textos com sinais de codificação quebrada, como `Ã`, `Â`, `Ð`, `Ñ`, `æ` ou `å`.
- Campos em que o usuário escreve texto humano devem usar o corretor nativo do navegador com `spellCheck` e `lang` compatível com o idioma atual.
- Campos técnicos como e-mail, senha, URL, telefone, números e arquivos não devem usar correção ortográfica.
- Ao criar novos textos traduzíveis, atualizar `src/i18n/messages.ts` e manter cobertura em `src/i18n/messages.test.ts`.

## Qualidade, testes e observabilidade

Todo PR deve manter o padrão mínimo de qualidade do projeto.

- Executar e registrar no PR: `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build`.
- Quando Playwright for ativado, mudanças em fluxo de usuário, navegação, formulário, busca, autenticação ou layout público devem executar também `pnpm e2e`.
- Quando Stryker for ativado, mudanças em regra de negócio em `src/lib` devem avaliar `pnpm mutation`.
- Usar ESLint para lint de Next.js/React/TypeScript.
- Usar Biome para formatação.
- Usar Commitlint para padronizar mensagens de commit.
- Usar Knip para encontrar dependências, exports e arquivos não usados.
- Usar Stryker para mutation testing em regras de negócio.
- Usar Vitest para testes unitários e de integração.
- Usar Playwright para testes end-to-end.
- Usar Codecov no GitHub Actions quando `CODECOV_TOKEN` estiver configurado.
- Manter observabilidade preparada com Sentry e OpenTelemetry.
- Datadog ou New Relic podem ser conectados quando houver conta, chaves e necessidade operacional real.
- Nunca commitar tokens, DSNs privados, chaves de API ou segredos de observabilidade.

As instruções detalhadas ficam em `docs/engineering-quality-observability.md`.

## Segurança de autenticação

- O login deve manter limite de tentativas de senha.
- Depois de falhas repetidas, novas tentativas devem ser bloqueadas temporariamente antes de chamar o provedor de autenticação.
- O bloqueio atual é de 5 falhas seguidas por e-mail no mesmo navegador, com espera de 15 minutos.
- Não remover essa proteção sem substituir por controle igual ou mais forte no Supabase/Auth, edge middleware ou banco.
- Mensagens de bloqueio devem ser claras e não devem informar se uma conta existe ou não.

## Backlog inicial recomendado em Issues

Criar Issues separadas para estes blocos já identificados:

- `Nova função`: Cadastro de empresa/anunciante com evidências, referência privada e envio para aprovação.
- `Nova função`: Painel administrativo de moderação para aprovar/rejeitar anúncios.
- `Melhoria`: Internacionalização controlada de anúncios aprovados e categorias.
- `Melhoria`: Cards públicos de anúncios com miniaturas clicáveis e detalhes completos.
- `Melhoria`: Identidade visual do cabeçalho e marca Web Paiva.
- `Melhoria`: Seeds de anúncios aprovados da Reserva do Paiva.
- `Correção`: Prevenir avisos de hidratação causados por atributos externos no `body`.
- `Melhoria`: Preparar deploy público com Vercel/Supabase e variáveis de ambiente.
- `Melhoria`: Configurar observabilidade de produção com Sentry, OpenTelemetry e provedor externo quando houver credenciais.
- `Melhoria`: Ampliar cobertura de testes unitários, integração e end-to-end.
- `Melhoria`: Adotar quality gates de PR com Biome, Knip, Commitlint, Stryker, Playwright e Codecov.
