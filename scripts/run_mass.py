# -*- coding: utf-8 -*-
"""
run_mass.py — one-shot, unattended driver for the full media pipeline across the
whole pool. Idempotent (each stage skips work that's already done), so it's safe to
re-run / resume. Reads the Xeno-canto key automatically from ~/.birdle/xeno_canto_key.

Stages (in order):
  1. validate_images.py --all      photos still resolve?
  2. fetch_audio.py --all          iNaturalist -> Xeno-canto (key auto-read)
  3. make_silhouette.py --all      rembg black silhouettes
  4. fetch_credits.py --all        Wikimedia author + license -> media.js
  5. lint_data.py                  final integrity + coverage report

Usage (you run this — no Claude needed to watch it):
  python scripts/run_mass.py              # run everything
  python scripts/run_mass.py --dry-run    # just print the queue + plan, do nothing
  python scripts/run_mass.py --overwrite  # force re-download/regenerate
  python scripts/run_mass.py --skip-images --skip-credits
"""
import argparse, os, subprocess, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import birdle_lib as lib

PY = sys.executable
SCRIPTS = os.path.dirname(os.path.abspath(__file__))
QUEUE_FILE = os.path.join(SCRIPTS, "mass_queue.txt")


def write_queue(birds):
    with open(QUEUE_FILE, "w", encoding="utf-8") as fh:
        fh.write("\n".join(b["id"] for b in birds) + "\n")


def run(stage, argv):
    print(f"\n{'='*60}\n>>> {stage}\n{'='*60}", flush=True)
    t0 = time.time()
    rc = subprocess.call([PY, os.path.join(SCRIPTS, argv[0])] + argv[1:])
    print(f"<<< {stage} finished in {time.time()-t0:.0f}s (exit {rc})", flush=True)
    return rc


def main():
    ap = argparse.ArgumentParser(description="Run the full Birdle media pipeline over all birds")
    ap.add_argument("--dry-run", action="store_true", help="print the queue + plan only")
    ap.add_argument("--overwrite", action="store_true", help="force re-download/regenerate")
    ap.add_argument("--skip-images", action="store_true")
    ap.add_argument("--skip-audio", action="store_true")
    ap.add_argument("--skip-silhouette", action="store_true")
    ap.add_argument("--skip-credits", action="store_true")
    args = ap.parse_args()

    birds = lib.load_birds()
    write_queue(birds)
    ow = ["--overwrite"] if args.overwrite else []

    plan = []
    if not args.skip_images:     plan.append(("validate images", ["validate_images.py"]))
    if not args.skip_audio:      plan.append(("fetch audio",     ["fetch_audio.py", "--all"] + ow))
    if not args.skip_silhouette: plan.append(("make silhouettes",["make_silhouette.py", "--all"] + ow))
    if not args.skip_credits:    plan.append(("fetch credits",   ["fetch_credits.py", "--all"]))
    plan.append(("lint report", ["lint_data.py"]))

    xc = "yes" if (os.environ.get("XENO_CANTO_KEY") or
                   os.path.exists(os.path.expanduser("~/.birdle/xeno_canto_key"))) else "NO"
    print(f"Queue: {len(birds)} birds -> {QUEUE_FILE}")
    print(f"Xeno-canto key available: {xc}")
    print("Plan:")
    for name, argv in plan:
        print(f"  - {name}: {' '.join(argv)}")

    if args.dry_run:
        print("\n(dry run — nothing executed)")
        return

    print("\nStarting. This runs unattended; safe to re-run to resume.\n")
    failures = []
    for name, argv in plan:
        if run(name, argv) not in (0, None) and name != "validate images":
            failures.append(name)  # image validation may exit 1 on a broken URL; keep going
    print(f"\n{'#'*60}\nMASS RUN COMPLETE. Stage failures: {failures or 'none'}")
    print("Review the lint report above; re-run to resume anything incomplete.")


if __name__ == "__main__":
    main()
