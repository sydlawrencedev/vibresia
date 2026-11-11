#!/usr/bin/env python3
"""Export Search Console data for vibresia.com into a JSON file the SEO
routines read.

    python3 ops/seo/pulse/gsc-export.py --days 28 --name gsc-28d

Writes ops/seo/pulse/data/<name>-latest.json with:

  - the current window's totals and the previous window's totals
  - query x page rows for both windows
  - the latest complete date GSC actually has data for

The Google credentials come from Application Default Credentials, set up with
the Search Console scope:

    gcloud auth application-default login \
      --scopes=https://www.googleapis.com/auth/webmasters,https://www.googleapis.com/auth/webmasters.readonly

and the property is sc-domain:vibresia.com.

UNITS: ctr in the output is a PERCENTAGE (0-100), not a fraction. A threshold
written as "ctr < 3%" means "ctr < 3" in this JSON. Dividing by 100 gives a
fraction. This is the single most common unit mistake in this repo, so it is
stated here, in the JSON itself, and in every report that reads it.
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DATA_DIR = ROOT / "ops" / "seo" / "pulse" / "data"
SITE = "sc-domain:vibresia.com"

# GSC data lags roughly two days. A window that ends "today" is incomplete,
# so every window ends two days back.
DATA_LAG_DAYS = 2


def get_quota_project():
    """Return the quota_project_id from the ADC JSON file, or None."""
    adc_dir = os.environ.get("CLOUDSDK_CONFIG") or os.path.join(
        os.path.expanduser("~"), ".config", "gcloud"
    )
    adc_path = os.path.join(adc_dir, "application_default_credentials.json")
    try:
        with open(adc_path) as f:
            data = json.load(f)
        if isinstance(data, dict):
            return data.get("quota_project_id") or None
    except (OSError, ValueError):
        pass
    return None


def get_access_token():
    try:
        result = subprocess.run(
            ["gcloud", "auth", "application-default", "print-access-token"],
            capture_output=True, text=True, timeout=30,
        )
    except FileNotFoundError:
        print("ERROR: gcloud not found.", file=sys.stderr)
        sys.exit(1)
    except subprocess.TimeoutExpired:
        print("ERROR: gcloud timed out after 30s.", file=sys.stderr)
        sys.exit(1)
    if result.returncode != 0 or not result.stdout.strip():
        print("ERROR: not authenticated. Run:", file=sys.stderr)
        print("  gcloud auth application-default login \\", file=sys.stderr)
        print("    --scopes=https://www.googleapis.com/auth/webmasters,"
              "https://www.googleapis.com/auth/webmasters.readonly", file=sys.stderr)
        sys.exit(1)
    return result.stdout.strip()


def gsc_query(token, site_url, body):
    """Call the Search Analytics query endpoint."""
    encoded = urllib.parse.quote(site_url, safe="")
    url = (f"https://searchconsole.googleapis.com/webmasters/v3/sites/"
           f"{encoded}/searchAnalytics/query")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    quota_project = get_quota_project()
    if quota_project:
        headers["x-goog-user-project"] = quota_project
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else "(no body)"
        print(f"GSC API error {e.code}: {err_body}", file=sys.stderr)
        return {"rows": []}
    except urllib.error.URLError as e:
        print(f"GSC API network error: {e.reason}", file=sys.stderr)
        return {"rows": []}


def window(days, offset=0):
    """(start, end) for a window of `days`, `offset` windows back from now."""
    end = date.today() - timedelta(days=DATA_LAG_DAYS + offset * days)
    start = end - timedelta(days=days)
    return start.isoformat(), end.isoformat()


def query_rows(token, start, end, dimensions, row_limit=25000):
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": dimensions,
        "rowLimit": row_limit,
        "dataState": "all",
    }
    return gsc_query(token, SITE, body).get("rows", [])


def latest_complete_date(token):
    """The most recent date GSC actually holds data for."""
    end = date.today() - timedelta(days=DATA_LAG_DAYS)
    start = end - timedelta(days=14)
    rows = query_rows(token, start.isoformat(), end.isoformat(), ["date"], row_limit=30)
    if not rows:
        return end.isoformat()
    return max(r["keys"][0] for r in rows)


def summarise(rows):
    clicks = impressions = 0
    weighted = 0.0
    for r in rows:
        clicks += r.get("clicks", 0)
        impressions += r.get("impressions", 0)
        weighted += r.get("position", 0) * r.get("impressions", 0)
    return {
        "clicks": clicks,
        "impressions": impressions,
        "ctrPct": round((clicks / impressions) * 100, 2) if impressions else 0,
        "position": round(weighted / impressions, 2) if impressions else 0,
    }


def aggregate_by_query(rows):
    """One row per query: summed clicks and impressions, impression-weighted
    position, and the page with the most impressions."""
    agg = defaultdict(lambda: {
        "clicks": 0, "impressions": 0, "pos_weighted": 0.0, "pages": [],
    })
    for r in rows:
        q, page = r["keys"][0], r["keys"][1]
        a = agg[q]
        a["clicks"] += r.get("clicks", 0)
        a["impressions"] += r.get("impressions", 0)
        a["pos_weighted"] += r.get("position", 0) * r.get("impressions", 0)
        a["pages"].append({
            "page": page,
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "position": round(r.get("position", 0), 2),
        })
    out = []
    for q, a in agg.items():
        top = sorted(a["pages"], key=lambda p: -p["impressions"])
        out.append({
            "query": q,
            "clicks": a["clicks"],
            "impressions": a["impressions"],
            "ctr": round((a["clicks"] / a["impressions"]) * 100, 2) if a["impressions"] else 0,
            "position": round(a["pos_weighted"] / a["impressions"], 2) if a["impressions"] else 0,
            "page": top[0]["page"] if top else "",
            "pages": top[:5],
        })
    return sorted(out, key=lambda r: -r["impressions"])


def aggregate_by_page(rows):
    """One row per page, with its top queries."""
    agg = defaultdict(lambda: {
        "clicks": 0, "impressions": 0, "pos_weighted": 0.0, "queries": [],
    })
    for r in rows:
        q, page = r["keys"][0], r["keys"][1]
        a = agg[page]
        a["clicks"] += r.get("clicks", 0)
        a["impressions"] += r.get("impressions", 0)
        a["pos_weighted"] += r.get("position", 0) * r.get("impressions", 0)
        a["queries"].append({
            "query": q,
            "clicks": r.get("clicks", 0),
            "impressions": r.get("impressions", 0),
            "position": round(r.get("position", 0), 2),
        })
    out = []
    for p, a in agg.items():
        out.append({
            "page": p,
            "clicks": a["clicks"],
            "impressions": a["impressions"],
            "ctr": round((a["clicks"] / a["impressions"]) * 100, 2) if a["impressions"] else 0,
            "position": round(a["pos_weighted"] / a["impressions"], 2) if a["impressions"] else 0,
            "queries": sorted(a["queries"], key=lambda q: -q["impressions"])[:10],
        })
    return sorted(out, key=lambda r: -r["impressions"])


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--days", type=int, default=28)
    ap.add_argument("--name", default=None)
    ap.add_argument("--site", default=SITE)
    args = ap.parse_args()

    name = args.name or f"gsc-{args.days}d"
    out_path = DATA_DIR / f"{name}-latest.json"

    print(f"Exporting {args.days} days for {args.site}...")
    token = get_access_token()

    cur = window(args.days, 0)
    prev = window(args.days, 1)
    print(f"  current:  {cur[0]} .. {cur[1]}")
    print(f"  previous: {prev[0]} .. {prev[1]}")

    latest = latest_complete_date(token)
    print(f"  latest complete date in GSC: {latest}")

    cur_qp = query_rows(token, cur[0], cur[1], ["query", "page"])
    prev_qp = query_rows(token, prev[0], prev[1], ["query", "page"])
    cur_pages = query_rows(token, cur[0], cur[1], ["page"])
    prev_pages = query_rows(token, prev[0], prev[1], ["page"])

    output = {
        "site": args.site,
        "generatedAt": date.today().isoformat(),
        "days": args.days,
        "latestCompleteDate": latest,
        "units": {
            "ctr": "percentage (0-100), NOT a fraction",
            "position": "average position, lower is better",
            "deltaPosition": "current - previous; NEGATIVE is an IMPROVEMENT",
        },
        "current": {
            "window": {"startDate": cur[0], "endDate": cur[1]},
            "totals": summarise(cur_pages),
            "queries": aggregate_by_query(cur_qp),
            "pages": aggregate_by_page(cur_qp),
            "queryPageRows": [
                {
                    "query": r["keys"][0],
                    "page": r["keys"][1],
                    "clicks": r.get("clicks", 0),
                    "impressions": r.get("impressions", 0),
                    "ctr": round(r.get("ctr", 0) * 100, 2),
                    "position": round(r.get("position", 0), 2),
                }
                for r in cur_qp
            ],
        },
        "previous": {
            "window": {"startDate": prev[0], "endDate": prev[1]},
            "totals": summarise(prev_pages),
            "queries": aggregate_by_query(prev_qp),
            "pages": aggregate_by_page(prev_qp),
        },
        "rowCap": 25000,
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, indent=2))

    c, p = output["current"]["totals"], output["previous"]["totals"]
    print(f"\nCurrent:  {c['clicks']} clicks, {c['impressions']} impressions, "
          f"ctr {c['ctrPct']}%, pos {c['position']}")
    print(f"Previous: {p['clicks']} clicks, {p['impressions']} impressions, "
          f"ctr {p['ctrPct']}%, pos {p['position']}")
    print(f"\nWrote {out_path}")
    print(f"({len(output['current']['queryPageRows'])} query x page rows, "
          f"{len(output['current']['queries'])} queries)")


if __name__ == "__main__":
    main()
