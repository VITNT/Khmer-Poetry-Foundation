# Aksara · អក្សរ

A Khmer literature collection built with SvelteKit, Svelte 5, TypeScript, and custom CSS.

Poems are queried on the server from Supabase Postgres. Readers receive one page
of summaries and only load full text when opening a poem. Accounts use Supabase
email links, and community submissions require editorial approval.

## Develop

```sh
nvm use
npm ci
cp .env.example .env
npm run dev
```

Use Node.js 26, as specified in `.nvmrc` and `package.json`. Fill in `.env` with
your Supabase project URL and public publishable key.

## Verify

```sh
npm run check
npm test
npm run build
```

## GitHub and Vercel

GitHub stores the source and runs CI; Vercel hosts the SvelteKit application.
The Vercel adapter runs Supabase authentication, form actions, and database
queries in server functions.

1. Push this folder to your GitHub repository, including `package-lock.json`,
   `.github/workflows/ci.yml`, and `.env.example`. Local `.env` files and build
   output are ignored. If this folder is not yet a Git repository, initialize
   one and add your GitHub remote before pushing.
2. In Vercel, create a project and import that GitHub repository. Use the folder
   containing `package.json` as the Root Directory (`.` for a repository rooted
   here).
3. Keep the **SvelteKit** framework preset. `vercel.json` sets `npm ci` for
   installation and `npm run build` for the build. Leave Output Directory at
   its framework default; the Vercel adapter creates `.vercel/output` with both
   static assets and server functions. Node.js 26 is selected in `package.json`
   and the adapter configuration.
4. Add `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel's
   Environment Variables for Production and, if used, Preview and Development.
   Take the values from your Supabase project's API settings. These are public
   credentials; this app does not need a service-role key.
5. Prepare the Supabase database as described below, then deploy. In Supabase
   **Authentication → URL Configuration**, set Site URL to your production
   origin (for example, `https://your-project.vercel.app`) and allow the
   redirect URL `https://your-project.vercel.app/auth/callback**`. The final
   `**` allows the callback's `next` query parameter. Also allow
   `http://127.0.0.1:5173/auth/callback**` for local development. Add a separate
   callback rule for each trusted preview origin if preview sign-in is needed.

GitHub Actions runs type checks, the existing tests, and a production build on
pushes and pull requests. It needs no Supabase credentials; database tests use
an isolated local PGlite database. Vercel's Git integration handles deployments
after import: the production branch deploys to production and other branches
receive previews. No Vercel token or deployment workflow is required in GitHub.
Changing Vercel environment variables requires a new deployment.

### Prepare Supabase

For a new Supabase project, run
`supabase/migrations/202611080001_poems.sql` in its SQL Editor, or apply it with
your normal Supabase migration workflow. Generate the initial collection:

```sh
npm run db:seed
```

Run the generated `supabase/seed.sql` in the same project's SQL Editor. Existing
poem slugs are preserved when the seed is rerun. The generated seed is ignored
by Git because it can be recreated from the tracked source data. Builds and
deployments do not apply migrations or seed the database automatically.

After deployment, check `/collection` loads poems and `/login` sends a working
sign-in link before using account and submission features.

Configuration references: [SvelteKit Vercel adapter](https://svelte.dev/docs/kit/adapter-vercel),
[Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
and [GitHub Node.js CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).
For authentication callbacks, see [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
