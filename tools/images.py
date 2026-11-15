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
so replacing a scan with a bigger one regenerates just that image. Large scans are decoded with
draft mode / reduction where possible to save memory. Derivatives of images that no longer exist
are removed.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = 400_000_000          # allow very large scans (default guard is ~89 MP)

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "images"
OUT = IMAGES / "generated"
MANIFEST = IMAGES / "manifest.json"
WIDTHS = (480, 768, 1200, 1920)
SOURCE_TYPES = {".jpg", ".jpeg", ".png"}
JPEG_QUALITY = 82
WEBP_QUALITY = 78


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
    OUT.mkdir(parents=True, exist_ok=True)
    images: dict[str, dict] = {}
    made = 0
    expected: set[str] = set()
    for source in sorted(p for p in IMAGES.iterdir() if p.is_file() and p.suffix.lower() in SOURCE_TYPES):
        try:
            width, height = oriented_size(source)
        except OSError as exc:
            print(f"Skipping {source.name}: {exc}")
            continue
        steps = sorted({min(w, width) for w in WIDTHS})
        names = [(w, f"{source.stem}-{w}.jpg", f"{source.stem}-{w}.webp") for w in steps]
        expected.update(n for _, j, wp in names for n in (j, wp))
        stale = [w for w, j, wp in names if not (is_fresh(OUT / j, source) and is_fresh(OUT / wp, source))]
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
        if old.is_file() and old.name not in expected:
            old.unlink()
            removed += 1
    text = json.dumps({"version": 1, "images": images}, indent=2) + "\n"
    if not MANIFEST.exists() or MANIFEST.read_text(encoding="utf8") != text:
        MANIFEST.write_text(text, encoding="utf8")
    print(f"{len(images)} images in the manifest; {made} sizes made, {removed} old derivatives removed.")


if __name__ == "__main__":
    main()
