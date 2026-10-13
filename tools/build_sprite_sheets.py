"""Build the seven small, transparent pixel-art animation sheets.

Requires Pillow only while preparing assets; the browser loads the PNG files.
Each sheet contains eight 48x64 cells: idle, step, jump, guard, attack,
special, hurt and defeat.
"""

from pathlib import Path
from PIL import Image, ImageDraw


FRAME_W = 48
FRAME_H = 64
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "sprites"

PALETTES = {
    "alma": dict(outline="#261d25", skin="#e8a47b", shade="#9e533f", hair="#302129", coat="#db6036", dark="#833a37", light="#ffae67", trim="#f7d77a", shoe="#35314a", eye="#23212b"),
    "diego": dict(outline="#182a2c", skin="#bd865f", shade="#785647", hair="#201e29", coat="#458f5c", dark="#24604d", light="#84c486", trim="#e5cf7c", shoe="#293846", eye="#201e29"),
    "nadia": dict(outline="#242039", skin="#d89b80", shade="#985d67", hair="#282039", coat="#8061b3", dark="#4c4389", light="#c9a5e7", trim="#76d6db", shoe="#2e3155", eye="#1f1d2f"),
    "chilo": dict(outline="#20293f", skin="#faf4dc", shade="#b5bfca", hair="#faf4dc", coat="#3377b8", dark="#24476f", light="#73b8e7", trim="#f7c64b", shoe="#d78d33", eye="#1a2634"),
    "vera": dict(outline="#1b2841", skin="#bb806b", shade="#765666", hair="#202b3d", coat="#2a9d97", dark="#205772", light="#83d3c3", trim="#f6c86b", shoe="#d9e9e8", eye="#202939"),
    "catodo3": dict(outline="#202b46", skin="#d3e5e8", shade="#788da5", hair="#d3e5e8", coat="#a7bed0", dark="#506f93", light="#ecf5ed", trim="#4ae5e7", shoe="#405574", eye="#092d43"),
    "null": dict(outline="#180d32", skin="#7751b5", shade="#42236f", hair="#ad75e2", coat="#5d34a0", dark="#312066", light="#a76ce4", trim="#55e0e1", shoe="#291c50", eye="#b8ffff"),
}


def rect(draw, box, color, outline=None):
    draw.rectangle(box, fill=color, outline=outline)


