# -*- coding: utf-8 -*-
"""
ingest_birds.py — turn a plain list of bird COMMON NAMES into fully-resolved pool
entries, sourcing everything from open APIs so we never hand-type scientific names
or image URLs (the two biggest error sources in the old add-birds flow).

Per candidate it:
  1. resolves the species on iNaturalist  -> canonical scientific name + family
     (family -> silhouetteType) and confirms it's a bird (iconic taxon = Aves)
  2. resolves the Wikipedia page          -> Commons lead image (960px thumb) +
     an intro extract dumped to scripts/sources/<id>.txt for the clue-writing agents
  3. probes for an OPEN recording (iNaturalist -> Xeno-canto). Birds with no open
     audio are EXCLUDED from the pool (per policy) — they never enter the game.

Surviving birds are written to js/birds_ingested.js (a generated JSON array merged
into the daily pool by getAllBirds()). Clue text fields are left blank here and
filled afterwards by reviewed Sonnet agents working from the source dumps.

Idempotent: a candidate already in birds.js or birds_ingested.js is skipped.

Usage:
  python scripts/ingest_birds.py --file scripts/candidates_pilot.txt
  python scripts/ingest_birds.py --file scripts/candidates.txt --limit 20
  python scripts/ingest_birds.py --names "Mute Swan,Common Loon"
"""
import argparse, json, os, re, sys, time, urllib.parse, urllib.request, urllib.error

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib
import fetch_audio  # reuse the audio source probes (non-destructive: returns URL only)

UA = {"User-Agent": "BirdleMediaBot/1.0 (educational bird-guessing game; contact: birdle.app)"}
SOURCES_DIR = os.path.join(lib.REPO_ROOT, "scripts", "sources")
THROTTLE_SEC = 1.0  # polite pause between candidates (iNat + Wikipedia)

# Bird family (iNat ancestor, rank=family) -> Birdle silhouette body-type.
# Approximate by design: this is only the *fallback* type; make_silhouette.py later
# generates the real per-species silhouette. Unmapped families fall back to passerine.
FAMILY_TO_SIL = {
    "Accipitridae": "raptor", "Pandionidae": "raptor", "Falconidae": "raptor",
    "Sagittariidae": "large-terrestrial",
    "Strigidae": "owl", "Tytonidae": "owl",
    "Anatidae": "waterfowl",
    "Ardeidae": "wading-bird", "Ciconiidae": "wading-bird", "Gruidae": "wading-bird",
    "Phoenicopteridae": "wading-bird", "Threskiornithidae": "wading-bird",
    "Spheniscidae": "penguin",
    "Alcidae": "seabird-compact", "Sulidae": "seabird-compact",
    "Phalacrocoracidae": "seabird-compact", "Fregatidae": "seabird-compact",
    "Laridae": "tern-gull", "Sternidae": "tern-gull", "Stercorariidae": "tern-gull",
    "Diomedeidae": "large-soaring", "Procellariidae": "large-soaring", "Cathartidae": "large-soaring",
    "Trochilidae": "hummingbird",
    "Psittacidae": "parrot", "Cacatuidae": "parrot", "Psittaculidae": "parrot",
    "Alcedinidae": "kingfisher", "Halcyonidae": "kingfisher", "Coraciidae": "kingfisher",
    "Upupidae": "kingfisher", "Bucerotidae": "kingfisher", "Bucorvidae": "kingfisher",
    "Momotidae": "kingfisher", "Meropidae": "kingfisher",
    "Corvidae": "corvid",
    "Phasianidae": "large-terrestrial", "Numididae": "large-terrestrial",
    "Dromaiidae": "large-terrestrial", "Casuariidae": "large-terrestrial",
    "Struthionidae": "large-terrestrial", "Rheidae": "large-terrestrial",
    "Ramphastidae": "large-terrestrial", "Otididae": "large-terrestrial",
    # waterbirds that aren't ducks/geese but sit low on the water
    "Gaviidae": "waterfowl", "Podicipedidae": "waterfowl", "Rallidae": "waterfowl",
    "Anhimidae": "waterfowl",
    # tall waders / big-billed water birds
    "Pelecanidae": "wading-bird", "Scolopacidae": "wading-bird",
    "Charadriidae": "wading-bird", "Recurvirostridae": "wading-bird",
    "Haematopodidae": "wading-bird", "Anhingidae": "seabird-compact",
    # non-passerines whose body plan reads closest to a perching bird
    "Columbidae": "passerine", "Picidae": "passerine", "Cuculidae": "passerine",
    "Apodidae": "passerine", "Caprimulgidae": "passerine", "Trogonidae": "passerine",
    "Coliidae": "passerine", "Todidae": "passerine",
}


def slugify(name):
    s = name.strip().lower()
    s = re.sub(r"['’.]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def _get_json(url, retries=4):
    req = urllib.request.Request(url, headers=UA)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < retries - 1:
                time.sleep(3.0 * (attempt + 1)); continue
            raise
        except Exception:
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1)); continue
            raise


# ── iNaturalist: scientific name + family ─────────────────────────────────────
def resolve_taxon(common_name):
    """Return (scientific_name, family) for a bird common name, or None."""
    q = urllib.parse.urlencode({"q": common_name, "rank": "species",
                                "is_active": "true", "per_page": 10})
    try:
        data = _get_json(f"https://api.inaturalist.org/v1/taxa?{q}")
    except Exception as e:
        print(f"      iNat taxa error: {e}")
        return None
    taxon = None
    for r in data.get("results", []):
        if r.get("iconic_taxon_name") == "Aves" and r.get("rank") == "species":
            taxon = r
            break
    if not taxon:
        return None
    sci = taxon.get("name")
    family = None
    # The search result carries ancestor ids; one detail call yields family name.
    try:
        det = _get_json(f"https://api.inaturalist.org/v1/taxa/{taxon['id']}")
        for anc in (det.get("results", [{}])[0].get("ancestors") or []):
            if anc.get("rank") == "family":
                family = anc.get("name")
    except Exception:
        pass
    return sci, family


