# -*- coding: utf-8 -*-
"""
make_silhouette.py — generate a per-species black silhouette from a bird's photo.

Pipeline per bird:
  1. download the Wikimedia photo (imageUrl from birds.js)
  2. isolate the bird with rembg (U^2-Net background removal -> alpha matte)
  3. threshold the alpha, paint the subject solid black on a transparent canvas
  4. autocrop to the subject + pad, save  svg/silhouettes/species/<bird-id>.png
  5. record the path in  js/media.js

The game prefers this per-species silhouette and falls back to the generic
body-type SVG (svg/silhouettes/<type>.svg) when one hasn't been generated.

Requires:  pip install rembg pillow   (numpy comes as a dependency)
First run downloads the U^2-Net model (~170 MB) into the rembg cache.

Usage:
  python scripts/make_silhouette.py --ids shoebill
  python scripts/make_silhouette.py --all
  python scripts/make_silhouette.py --all --limit 10 --overwrite
"""
import argparse, io, os, sys, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

UA = "BirdleMediaBot/1.0 (educational bird-guessing game; contact: birdle.app)"
OUT_DIR = os.path.join(lib.REPO_ROOT, "svg", "silhouettes", "species")
ALPHA_THRESHOLD = 128   # alpha >= this becomes solid black
PAD_FRAC = 0.06         # padding around the subject, as a fraction of the larger side


def _load_deps():
    try:
        from rembg import remove, new_session  # noqa
        from PIL import Image  # noqa
        import numpy as np  # noqa
        return remove, new_session, Image, np
    except ImportError as e:
        sys.exit(f"Missing dependency: {e}\n  Run: pip install rembg pillow")


def _download(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def make_one(bird, session, deps, overwrite=False):
    remove, _new_session, Image, np = deps
    bid, url = bird["id"], bird["imageUrl"]
    out_path = os.path.join(OUT_DIR, f"{bid}.png")
    rel = f"svg/silhouettes/species/{bid}.png"

    if os.path.exists(out_path) and not overwrite:
        print(f"  [skip] {bid}: {rel} exists")
        lib.update_media_entry(bid, silhouette=rel)
        return "skip"
    if not url:
        print(f"  [warn] {bid}: no imageUrl")
        return "fail"

    print(f"  [silhouette] {bid}")
    try:
        raw = _download(url)
        cutout = remove(raw, session=session)  # PNG bytes with alpha
        img = Image.open(io.BytesIO(cutout)).convert("RGBA")
    except Exception as e:
        print(f"      -> failed: {e}")
        return "fail"

    arr = np.array(img)
    alpha = arr[:, :, 3]
    mask = alpha >= ALPHA_THRESHOLD
    if mask.sum() < 200:  # essentially nothing isolated
        print(f"      -> empty matte, skipping ({int(mask.sum())} px)")
        return "fail"

    # Solid black where the subject is, transparent elsewhere.
    out = np.zeros_like(arr)
    out[:, :, 3] = np.where(mask, 255, 0).astype("uint8")  # RGB stays 0 => black
    sil = Image.fromarray(out, "RGBA")

    # Autocrop to subject + pad.
    ys, xs = np.where(mask)
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = int(max(y1 - y0, x1 - x0) * PAD_FRAC)
    y0 = max(0, y0 - pad); x0 = max(0, x0 - pad)
    y1 = min(sil.height, y1 + pad); x1 = min(sil.width, x1 + pad)
    sil = sil.crop((x0, y0, x1 + 1, y1 + 1))

    os.makedirs(OUT_DIR, exist_ok=True)
    sil.save(out_path)
    coverage = 100.0 * mask.sum() / mask.size
    lib.update_media_entry(bid, silhouette=rel)
    print(f"      -> {rel} ({sil.width}x{sil.height}, subject {coverage:.1f}% of frame)")
    return "ok"


def main():
    ap = argparse.ArgumentParser(description="Generate per-species black silhouettes from photos")
    ap.add_argument("--ids", help="comma-separated bird ids")
    ap.add_argument("--all", action="store_true", help="process every bird")
    ap.add_argument("--limit", type=int, help="cap the number processed")
    ap.add_argument("--overwrite", action="store_true", help="regenerate even if present")
    ap.add_argument("--model", default="isnet-general-use",
                    help="rembg model (default: isnet-general-use; try u2net)")
    args = ap.parse_args()

    deps = _load_deps()
    _remove, new_session, _Image, _np = deps

    birds = lib.load_birds()
    targets = lib.select_birds(birds, ids=args.ids.split(",") if args.ids else None,
                               do_all=args.all, limit=args.limit)
    if not targets:
        ap.error("nothing selected — pass --ids <a,b> or --all")

    session = new_session(args.model)
    counts = {}
    for b in targets:
        r = make_one(b, session, deps, overwrite=args.overwrite)
        counts[r] = counts.get(r, 0) + 1
    print(f"\nDone: {counts}")


if __name__ == "__main__":
    main()
