# -*- coding: utf-8 -*-
"""
fix_birds.py — repair specific ingested birds whose common name collided with a
non-bird Wikipedia article during auto-ingest (e.g. Merlin->wizard, Tui->Rock Dove,
Kea->Kaka). Re-resolves each with an EXPLICIT scientific name + Wikipedia title so the
image, scientific name, family/silhouette, and source extract are correct. Then re-dumps
the source file. Run the media + clue regeneration afterward for these ids.
"""
import sys, os, re, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib
import ingest_birds as ing

# id -> (correct scientific name, explicit Wikipedia page title)
FIXES = {
    "merlin": ("Falco columbarius", "Merlin (bird)"),
    "tui":    ("Prosthemadera novaeseelandiae", "Tūī"),
    "kea":    ("Nestor notabilis", "Kea"),
}


def main():
    birds = lib.load_ingested()
    by_id = {b["id"]: b for b in birds}
    for bid, (sci, title) in FIXES.items():
        b = by_id.get(bid)
        if not b:
            print(f"  [skip] {bid}: not ingested"); continue
        wiki = ing.resolve_wikipedia(title, sci)
        if not wiki:
            print(f"  [FAIL] {bid}: no Wikipedia image for {title!r}/{sci!r}"); continue
        image_url, extract, page_title = wiki
        # family -> silhouette from the corrected scientific name
        fam = None
        try:
            data = ing._get_json(
                f"https://api.inaturalist.org/v1/taxa?{urllib.parse.urlencode({'q': sci, 'rank':'species'})}")
            for r in data.get("results", []):
                if r.get("name", "").lower() == sci.lower():
                    det = ing._get_json(f"https://api.inaturalist.org/v1/taxa/{r['id']}")
                    for anc in (det.get("results", [{}])[0].get("ancestors") or []):
                        if anc.get("rank") == "family":
                            fam = anc.get("name")
                    break
        except Exception:
            pass
        sil = ing.FAMILY_TO_SIL.get(fam or "", b.get("silhouetteType", "passerine"))

        b["scientificName"] = sci
        b["xenoCantoQuery"] = sci
        b["imageUrl"] = image_url
        b["silhouetteType"] = sil
        # blank the clue/facts so the regen agents refill from the corrected source
        b["hints"] = {"region": "", "size": "", "behavior": ""}
        b["facts"] = {"size": "", "habitat": "", "diet": "", "migration": ""}
        b["funFact"] = ""
        with open(os.path.join(ing.SOURCES_DIR, f"{bid}.txt"), "w", encoding="utf-8") as fh:
            fh.write(f"# {b['commonName']} ({sci})\n# family: {fam}\n"
                     f"# wikipedia: {page_title}\n\n{extract}\n")
        print(f"  [fixed] {bid} -> {sci} ({sil}) | {page_title}")
    lib.save_ingested(birds)
    print("\nNow regenerate media + clues/facts for:", ", ".join(FIXES))


if __name__ == "__main__":
    main()
