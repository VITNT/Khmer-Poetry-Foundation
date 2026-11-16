# Aksara · អក្សរ

A Khmer literature collection built with SvelteKit, Svelte 5 and TypeScript.
Neon PostgreSQL stores poems, accounts, drafts and editorial decisions. Better
Auth runs inside SvelteKit and stores its tables in the same Neon database;
this project does **not** use Neon's separately managed Auth service. Resend
sends passwordless sign-in emails.

## Develop

Use Node.js 26 (see `.nvmrc`).

```sh
npm ci
cp .env.example .env
npm run dev
```

Without `DATABASE_URL`, the public collection uses bundled poems. Accounts and
submissions require the configured database and authentication below.

## Set up Neon and email

1. Create a Neon project and copy its pooled PostgreSQL connection URL into
   `DATABASE_URL` in `.env`. Keep `sslmode=require`. Set `DATABASE_URL_DIRECT` to the direct (unpooled)
   URL for migrations. Use the database owner for
   setup; the app requires permission to switch into the two restricted roles
   created by the migration. Never expose this URL in client code.
2. Set `BETTER_AUTH_URL` to `http://127.0.0.1:5173` locally and your HTTPS site
   origin in production. Set `BETTER_AUTH_SECRET` to a random secret of at least
   32 characters (`openssl rand -base64 32`). Keep it stable between deployments.
3. Create a Resend API key and verify a sending domain. Set `RESEND_API_KEY`
   and `AUTH_EMAIL_FROM`. The testing sender only delivers to permitted test
   recipients; a verified domain is required for public sign-in. Neon and
   Resend have separate free quotas; email delivery also requires your domain.
4. Prepare an **empty** Neon database:

   ```sh
   npm run db:migrate
   npm run db:seed
   ```

   The migration command creates Better Auth's tables and applies the tracked
   poem migration once. It reads `.env`. Run the generated `neon/seed.sql` in
   Neon's SQL Editor to load the 15 initial poems. Rerunning the seed preserves
   existing slugs. Builds do not migrate or seed databases.
5. Sign in, then grant yourself editorial access in Neon's SQL Editor:

   ```sql
   insert into private.site_admins (user_id)
   select id from public."user" where email = 'your@email.com'
   on conflict do nothing;
   ```

Better Auth handles `/api/auth/*`; successful magic links return through
`/auth/callback`. Session validation happens on the server. Database queries
run in a transaction with `SET LOCAL ROLE` and a server-verified user ID.
Row-level policies protect drafts, author ownership and moderation; restricted
column grants protect source metadata. PostgreSQL enforces the daily submission
limit. Account state is never publicly cached. Published poem details and collection
statistics use a bounded, per-server 30-second memory cache that also shares
concurrent reads. Editorial decisions clear that server's cache immediately;
other running instances refresh within 30 seconds. Collection pagination and
poem recommendations each load in a single SQL query. The collection ships six small sample poems in the frontend and renders them
before fetching the complete, filtered archive in the background. A loading
indicator explains the partial results, and failed refreshes retain the bundled
poems with a Retry button. Page navigation and saved-list fetches also display
loading indicators. The complete archive and unbundled poem pages may still
wait for Neon to wake up on the first request.

## Existing Supabase data

The setup above seeds the bundled collection only. It does not transfer existing
Supabase accounts, community poems or admin membership. Keep a backup of the
old database. Before switching a live site, import existing poems and migrate
accounts with an explicit old-user-ID to Better-Auth-user-ID mapping; preserve
those mappings in `owner_id` and `private.site_admins`. Supabase sessions and
old sign-in links will not work with Better Auth. Do not run the new migration
against the old Supabase database.

## Verify and deploy

```sh
npm run check
npm test
npm run build
```

Database tests run in isolated PGlite and check seed integrity, Khmer search,
private drafts, authorship, editorial decisions and submission limits. They
require no Neon credentials.

Import the repository into Vercel with the SvelteKit preset. Add the variables
from `.env.example` to the relevant deployment environments, using that
environment's origin for `BETTER_AUTH_URL`. Use separate databases and secrets
for untrusted preview deployments. Redeploy after changing environment variables.
GitHub Actions runs checks, tests and the production build.

After setup, verify `/collection`, request and open an email link at `/login`,
save a draft, submit it, approve it at `/admin`, and sign out. Hosted database
connectivity and email delivery must be tested with your actual credentials.

References: [Neon connections](https://neon.com/docs/connect/connect-from-any-app),
[Better Auth SvelteKit integration](https://better-auth.com/docs/integrations/svelte-kit),
[Better Auth magic links](https://better-auth.com/docs/plugins/magic-link),
[Resend sending domains](https://resend.com/docs/dashboard/domains/introduction).
