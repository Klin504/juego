"""Build versioned, transparent fighting spritesheets for Chilos Fighters.

The source is deliberately deterministic so each animation keeps an exact cell
size and can be regenerated without touching the original spritesheets.
Requires Pillow only while preparing assets.
"""

from pathlib import Path
from PIL import Image, ImageDraw


PIXEL_SCALE = 1
BASE_FRAME_WIDTH = 64
BASE_FRAME_HEIGHT = 80
FRAME_WIDTH = BASE_FRAME_WIDTH * 2
FRAME_HEIGHT = BASE_FRAME_HEIGHT * 2
FRAME_COUNT = 8
OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "sprites" / "fighting-v2"

PALETTES = {
    "alma": {
        "outline": "#211c2b", "skin": "#e8a17a", "skin_light": "#ffd0a1", "skin_shadow": "#a75e4c",
        "hair": "#302033", "hair_light": "#694356", "main": "#c64f37",
        "dark": "#763546", "light": "#f1844b", "accent": "#ffd36f",
        "metal": "#e2bc66", "shoe": "#343347", "white": "#ffebcb",
    },
    "diego": {
        "outline": "#19272b", "skin": "#bf896b", "skin_light": "#e2af83", "skin_shadow": "#80584e",
        "hair": "#20272e", "hair_light": "#54665d", "main": "#34704f",
        "dark": "#224438", "light": "#68ad76", "accent": "#f0d787",
        "metal": "#559ca4", "shoe": "#293642", "white": "#e6eee0",
    },
    "nadia": {
        "outline": "#261d35", "skin": "#d99b84", "skin_light": "#f5b99c", "skin_shadow": "#925d6a",
        "hair": "#30223f", "hair_light": "#775a91", "main": "#7052a0",
        "dark": "#403766", "light": "#aa83ca", "accent": "#59d5d3",
        "metal": "#e38bb9", "shoe": "#302b4d", "white": "#f0dafa",
    },
    "chilo": {
        "outline": "#20283b", "feather": "#f4f1dc", "feather_shadow": "#aebaca",
        "feather_light": "#ffffff", "main": "#3474ae", "dark": "#24476e",
        "light": "#72b9df", "accent": "#f2bf48", "beak": "#ee9a31",
        "skin": "#e9a13d", "shoe": "#a85138",
    },
    "vera": {
        "outline": "#1c293d", "skin": "#c88c78", "skin_light": "#ebad89", "skin_shadow": "#805768",
        "hair": "#27324a", "hair_light": "#53617b", "main": "#208e8c",
        "dark": "#20536b", "light": "#70d1bb", "accent": "#f2c66b",
        "metal": "#f2eee0", "shoe": "#273c59", "white": "#eff6e7",
    },
    "catodo3": {
        "outline": "#1d293c", "metal": "#bac9d0", "metal_shadow": "#657f99",
        "metal_light": "#edf3ed", "main": "#799bb0", "dark": "#3a5875",
        "screen": "#1a344e", "accent": "#45e1df", "warning": "#ffcf69",
        "shoe": "#344a66", "white": "#f5f5df",
    },
    "null": {
        "outline": "#160f2c", "void": "#302154", "dark": "#482978",
        "main": "#7141ae", "light": "#b47be8", "accent": "#57e8e1",
        "pink": "#f282c9", "white": "#e6d6ff", "shadow": "#22183d",
    },
}


def rect(draw, x1, y1, x2, y2, color, outline=None):
    """Draw using exclusive right/bottom coordinates for consistent pixels."""
    scale = PIXEL_SCALE
    draw.rectangle((x1 * scale, y1 * scale, x2 * scale - 1, y2 * scale - 1), fill=color, outline=outline)


def polygon(draw, points, color, outline):
    draw.polygon([(x * PIXEL_SCALE, y * PIXEL_SCALE) for x, y in points], fill=color, outline=outline)


def shadow(draw, palette, x1=17, x2=48):
    rect(draw, x1, 76, x2, 79, palette.get("outline", palette.get("shadow")))
    rect(draw, x1 + 4, 76, x2 - 4, 77, palette.get("dark", palette.get("void", "#333333")))


def human_head(draw, p, character, top):
    """One compact 3/4 profile: the face is smaller than the chest."""
    if character == "nadia":
        polygon(draw, [(27, top + 5), (19, top + 13), (14, top + 31),
                       (20, top + 39), (26, top + 24)], p["hair"], p["outline"])
        rect(draw, 17, top + 25, 20, top + 32, p["hair_light"])
    elif character == "vera":
        polygon(draw, [(26, top + 6), (17, top + 13), (12, top + 24),
                       (18, top + 31), (26, top + 22)], p["hair"], p["outline"])
        rect(draw, 16, top + 19, 20, top + 23, p["hair_light"])

    polygon(draw, [(27, top + 5), (40, top + 5), (44, top + 10),
                   (44, top + 19), (40, top + 23), (30, top + 24),
                   (26, top + 19), (25, top + 12)], p["skin"], p["outline"])
    # Deliberate light and shadow clusters give the face a jaw and cheek.
    polygon(draw, [(29, top + 9), (38, top + 8), (40, top + 12),
                   (37, top + 17), (29, top + 17)], p["skin_light"], p["skin_light"])
    polygon(draw, [(27, top + 17), (31, top + 20), (41, top + 19),
                   (39, top + 22), (31, top + 22)], p["skin_shadow"], p["skin_shadow"])
    rect(draw, 26, top + 12, 29, top + 18, p["skin_shadow"], p["outline"])
    rect(draw, 27, top + 14, 28, top + 16, p["skin_light"])
    polygon(draw, [(43, top + 15), (47, top + 17),
                   (44, top + 19), (41, top + 18)], p["skin"], p["outline"])
    rect(draw, 38, top + 12, 43, top + 14, p["outline"])
    rect(draw, 40, top + 13, 42, top + 14, p["white"])
    rect(draw, 39, top + 20, 43, top + 21, p["outline"])

    if character == "alma":
        polygon(draw, [(24, top + 10), (25, top + 4), (31, top + 1),
                       (41, top + 2), (45, top + 7), (40, top + 10),
                       (30, top + 8), (27, top + 14)], p["hair"], p["outline"])
        polygon(draw, [(26, top + 8), (32, top + 7), (29, top + 14),
                       (25, top + 15)], p["hair"], p["outline"])
        rect(draw, 28, top + 7, 43, top + 9, p["metal"], p["outline"])
        rect(draw, 33, top + 6, 40, top + 10, p["accent"], p["outline"])
        rect(draw, 35, top + 7, 39, top + 8, p["white"])
        rect(draw, 30, top + 3, 38, top + 5, p["hair_light"])
    elif character == "diego":
        polygon(draw, [(24, top + 10), (25, top + 3), (30, top + 1),
                       (41, top + 1), (45, top + 5), (45, top + 10)], p["hair"], p["outline"])
        rect(draw, 26, top + 7, 44, top + 10, p["accent"], p["outline"])
        rect(draw, 29, top + 3, 40, top + 5, p["hair_light"])
        rect(draw, 34, top + 21, 39, top + 23, p["hair"])
        rect(draw, 40, top + 18, 43, top + 20, p["skin_shadow"])
    elif character == "nadia":
        polygon(draw, [(23, top + 13), (24, top + 5), (30, top),
                       (40, top + 2), (44, top + 9), (34, top + 8),
                       (29, top + 14)], p["hair"], p["outline"])
        rect(draw, 23, top + 11, 27, top + 18, p["metal"], p["outline"])
        rect(draw, 41, top + 8, 46, top + 11, p["accent"], p["outline"])
        rect(draw, 31, top + 3, 39, top + 5, p["hair_light"])
        rect(draw, 19, top + 19, 22, top + 22, p["accent"], p["outline"])
        rect(draw, 21, top + 27, 23, top + 32, p["hair_light"])
    else:
        polygon(draw, [(24, top + 11), (25, top + 4), (32, top + 1),
                       (42, top + 3), (45, top + 9), (35, top + 9),
                       (27, top + 15)], p["hair"], p["outline"])
        rect(draw, 25, top + 7, 44, top + 10, p["accent"])
        rect(draw, 31, top + 3, 40, top + 5, p["hair_light"])
        rect(draw, 15, top + 22, 21, top + 24, p["hair_light"])


