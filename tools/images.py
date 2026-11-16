#!/usr/bin/env python3
"""Responsive image derivatives for the site. Needs Pillow (pip install Pillow); no build step on the host.

Run from anywhere:   python3 tools/images.py

For every .jpg/.jpeg/.png directly in images/ it writes resized copies to images/generated/
  <name>-<width>.jpg and <name>-<width>.webp   at widths 480, 768, 1200, 1920
(never upscaled: a source narrower than a step gets one copy at its own width), and lists them,
with the source's own width and height, in images/manifest.json.

tools/build.js reads the manifest to write width/height, srcset and sizes; if an image is not in
the manifest the build falls back to the original file.

Re-running is cheap: a derivative is only (re)made when it is missing or older than its source,
so replacing a scan with a bigger one regenerates just that image. Changing the settings below
(widths, qualities, GENERATOR) changes the fingerprint stored in the manifest, and then every
derivative is remade. Large scans are decoded with draft mode / reduction where possible to save
memory. Derivatives of images that no longer exist are removed.

Safety: every source is checked first. If any cannot be read, or two sources share a name
(foo.jpg and foo.png would write the same files), the script stops with an error before writing
or deleting anything.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = 400_000_000          # allow very large scans (default guard is ~89 MP)

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OUT = IMAGES / "generated"
MANIFEST = IMAGES / "manifest.json"
WIDTHS = (480, 768, 1200, 1920)
SOURCE_TYPES = {".jpg", ".jpeg", ".png"}
# Files in images/ that are not indexed or processed: they stay out of the manifest (and so out of every
# tracked file). Their derivatives, if any, are left alone on disk.
EXCLUDE = {
    "atwork-moss-paper-hands.jpg",   # held back until she approves it
}
JPEG_QUALITY = 82
WEBP_QUALITY = 78
GENERATOR = 1                                 # bump when the resizing code changes, to remake every derivative
SETTINGS = {"widths": list(WIDTHS), "jpeg": JPEG_QUALITY, "webp": WEBP_QUALITY, "generator": GENERATOR}


def is_fresh(target: Path, source: Path) -> bool:
    return target.exists() and target.stat().st_mtime >= source.stat().st_mtime


def oriented_size(source: Path) -> tuple[int, int]:
    """Width and height as displayed (EXIF rotation applied), without decoding the pixels."""
    with Image.open(source) as im:
        w, h = im.size
        if im.getexif().get(0x0112) in (5, 6, 7, 8):   # rotated 90/270 degrees
            w, h = h, w
        return w, h


def make_variants(source: Path, widths: list[int]) -> None:
    with Image.open(source) as raw:
        if raw.format == "JPEG":
            raw.draft("RGB", (max(widths), max(widths) * 4))   # decode big JPEGs at reduced size when possible
        image = ImageOps.exif_transpose(raw)
        image = image.convert("RGBA" if image.mode in ("RGBA", "LA", "P") and source.suffix.lower() == ".png" else "RGB")
        for width in widths:
            ratio = width / image.width
            resized = image if ratio >= 1 else image.resize((width, max(1, round(image.height * ratio))), Image.Resampling.LANCZOS)
            resized.convert("RGB").save(OUT / f"{source.stem}-{width}.jpg", "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
            resized.save(OUT / f"{source.stem}-{width}.webp", "WEBP", quality=WEBP_QUALITY, method=6)


def main() -> None:
    sources = sorted(p for p in IMAGES.iterdir() if p.is_file() and p.suffix.lower() in SOURCE_TYPES and p.name not in EXCLUDE)
    held = {f"{Path(name).stem}-" for name in EXCLUDE}

    # 1. check everything before touching anything
    sizes: dict[Path, tuple[int, int]] = {}
    problems: list[str] = []
    stems: dict[str, str] = {}
    for source in sources:
        if source.stem in stems:
            problems.append(f"{source.name} and {stems[source.stem]} have the same name; their derivatives would overwrite each other")
        stems.setdefault(source.stem, source.name)
        try:
            with Image.open(source) as im:
                im.verify()                                   # catches truncated or corrupt files
            sizes[source] = oriented_size(source)
        except Exception as exc:                              # noqa: BLE001 - any failure to read is fatal here
            problems.append(f"{source.name} cannot be read: {exc}")
    if problems:
        print("Stopped, nothing was written or deleted:\n  - " + "\n  - ".join(problems), file=sys.stderr)
        sys.exit(1)

    # 2. settings fingerprint: a change remakes everything. A manifest without one (written before the
    #    fingerprint existed) adopts the derivatives already there instead of remaking them all.
    previous = None
    if MANIFEST.exists():
        try:
            previous = json.loads(MANIFEST.read_text(encoding="utf8")).get("settings")
        except ValueError:
            previous = None
    remake_all = previous is not None and previous != SETTINGS

    OUT.mkdir(parents=True, exist_ok=True)
    images: dict[str, dict] = {}
    made = 0
    expected: set[str] = set()
    for source in sources:
        width, height = sizes[source]
        steps = sorted({min(w, width) for w in WIDTHS})
        names = [(w, f"{source.stem}-{w}.jpg", f"{source.stem}-{w}.webp") for w in steps]
        expected.update(n for _, j, wp in names for n in (j, wp))
        stale = [w for w, j, wp in names if remake_all or not (is_fresh(OUT / j, source) and is_fresh(OUT / wp, source))]
        if stale:
            make_variants(source, stale)
            made += len(stale)
        images[source.name] = {
            "width": width,
            "height": height,
            "variants": [{"width": w, "jpeg": f"images/generated/{j}", "webp": f"images/generated/{wp}"} for w, j, wp in names],
        }
    removed = 0
    for old in OUT.iterdir():
        if old.is_file() and old.name not in expected and not any(old.name.startswith(h) for h in held):
            old.unlink()
            removed += 1
    text = json.dumps({"version": 1, "settings": SETTINGS, "images": images}, indent=2) + "\n"
    if not MANIFEST.exists() or MANIFEST.read_text(encoding="utf8") != text:
        MANIFEST.write_text(text, encoding="utf8")
    print(f"{len(images)} images in the manifest; {made} sizes made, {removed} old derivatives removed"
          + (" (settings changed: everything remade)" if remake_all else "") + ".")


if __name__ == "__main__":
    main()
