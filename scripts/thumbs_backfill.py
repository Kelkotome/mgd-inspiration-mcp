#!/usr/bin/env python3
"""thumbs-r1 (27-Nov-2026): pre-made R2 thumbnails for every library image, so the phone app's grid
(GET /inspiration/img/t/<image_key>?src=app, stored-only) never needs a Cloudflare Images transform.

For each image key (items/… design + Unsplash, museum/…, annual/…, ui/…) it
  1. reads the original: R2 directly over the S3 API when R2 credentials exist, else the public site
     https://madegooddesigns.com/inspiration/img/<key> (User-Agent curl/8.4.0, the WAF needs it; <= 4 at a time,
     backs off on 429/403/5xx),
  2. makes the same thumbnail the Worker makes (src/mcp_gallery.js resize()): fit inside 320x400 without enlarging,
     white background, JPEG quality 72; if that is over 60 KB, 240 px wide at quality 55; still over -> skipped.
     ui/ screens (never transformed by the Worker) are 320 px wide, top-cropped at 1600 px (240/1200 fallback),
  3. uploads it to R2 at thumb/<image_key>.jpg (Content-Type image/jpeg, Cache-Control public, max-age=31536000, immutable)
     with S3 (fast, parallel) or `wrangler r2 bulk put --remote` (Cloudflare API; throttled to stay under the account's
     1,200 requests / 5 min API limit so deploys/purges keep working).

Image keys: ONE D1 query (SELECT id, image_key, collection, created_at FROM items WHERE status='published'), cached in
<state>/keys.json; later runs reuse the cache (no D1 reads) unless --refresh-keys. --since YYYY-MM-DD reads only items
created on/after that day (indexed, rows read ~ new items). --keys FILE takes a list (one key per line, a JSON list, or
wrangler `d1 execute --json` output) and reads nothing from D1.

Resumable: <state>/done.txt (one key per line, appended after each successful upload); done keys are skipped.
--check-remote also skips keys whose thumbnail is already live (GET …/img/t/<key>?src=app -> 200), but ONLY after a probe
proves the stored-only mode is deployed (a missing sentinel key must answer 302 + X-MGD-Thumb: none); the old route would
transform, so without the probe it never calls /img/t/.
STOP file: touch <state>/STOP to finish the batch in flight and exit. --dry-run: plan + projections (reads the key list:
cache, file or the one --since query), no downloads, no uploads.

Usage (from anywhere):
  python3 scripts/thumbs_backfill.py --dry-run                     # plan for the whole library
  python3 scripts/thumbs_backfill.py --limit 50 --spread           # pilot, ~equal share per collection
  python3 scripts/thumbs_backfill.py                               # full run (resumable)
  python3 scripts/thumbs_backfill.py --since 2026-11-27            # a new library round
  python3 scripts/thumbs_backfill.py --keys keep_keys.txt          # a staging folder's keep list
Env (optional, S3 mode): R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID (also read from ~/Downloads/EtiennAubertBonn/.env)
+ `pip install boto3`. Never printed.
"""
import argparse, io, json, os, random, re, subprocess, sys, tempfile, threading, time, urllib.error, urllib.request
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)                        # mgd-inspiration checkout (wrangler.jsonc lives here)
ENV_FILE = os.path.expanduser("~/Downloads/EtiennAubertBonn/.env")
BUCKET = "mgd-inspiration-images"
D1_NAME = "mgd-inspiration"
SITE = "https://madegooddesigns.com/inspiration"
UA = "curl/8.4.0"
THUMB_MAX = 60 * 1024
PASSES = [(320, 72), (240, 55)]                     # same as the Worker's resize()
BOX_H = 400
CACHE_CONTROL = "public, max-age=31536000, immutable"
APP_KEY = re.compile(r"^(items|museum|annual|ui)/[A-Za-z0-9._-]{1,80}\.(jpe?g|png|webp)$")   # = okAppKey in mcp_gallery.js
PROBE_KEY = "items/zz-thumbs-r1-probe-000000.png"   # never exists; the stored-only route must 302 it with X-MGD-Thumb: none

