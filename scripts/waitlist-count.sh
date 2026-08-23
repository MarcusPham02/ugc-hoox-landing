#!/usr/bin/env bash
# Count waitlist signups via the Supabase REST API, broken down by A/B variant.
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
# The A/B test writes a `variant` column ('A' | 'B') on each signup. This is the
# "simple" comparison: assignment is ~50/50, so compare raw counts directly.
# For a richer breakdown run this in the Supabase SQL editor instead:
#   select coalesce(variant,'(none)') as variant, count(*) as signups
#   from waitlist group by variant order by variant;
set -euo pipefail
: "${SUPABASE_URL:?set SUPABASE_URL, e.g. https://xxxx.supabase.co}"
: "${SUPABASE_SERVICE_KEY:?set SUPABASE_SERVICE_KEY (Supabase > Settings > API > service_role)}"

# Return the exact row count for a query filter (e.g. "" or "variant=eq.A").
count_where() {
  local filter="$1"
  local url="${SUPABASE_URL}/rest/v1/waitlist?select=id"
  [ -n "$filter" ] && url="${url}&${filter}"
  curl -s -D - -o /dev/null "$url" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Prefer: count=exact" \
    -H "Range: 0-0" \
    | awk -F/ 'tolower($0) ~ /content-range/ {gsub(/\r/,""); print $2}'
}

echo "Waitlist signups"
echo "  total: $(count_where '')"
echo "  A (Get Early Access): $(count_where 'variant=eq.A')"
echo "  B (Join the Waitlist): $(count_where 'variant=eq.B')"
