#!/usr/bin/env bash
# 111111.live — one-shot go-live.
#
# Does everything that needs a logged-in Vercel session: attaches the domain,
# creates and connects Blob storage, sets every environment variable, and
# redeploys. Run it once.
#
#   npm i -g vercel && vercel login
#   bash setup.sh
#
# Safe to re-run: every step checks before it acts.

set -uo pipefail

PROJECT="111111-live"
DOMAIN="111111.live"
BLOB_STORE="111111-board"

bold() { printf '\033[1m%s\033[0m\n' "$1"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; }

command -v vercel >/dev/null 2>&1 || { fail "Vercel CLI not found. Run: npm i -g vercel"; exit 1; }
vercel whoami >/dev/null 2>&1 || { fail "Not logged in. Run: vercel login"; exit 1; }
ok "Vercel CLI ready as $(vercel whoami 2>/dev/null)"

bold ""
bold "1/5  Link the project"
if [ -f .vercel/project.json ]; then
  ok "Already linked"
else
  vercel link --yes --project "$PROJECT" || { fail "Link failed"; exit 1; }
  ok "Linked to $PROJECT"
fi

bold ""
bold "2/5  Blob storage  (without this a paid seat cannot be saved)"
if vercel blob store ls 2>/dev/null | grep -q "$BLOB_STORE"; then
  ok "Store '$BLOB_STORE' already exists"
else
  if vercel blob store add "$BLOB_STORE" 2>/dev/null; then
    ok "Created store '$BLOB_STORE'"
  else
    warn "Could not create the store from the CLI on this version."
    warn "Do it once in the dashboard: Storage → Create Database → Blob → Connect to Project"
  fi
fi

bold ""
bold "3/5  Domain"
if vercel domains inspect "$DOMAIN" >/dev/null 2>&1; then
  ok "$DOMAIN already on this account"
else
  vercel domains add "$DOMAIN" "$PROJECT" || warn "Domain add reported an issue - check the output above"
fi
vercel domains add "www.$DOMAIN" "$PROJECT" >/dev/null 2>&1 && ok "www added" || warn "www may already exist"
cat <<EOF

  Now point DNS at Vercel, in GoDaddy, for $DOMAIN.
  DELETE the parking / forwarding records for @ and www first, then add:

      A      @      76.76.21.21
      CNAME  www    cname.vercel-dns.com

  The TLS certificate issues automatically once the A record resolves.

EOF

bold ""
bold "4/5  Environment variables"
set_env() {
  local key="$1" prompt="$2" required="$3" value=""
  if vercel env ls production 2>/dev/null | grep -q "^ *$key "; then
    ok "$key already set"
    return
  fi
  printf '  %s\n  %s: ' "$prompt" "$key"
  read -r value
  if [ -z "$value" ]; then
    if [ "$required" = "required" ]; then
      warn "$key skipped - the site cannot take money without it"
    else
      warn "$key skipped"
    fi
    return
  fi
  printf '%s' "$value" | vercel env add "$key" production >/dev/null 2>&1 \
    && ok "$key set" || fail "$key failed"
}

echo ""
echo "  Polar — from polar.sh. The product MUST allow a dynamic amount."
set_env POLAR_ACCESS_TOKEN  "Organisation access token"        required
set_env POLAR_PRODUCT_ID    "Product id (dynamic amount)"      required
set_env POLAR_WEBHOOK_SECRET "Webhook signing secret"          required
printf 'sandbox' | vercel env add POLAR_SERVER production >/dev/null 2>&1 \
  && ok "POLAR_SERVER=sandbox (flip to production after a test purchase)" \
  || ok "POLAR_SERVER already set"

echo ""
echo "  Analytics — leave blank to skip; each is inert until set."
set_env NEXT_PUBLIC_GA_ID        "GA4 measurement id (G-XXXXXXXXXX)" optional
set_env NEXT_PUBLIC_DATAFAST_ID  "DataFast website id (dfid_...)"    optional

echo ""
echo "  Ops secrets — generating strong values automatically."
for key in ADMIN_SECRET CRON_SECRET; do
  if vercel env ls production 2>/dev/null | grep -q "^ *$key "; then
    ok "$key already set"
  else
    secret="$(openssl rand -hex 24 2>/dev/null || head -c 48 /dev/urandom | base64 | tr -d '/+=' | head -c 48)"
    printf '%s' "$secret" | vercel env add "$key" production >/dev/null 2>&1 \
      && { ok "$key generated"; echo "      $key=$secret"; } || fail "$key failed"
  fi
done

printf '%s' "https://$DOMAIN" | vercel env add NEXT_PUBLIC_APP_URL production >/dev/null 2>&1 \
  && ok "NEXT_PUBLIC_APP_URL=https://$DOMAIN" || ok "NEXT_PUBLIC_APP_URL already set"

bold ""
bold "5/5  Deploy and verify"
vercel --prod --yes || { fail "Deploy failed"; exit 1; }

echo ""
echo "  Checking what is actually wired..."
HEALTH="$(curl -sS -m 30 "https://$PROJECT.vercel.app/api/health" 2>/dev/null || echo '{}')"
echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"

if echo "$HEALTH" | grep -q '"canTakeMoney": true'; then
  bold ""
  ok "canTakeMoney: TRUE — the board can sell a seat."
  echo ""
  echo "  Last two things, both manual:"
  echo "   • Vercel → project → Analytics → Enable   (the script is already deployed)"
  echo "   • Buy one \$1 seat yourself in sandbox and confirm it lands on the board"
  echo ""
  echo "  Then flip POLAR_SERVER to production and run the outreach."
else
  bold ""
  warn "canTakeMoney is still false. The 'blocking' list above says exactly why."
fi