def human_defeat(draw, p, character):
    """A readable one-knee pose instead of a collapsed horizontal blob."""
    shadow(draw, p, 10, 56)
    polygon(draw, [(26, 57), (42, 58), (53, 69), (53, 75),
                   (41, 75), (34, 66)], p["dark"], p["outline"])
    rect(draw, 42, 71, 56, 76, p["shoe"], p["outline"])
    polygon(draw, [(22, 55), (34, 58), (31, 72), (19, 73),
                   (15, 66)], p["main"], p["outline"])
    rect(draw, 14, 71, 32, 76, p["shoe"], p["outline"])
    polygon(draw, [(20, 44), (28, 40), (43, 43), (48, 53),
                   (42, 64), (25, 62), (16, 53)], p["main"], p["outline"])
    polygon(draw, [(20, 47), (25, 45), (27, 57), (21, 58)], p["light"], p["outline"])
    polygon(draw, [(18, 47), (22, 49), (19, 66), (13, 69),
                   (11, 63)], p["dark"], p["outline"])
    rect(draw, 10, 66, 18, 72, p["skin"], p["outline"])
    human_head(draw, p, character, 21)
    rect(draw, 29, 59, 41, 62, p["accent"], p["outline"])
    if character == "diego":
        rect(draw, 32, 48, 37, 54, p["white"], p["outline"])
    elif character == "vera":
        rect(draw, 48, 60, 57, 68, p["accent"], p["outline"])
        rect(draw, 50, 63, 55, 65, p["white"])
    elif character == "nadia":
        rect(draw, 18, 54, 21, 62, p["hair_light"])


