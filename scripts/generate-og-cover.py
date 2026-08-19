#!/usr/bin/env python3
"""Genera public/img/og-cover.png, la tarjeta que sale al compartir un enlace.

    python3 scripts/generate-og-cover.py

1200x630 es el tamaño que piden Open Graph y Twitter Cards. La paleta sale del
icono de marca (ver scripts/generate-icons.py): azul #01229B de fondo y verde
lima #98E214 para los acentos, para que el enlace compartido y el icono de la
app se lean como la misma marca.

El logo se compone desde el arte maestro en vez de redibujarse aquí: así no hay
una tercera versión de la F que se pueda desincronizar.

Requiere Pillow. Se ejecuta a mano cuando cambia la marca o el mensaje; el PNG
resultante se commitea.
"""

import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "img" / "og-cover.png"
FONT = "/usr/share/fonts/truetype/ubuntu/UbuntuSans[wdth,wght].ttf"

W, H = 1200, 630
SS = 2  # se dibuja al doble y se reduce: bordes y texto mucho más limpios

BLUE = (1, 34, 155)
BLUE_DEEP = (0, 14, 74)
LIME = (152, 226, 20)
WHITE = (255, 255, 255)

LEAGUES = ["Liga MX", "Premier League", "LaLiga", "Serie A", "Bundesliga"]


def _icons():
    spec = importlib.util.spec_from_file_location("gen", ROOT / "scripts" / "generate-icons.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def font(size, weight="Bold"):
    f = ImageFont.truetype(FONT, size * SS)
    f.set_variation_by_name(weight)
    return f


def background(im):
    """Degradado diagonal azul + marcas de cancha muy tenues."""
    d = ImageDraw.Draw(im, "RGBA")
    w, h = im.size
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(
            round(a + (b - a) * t) for a, b in zip(BLUE, BLUE_DEEP)))
    # Viñeta lateral: oscurece la derecha para que el titular respire.
    for x in range(w):
        a = int(60 * (x / w) ** 2)
        if a:
            d.line([(x, 0), (x, h)], fill=(0, 8, 46, a))

    line = (255, 255, 255, 26)
    lw = 3 * SS
    d.line([(w // 2, 0), (w // 2, h)], fill=line, width=lw)
    r = 150 * SS
    d.ellipse([w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r], outline=line, width=lw)
    box_h, box_w = 300 * SS, 150 * SS
    d.rectangle([-lw, h // 2 - box_h // 2, box_w, h // 2 + box_h // 2], outline=line, width=lw)
    d.rectangle([w - box_w, h // 2 - box_h // 2, w + lw, h // 2 + box_h // 2],
                outline=line, width=lw)


def pill(d, xy, text, f, *, fg, bg, pad=(22, 12), radius=999):
    x, y = xy
    tw = d.textlength(text, font=f)
    asc, desc = f.getmetrics()
    w = tw + 2 * pad[0] * SS
    h = asc + desc + 2 * pad[1] * SS
    d.rounded_rectangle([x, y, x + w, y + h], radius=min(radius * SS, h / 2), fill=bg)
    d.text((x + pad[0] * SS, y + pad[1] * SS), text, font=f, fill=fg)
    return w, h


def main():
    im = Image.new("RGB", (W * SS, H * SS), BLUE)
    background(im)
    d = ImageDraw.Draw(im, "RGBA")

    # --- marca -------------------------------------------------------------
    logo = _icons().render_art(72 * SS)
    im.paste(logo, (80 * SS, 62 * SS), logo)
    f_brand = font(38, "ExtraBold")
    d.text((172 * SS, 74 * SS), "Pro Fantasy", font=f_brand, fill=WHITE)

    # --- badge -------------------------------------------------------------
    f_badge = font(26, "ExtraBold")
    tw = d.textlength("GRATIS", font=f_badge)
    pill(d, (W * SS - 80 * SS - tw - 44 * SS, 68 * SS), "GRATIS", f_badge,
         fg=BLUE_DEEP, bg=LIME)

    # --- titular -----------------------------------------------------------
    f_h1 = font(62, "ExtraBold")
    y = 205 * SS
    d.text((80 * SS, y), "Fantasy con draft en vivo,", font=f_h1, fill=WHITE)
    y += 82 * SS
    x = 80 * SS
    for text, color in (("quinielas y ", WHITE), ("Survivor", LIME)):
        d.text((x, y), text, font=f_h1, fill=color)
        x += d.textlength(text, font=f_h1)

    # --- subtítulo ---------------------------------------------------------
    f_sub = font(30, "Regular")
    sub = (210, 220, 245)
    d.text((80 * SS, 385 * SS),
           "Sigue el futbol en vivo y reta a tus amigos en las 5 grandes", font=f_sub, fill=sub)
    d.text((80 * SS, 425 * SS), "ligas.", font=f_sub, fill=sub)

    # --- ligas -------------------------------------------------------------
    f_pill = font(24, "SemiBold")
    x = 80 * SS
    for name in LEAGUES:
        w, _ = pill(d, (x, 505 * SS), name, f_pill,
                    fg=WHITE, bg=(255, 255, 255, 28), pad=(24, 13))
        x += w + 16 * SS

    im.resize((W, H), Image.LANCZOS).save(OUT, "PNG", optimize=True)
    print(f"  {OUT.relative_to(ROOT)}  {W}x{H}")


if __name__ == "__main__":
    main()
