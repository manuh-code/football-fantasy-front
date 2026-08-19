#!/usr/bin/env python3
"""Genera todos los iconos de marca de Pro Fantasy desde el arte maestro.

    python3 scripts/generate-icons.py

La fuente es `scripts/brand/profantasy-icon.ico` (256x256): la "F" verde lima
sobre un squircle azul con textura de balón. Viene con el marco negro opaco que
mete el exportador de app icons, así que el script lo recorta y lo vuelve
transparente antes de derivar nada — ver `art()`.

De ahí salen tres cosas distintas, y conviene tener claro cuál usa cada
plataforma:

  * el **arte completo** (squircle azul + F) para favicons, apple-touch e iconos
    PWA `purpose: any`;
  * la **F sola sobre azul sólido** para los maskable de Android, que recortan
    con su propia máscara y perderían el borde del squircle;
  * la **silueta de la F** para el badge de notificación (Android lo aplasta al
    canal alfa) y los mosaicos de Windows (el fondo lo pone <TileColor>).

Los SVG escritos a mano comparten el mismo trazado de la F: `public/favicon.svg`,
`public/img/icons/safari-pinned-tab.svg` y las copias inline del header
(`src/components/HeaderMenu.vue`) y del splash (`index.html`). Ese trazado se
vectorizó una vez desde este mismo arte con `--trace`; si cambia el logo, corre
`python3 scripts/generate-icons.py --trace` y pega el path resultante en los
cuatro sitios. No hay forma de derivarlos en tiempo de compilación.

Requiere Pillow (`pip install Pillow`). Solo se ejecuta a mano cuando cambia la
marca; los PNG resultantes se commitean.
"""

import io
import math
import struct
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "img" / "icons"
SOURCE = ROOT / "scripts" / "brand" / "profantasy-icon.ico"

BLUE = (1, 34, 155, 255)   # #01229B — azul medio del squircle; = theme_color
LIME = (152, 226, 20, 255)  # #98E214 — verde medio de la F
WHITE = (255, 255, 255, 255)

_cache = {}


def art():
    """El arte maestro sin el marco negro: RGBA con el exterior transparente."""
    if "art" in _cache:
        return _cache["art"].copy()

    im = Image.open(SOURCE).convert("RGBA")
    px = im.load()
    w, h = im.size

    # El marco es negro *opaco*, no transparente, así que hay que quitarlo a
    # mano. Flood fill desde las cuatro esquinas en vez de un umbral global:
    # así el contorno oscuro que el propio squircle lleva dibujado sobrevive.
    seen = [[False] * w for _ in range(h)]
    q = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])
    while q:
        x, y = q.popleft()
        if not (0 <= x < w and 0 <= y < h) or seen[y][x]:
            continue
        r, g, b, _ = px[x, y]
        if r > 26 or g > 26 or b > 26:
            continue
        seen[y][x] = True
        px[x, y] = (0, 0, 0, 0)
        q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    im = im.crop(im.getbbox())
    _cache["art"] = im
    return im.copy()


def glyph_mask():
    """Máscara (modo L) de la F verde, recortada a su propia caja."""
    if "glyph" in _cache:
        return _cache["glyph"].copy()

    src = art()
    px = src.load()
    w, h = src.size
    mask = Image.new("L", (w, h), 0)
    mp = mask.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a > 128 and g > 110 and g > b + 40 and g > r - 10:
                mp[x, y] = 255

    mask = mask.crop(mask.getbbox())
    _cache["glyph"] = mask
    return mask.copy()


def fit(im, size):
    """Escala `im` a un cuadrado de lado `size` conservando su proporción."""
    w, h = im.size
    s = size / max(w, h)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    scaled = im.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    out.paste(scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2))
    return out


def render_art(size, *, bleed=True, bg=None):
    """El arte completo. `bleed` lo lleva a sangre; si no, deja aire alrededor."""
    base = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    piece = art()
    if bleed:
        piece = piece.resize((size, size), Image.LANCZOS)
        base.alpha_composite(piece)
    else:
        base.alpha_composite(fit(piece, size))
    return base


