#!/usr/bin/env python3
"""Genera todos los iconos de marca de Fantasy MX desde una única definición.

    python3 scripts/generate-icons.py

El mark es el monograma "F" en blanco sobre esmeralda #059669 (el mismo
`theme_color` del manifest, del `TileColor` y del `mask-icon`, para que el icono
y el cromo del navegador se lean como una sola pieza).

La geometría vive aquí y en tres SVG escritos a mano — `public/favicon.svg`,
`public/img/icons/safari-pinned-tab.svg` y las copias inline del header
(`src/components/HeaderMenu.vue`) y del splash (`index.html`). Si tocas el
trazo, tócalos todos: no hay forma de derivarlos en tiempo de compilación.

Requiere Pillow (`pip install Pillow`). Solo se ejecuta a mano cuando cambia la
marca; los PNG resultantes se commitean.
"""

import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ICONS = PUBLIC / "img" / "icons"

EMERALD = (5, 150, 105, 255)  # #059669 — igual que theme_color
WHITE = (255, 255, 255, 255)

# Supersampling: se dibuja a 4x y se reduce con LANCZOS. Sin esto los bordes
# rectos del monograma quedan dentados a 16px, que es justo donde más se nota.
SS = 4

# Monograma "F" en su propia caja de 39x54. Trazo uniforme de 12 (0.22 de la
# altura): lo bastante grueso para sobrevivir a 16px sin cerrarse.
GLYPH = [(0, 0), (39, 0), (39, 12), (12, 12), (12, 21),
         (31, 21), (31, 33), (12, 33), (12, 54), (0, 54)]
GW, GH = 39, 54


# La masa de una "F" se concentra arriba a la izquierda, así que centrar su caja
# geométricamente la hace *parecer* desplazada a la izquierda. Se compensa con
# este empujón a la derecha, en fracción del lado del lienzo.
OPTICAL_NUDGE = 0.015


def draw_glyph(draw, canvas, height, color):
    """Dibuja la F ópticamente centrada en un lienzo cuadrado de lado `canvas`."""
    s = height / GH
    x0 = (canvas - GW * s) / 2 + canvas * OPTICAL_NUDGE
    y0 = (canvas - height) / 2
    draw.polygon([(x0 + px * s, y0 + py * s) for px, py in GLYPH], fill=color)


def render(size, *, bg=None, radius=0.0, glyph=0.54, fg=WHITE):
    """`radius` y `glyph` son fracciones del lado, no píxeles."""
    n = size * SS
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if bg is not None:
        if radius:
            d.rounded_rectangle([0, 0, n - 1, n - 1], radius=n * radius, fill=bg)
        else:
            d.rectangle([0, 0, n, n], fill=bg)
    draw_glyph(d, n, n * glyph, fg)
    return im.resize((size, size), Image.LANCZOS)


def write_ico(path, images):
    """Empaqueta varios PNG en un .ico.

    Pillow solo sabe reescalar una imagen a los tamaños pedidos; aquí cada
    tamaño se renderiza nativo a 4x, que es notablemente más nítido a 16px.
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


def main():
    ICONS.mkdir(parents=True, exist_ok=True)
    print("Fantasy MX — iconos")

    # Favicon: cuadrado redondeado a sangre. El fondo opaco es deliberado — un
    # icono transparente desaparece contra la barra de pestañas clara.
    for size in (16, 32):
        save(render(size, bg=EMERALD, radius=0.20), ICONS / f"favicon-{size}x{size}.png")

    ico = [render(s, bg=EMERALD, radius=0.20) for s in (16, 32, 48)]
    write_ico(PUBLIC / "favicon.ico", ico)
    write_ico(ICONS / "favicon.ico", ico)
    print("  public/favicon.ico  16+32+48")

    # PWA `purpose: any` — se muestran tal cual, así que llevan su propio radio.
    for size in (192, 512):
        save(render(size, bg=EMERALD, radius=0.22), ICONS / f"android-chrome-{size}x{size}.png")

    # PWA `purpose: maskable` — cuadrado a sangre sin redondear (el lanzador
    # aplica su máscara) y glifo al 46% para caber holgado en la zona segura,
    # el círculo central del 80%.
    for size in (192, 512):
        save(render(size, bg=EMERALD, glyph=0.46),
             ICONS / f"android-chrome-maskable-{size}x{size}.png")

    # iOS: sin alfa y sin redondear. iOS rellena de negro cualquier
    # transparencia y aplica su propia máscara superelíptica encima.
    for size in (60, 76, 120, 152, 180):
        save(render(size, bg=EMERALD), ICONS / f"apple-touch-icon-{size}x{size}.png")
    save(render(180, bg=EMERALD), ICONS / "apple-touch-icon.png")

    # Mosaicos de Windows: el color lo pone <TileColor> en browserconfig.xml,
    # así que aquí va el glifo blanco sobre transparente (lo contrario que en
    # el resto de plataformas).
    save(render(150, glyph=0.60), ICONS / "mstile-150x150.png")
    save(render(144, glyph=0.60), ICONS / "msapplication-icon-144x144.png")

    # Badge de notificación push: Android lo aplasta a una silueta desde el
    # canal alfa, así que un icono opaco saldría como un cuadrado macizo.
    save(render(96, glyph=0.62), ICONS / "notification-badge-96x96.png")


if __name__ == "__main__":
    main()