def draw_human(draw, p, character, frame):
    if frame == 7:
        human_defeat(draw, p, character)
        return

    jumping = frame == 2
    moving = frame == 1
    bob = -5 if jumping else 1 if moving else 0
    torso = 29 + bob
    shadow(draw, p, 23, 43) if jumping else shadow(draw, p)

    # Legs occupy a full third of the height; boots are below the hem.
    if jumping:
        legs = [(23, 53 + bob, 31, 67), (37, 53 + bob, 45, 65)]
    elif moving:
        legs = [(20, 53 + bob, 29, 72), (38, 53 + bob, 47, 73)]
    elif character == "alma":
        legs = [(22, 53, 31, 74), (38, 55, 47, 71)]
    elif character == "diego":
        legs = [(19, 54, 30, 71), (39, 54, 50, 71)]
    elif character == "nadia":
        legs = [(24, 54, 32, 74), (38, 54, 46, 72)]
    else:
        legs = [(21, 53, 31, 73), (39, 55, 49, 71)]
    for index, (x1, y1, x2, y2) in enumerate(legs):
        rect(draw, x1, y1, x2, y2, p["main"] if index == 0 else p["dark"], p["outline"])
        rect(draw, x1 + 2, y1 + 4, x2 - 2, y2 - 4,
             p["light"] if index == 0 else p["main"])
        rect(draw, x1 + 2, y1 + 6, x1 + 4, y1 + 12, p["light"])
        rect(draw, x2 - 3, y1 + 9, x2 - 1, y1 + 15, p["dark"])
        rect(draw, x1 + 2, y2 - 18, x2 - 1, y2 - 16, p["dark"])
        rect(draw, x1 + 2, y2 - 15, x1 + 5, y2 - 13, p["light"])
        rect(draw, x1 - 2, y2 - 4, x2 + 3, y2 + 2, p["shoe"], p["outline"])
        rect(draw, x1, y2 - 3, x2, y2 - 2, p["white"])
        rect(draw, x1 + 1, y2 - 1, x2 + 1, y2 + 1, p["dark"])
        if character == "vera":
            # Court socks and knee guards keep the athlete readable in motion.
            rect(draw, x1 + 1, y2 - 12, x2 - 1, y2 - 9, p["white"], p["outline"])
            rect(draw, x1 + 2, y2 - 10, x2 - 2, y2 - 9, p["accent"])
        elif character == "diego":
            rect(draw, x1, y2 - 16, x2, y2 - 12, p["dark"], p["outline"])
            rect(draw, x1 + 2, y2 - 15, x2 - 2, y2 - 14, p["accent"])

    # Distinct outline accessories are drawn behind the jacket.
    if character == "alma":
        rect(draw, 12, torso + 7, 21, torso + 25, p["metal"], p["outline"])
        rect(draw, 14, torso + 10, 19, torso + 15, p["accent"])
    elif character == "nadia":
        polygon(draw, [(23, torso + 14), (17, torso + 34),
                       (23, torso + 37), (29, torso + 24)], p["dark"], p["outline"])
        rect(draw, 18, torso + 30, 22, torso + 33, p["accent"])
        polygon(draw, [(42, torso + 18), (51, torso + 34),
                       (45, torso + 38), (39, torso + 26)], p["dark"], p["outline"])
        rect(draw, 46, torso + 31, 49, torso + 34, p["accent"])
    elif character == "vera":
        polygon(draw, [(25, torso - 5), (16, torso + 1),
                       (13, torso + 14), (21, torso + 17),
                       (28, torso + 4)], p["hair"], p["outline"])

    # Rear arm and tapered jacket.
    polygon(draw, [(19, torso + 3), (25, torso + 4),
                   (24, torso + 20), (19, torso + 25),
                   (14, torso + 19)], p["dark"], p["outline"])
    polygon(draw, [(19, torso + 5), (22, torso + 6),
                   (21, torso + 17), (17, torso + 19)], p["main"], p["outline"])
    rect(draw, 13, torso + 20, 21, torso + 28, p["skin"], p["outline"])
    rect(draw, 15, torso + 21, 19, torso + 23, p["skin_light"])
    shoulder_left = 17 if character == "diego" else 20
    shoulder_right = 50 if character == "diego" else 48
    polygon(draw, [(25, torso), (40, torso), (shoulder_right, torso + 5),
                   (45, torso + 23), (40, torso + 28), (25, torso + 27),
                   (shoulder_left, torso + 18), (shoulder_left, torso + 7)],
            p["main"], p["outline"])
    polygon(draw, [(22, torso + 6), (27, torso + 3),
                   (29, torso + 23), (24, torso + 23)], p["light"], p["outline"])
    polygon(draw, [(41, torso + 4), (47, torso + 7),
                   (44, torso + 22), (39, torso + 25)], p["dark"], p["outline"])
    polygon(draw, [(28, torso + 2), (39, torso + 2),
                   (42, torso + 6), (35, torso + 7),
                   (31, torso + 5)], p["light"], p["light"])
    polygon(draw, [(43, torso + 9), (45, torso + 13),
                   (42, torso + 22), (38, torso + 24)], p["dark"], p["dark"])
    rect(draw, 26, torso + 20, 30, torso + 22, p["light"])
    rect(draw, 37, torso + 21, 41, torso + 23, p["dark"])
    rect(draw, 25, torso + 24, 42, torso + 28, p["accent"], p["outline"])
    rect(draw, 29, torso + 25, 33, torso + 27, p["outline"])

    if character == "alma":
        rect(draw, 31, torso + 6, 37, torso + 14, p["accent"], p["outline"])
        rect(draw, 33, torso + 8, 35, torso + 12, p["white"])
        rect(draw, 42, torso + 18, 49, torso + 25, p["metal"], p["outline"])
        rect(draw, 19, torso + 6, 24, torso + 10, p["metal"], p["outline"])
        rect(draw, 21, torso + 7, 23, torso + 9, p["white"])
        polygon(draw, [(25, torso + 14), (31, torso + 16),
                       (34, torso + 18), (27, torso + 18)], p["dark"], p["dark"])
        rect(draw, 25, torso + 29, 31, torso + 35, p["metal"], p["outline"])
        rect(draw, 27, torso + 30, 29, torso + 33, p["accent"])
    elif character == "diego":
        # Broad shoulder pads and taped wrists establish a heavyweight shape.
        polygon(draw, [(16, torso + 3), (23, torso - 1), (29, torso + 5),
                       (23, torso + 12), (15, torso + 11)], p["dark"], p["outline"])
        polygon(draw, [(42, torso + 4), (49, torso - 1), (54, torso + 6),
                       (51, torso + 13), (45, torso + 11)], p["dark"], p["outline"])
        rect(draw, 18, torso + 3, 24, torso + 10, p["dark"], p["outline"])
        rect(draw, 44, torso + 3, 50, torso + 10, p["dark"], p["outline"])
        rect(draw, 20, torso + 5, 23, torso + 7, p["light"])
        rect(draw, 45, torso + 5, 48, torso + 7, p["light"])
        rect(draw, 32, torso + 7, 39, torso + 16, p["white"], p["outline"])
        rect(draw, 35, torso + 9, 37, torso + 14, p["main"])
        rect(draw, 21, torso + 11, 25, torso + 15, p["main"], p["outline"])
        rect(draw, 45, torso + 11, 49, torso + 15, p["main"], p["outline"])
        rect(draw, 28, torso + 18, 40, torso + 20, p["dark"])
        rect(draw, 31, torso + 19, 37, torso + 20, p["light"])
    elif character == "nadia":
        rect(draw, 26, torso + 4, 42, torso + 7, p["accent"], p["outline"])
        rect(draw, 29, torso + 11, 42, torso + 15, p["metal"], p["outline"])
        rect(draw, 37, torso + 13, 40, torso + 15, p["accent"])
        rect(draw, 24, torso + 18, 28, torso + 27, p["light"], p["outline"])
        rect(draw, 40, torso + 18, 44, torso + 27, p["light"], p["outline"])
        polygon(draw, [(27, torso + 5), (32, torso + 12),
                       (29, torso + 20), (25, torso + 13)], p["dark"], p["outline"])
        rect(draw, 33, torso + 18, 38, torso + 20, p["accent"])
        rect(draw, 21, torso + 29, 24, torso + 32, p["light"])
        rect(draw, 44, torso + 30, 47, torso + 33, p["light"])
    else:
        polygon(draw, [(28, torso + 2), (34, torso + 2),
                       (44, torso + 22), (39, torso + 25)], p["accent"], p["outline"])
        rect(draw, 26, torso + 18, 30, torso + 21, p["white"])
        rect(draw, 29, torso + 26, 40, torso + 28, p["dark"], p["outline"])
        rect(draw, 20, torso + 6, 23, torso + 17, p["light"])
        rect(draw, 31, torso + 5, 35, torso + 7, p["white"])
        polygon(draw, [(39, torso + 17), (43, torso + 23),
                       (39, torso + 25), (35, torso + 20)], p["light"], p["light"])

    human_head(draw, p, character, 6 + bob)

    # Front arm pose is the combat read: guard, strike and special differ.
    if frame == 3:
        polygon(draw, [(43, torso + 5), (50, torso + 5),
                       (51, torso + 15), (44, torso + 17)], p["dark"], p["outline"])
        polygon(draw, [(43, torso + 15), (51, torso + 8),
                       (55, torso + 10), (56, torso + 19),
                       (46, torso + 22)], p["skin"], p["outline"])
        rect(draw, 45, torso + 15, 52, torso + 18, p["accent"])
    elif frame == 4:
        polygon(draw, [(44, torso + 5), (51, torso + 7),
                       (55, torso + 12), (51, torso + 17),
                       (44, torso + 15)], p["dark"], p["outline"])
        rect(draw, 51, torso + 10, 62, torso + 17, p["skin"], p["outline"])
        rect(draw, 57, torso + 11, 61, torso + 13, p["white"])
    elif frame == 5:
        polygon(draw, [(43, torso + 5), (50, torso + 3),
                       (55, torso - 3), (59, torso + 1),
                       (52, torso + 12), (45, torso + 17)], p["dark"], p["outline"])
        rect(draw, 54, torso - 6, 61, torso + 2, p["skin"], p["outline"])
        for x, y in ((52, 16), (58, 12), (61, 21), (12, 32), (16, 24)):
            rect(draw, x, y, x + 3, y + 3, p["accent"])
    elif frame == 6:
        polygon(draw, [(43, torso + 7), (49, torso + 10),
                       (46, torso + 24), (40, torso + 25)], p["dark"], p["outline"])
        rect(draw, 39, torso + 22, 47, torso + 28, p["skin"], p["outline"])
        rect(draw, 12, 24, 16, 27, p["white"])
    elif frame == 1:
        # A forward arm swing keeps the moving pose distinct from idle.
        polygon(draw, [(43, torso + 4), (49, torso + 6),
                       (53, torso + 13), (48, torso + 18),
                       (41, torso + 13)], p["dark"], p["outline"])
        rect(draw, 48, torso + 11, 56, torso + 17, p["skin"], p["outline"])
        rect(draw, 49, torso + 12, 53, torso + 14, p["skin_light"])
        rect(draw, 46, torso + 16, 52, torso + 18, p["accent"])
    elif frame == 0 and character == "alma":
        # Engineer at rest: an elbow bent around her hand-held circuit tool.
        polygon(draw, [(43, torso + 5), (50, torso + 7),
                       (52, torso + 17), (45, torso + 19),
                       (41, torso + 14)], p["dark"], p["outline"])
        rect(draw, 48, torso + 13, 55, torso + 20, p["skin"], p["outline"])
        rect(draw, 53, torso + 8, 59, torso + 19, p["metal"], p["outline"])
        rect(draw, 55, torso + 10, 57, torso + 15, p["accent"])
        rect(draw, 54, torso + 5, 58, torso + 9, p["white"])
    elif frame == 0 and character == "diego":
        # The athlete keeps both taped fists high in a boxing guard.
        polygon(draw, [(19, torso + 9), (25, torso + 7),
                       (31, torso + 14), (27, torso + 20),
                       (17, torso + 17)], p["dark"], p["outline"])
        rect(draw, 25, torso + 9, 32, torso + 16, p["skin"], p["outline"])
        rect(draw, 25, torso + 14, 32, torso + 17, p["accent"])
        polygon(draw, [(44, torso + 5), (51, torso + 7),
                       (54, torso + 19), (47, torso + 21),
                       (40, torso + 14)], p["dark"], p["outline"])
        rect(draw, 47, torso + 6, 55, torso + 14, p["skin"], p["outline"])
        rect(draw, 47, torso + 12, 55, torso + 15, p["accent"])
    elif frame == 0 and character == "nadia":
        # Nadia holds a recorder near her face, with the cable crossing her sleeve.
        polygon(draw, [(43, torso + 7), (49, torso + 7),
                       (53, torso + 17), (48, torso + 21),
                       (41, torso + 15)], p["dark"], p["outline"])
        rect(draw, 48, torso + 9, 55, torso + 15, p["skin"], p["outline"])
        rect(draw, 51, torso + 2, 59, torso + 11, p["metal"], p["outline"])
        rect(draw, 53, torso + 4, 57, torso + 7, p["accent"])
        rect(draw, 45, torso + 20, 48, torso + 27, p["accent"])
    else:
        polygon(draw, [(43, torso + 4), (49, torso + 7),
                       (49, torso + 22), (44, torso + 27),
                       (40, torso + 20)], p["dark"], p["outline"])
        rect(draw, 43, torso + 21, 50, torso + 28, p["skin"], p["outline"])

    if character == "vera":
        ball_x = 52 if frame in (4, 5) else 49
        ball_y = torso + (4 if frame in (4, 5) else 17)
        if frame in (0, 1, 3, 4, 5):
            polygon(draw, [(ball_x + 3, ball_y), (ball_x + 8, ball_y),
                           (ball_x + 11, ball_y + 3), (ball_x + 11, ball_y + 8),
                           (ball_x + 8, ball_y + 11), (ball_x + 3, ball_y + 11),
                           (ball_x, ball_y + 8), (ball_x, ball_y + 3)],
                    p["accent"], p["outline"])
            rect(draw, ball_x + 2, ball_y + 2, ball_x + 9, ball_y + 4, p["white"])
            rect(draw, ball_x + 5, ball_y + 2, ball_x + 7, ball_y + 10, p["dark"])
            rect(draw, ball_x + 2, ball_y + 5, ball_x + 10, ball_y + 7, p["dark"])
            if frame in (4, 5):
                rect(draw, 47, ball_y + 5, 51, ball_y + 7, p["white"])


