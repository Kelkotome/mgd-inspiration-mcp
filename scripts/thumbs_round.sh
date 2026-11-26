#!/bin/bash
# thumbs-r1: thumbnails for a new library round (Unsplash / museum / annual / ui), after its ingest has merged.
# Reads only the round's new rows from D1 (status='published' AND created_at >= day, indexed), makes the thumbs and uploads them
# to R2 thumb/<image_key>.jpg. Resumable and idempotent (shares ~/.mgd-thumbs/done.txt with the backfill). Abort: touch ~/.mgd-thumbs/STOP
# Usage: bash scripts/thumbs_round.sh [YYYY-MM-DD]     (default: yesterday, UTC, so a round that crossed midnight is covered)
# Hook: in a lib_rNNN*.sh round script, after `hyg` (dedupe hygiene + purge) and outside any publisher window:
#   bash /Users/eugeneleow/Downloads/EtiennAubertBonn/mgd-inspiration-thumbs/scripts/thumbs_round.sh 2026-11-28
set -u
DAY=${1:-$(date -u -v-1d +%Y-%m-%d 2>/dev/null || date -u -d yesterday +%Y-%m-%d)}
cd "$(dirname "$0")/.." || exit 1
exec python3 -W ignore scripts/thumbs_backfill.py --since "$DAY" "${@:2}"