thumb_key = lambda k: f"thumb/{k}.jpg"
def group_of(row):
    k = row["key"]; p = k.split("/", 1)[0]
    if p == "items": return "unsplash" if "unsplash" in (row.get("host") or "") else ("design-jpg" if k.endswith((".jpg", ".jpeg")) else "design-png")
    return {"annual": "annual", "museum": "museum", "ui": "ui"}.get(p, p)

def log(state, msg):
    line = f"{datetime.now().strftime('%H:%M:%S')} {msg}"
    print(line, flush=True)
    with open(os.path.join(state, "run.log"), "a") as f: f.write(line + "\n")

# ---------------------------------------------------------------- keys
def wrangler(args, timeout=600):
    return subprocess.run(["npx", "wrangler", *args], cwd=REPO, capture_output=True, text=True, timeout=timeout)

def d1_rows(sql):
    r = wrangler(["d1", "execute", D1_NAME, "--remote", "--json", "--command", sql])
    if r.returncode: raise SystemExit("D1 query failed: " + (r.stderr or r.stdout)[-400:])
    d = json.loads(r.stdout)[0]
    return d["results"], d.get("meta", {}).get("rows_read")

def rows_from_any(path):
    txt = open(path).read().strip()
    if txt.startswith("["):
        j = json.loads(txt)
        if j and isinstance(j[0], dict) and "results" in j[0]: j = j[0]["results"]   # wrangler --json output
        return [x if isinstance(x, dict) else {"image_key": x} for x in j]
    return [{"image_key": ln.strip()} for ln in txt.splitlines() if ln.strip() and not ln.startswith("#")]

def norm(rows):
    out, seen = [], set()
    for r in rows:
        k = str(r.get("image_key") or r.get("key") or "").replace("/inspiration/img/", "").lstrip("/")
        if k.startswith("img/"): k = k[4:]
        if not APP_KEY.match(k) or k in seen: continue
        seen.add(k); out.append({"key": k, "coll": r.get("collection") or r.get("coll"), "host": r.get("source_host") or r.get("host") or "", "created": r.get("created_at") or r.get("created")})
    return out

def load_keys(a, state):
    if a.keys: return norm(rows_from_any(a.keys)), f"file {a.keys}"
    if a.since:
        ms = int(datetime.strptime(a.since, "%Y-%m-%d").replace(tzinfo=timezone.utc).timestamp() * 1000)
        rows, rr = d1_rows(f"SELECT id, image_key, collection, created_at, source_host FROM items WHERE status='published' AND created_at >= {ms}")
        return norm(rows), f"D1 --since {a.since} (rows_read={rr})"
    cache = os.path.join(state, "keys.json")
    if os.path.exists(cache) and not a.refresh_keys:
        return json.load(open(cache)), f"cache {cache}"
    if a.dry_run and not a.refresh_keys:
        raise SystemExit(f"no key cache at {cache}; run once without --dry-run (or with --refresh-keys) to read D1 (~110k rows, once)")
    rows, rr = d1_rows("SELECT id, image_key, collection, created_at, source_host FROM items WHERE status='published'")
    ks = norm(rows); json.dump(ks, open(cache, "w"))
    return ks, f"D1 full (rows_read={rr}), cached to {cache}"

def spread(rows):   # round-robin across groups, so --limit N samples every collection
    by = {}
    for r in rows: by.setdefault(group_of(r), []).append(r)
    for v in by.values(): random.Random(7).shuffle(v)
    out, qs = [], [deque(v) for _, v in sorted(by.items())]
    while any(qs):
        for q in qs:
            if q: out.append(q.popleft())
    return out

# ---------------------------------------------------------------- thumbnail (same parameters as the Worker)
UI_PASSES = [(320, 72, 1600), (240, 55, 1200)]     # ui/ screens (the Worker never transforms these): keep the full width, top-crop
                                                    # very tall full-page shots, instead of a 15 px sliver inside the 320x400 box