# ── Wikipedia: Commons lead image + intro extract ─────────────────────────────
def resolve_wikipedia(*titles):
    """Try each title; return (image_url, extract, page_title) for the first hit
    that has a Commons thumbnail. None if nothing usable."""
    for title in titles:
        if not title:
            continue
        q = urllib.parse.urlencode({
            "action": "query", "prop": "pageimages|extracts",
            "piprop": "thumbnail", "pithumbsize": 960,
            "exintro": 1, "explaintext": 1, "redirects": 1,
            "titles": title, "format": "json",
        })
        try:
            data = _get_json(f"https://en.wikipedia.org/w/api.php?{q}")
        except Exception as e:
            print(f"      Wikipedia error: {e}")
            continue
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            thumb = (page.get("thumbnail") or {}).get("source")
            if thumb and "upload.wikimedia.org" in thumb:
                return thumb, (page.get("extract") or "").strip(), page.get("title")
    return None


def ingest_one(common_name, region):
    bid = slugify(common_name)
    taxon = resolve_taxon(common_name)
    if not taxon:
        return ("fail", bid, "no iNat bird taxon")
    sci, family = taxon

    wiki = resolve_wikipedia(common_name, sci)
    if not wiki:
        return ("fail", bid, "no Wikipedia Commons image")
    image_url, extract, page_title = wiki

    # Audio gate — probe only (no download); excluded if nothing open exists.
    if not (fetch_audio.from_inaturalist(sci) or fetch_audio.from_xeno_canto(sci)):
        return ("excluded", bid, "no open audio")

    sil = FAMILY_TO_SIL.get(family or "", "passerine")

    os.makedirs(SOURCES_DIR, exist_ok=True)
    with open(os.path.join(SOURCES_DIR, f"{bid}.txt"), "w", encoding="utf-8") as fh:
        fh.write(f"# {common_name} ({sci})\n# family: {family}  region: {region}\n"
                 f"# wikipedia: {page_title}\n\n{extract}\n")

    entry = {
        "id": bid,
        "commonName": common_name.strip(),
        "scientificName": sci,
        "regions": [region],
        "imageUrl": image_url,
        "audioUrl": "",
        "xenoCantoQuery": sci,
        "focalPoint": {"x": 0.5, "y": 0.45},
        "facts": {"size": "", "habitat": "", "diet": "", "migration": ""},
        "hints": {"region": "", "size": "", "behavior": ""},
        "funFact": "",
        "ebirdUrl": "",
        "audubonUrl": "",
        "silhouetteType": sil,
    }
    return ("ok", bid, entry)


def read_candidates(args):
    raw = []
    if args.names:
        raw = [n for n in args.names.split(",")]
    elif args.file:
        with open(args.file, encoding="utf-8") as fh:
            raw = [ln for ln in fh]
    out = []
    for ln in raw:
        ln = ln.split("#", 1)[0].strip()
        if not ln:
            continue
        if "|" in ln:
            name, region = ln.split("|", 1)
            out.append((name.strip(), region.strip()))
        else:
            out.append((ln, "worldwide"))
    return out


def main():
    ap = argparse.ArgumentParser(description="Resolve bird common names into pool entries")
    ap.add_argument("--file", help="candidates file (one 'Common Name [| region]' per line)")
    ap.add_argument("--names", help="comma-separated common names (quick test)")
    ap.add_argument("--limit", type=int, help="cap how many NEW birds to ingest")
    args = ap.parse_args()
    if not (args.file or args.names):
        ap.error("pass --file or --names")

    curated_ids = {b["id"] for b in lib.load_birds(include_ingested=False)}
    ingested = lib.load_ingested()
    ingested_ids = {b["id"] for b in ingested}
    existing_ids = curated_ids | ingested_ids  # for dedupe

    candidates = read_candidates(args)
    print(f"Candidates: {len(candidates)} | already in pool: {len(existing_ids)}\n")

    added = 0
    report = {"ok": 0, "skip": 0, "excluded": 0, "fail": 0}
    excluded, failed = [], []
    for name, region in candidates:
        bid = slugify(name)
        if bid in existing_ids or bid in ingested_ids:
            report["skip"] += 1
            continue
        status, rid, payload = ingest_one(name, region)
        report[status] += 1
        if status == "ok":
            ingested.append(payload)
            ingested_ids.add(rid)
            lib.save_ingested(ingested)   # persist incrementally (resumable)
            added += 1
            print(f"  [ok] {rid} <- {payload['scientificName']} ({payload['silhouetteType']})")
        elif status == "excluded":
            excluded.append(rid); print(f"  [excluded] {rid}: {payload}")
        else:
            failed.append(rid); print(f"  [fail] {rid}: {payload}")
        time.sleep(THROTTLE_SEC)
        if args.limit and added >= args.limit:
            print(f"\n(reached --limit {args.limit})")
            break

    print(f"\nDone: {report}  | pool now {len(curated_ids | ingested_ids)} birds")
    if excluded:
        print(f"Excluded (no open audio): {excluded}")
    if failed:
        print(f"Failed to resolve: {failed}")
    print("\nNext: run audio/silhouette/credits over the new ids "
          "(python scripts/run_mass.py), then have the clue agents fill "
          "scripts/sources/<id>.txt -> birds_ingested.js.")


if __name__ == "__main__":
    main()
