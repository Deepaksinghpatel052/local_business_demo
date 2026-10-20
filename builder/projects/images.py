"""Upload checks and compression for owner photos (Pillow)."""
import io
import uuid

from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError

MAX_BYTES = 5 * 1024 * 1024
MAX_SIDE = 1600
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
Image.MAX_IMAGE_PIXELS = 40_000_000     # refuse decompression bombs


class ImageRejected(ValueError):
    pass


def process_upload(upload, keep_transparency=False):
    """Validate type and size, fix rotation, resize to MAX_SIDE, recompress.
    Returns (ContentFile, width, height). Re-encoding also drops EXIF (GPS etc.)."""
    if upload.size > MAX_BYTES:
        raise ImageRejected("Photo is too large (max 5 MB).")
    try:
        img = Image.open(upload)
        fmt = img.format
        img.verify()
        upload.seek(0)
        img = Image.open(upload)
        img.load()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, SyntaxError):
        raise ImageRejected("This file is not a photo we can use. Please upload a JPG, PNG or WebP.")
    if fmt not in ALLOWED_FORMATS:
        raise ImageRejected("Only JPG, PNG or WebP photos are allowed.")
    img = ImageOps.exif_transpose(img)
    img.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    out = io.BytesIO()
    if keep_transparency and has_alpha:
        img = img.convert("RGBA")
        img.save(out, "PNG", optimize=True)
        ext = "png"
    else:
        if img.mode != "RGB":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            rgba = img.convert("RGBA")
            bg.paste(rgba, mask=rgba.split()[-1])
            img = bg
        img.save(out, "JPEG", quality=82, optimize=True, progressive=True)
        ext = "jpg"
    name = "%s.%s" % (uuid.uuid4().hex[:12], ext)
    return ContentFile(out.getvalue(), name=name), img.width, img.height