def make_thumb(data, key=""):
    from PIL import Image, ImageOps
    Image.MAX_IMAGE_PIXELS = 400_000_000
    im = Image.open(io.BytesIO(data))
    if im.format == "JPEG": im.draft("RGB", (PASSES[0][0] * 2, BOX_H * 2))     # fast DCT downscale, still >= 2x the target
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA"); bg = Image.new("RGB", im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")
    if key.startswith("ui/"):
        for w, q, maxh in UI_PASSES:
            t = im.copy()
            if t.width > w: t = t.resize((w, max(1, round(t.height * w / t.width))), Image.LANCZOS)
            if t.height > maxh: t = t.crop((0, 0, t.width, maxh))
            buf = io.BytesIO(); t.save(buf, "JPEG", quality=q, optimize=True)
            if 0 < buf.tell() <= THUMB_MAX: return buf.getvalue(), t.size
        return None, None
    for w, q in PASSES:
        t = im.copy(); t.thumbnail((w, BOX_H), Image.LANCZOS)                 # scale-down: never enlarges
        buf = io.BytesIO(); t.save(buf, "JPEG", quality=q, optimize=True)
        if 0 < buf.tell() <= THUMB_MAX: return buf.getvalue(), t.size
    return None, None

# ---------------------------------------------------------------- sources / sinks
def read_env():
    env = dict(os.environ)
    try:
        for ln in open(ENV_FILE):
            m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$", ln)
            if m and m.group(1).startswith("R2_") and m.group(1) not in env: env[m.group(1)] = m.group(2).strip().strip('"\'')
    except OSError: pass
    return env

def s3_client():
    env = read_env()
    if not all(env.get(k) for k in ("R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ACCOUNT_ID")): return None
    try: import boto3
    except ImportError: return None
    return boto3.client("s3", endpoint_url=f"https://{env['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com", aws_access_key_id=env["R2_ACCESS_KEY_ID"],
                        aws_secret_access_key=env["R2_SECRET_ACCESS_KEY"], region_name="auto")

class Polite:
    """Shared pacing for the public site: min interval between request starts + a global pause after 429/403."""
    def __init__(s, rps): s.gap = 1.0 / rps; s.lock = threading.Lock(); s.next = 0.0; s.pause_until = 0.0
    def wait(s):
        with s.lock:
            now = time.time(); at = max(now, s.next, s.pause_until); s.next = at + s.gap
        if at > now: time.sleep(at - now)
    def back_off(s, secs):
        with s.lock: s.pause_until = max(s.pause_until, time.time() + secs)

class NoRedir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
OPENER = urllib.request.build_opener(NoRedir)

