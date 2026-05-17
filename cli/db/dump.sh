#!/usr/bin/env bash
# Dump a Postgres database via Docker so you don't need a local pg_dump
# matching the server version. Defaults target Supabase (PG17), public schema.
#
# Restore on another server (any matching or newer pg_restore):
#   pg_restore --no-owner --no-acl -d 'postgres://USER:PASS@HOST:PORT/DB' file.tar
# For --format plain (.sql):
#   psql 'postgres://...' -f file.sql

set -euo pipefail

FORMAT="tar"
OUT="backups"
SCHEMA="public"
DB_URL="${SUPABASE_DB_URL:-}"
PG_IMAGE="${PG_DUMP_IMAGE:-postgres:17-alpine}"
EXTRA_ARGS=()

usage() {
	cat <<EOF
Usage: cli/db/dump.sh [options]

Options:
  --format tar|custom|plain  Dump format (default: tar)
                             - tar/custom: restore with pg_restore
                             - plain:      readable SQL, restore with psql -f
  --out DIR                  Output directory (default: backups)
  --db-url URL               Source DB URL (default: \$SUPABASE_DB_URL from .env)
  --schema NAME              Schema to dump (default: public)
  --all-schemas              Dump every schema (omit -n public)
  --schema-only              Schema/DDL only, no data
  --data-only                Data only, no schema
  --image REF                pg_dump image (default: postgres:17-alpine, override
                             via PG_DUMP_IMAGE)
  -h, --help                 Show this help

Notes:
  Supabase exposes three connection strings:
    direct:        db.<ref>.supabase.co:5432       <- USE THIS for pg_dump
    pooler/session: aws-X-...pooler.supabase.com:5432
    pooler/tx:      aws-X-...pooler.supabase.com:6543  <- WILL FAIL (PgBouncer
                                                          transaction mode)
  Your .env SUPABASE_DB_URL uses the transaction pooler. Pass --db-url with the
  direct connection string if pg_dump errors out.

Examples:
  cli/db/dump.sh                                     # tar of public schema
  cli/db/dump.sh --format custom                     # compressed custom format
  cli/db/dump.sh --format plain --schema-only        # readable DDL .sql
  cli/db/dump.sh --db-url 'postgres://...:5432/...'  # explicit direct URL
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--format) FORMAT="$2"; shift 2 ;;
		--out) OUT="$2"; shift 2 ;;
		--db-url) DB_URL="$2"; shift 2 ;;
		--schema) SCHEMA="$2"; shift 2 ;;
		--all-schemas) SCHEMA=""; shift ;;
		--schema-only) EXTRA_ARGS+=("--schema-only"); shift ;;
		--data-only) EXTRA_ARGS+=("--data-only"); shift ;;
		--image) PG_IMAGE="$2"; shift 2 ;;
		-h|--help) usage; exit 0 ;;
		*) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
	esac
done

if [[ -z "$DB_URL" && -f ".env" ]]; then
	DB_URL=$(grep -E '^SUPABASE_DB_URL=' .env | head -1 | cut -d= -f2- | sed -e 's/^["'\'']//; s/["'\'']$//')
fi

if [[ -z "$DB_URL" ]]; then
	echo "Error: no DB URL. Set SUPABASE_DB_URL in .env or pass --db-url" >&2
	exit 1
fi

case "$FORMAT" in
	tar)    FORMAT_FLAG="-Ft"; EXT="tar" ;;
	custom) FORMAT_FLAG="-Fc"; EXT="dump" ;;
	plain)  FORMAT_FLAG="-Fp"; EXT="sql" ;;
	*) echo "Invalid --format: $FORMAT (use tar|custom|plain)" >&2; exit 1 ;;
esac

if [[ "$DB_URL" == *":6543"* ]]; then
	echo "warn: DB URL uses port 6543 (PgBouncer transaction mode)." >&2
	echo "      pg_dump needs a direct or session-mode connection." >&2
	echo "      Try the direct URL: db.<ref>.supabase.co:5432" >&2
	echo >&2
fi

mkdir -p "$OUT"
OUT_ABS=$(cd "$OUT" && pwd)
TS=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
FILENAME="telnetquiz-${TS}.${EXT}"

SCHEMA_ARGS=()
if [[ -n "$SCHEMA" ]]; then
	SCHEMA_ARGS=("-n" "$SCHEMA")
fi

echo "============================================================"
echo "  Postgres Dump (pg_dump via Docker)"
echo "============================================================"
echo "  Image:   $PG_IMAGE"
echo "  Format:  $FORMAT ($FORMAT_FLAG)"
echo "  Schema:  ${SCHEMA:-<all>}"
echo "  Output:  $OUT_ABS/$FILENAME"
echo

docker run --rm \
	--user "$(id -u):$(id -g)" \
	-v /etc/passwd:/etc/passwd:ro \
	-v /etc/group:/etc/group:ro \
	-e HOME=/tmp \
	-v "$OUT_ABS:/dump" \
	"$PG_IMAGE" \
	pg_dump \
		"$DB_URL" \
		"${SCHEMA_ARGS[@]}" \
		--no-owner \
		--no-acl \
		"$FORMAT_FLAG" \
		-f "/dump/$FILENAME" \
		"${EXTRA_ARGS[@]}"

SIZE=$(du -h "$OUT_ABS/$FILENAME" | cut -f1)
echo
echo "============================================================"
echo "  DUMP COMPLETE  ($SIZE)"
echo "============================================================"
echo "  $OUT_ABS/$FILENAME"
echo
case "$FORMAT" in
	plain)
		echo "Restore:"
		echo "  psql 'postgres://USER:PASS@HOST:PORT/DB' -f '$OUT_ABS/$FILENAME'"
		;;
	*)
		echo "Restore (any pg_restore >= server version, no DB17 needed locally"
		echo "if you also use docker):"
		echo "  pg_restore --no-owner --no-acl --clean --if-exists \\"
		echo "    -d 'postgres://USER:PASS@HOST:PORT/DB' '$OUT_ABS/$FILENAME'"
		echo
		echo "Or via Docker (matches dump version):"
		echo "  docker run --rm -v '$OUT_ABS:/dump' $PG_IMAGE \\"
		echo "    pg_restore --no-owner --no-acl --clean --if-exists \\"
		echo "    -d 'postgres://USER:PASS@HOST:PORT/DB' '/dump/$FILENAME'"
		;;
esac