def draw_chilo(draw, p, frame):
    if frame == 7:
        shadow(draw, p, 11, 55)
        polygon(draw, [(18, 48), (9, 46), (7, 57), (20, 62)], p["feather_shadow"], p["outline"])
        polygon(draw, [(21, 43), (31, 37), (45, 39), (51, 51), (44, 65), (25, 67), (16, 57)], p["main"], p["outline"])
        polygon(draw, [(23, 46), (29, 42), (30, 58), (25, 62)], p["light"], p["outline"])
        rect(draw, 31, 52, 42, 57, p["accent"], p["outline"])
        polygon(draw, [(43, 46), (53, 51), (59, 61), (52, 65), (39, 57)], p["feather_light"], p["outline"])
        rect(draw, 20, 60, 28, 71, p["skin"], p["outline"])
        rect(draw, 15, 69, 33, 76, p["beak"], p["outline"])
        rect(draw, 37, 62, 45, 72, p["skin"], p["outline"])
        rect(draw, 35, 70, 53, 76, p["beak"], p["outline"])
        polygon(draw, [(23, 22), (30, 18), (44, 20), (49, 28), (44, 44), (29, 46), (22, 37)], p["feather"], p["outline"])
        rect(draw, 27, 27, 43, 39, p["feather_light"])
        polygon(draw, [(29, 21), (32, 13), (37, 20), (42, 14), (45, 23)], p["feather_light"], p["outline"])
        polygon(draw, [(43, 31), (58, 34), (44, 38)], p["beak"], p["outline"])
        rect(draw, 39, 28, 42, 31, p["outline"])
        return
    jumping = frame == 2
    y = -1 if jumping else 1 if frame == 1 else 0
    shadow(draw, p, 22, 43) if jumping else shadow(draw, p)
    # Tail feathers and long bird legs make Chilo's silhouette distinct from students.
    polygon(draw, [(22, 46 + y), (11, 42 + y), (7, 52 + y), (22, 55 + y)], p["feather_shadow"], p["outline"])
    rect(draw, 23, 53 + y, 30, 72 if not jumping else 64, p["skin"], p["outline"])
    rect(draw, 38, 53 + y, 45, 72 if not jumping else 61, p["skin"], p["outline"])
    rect(draw, 19, 70 if not jumping else 62, 34, 76 if not jumping else 68, p["beak"], p["outline"])
    rect(draw, 35, 70 if not jumping else 59, 50, 76 if not jumping else 65, p["beak"], p["outline"])
    rect(draw, 22, 71 if not jumping else 63, 31, 73 if not jumping else 65, p["accent"])
    rect(draw, 38, 71 if not jumping else 60, 47, 73 if not jumping else 62, p["accent"])
    polygon(draw, [(21, 31 + y), (27, 27 + y), (42, 29 + y), (49, 36 + y), (45, 57 + y), (39, 61 + y), (22, 57 + y), (17, 42 + y)], p["main"], p["outline"])
    polygon(draw, [(23, 34 + y), (29, 31 + y), (30, 53 + y), (24, 52 + y)], p["light"], p["outline"])
    rect(draw, 31, 43 + y, 41, 49 + y, p["accent"], p["outline"])
    rect(draw, 33, 45 + y, 39, 47 + y, p["dark"])
    rect(draw, 23, 48 + y, 29, 51 + y, p["feather_light"])
    rect(draw, 38, 52 + y, 44, 54 + y, p["dark"])
    polygon(draw, [(38, 31 + y), (45, 36 + y), (44, 48 + y),
                   (41, 55 + y), (36, 51 + y)], p["dark"], p["dark"])
    rect(draw, 22, 37 + y, 25, 45 + y, p["light"])
    rect(draw, 33, 35 + y, 39, 37 + y, p["light"])
    # Layered breast feathers and a side stripe survive the 100 px battle scale.
    polygon(draw, [(28, 34 + y), (35, 37 + y), (31, 42 + y),
                   (37, 44 + y), (29, 46 + y)], p["feather_light"], p["outline"])
    rect(draw, 26, 53 + y, 39, 56 + y, p["dark"], p["outline"])
    rect(draw, 30, 54 + y, 36, 55 + y, p["accent"])
    # Smaller head, shorter beak and a visible neck balance the mascot body.
    rect(draw, 31, 28 + y, 40, 36 + y, p["feather_shadow"], p["outline"])
    polygon(draw, [(25, 13 + y), (30, 9 + y), (42, 10 + y),
                   (47, 16 + y), (44, 29 + y), (29, 31 + y),
                   (24, 25 + y)], p["feather"], p["outline"])
    polygon(draw, [(29, 16 + y), (39, 13 + y), (44, 17 + y),
                   (42, 25 + y), (30, 27 + y)], p["feather_light"], p["outline"])
    polygon(draw, [(25, 16 + y), (29, 14 + y), (29, 24 + y),
                   (32, 28 + y), (27, 26 + y)], p["feather_shadow"], p["feather_shadow"])
    rect(draw, 31, 14 + y, 40, 16 + y, p["feather_light"])
    polygon(draw, [(29, 13 + y), (32, 5 + y), (36, 11 + y),
                   (40, 6 + y), (44, 14 + y)], p["feather_light"], p["outline"])
    polygon(draw, [(43, 20 + y), (57, 22 + y), (44, 26 + y)], p["beak"], p["outline"])
    rect(draw, 45, 21 + y, 54, 22 + y, p["accent"])
    rect(draw, 47, 24 + y, 54, 25 + y, p["skin"])
    rect(draw, 39, 17 + y, 43, 21 + y, p["outline"])
    rect(draw, 40, 18 + y, 42, 20 + y, p["accent"])
    rect(draw, 41, 18 + y, 42, 19 + y, p["feather_light"])
    rect(draw, 28, 22 + y, 31, 25 + y, p["feather_shadow"])
    rect(draw, 33, 27 + y, 39, 29 + y, p["feather_shadow"])
    # Wings sweep into distinct blocks for guard, slash and charged strike poses.
    if frame == 3:
        polygon(draw, [(18, 35 + y), (25, 33 + y), (30, 43 + y), (22, 49 + y), (13, 44 + y)], p["feather_light"], p["outline"])
        polygon(draw, [(42, 34 + y), (49, 35 + y), (57, 44 + y), (52, 49 + y), (41, 44 + y)], p["feather_light"], p["outline"])
        rect(draw, 22, 40 + y, 47, 46 + y, p["accent"], p["outline"])
    elif frame in (4, 5):
        polygon(draw, [(42, 35 + y), (51, 33 + y), (62, 29 + y), (59, 40 + y), (63, 46 + y), (48, 49 + y)], p["feather_light"], p["outline"])
        rect(draw, 53, 37 + y, 61, 40 + y, p["light"])
        polygon(draw, [(17, 36 + y), (24, 34 + y), (28, 46 + y), (21, 50 + y), (15, 44 + y)], p["feather_shadow"], p["outline"])
        if frame == 5:
            polygon(draw, [(48, 32 + y), (57, 25 + y), (62, 19 + y),
                           (60, 34 + y), (63, 37 + y), (52, 43 + y)], p["accent"], p["outline"])
    elif frame == 2:
        polygon(draw, [(20, 34 + y), (10, 28 + y), (5, 16 + y),
                       (17, 23 + y), (28, 39 + y)], p["feather_light"], p["outline"])
        polygon(draw, [(43, 34 + y), (52, 25 + y), (60, 16 + y),
                       (60, 34 + y), (49, 43 + y)], p["feather_light"], p["outline"])
        rect(draw, 9, 27 + y, 18, 30 + y, p["accent"])
        rect(draw, 51, 27 + y, 60, 30 + y, p["accent"])
    elif frame == 6:
        polygon(draw, [(18, 36 + y), (9, 39 + y), (14, 51 + y),
                       (24, 53 + y)], p["feather_shadow"], p["outline"])
        polygon(draw, [(43, 36 + y), (55, 45 + y), (48, 55 + y),
                       (40, 45 + y)], p["feather_shadow"], p["outline"])
        rect(draw, 40, 18 + y, 43, 20 + y, p["accent"])
    elif frame == 1:
        polygon(draw, [(18, 35 + y), (24, 32 + y), (30, 42 + y),
                       (23, 49 + y), (15, 46 + y)], p["feather_light"], p["outline"])
        polygon(draw, [(43, 34 + y), (50, 35 + y), (56, 29 + y),
                       (54, 44 + y), (46, 51 + y)], p["feather_shadow"], p["outline"])
        rect(draw, 17, 41 + y, 23, 44 + y, p["feather"])
    else:
        polygon(draw, [(18, 35 + y), (25, 33 + y), (29, 50 + y), (22, 55 + y), (16, 48 + y)], p["feather_shadow"], p["outline"])
        polygon(draw, [(43, 34 + y), (50, 36 + y), (49, 51 + y), (43, 54 + y), (39, 43 + y)], p["feather_shadow"], p["outline"])
        rect(draw, 17, 44 + y, 22, 47 + y, p["feather_light"])
        rect(draw, 45, 45 + y, 49, 48 + y, p["feather_light"])
    if frame != 2:
        rect(draw, 18, 39 + y, 21, 43 + y, p["feather_light"])
        rect(draw, 21, 44 + y, 24, 48 + y, p["feather"])
        rect(draw, 46, 39 + y, 49, 43 + y, p["feather_light"])
        rect(draw, 43, 44 + y, 46, 48 + y, p["feather"])
    if frame == 5:
        for x, yy in ((11, 25), (14, 19), (51, 52), (57, 48), (9, 48)):
            rect(draw, x, yy, x + 4, yy + 3, p["accent"])