def body(draw, palette, character, frame):
    """Dibuja cuerpo y postura según el personaje y el número de animación."""
    p = palette
    # Ground shadow and shoes change shape as the fighter moves.
    if frame == 7:
        rect(draw, (7, 56, 43, 60), p["outline"])
        rect(draw, (10, 49, 37, 56), p["dark"], p["outline"])
        rect(draw, (31, 44, 40, 51), p["skin"], p["outline"])
        rect(draw, (5, 54, 17, 58), p["shoe"])
        return

    jump = frame == 2
    foot = 53 if jump else 60
    head_y = 5 if jump else 8
    torso_y = head_y + 21
    if frame == 1:
        legs = ((12, torso_y + 21, 21, foot - 5), (27, torso_y + 21, 36, foot - 1))
    elif jump:
        legs = ((13, torso_y + 20, 24, foot - 5), (26, torso_y + 17, 37, foot - 8))
    else:
        legs = ((14, torso_y + 20, 22, foot - 4), (26, torso_y + 20, 34, foot - 4))
    for index, leg in enumerate(legs):
        rect(draw, leg, p["dark" if index else "coat"], p["outline"])
        rect(draw, (leg[0] - 2, leg[3], leg[2] + 2, leg[3] + 4), p["shoe"], p["outline"])

    rect(draw, (12, torso_y - 1, 36, torso_y + 23), p["outline"])
    rect(draw, (14, torso_y + 1, 34, torso_y + 20), p["coat"])
    rect(draw, (14, torso_y + 2, 18, torso_y + 18), p["light"])
    rect(draw, (29, torso_y + 2, 34, torso_y + 20), p["dark"])
    rect(draw, (19, torso_y + 19, 29, torso_y + 21), p["trim"])

    # Left arm, then a visibly different right arm for each action.
    left_arm = (7, torso_y + 3, 14, torso_y + 22) if frame != 3 else (12, torso_y + 8, 20, torso_y + 20)
    rect(draw, left_arm, p["dark"], p["outline"])
    rect(draw, (left_arm[0], left_arm[3] - 4, left_arm[0] + 5, left_arm[3]), p["skin"])
    if frame in (4, 5):
        rect(draw, (33, torso_y + 4, 46, torso_y + 10), p["coat"], p["outline"])
        rect(draw, (42, torso_y + 3, 47, torso_y + 11), p["skin"], p["outline"])
    elif frame == 3:
        rect(draw, (27, torso_y + 5, 39, torso_y + 17), p["dark"], p["outline"])
        rect(draw, (31, torso_y + 4, 38, torso_y + 9), p["skin"])
    elif frame == 6:
        rect(draw, (32, torso_y + 8, 39, torso_y + 25), p["dark"], p["outline"])
    else:
        right_y = torso_y + (1 if frame == 1 else 4)
        rect(draw, (34, right_y, 40, right_y + 18), p["dark"], p["outline"])
        rect(draw, (34, right_y + 15, 39, right_y + 20), p["skin"])

    # A dark rim makes the sprite readable on every arena palette.
    rect(draw, (15, head_y + 2, 32, head_y + 22), p["outline"])
    rect(draw, (17, head_y + 4, 30, head_y + 20), p["skin"])
    rect(draw, (18, head_y + 15, 28, head_y + 20), p["shade"])

    if character == "chilo":
        draw.polygon([(18, head_y + 3), (22, head_y - 4), (25, head_y + 2), (28, head_y - 2), (31, head_y + 5)], fill="#f7f4e8", outline=p["outline"])
        rect(draw, (16, head_y, 31, head_y + 10), "#f7f4e8", p["outline"])
        rect(draw, (17, head_y + 6, 30, head_y + 19), "#f7f4e8")
        rect(draw, (30, head_y + 12, 40, head_y + 16), p["trim"], p["outline"])
        rect(draw, (26, head_y + 8, 28, head_y + 10), p["eye"])
        rect(draw, (20, torso_y + 7, 27, torso_y + 12), p["trim"])
        rect(draw, (11, torso_y + 4, 16, torso_y + 14), p["light"])
        if frame in (4, 5):
            draw.polygon([(32, torso_y + 4), (47, torso_y - 2), (42, torso_y + 7), (47, torso_y + 11), (33, torso_y + 13)], fill="#e7f4ef", outline=p["outline"])
            rect(draw, (37, torso_y + 6, 44, torso_y + 8), p["light"])
    elif character == "catodo3":
        rect(draw, (22, head_y - 4, 26, head_y + 3), p["dark"], p["outline"])
        rect(draw, (23, head_y - 6, 25, head_y - 4), p["trim"])
        rect(draw, (16, head_y + 2, 32, head_y + 17), p["light"], p["outline"])
        rect(draw, (19, head_y + 7, 30, head_y + 12), p["eye"])
        rect(draw, (22, head_y + 8, 29, head_y + 10), p["trim"])
        rect(draw, (8, torso_y, 16, torso_y + 9), p["light"], p["outline"])
        rect(draw, (33, torso_y, 41, torso_y + 9), p["light"], p["outline"])
        rect(draw, (20, torso_y + 8, 29, torso_y + 14), p["dark"])
        rect(draw, (22, torso_y + 9, 27, torso_y + 12), p["trim"])
        if frame in (4, 5):
            rect(draw, (38, torso_y + 2, 47, torso_y + 13), p["dark"], p["outline"])
            rect(draw, (43, torso_y + 5, 47, torso_y + 10), p["trim"])
    elif character == "null":
        draw.polygon([(15, head_y + 8), (23, head_y - 1), (33, head_y + 8), (30, head_y + 19), (18, head_y + 19)], fill=p["hair"], outline=p["outline"])
        draw.polygon([(8, torso_y + 10), (10, torso_y - 7), (20, torso_y + 3)], fill=p["light"], outline=p["outline"])
        draw.polygon([(31, torso_y + 3), (39, torso_y - 7), (42, torso_y + 11)], fill=p["shade"], outline=p["outline"])
        rect(draw, (21, head_y + 9, 24, head_y + 11), p["eye"])
        rect(draw, (27, head_y + 9, 30, head_y + 11), p["eye"])
        draw.polygon([(20, torso_y + 9), (25, torso_y + 4), (30, torso_y + 9), (25, torso_y + 16)], fill=p["trim"])
        if frame in (4, 5):
            draw.polygon([(38, torso_y + 2), (47, torso_y - 4), (44, torso_y + 12)], fill=p["trim"], outline=p["outline"])
    else:
        hair_top = head_y + (0 if character == "nadia" else 2)
        rect(draw, (16, hair_top, 31, head_y + 8), p["hair"], p["outline"])
        rect(draw, (16, head_y + 6, 19, head_y + 13), p["hair"])
        if character == "nadia":
            rect(draw, (14, head_y + 6, 17, head_y + 22), p["hair"])
            rect(draw, (29, head_y + 4, 33, head_y + 22), p["hair"])
            rect(draw, (13, torso_y + 1, 19, torso_y + 5), p["trim"])
            rect(draw, (14, head_y + 8, 17, head_y + 16), p["trim"])
            rect(draw, (30, head_y + 8, 33, head_y + 16), p["trim"])
            rect(draw, (15, torso_y + 19, 21, torso_y + 27), p["light"])
        if character == "vera":
            rect(draw, (17, head_y + 1, 31, head_y + 5), p["trim"])
            rect(draw, (20, torso_y + 4, 27, torso_y + 9), p["light"])
            rect(draw, (11, head_y + 5, 16, head_y + 18), p["hair"], p["outline"])
            rect(draw, (16, torso_y + 20, 21, torso_y + 31), p["light"])
            if frame in (4, 5):
                draw.ellipse((39, torso_y - 3, 47, torso_y + 5), fill="#de8b40", outline=p["outline"])
                rect(draw, (42, torso_y - 1, 43, torso_y + 4), p["outline"])
        if character == "alma":
            rect(draw, (21, torso_y + 3, 26, torso_y + 12), p["trim"])
            rect(draw, (32, torso_y + 16, 39, torso_y + 21), p["trim"], p["outline"])
            if frame in (4, 5):
                rect(draw, (42, torso_y + 2, 47, torso_y + 8), "#fff1ae")
        if character == "diego":
            rect(draw, (18, head_y + 4, 30, head_y + 6), p["light"])
            rect(draw, (21, torso_y + 8, 27, torso_y + 11), p["trim"])
            rect(draw, (11, torso_y + 1, 17, torso_y + 8), p["light"], p["outline"])
            rect(draw, (32, torso_y + 1, 38, torso_y + 8), p["light"], p["outline"])
            rect(draw, (16, torso_y + 30, 21, torso_y + 33), p["trim"])
        rect(draw, (27, head_y + 11, 29, head_y + 12), p["eye"])

    if frame == 5:
        energy = p["trim"]
        for x, y in ((40, 14), (44, 21), (43, 28), (7, 17), (4, 27), (40, 43)):
            rect(draw, (x, y, x + 2, y + 2), energy)
    if frame == 6:
        rect(draw, (2, 25, 7, 27), "#ffed8a")
        rect(draw, (5, 20, 8, 22), "#ffed8a")


def build():
    """Reúne las ocho poses pequeñas de cada personaje en una hoja PNG."""
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for character, palette in PALETTES.items():
        sheet = Image.new("RGBA", (FRAME_W * 8, FRAME_H), (0, 0, 0, 0))
        for frame in range(8):
            cell = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
            body(ImageDraw.Draw(cell), palette, character, frame)
            sheet.alpha_composite(cell, (frame * FRAME_W, 0))
        sheet.save(OUTPUT / f"{character}.png", optimize=True)


if __name__ == "__main__":
    build()