def render_glyph(size, *, bg=None, scale=0.62, fg=LIME):
    """Solo la F, ópticamente centrada, ocupando `scale` del lado."""
    im = Image.new("RGBA", (size, size), bg or (0, 0, 0, 0))
    mask = glyph_mask()
    box = round(size * scale)
    w, h = mask.size
    s = box / max(w, h)
    mask = mask.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
    layer = Image.new("RGBA", mask.size, fg)
    im.paste(layer, ((size - mask.width) // 2, (size - mask.height) // 2), mask)
    return im


def flatten(im, bg):
    """Aplana sobre un fondo opaco. iOS rellena de negro cualquier alfa."""
    out = Image.new("RGBA", im.size, bg)
    out.alpha_composite(im)
    return out


def write_ico(path, images):
    """Empaqueta varios PNG en un .ico.

    Pillow solo sabe reescalar una imagen a los tamaños pedidos; aquí cada
    tamaño se renderiza nativo desde el arte maestro, que es más nítido a 16px.
    """
    blobs = []
    for im in images:
        buf = io.BytesIO()
        im.save(buf, "PNG")
        blobs.append(buf.getvalue())

    offset = 6 + 16 * len(images)
    entries = b""
    for im, blob in zip(images, blobs):
        entries += struct.pack(
            "<BBBBHHII",
            im.width if im.width < 256 else 0,
            im.height if im.height < 256 else 0,
            0, 0, 1, 32, len(blob), offset,
        )
        offset += len(blob)

    path.write_bytes(struct.pack("<HHH", 0, 1, len(images)) + entries + b"".join(blobs))


def save(im, path):
    im.save(path, "PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}  {im.width}x{im.height}")


# --------------------------------------------------------------------------
# Vectorizado de la F (solo con --trace)
# --------------------------------------------------------------------------

def _contours(mask):
    """Marching squares sobre los bordes de píxel; devuelve bucles cerrados."""
    w, h = mask.size
    m = mask.load()

    def inside(x, y):
        return 0 <= x < w and 0 <= y < h and m[x, y] > 127

    edges = {}
    for y in range(h):
        for x in range(w):
            if not inside(x, y):
                continue
            if not inside(x, y - 1): edges.setdefault((x, y), []).append((x + 1, y))
            if not inside(x + 1, y): edges.setdefault((x + 1, y), []).append((x + 1, y + 1))
            if not inside(x, y + 1): edges.setdefault((x + 1, y + 1), []).append((x, y + 1))
            if not inside(x - 1, y): edges.setdefault((x, y + 1), []).append((x, y))

    loops = []
    while edges:
        start = next(iter(edges))
        loop, cur = [start], start
        while True:
            nxts = edges.get(cur)
            if not nxts:
                break
            nxt = nxts.pop()
            if not nxts:
                del edges[cur]
            if nxt == start:
                break
            loop.append(nxt)
            cur = nxt
        if len(loop) > 8:
            loops.append(loop)
    return loops


def _chaikin(pts, iters):
    """Redondea la escalera de píxel antes de simplificar."""
    for _ in range(iters):
        out = []
        n = len(pts)
        for i in range(n):
            x0, y0 = pts[i]
            x1, y1 = pts[(i + 1) % n]
            out.append((x0 * .75 + x1 * .25, y0 * .75 + y1 * .25))
            out.append((x0 * .25 + x1 * .75, y0 * .25 + y1 * .75))
        pts = out
    return pts


def _simplify(pts, tol):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    norm = math.hypot(dx, dy)
    imax, dmax = 0, -1.0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = (abs(dx * (ay - py) - (ax - px) * dy) / norm if norm
             else math.hypot(px - ax, py - ay))
        if d > dmax:
            imax, dmax = i, d
    if dmax > tol:
        return _simplify(pts[:imax + 1], tol)[:-1] + _simplify(pts[imax:], tol)
    return [pts[0], pts[-1]]


def trace(size=100, tol=0.35, smooth=3):
    """Path SVG de la F, normalizado a una caja de lado `size`."""
    mask = glyph_mask()
    w, h = mask.size
    s = size / max(w, h)
    parts = []
    for loop in _contours(mask):
        pts = _chaikin(loop, smooth)
        pts = _simplify(pts + [pts[0]], tol)[:-1]
        if len(pts) < 3:
            continue
        parts.append("M" + " ".join(f"{x*s:.2f},{y*s:.2f}" for x, y in pts) + "Z")
    return "".join(parts)


def main():
    if "--trace" in sys.argv:
        mask = glyph_mask()
        w, h = mask.size
        print(f"<!-- viewBox 0 0 {100*w/max(w,h):.2f} {100*h/max(w,h):.2f} -->")
        print(trace())
        return

    ICONS.mkdir(parents=True, exist_ok=True)
    print("Pro Fantasy — iconos")

    # Favicon: el arte a sangre. Las esquinas quedan transparentes (el squircle
    # ya trae su propio contorno oscuro, que lo separa de barras claras).
    for size in (16, 32):
        save(render_art(size), ICONS / f"favicon-{size}x{size}.png")

    ico = [render_art(s) for s in (16, 32, 48)]
    write_ico(PUBLIC / "favicon.ico", ico)
    write_ico(ICONS / "favicon.ico", ico)
    print("  public/favicon.ico  16+32+48")

    # PWA `purpose: any` — se muestran tal cual, con el squircle del arte.
    for size in (192, 512):
        save(render_art(size), ICONS / f"android-chrome-{size}x{size}.png")

    # PWA `purpose: maskable` — el lanzador recorta con su propia máscara, así
    # que aquí va azul a sangre y la F al 46% del lado, dentro de la zona
    # segura (el círculo central del 80%). El squircle del arte sobraría.
    for size in (192, 512):
        save(render_glyph(size, bg=BLUE, scale=0.46),
             ICONS / f"android-chrome-maskable-{size}x{size}.png")

    # iOS: sin alfa. iOS rellena de negro cualquier transparencia y aplica su
    # propia máscara superelíptica, así que el arte va a sangre sobre azul.
    for size in (60, 76, 120, 152, 180):
        save(flatten(render_art(size), BLUE), ICONS / f"apple-touch-icon-{size}x{size}.png")
    save(flatten(render_art(180), BLUE), ICONS / "apple-touch-icon.png")

    # Mosaicos de Windows: el color lo pone <TileColor> en browserconfig.xml,
    # así que aquí va la F sobre transparente.
    save(render_glyph(150, scale=0.58), ICONS / "mstile-150x150.png")
    save(render_glyph(144, scale=0.58), ICONS / "msapplication-icon-144x144.png")

    # Badge de notificación push: Android lo aplasta a una silueta desde el
    # canal alfa, así que va la F blanca y nada más — un icono opaco saldría
    # como un cuadrado macizo.
    save(render_glyph(96, scale=0.66, fg=WHITE), ICONS / "notification-badge-96x96.png")

    # Logo suelto para usos fuera del navegador (README, tiendas, prensa).
    save(render_art(512, bleed=False), ROOT / "src" / "assets" / "logo.png")


if __name__ == "__main__":
    main()