def draw_catodo(draw, p, frame):
    if frame == 7:
        shadow(draw, p, 10, 55)
        rect(draw, 17, 58, 27, 72, p["metal_shadow"], p["outline"])
        rect(draw, 14, 70, 31, 76, p["shoe"], p["outline"])
        rect(draw, 37, 60, 47, 72, p["metal_shadow"], p["outline"])
        rect(draw, 35, 70, 54, 76, p["shoe"], p["outline"])
        polygon(draw, [(20, 37), (28, 35), (43, 38), (49, 49), (43, 64), (23, 62), (16, 53)], p["metal"], p["outline"])
        rect(draw, 29, 43, 41, 51, p["screen"], p["outline"])
        rect(draw, 31, 46, 37, 48, p["warning"])
        polygon(draw, [(45, 42), (54, 49), (57, 62), (51, 66), (42, 54)], p["metal_shadow"], p["outline"])
        polygon(draw, [(18, 43), (23, 45), (17, 64), (10, 66), (10, 57)], p["metal_shadow"], p["outline"])
        polygon(draw, [(23, 19), (29, 15), (43, 17), (49, 24), (45, 39), (26, 38), (20, 31)], p["metal"], p["outline"])
        rect(draw, 25, 23, 43, 33, p["screen"], p["outline"])
        rect(draw, 28, 27, 33, 29, p["warning"])
        rect(draw, 36, 27, 41, 29, p["warning"])
        rect(draw, 34, 10, 37, 17, p["metal_shadow"], p["outline"])
        rect(draw, 31, 8, 40, 11, p["warning"], p["outline"])
        return
    jumping = frame == 2
    bob = -1 if jumping else 1 if frame == 1 else 0
    shadow(draw, p, 23, 43) if jumping else shadow(draw, p)
    # Antenna, boxed head and bright visor are visible even at a small battle scale.
    rect(draw, 32, 2 + bob, 36, 11 + bob, p["metal_shadow"], p["outline"])
    rect(draw, 29, 0 + bob, 39, 4 + bob, p["accent"], p["outline"])
    polygon(draw, [(23, 10 + bob), (28, 6 + bob), (42, 7 + bob), (48, 13 + bob), (46, 29 + bob), (40, 34 + bob), (24, 30 + bob), (20, 23 + bob)], p["metal"], p["outline"])
    polygon(draw, [(25, 10 + bob), (30, 8 + bob), (41, 9 + bob),
                   (44, 12 + bob), (27, 12 + bob)], p["metal_light"], p["metal_light"])
    rect(draw, 22, 20 + bob, 25, 26 + bob, p["metal_shadow"])
    rect(draw, 43, 22 + bob, 46, 27 + bob, p["metal_shadow"])
    rect(draw, 25, 12 + bob, 43, 23 + bob, p["screen"], p["outline"])
    rect(draw, 28, 15 + bob, 40, 19 + bob, p["accent"])
    rect(draw, 30, 16 + bob, 38, 18 + bob, p["white"])
    rect(draw, 27, 22 + bob, 41, 24 + bob, p["metal_shadow"])
    rect(draw, 21, 18 + bob, 25, 22 + bob, p["warning"], p["outline"])
    rect(draw, 42, 25 + bob, 47, 28 + bob, p["metal_light"])
    rect(draw, 22, 11 + bob, 25, 18 + bob, p["metal_shadow"], p["outline"])
    rect(draw, 44, 13 + bob, 48, 19 + bob, p["metal_shadow"], p["outline"])
    # Shoulder housings, piston arms and segmented chest panel.
    polygon(draw, [(19, 31 + bob), (27, 28 + bob), (42, 29 + bob), (50, 35 + bob), (47, 57 + bob), (41, 61 + bob), (23, 59 + bob), (17, 51 + bob)], p["metal_light"], p["outline"])
    polygon(draw, [(19, 36 + bob), (24, 32 + bob), (27, 36 + bob),
                   (25, 54 + bob), (20, 50 + bob)], p["metal_shadow"], p["metal_shadow"])
    polygon(draw, [(42, 32 + bob), (48, 36 + bob), (46, 54 + bob),
                   (42, 58 + bob), (39, 54 + bob)], p["metal"], p["metal"])
    polygon(draw, [(22, 34 + bob), (27, 33 + bob), (29, 53 + bob), (24, 54 + bob)], p["metal"], p["outline"])
    # Two bright induction coils make the robot's shoulder width unmistakable.
    for x in (13, 47):
        rect(draw, x, 32 + bob, x + 9, 45 + bob, p["dark"], p["outline"])
        rect(draw, x + 2, 34 + bob, x + 7, 37 + bob, p["accent"])
        rect(draw, x + 2, 40 + bob, x + 7, 43 + bob, p["accent"])
        rect(draw, x + 3, 37 + bob, x + 6, 40 + bob, p["metal_light"])
    rect(draw, 30, 36 + bob, 42, 43 + bob, p["screen"], p["outline"])
    rect(draw, 32, 38 + bob, 40, 41 + bob, p["accent"])
    rect(draw, 33, 38 + bob, 38, 39 + bob, p["white"])
    rect(draw, 29, 44 + bob, 43, 46 + bob, p["metal_shadow"], p["outline"])
    for x in (30, 34, 38):
        rect(draw, x, 44 + bob, x + 2, 46 + bob, p["warning"])
    rect(draw, 32, 46 + bob, 40, 52 + bob, p["metal_shadow"], p["outline"])
    rect(draw, 21, 51 + bob, 26, 54 + bob, p["warning"])
    rect(draw, 41, 51 + bob, 46, 54 + bob, p["warning"])
    for y in (47 + bob, 50 + bob):
        rect(draw, 34, y, 39, y + 1, p["accent"])
    if jumping:
        legs = [(23, 56 + bob, 31, 67), (36, 53 + bob, 44, 64)]
    elif frame == 1:
        legs = [(23, 56, 31, 71), (36, 57, 45, 73)]
    else:
        legs = [(23, 56, 32, 72), (36, 56, 45, 72)]
    for x1, y1, x2, y2 in legs:
        rect(draw, x1, y1, x2, y2, p["metal_shadow"], p["outline"])
        rect(draw, x1 + 2, y1 + 3, x2 - 2, y2 - 3, p["metal"])
        rect(draw, x1 + 2, y1 + 3, x1 + 4, y2 - 3, p["metal_light"])
        rect(draw, x2 - 3, y1 + 4, x2 - 1, y2 - 3, p["dark"])
        rect(draw, x1, y2 - 9, x2, y2 - 7, p["screen"], p["outline"])
        rect(draw, x1 + 2, y2 - 9, x2 - 2, y2 - 8, p["accent"])
        rect(draw, x1 - 2, y2 - 4, x2 + 3, y2, p["shoe"], p["outline"])
        rect(draw, x1 + 1, y2 - 3, x2, y2 - 2, p["accent"])
    if frame == 3:
        polygon(draw, [(17, 34 + bob), (24, 32 + bob), (30, 42 + bob), (25, 48 + bob), (15, 45 + bob)], p["metal"], p["outline"])
        polygon(draw, [(44, 34 + bob), (51, 36 + bob), (55, 47 + bob), (49, 50 + bob), (42, 44 + bob)], p["metal_light"], p["outline"])
        rect(draw, 26, 43 + bob, 48, 48 + bob, p["accent"], p["outline"])
        rect(draw, 28, 14 + bob, 40, 20 + bob, p["warning"], p["outline"])
        rect(draw, 31, 16 + bob, 37, 18 + bob, p["screen"])
    elif frame in (4, 5):
        polygon(draw, [(43, 34 + bob), (51, 33 + bob), (57, 39 + bob), (63, 37 + bob), (62, 48 + bob), (53, 50 + bob), (43, 45 + bob)], p["metal_light"], p["outline"])
        rect(draw, 55, 39 + bob, 62, 45 + bob, p["screen"], p["outline"])
        rect(draw, 57, 41 + bob, 61, 43 + bob, p["accent"])
        rect(draw, 54, 36 + bob, 60, 39 + bob, p["metal_shadow"], p["outline"])
        if frame == 5:
            polygon(draw, [(49, 30 + bob), (58, 23 + bob), (55, 33 + bob),
                           (63, 31 + bob), (57, 39 + bob)], p["accent"], p["outline"])
    else:
        polygon(draw, [(18, 34 + bob), (25, 33 + bob), (28, 51 + bob), (21, 54 + bob), (16, 47 + bob)], p["metal_shadow"], p["outline"])
        polygon(draw, [(44, 34 + bob), (50, 36 + bob), (49, 51 + bob), (44, 54 + bob), (40, 43 + bob)], p["metal_shadow"], p["outline"])
        if frame == 1:
            rect(draw, 46, 45 + bob, 55, 49 + bob, p["metal_light"], p["outline"])
            rect(draw, 52, 44 + bob, 58, 51 + bob, p["screen"], p["outline"])
            rect(draw, 54, 46 + bob, 57, 49 + bob, p["accent"])
    if frame == 5:
        for x, y in ((12, 19), (51, 27), (54, 34), (13, 48), (52, 55)):
            rect(draw, x, y, x + 4, y + 3, p["accent"])
    elif frame == 6:
        rect(draw, 31, 13 + bob, 39, 21 + bob, p["screen"], p["outline"])
        polygon(draw, [(31, 14 + bob), (36, 17 + bob), (33, 21 + bob)], p["warning"], p["outline"])