def http_get(url, follow=True, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    try:
        r = (urllib.request.urlopen if follow else OPENER.open)(req, timeout=timeout)
        return r.status, r.headers, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.headers, e.read()

def fetch_original(key, pol, s3, tries=6):
    if s3:
        return s3.get_object(Bucket=BUCKET, Key=key)["Body"].read()
    delay = 5
    for i in range(tries):
        pol.wait()
        try: st, h, b = http_get(f"{SITE}/img/{key}")
        except Exception as e: st, h, b = 0, {}, str(e).encode()
        if st == 200 and b: return b
        if st == 404: raise LookupError("original 404")
        if st in (403, 429, 0) or st >= 500:
            ra = h.get("Retry-After") if h else None
            wait = int(ra) if ra and str(ra).isdigit() else delay
            if st in (403, 429): pol.back_off(wait)        # everyone pauses, not just this thread
            time.sleep(wait); delay = min(delay * 2, 300); continue
        raise RuntimeError(f"HTTP {st}")
    raise RuntimeError("gave up after retries")

class ApiBudget:
    """Rolling 5-minute window for Cloudflare API calls made by `wrangler r2 bulk put` (account limit 1,200 / 5 min)."""
    def __init__(s, per5): s.per5 = per5; s.sent = deque()
    def take(s, n, stop):
        while True:
            now = time.time()
            while s.sent and now - s.sent[0][0] > 300: s.sent.popleft()
            used = sum(x[1] for x in s.sent)
            if used + n <= s.per5: s.sent.append((now, n)); return True
            if stop(): return False
            time.sleep(2)

def upload_wrangler(batch, tmpdir):
    man = os.path.join(tmpdir, f"manifest-{int(time.time()*1000)}.json")
    json.dump([{"key": thumb_key(k), "file": p} for k, p in batch], open(man, "w"))
    r = wrangler(["r2", "bulk", "put", BUCKET, "--remote", "--filename", man, "--ct", "image/jpeg", "--cc", CACHE_CONTROL,
                  "--concurrency", "8", "--force"], timeout=1800)
    os.remove(man)
    if r.returncode: raise RuntimeError((r.stderr or r.stdout)[-500:])

def upload_s3(s3, key, data):
    s3.put_object(Bucket=BUCKET, Key=thumb_key(key), Body=data, ContentType="image/jpeg", CacheControl=CACHE_CONTROL)

def stored_only_live():
    st, h, _ = http_get(f"{SITE}/img/t/{PROBE_KEY}?src=app", follow=False)
    return st == 302 and (h.get("X-MGD-Thumb") or "") == "none"

# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--state", default=os.path.expanduser("~/.mgd-thumbs"), help="state dir (keys cache, done list, logs, STOP)")
    ap.add_argument("--keys", help="key list file (lines / JSON list / wrangler --json output); no D1 read")
    ap.add_argument("--since", help="YYYY-MM-DD (UTC): only items created on/after (one indexed D1 query)")
    ap.add_argument("--refresh-keys", action="store_true", help="re-run the one full D1 query (~110k rows read)")
    ap.add_argument("--only", help="comma list of groups: design-png,design-jpg,unsplash,museum,annual,ui")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--spread", action="store_true", help="round-robin across groups (pilot sampling)")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-upload", action="store_true", help="make thumbs into <state>/out only")
    ap.add_argument("--check-remote", action="store_true", help="skip keys already live (needs the stored-only route deployed)")
    ap.add_argument("--concurrency", type=int, default=4, help="parallel downloads (site mode is capped at 4)")
    ap.add_argument("--rps", type=float, default=6.0, help="max requests/second to the public site")
    ap.add_argument("--batch", type=int, default=150, help="thumbs per wrangler bulk put")
    ap.add_argument("--api-per-5min", type=int, default=900, help="Cloudflare API calls per rolling 5 min for uploads (limit is 1,200)")
    ap.add_argument("--keep-files", action="store_true", help="keep generated jpgs in <state>/out after upload")
    a = ap.parse_args()
    state = a.state; os.makedirs(state, exist_ok=True); out_dir = os.path.join(state, "out"); os.makedirs(out_dir, exist_ok=True)
    stopf = os.path.join(state, "STOP"); stop = lambda: os.path.exists(stopf)
    if stop(): raise SystemExit(f"STOP file present ({stopf}); remove it to run")

    rows, src = load_keys(a, state)
    done_path = os.path.join(state, "done.txt")
    done = set(open(done_path).read().split()) if os.path.exists(done_path) else set()
    total = len(rows)
    if a.only: rows = [r for r in rows if group_of(r) in set(a.only.split(","))]
    todo = [r for r in rows if r["key"] not in done]
    if a.spread: todo = spread(todo)
    if a.limit: todo = todo[: a.limit]
    groups = {}
    for r in todo: groups[group_of(r)] = groups.get(group_of(r), 0) + 1
    s3 = None if a.dry_run else s3_client()
    mode_src = "R2 (S3 API)" if s3 else "public site (curl/8.4.0)"
    mode_up = "none (--no-upload)" if a.no_upload else ("S3 put_object" if s3 else "wrangler r2 bulk put --remote")
    log(state, f"keys: {total} from {src}; done already {len(done)}; to do {len(todo)} {groups}")
    log(state, f"source: {mode_src}; upload: {mode_up}; state: {state}")
    if a.dry_run:
        dl = len(todo) / min(a.rps, 5.0)                           # pilot: ~5 originals/s with 4 workers
        ul = len(todo) / (a.api_per_5min / 300.0)
        log(state, f"dry-run: projected ~{max(dl, ul)/3600:.1f} h in site+wrangler mode (downloads ~{dl/3600:.1f} h, uploads ~{ul/3600:.1f} h at {a.api_per_5min}/5 min); "
                   f"storage ~{len(todo)*9.2/1e6:.2f} GB at ~9.2 KB/thumb (pilot mix: design PNG ~4 KB, photos ~14-17 KB, ui ~40 KB)")
        return
    if a.check_remote and not stored_only_live():
        raise SystemExit("--check-remote: the stored-only route (?src=app) is not live yet; refusing to call /img/t/ (it would transform)")
    if not s3: a.concurrency = min(a.concurrency, 4)

    pol, budget, lock = Polite(a.rps), ApiBudget(a.api_per_5min), threading.Lock()
    stats = {"ok": 0, "skip_live": 0, "too_big": 0, "fail": 0, "bytes": 0, "uploaded": 0}
    pending, t0 = [], time.time()
    tmpdir = tempfile.mkdtemp(prefix="thumbs-", dir=state)
    failed = open(os.path.join(state, "failed.tsv"), "a")
    donef = open(done_path, "a")

    def mark_done(keys):
        with lock:
            for k in keys: donef.write(k + "\n"); done.add(k)
            donef.flush()

    def flush(force=False):
        nonlocal pending
        if a.no_upload or s3: return
        while len(pending) >= a.batch or (force and pending):
            batch, pending = pending[: a.batch], pending[a.batch:]
            if not budget.take(len(batch), lambda: False): return
            for attempt in range(4):
                try: upload_wrangler(batch, tmpdir); break
                except Exception as e:
                    log(state, f"bulk put failed (attempt {attempt+1}): {str(e)[-200:]}"); time.sleep(60 * (attempt + 1))
            else:
                for k, _ in batch: failed.write(f"{k}\tupload failed\n")
                continue
            mark_done([k for k, _ in batch]); stats["uploaded"] += len(batch)
            if not a.keep_files:
                for _, p in batch:
                    try: os.remove(p)
                    except OSError: pass

    def work(r):
        k = r["key"]
        if stop(): return k, "stopped", None
        if a.check_remote:
            pol.wait()
            st, h, _ = http_get(f"{SITE}/img/t/{k}?src=app", follow=False)
            if st == 200 and h.get("X-MGD-Thumb") == "stored": return k, "live", None
        data = fetch_original(k, pol, s3)
        th, size = make_thumb(data, k)
        if th is None: return k, "too_big", None
        if s3 and not a.no_upload:
            upload_s3(s3, k, th); return k, "ok-up", len(th)
        p = os.path.join(out_dir, k.replace("/", "__") + ".jpg")
        open(p, "wb").write(th)
        return k, "ok", (p, len(th))

    n = 0
    with ThreadPoolExecutor(a.concurrency) as ex:
        it = iter(todo); futs = set()
        def refill():
            while len(futs) < a.concurrency * 3 and not stop():
                r = next(it, None)
                if r is None: return
                futs.add(ex.submit(work, r))
        refill()
        while futs:
            f = next(as_completed(futs)); futs.discard(f)
            try:
                k, res, extra = f.result()
            except Exception as e:
                k, res, extra = "?", "fail", str(e)
            if res == "ok":
                pending.append((k, extra[0])); stats["ok"] += 1; stats["bytes"] += extra[1]
                if a.no_upload: mark_done([])
            elif res == "ok-up":
                stats["ok"] += 1; stats["uploaded"] += 1; stats["bytes"] += extra; mark_done([k])
            elif res == "live": stats["skip_live"] += 1; mark_done([k])
            elif res == "too_big": stats["too_big"] += 1; failed.write(f"{k}\tthumb over 60 KB at 240px q55\n")
            elif res == "fail": stats["fail"] += 1; failed.write(f"{k}\t{extra}\n")
            n += 1
            if n % 100 == 0:
                el = time.time() - t0
                log(state, f"{n}/{len(todo)} ok={stats['ok']} up={stats['uploaded']} live={stats['skip_live']} big={stats['too_big']} fail={stats['fail']} "
                           f"avg={stats['bytes']//max(1,stats['ok'])} B; {n/el:.2f}/s; eta {(len(todo)-n)/max(n/el,1e-6)/3600:.1f} h")
            flush()
            refill()
    flush(force=True)
    failed.close(); donef.close()
    try: os.rmdir(tmpdir)
    except OSError: pass
    el = time.time() - t0
    log(state, f"finished{' (STOP file)' if stop() else ''}: {json.dumps(stats)}; avg thumb {stats['bytes']//max(1,stats['ok'])} B; {el:.0f} s ({n/max(el,1e-6):.2f}/s)")

if __name__ == "__main__":
    main()
