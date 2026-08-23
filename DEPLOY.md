# Deploy & test — UGC Hoox landing page

The site is a static page (no build step) published from `Mock Ups/` to Netlify.
Signups go to **Netlify Forms** and a **Supabase `waitlist` table** in parallel;
a CTA A/B test tags each signup with a `variant` (`A` = "Get Early Access",
`B` = "Join the Waitlist").

> Forms and the injected Supabase credentials only exist on the **deployed**
> Netlify site — a local `python3 -m http.server` returns 501 on POST and cannot
> test submissions.

## 1. Point Netlify at this repo

Repo: `MarcusPham02/ugc-hoox-landing` (the local `origin`).

- Existing site: Netlify → **Site config → Build & deploy → Link to a different
  repository** → pick `ugc-hoox-landing`.
- Or new site: **Add new site → Import from Git** → `ugc-hoox-landing`.
- **Leave build settings blank** — the root `netlify.toml` supplies `base`
  (`Mock Ups`), `publish` (`.`), and the build command.

## 2. Environment variables (Netlify → Site config → Environment variables)

```
SUPABASE_URL       = https://<your-ref>.supabase.co
SUPABASE_ANON_KEY  = eyJ...            # anon / public key
```

The build `sed`-injects these into `index.html` (replacing the
`YOUR_SUPABASE_*` placeholders). If unset, signups still record to Netlify
Forms; only the Supabase insert is skipped.

## 3. Supabase (SQL editor)

The `waitlist` table already exists (name, email, message, created_at). Add the
A/B column:

```sql
alter table waitlist add column if not exists variant text;
```

Confirm anonymous inserts are allowed (needed so the public anon key can write).
Only if a submit errors with a policy message:

```sql
alter table waitlist enable row level security;
create policy "anon insert waitlist" on waitlist
  for insert to anon with check (true);
```

## 4. (Optional) Email on signup

Netlify → **Forms → Notifications** → add a recipient email.

## 5. Test end-to-end

1. Deploy (auto on push once linked). Open the **live** URL.
2. Submit the form — expect success with no 501.
3. Verify it landed:
   - Netlify → **Forms → `contact`** — submission incl. the `variant` field.
   - Supabase → **Table Editor → `waitlist`** — the row incl. `variant`.
   - Counts:
     ```sh
     export SUPABASE_URL="https://<your-ref>.supabase.co"
     export SUPABASE_SERVICE_KEY="<service_role key>"   # NOT the anon key; never commit
     bash scripts/waitlist-count.sh
     ```
4. A/B sanity (live console): `localStorage.setItem('ugchoox_ab_cta','B'); location.reload()`
   — all CTAs flip to variant B, and a submit records `variant=B`.

## Reading A/B results

Simple comparison (assignment is ~50/50, so compare raw counts):

```sql
select coalesce(variant,'(none)') as variant, count(*) as signups
from waitlist group by variant order by variant;
```

Or `bash scripts/waitlist-count.sh` (prints total + A + B).
