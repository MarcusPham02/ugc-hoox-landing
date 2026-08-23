#!/usr/bin/env bash
# Count waitlist signups via the Supabase REST API.
#
# Uses the SERVICE_ROLE key, which bypasses RLS — the site's anon key cannot
# read rows (SELECT is blocked), so it can't count. NEVER commit the key or use
# it in client-side code; export it in your shell only.
#
# Usage:
#   export SUPABASE_URL="https://<your-ref>.supabase.co"
#   export SUPABASE_SERVICE_KEY="<service_role key from Supabase > Settings > API>"
#   bash scripts/waitlist-count.sh
#
# For a richer breakdown (last 7 days, unique emails) run this in the Supabase
# SQL editor instead:
#   select count(*) as total_signups,
#          count(*) filter (where created_at > now() - interval '7 days') as last_7_days,
#          count(distinct email) as unique_emails
#   from waitlist;
set -euo pipefail
: "${SUPABASE_URL:?set SUPABASE_URL, e.g. https://xxxx.supabase.co}"
: "${SUPABASE_SERVICE_KEY:?set SUPABASE_SERVICE_KEY (Supabase > Settings > API > service_role)}"

total=$(curl -s -D - -o /dev/null \
  "${SUPABASE_URL}/rest/v1/waitlist?select=id" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Prefer: count=exact" \
  -H "Range: 0-0" \
  | awk -F/ 'tolower($0) ~ /content-range/ {gsub(/\r/,""); print $2}')

echo "Waitlist signups: ${total:-unknown}"