def draw_null(draw, p, frame):
    if frame == 7:
        shadow(draw, p, 9, 56)
        polygon(draw, [(21, 43), (35, 38), (47, 45), (51, 62), (42, 73), (22, 71), (14, 60)], p["void"], p["outline"])
        polygon(draw, [(17, 48), (10, 37), (13, 58), (22, 64)], p["dark"], p["outline"])
        polygon(draw, [(46, 48), (56, 39), (52, 62), (44, 66)], p["main"], p["outline"])
        polygon(draw, [(23, 24), (18, 14), (28, 20), (33, 9), (39, 21), (49, 17), (44, 32), (42, 42), (26, 43)], p["main"], p["outline"])
        polygon(draw, [(27, 27), (32, 22), (42, 26), (42, 36), (29, 38)], p["light"], p["outline"])
        rect(draw, 29, 30, 33, 33, p["pink"], p["outline"])
        rect(draw, 38, 31, 42, 34, p["pink"], p["outline"])
        polygon(draw, [(29, 47), (37, 45), (42, 52), (35, 64), (27, 55)], p["accent"], p["outline"])
        polygon(draw, [(32, 49), (38, 50), (35, 57)], p["pink"], p["outline"])
        rect(draw, 12, 67, 22, 71, p["light"])
        rect(draw, 45, 69, 54, 72, p["light"])
        return
    floating = frame == 2
    bob = -1 if floating else (1 if frame == 1 else 0)
    shadow(draw, p, 22, 43) if floating else shadow(draw, p, 17, 48)
    # Crown shards and mask form a crystalline silhouette, not a recolored humanoid.
    polygon(draw, [(21, 20 + bob), (17, 9 + bob), (27, 14 + bob), (33, 2 + bob), (39, 14 + bob), (49, 8 + bob), (45, 23 + bob), (42, 35 + bob), (24, 35 + bob)], p["main"], p["outline"])
    polygon(draw, [(21, 15 + bob), (19, 11 + bob), (29, 17 + bob),
                   (25, 22 + bob)], p["dark"], p["dark"])
    polygon(draw, [(33, 5 + bob), (38, 17 + bob), (31, 16 + bob)], p["light"], p["light"])
    polygon(draw, [(46, 13 + bob), (43, 20 + bob), (39, 18 + bob)], p["light"], p["light"])
    polygon(draw, [(24, 21 + bob), (29, 16 + bob), (39, 16 + bob), (45, 22 + bob), (41, 31 + bob), (27, 31 + bob)], p["light"], p["outline"])
    # A single fractured sigil replaces a human expression on the mask.
    polygon(draw, [(28, 23 + bob), (34, 20 + bob), (42, 23 + bob),
                   (35, 27 + bob)], p["accent"], p["outline"])
    rect(draw, 34, 22 + bob, 38, 24 + bob, p["white"])
    rect(draw, 27, 28 + bob, 42, 30 + bob, p["void"], p["outline"])
    # Floating mantle and faceted core.
    polygon(draw, [(25, 33 + bob), (42, 33 + bob), (49, 45 + bob), (45, 62 + bob), (37, 70 + bob), (28, 63 + bob), (19, 47 + bob)], p["void"], p["outline"])
    polygon(draw, [(25, 36 + bob), (34, 41 + bob), (30, 59 + bob), (22, 49 + bob)], p["dark"], p["outline"])
    polygon(draw, [(42, 36 + bob), (48, 46 + bob), (42, 58 + bob), (38, 42 + bob)], p["light"], p["outline"])
    polygon(draw, [(25, 38 + bob), (29, 43 + bob), (27, 52 + bob),
                   (23, 48 + bob)], p["main"], p["main"])
    polygon(draw, [(42, 39 + bob), (46, 45 + bob), (43, 52 + bob),
                   (40, 44 + bob)], p["white"], p["white"])
    polygon(draw, [(22, 51 + bob), (15, 62 + bob), (25, 59 + bob),
                   (22, 70 + bob), (31, 62 + bob)], p["main"], p["outline"])
    polygon(draw, [(43, 52 + bob), (52, 63 + bob), (42, 60 + bob),
                   (45, 71 + bob), (36, 63 + bob)], p["dark"], p["outline"])
    polygon(draw, [(34, 40 + bob), (41, 46 + bob), (36, 57 + bob), (29, 48 + bob)], p["accent"], p["outline"])
    polygon(draw, [(34, 43 + bob), (38, 47 + bob), (35, 53 + bob), (32, 48 + bob)], p["pink"], p["outline"])
    polygon(draw, [(34, 44 + bob), (36, 46 + bob), (34, 49 + bob)], p["white"], p["white"])
    rect(draw, 24, 57 + bob, 28, 60 + bob, p["main"])
    rect(draw, 41, 58 + bob, 45, 61 + bob, p["light"])
    polygon(draw, [(20, 37 + bob), (10, 29 + bob), (15, 47 + bob), (23, 52 + bob)], p["light"], p["outline"])
    polygon(draw, [(45, 37 + bob), (56, 27 + bob), (52, 48 + bob), (44, 54 + bob)], p["main"], p["outline"])
    polygon(draw, [(15, 36 + bob), (19, 40 + bob), (20, 47 + bob),
                   (16, 44 + bob)], p["white"], p["white"])
    polygon(draw, [(50, 36 + bob), (53, 32 + bob), (52, 45 + bob),
                   (48, 49 + bob)], p["light"], p["light"])
    polygon(draw, [(17, 38 + bob), (9, 31 + bob), (7, 24 + bob),
                   (19, 32 + bob)], p["dark"], p["outline"])
    polygon(draw, [(49, 37 + bob), (58, 30 + bob), (61, 22 + bob),
                   (47, 31 + bob)], p["light"], p["outline"])
    if frame == 3:
        polygon(draw, [(19, 39 + bob), (12, 33 + bob), (18, 50 + bob), (29, 48 + bob)], p["accent"], p["outline"])
        polygon(draw, [(46, 38 + bob), (55, 34 + bob), (48, 51 + bob), (39, 48 + bob)], p["accent"], p["outline"])
    elif frame in (4, 5):
        polygon(draw, [(42, 37 + bob), (52, 31 + bob), (61, 32 + bob), (56, 40 + bob), (62, 46 + bob), (48, 52 + bob)], p["light"] if frame == 4 else p["accent"], p["outline"])
        polygon(draw, [(20, 38 + bob), (12, 33 + bob), (18, 50 + bob), (27, 49 + bob)], p["dark"], p["outline"])
        if frame == 5:
            polygon(draw, [(20, 38 + bob), (9, 29 + bob), (2, 33 + bob),
                           (12, 42 + bob), (5, 49 + bob), (25, 54 + bob)], p["accent"], p["outline"])
            polygon(draw, [(45, 37 + bob), (56, 27 + bob), (63, 31 + bob),
                           (56, 40 + bob), (63, 47 + bob), (42, 54 + bob)], p["accent"], p["outline"])
            polygon(draw, [(28, 48 + bob), (35, 38 + bob), (44, 48 + bob),
                           (35, 64 + bob)], p["pink"], p["outline"])
            polygon(draw, [(32, 48 + bob), (35, 43 + bob), (40, 48 + bob),
                           (35, 57 + bob)], p["white"], p["outline"])
    elif frame == 6:
        rect(draw, 13, 17 + bob, 17, 20 + bob, p["pink"])
        rect(draw, 10, 25 + bob, 14, 28 + bob, p["accent"])
    elif frame == 1:
        polygon(draw, [(9, 28 + bob), (3, 23 + bob), (6, 37 + bob),
                       (15, 43 + bob)], p["light"], p["outline"])
        polygon(draw, [(56, 26 + bob), (62, 21 + bob), (60, 38 + bob),
                       (51, 44 + bob)], p["accent"], p["outline"])
    if frame == 5:
        for x, y in ((10, 20), (13, 14), (51, 19), (55, 25), (10, 48), (54, 50), (32, 73)):
            rect(draw, x, y, x + 4, y + 3, p["accent"])


def draw_frame(draw, character, frame):
    """Elige la anatomía del personaje para la pose solicitada."""
    if character == "chilo":
        draw_chilo(draw, PALETTES[character], frame)
    elif character == "catodo3":
        draw_catodo(draw, PALETTES[character], frame)
    elif character == "null":
        draw_null(draw, PALETTES[character], frame)
    else:
        draw_human(draw, PALETTES[character], character, frame)


def build():
    """Dibuja ocho poses por personaje y las escala sin suavizar píxeles."""
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for character in PALETTES:
        sheet = Image.new("RGBA", (FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT), (0, 0, 0, 0))
        for frame in range(FRAME_COUNT):
            cell = Image.new("RGBA", (BASE_FRAME_WIDTH, BASE_FRAME_HEIGHT), (0, 0, 0, 0))
            draw_frame(ImageDraw.Draw(cell), character, frame)
            crisp_cell = cell.resize((FRAME_WIDTH, FRAME_HEIGHT), Image.Resampling.NEAREST)
            sheet.alpha_composite(crisp_cell, (frame * FRAME_WIDTH, 0))
        sheet.save(OUTPUT / f"{character}.png", optimize=True)


if __name__ == "__main__":
    build()
