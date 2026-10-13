"""Refine the seven eight-pose fighters without changing the combat atlas contract.

The v2 drawing remains the anatomical base. This pass adds readable facial,
material and action details on the same 64×80 pixel grid, then scales 2× with
nearest-neighbor sampling. The older sheets remain available for comparison.
"""

from pathlib import Path

from PIL import Image, ImageDraw

from build_fighting_sprites_v2 import (
    BASE_FRAME_HEIGHT,
    BASE_FRAME_WIDTH,
    FRAME_COUNT,
    FRAME_HEIGHT,
    FRAME_WIDTH,
    PALETTES,
    draw_frame,
)


OUTPUT = Path(__file__).resolve().parents[1] / "assets" / "sprites" / "fighting-v3"


def block(draw, x1, y1, x2, y2, color):
    """Draw one crisp pixel cluster with exclusive right and bottom edges."""
    draw.rectangle((x1, y1, x2 - 1, y2 - 1), fill=color)


def shape(draw, points, color):
    """Draw a connected cluster while keeping every vertex on the pixel grid."""
    draw.polygon(points, fill=color)


def human_finish(draw, palette, character, pose):
    """Separate the four people by face, clothing construction and attack VFX."""
    p = palette
    if pose == 7:
        block(draw, 24, 46, 30, 48, p["light"])
        block(draw, 28, 56, 39, 58, p["dark"])
        block(draw, 25, 24, 29, 27, p["hair_light"])
        if character == "alma":
            block(draw, 33, 47, 37, 52, p["accent"])
        elif character == "diego":
            block(draw, 43, 47, 48, 50, p["accent"])
        elif character == "nadia":
            block(draw, 13, 50, 17, 58, p["hair_light"])
        else:
            block(draw, 49, 61, 55, 63, p["white"])
        return

    bob = -5 if pose == 2 else 1 if pose == 1 else 0
    head = 6 + bob
    torso = 29 + bob

    # Large character-specific masses change the silhouette before tiny details.
    if character == "alma":
        shape(draw, [(12, torso + 4), (17, torso + 2), (20, torso + 7),
                     (19, torso + 24), (15, torso + 27), (10, torso + 22)], p["outline"])
        shape(draw, [(13, torso + 6), (17, torso + 5), (18, torso + 9),
                     (17, torso + 23), (13, torso + 23)], p["metal"])
        block(draw, 14, torso + 10, 17, torso + 15, p["accent"])
    elif character == "diego":
        shape(draw, [(12, torso + 3), (18, torso - 2), (25, torso + 1),
                     (26, torso + 8), (18, torso + 13), (11, torso + 10)], p["outline"])
        shape(draw, [(13, torso + 5), (19, torso), (23, torso + 3),
                     (22, torso + 9), (15, torso + 10)], p["main"])
        shape(draw, [(47, torso + 1), (54, torso - 2), (59, torso + 4),
                     (58, torso + 11), (51, torso + 13), (46, torso + 8)], p["outline"])
        shape(draw, [(49, torso + 3), (54, torso), (57, torso + 5),
                     (55, torso + 10), (49, torso + 9)], p["main"])
        block(draw, 16, torso + 4, 21, torso + 6, p["light"])
        block(draw, 52, torso + 3, 56, torso + 5, p["light"])
    elif character == "nadia":
        shape(draw, [(18, head + 8), (12, head + 15), (9, head + 29),
                     (12, head + 42), (8, head + 51), (17, head + 55),
                     (22, head + 36), (20, head + 20)], p["outline"])
        shape(draw, [(17, head + 11), (13, head + 20), (11, head + 30),
                     (14, head + 40), (11, head + 49), (17, head + 50),
                     (19, head + 34)], p["hair"])
        shape(draw, [(13, head + 34), (16, head + 25), (15, head + 43),
                     (13, head + 48)], p["hair_light"])
    else:  # Vera
        shape(draw, [(18, head + 9), (10, head + 13), (7, head + 25),
                     (11, head + 34), (6, head + 39), (14, head + 44),
                     (20, head + 29)], p["outline"])
        shape(draw, [(17, head + 12), (11, head + 18), (9, head + 26),
                     (13, head + 34), (9, head + 39), (14, head + 41),
                     (18, head + 29)], p["hair"])
        block(draw, 11, head + 24, 14, head + 29, p["hair_light"])

    # Small facial planes preserve the side-facing expression at battle size.
    block(draw, 30, head + 10, 35, head + 12, p["skin_light"])
    block(draw, 38, head + 11, 43, head + 12, p["hair"])
    block(draw, 42, head + 16, 45, head + 17, p["skin_light"])
    block(draw, 31, head + 19, 35, head + 20, p["skin_shadow"])
    block(draw, 40, head + 21, 43, head + 22, p["hair"])

    # Two fabric planes and a cuff add volume without random pixel noise.
    block(draw, 27, torso + 9, 29, torso + 19, p["light"])
    block(draw, 40, torso + 7, 42, torso + 18, p["dark"])
    block(draw, 26, torso + 23, 30, torso + 24, p["white"])
    block(draw, 36, torso + 25, 41, torso + 26, p["dark"])
    block(draw, 20, torso + 12, 23, torso + 14, p["light"])

    if character == "alma":
        # Copper goggles, a circuit gauntlet and orange utility jacket.
        block(draw, 30, head + 2, 37, head + 3, p["hair_light"])
        block(draw, 34, head + 7, 39, head + 8, p["white"])
        block(draw, 18, torso + 8, 20, torso + 16, p["accent"])
        block(draw, 21, torso + 18, 25, torso + 20, p["dark"])
        block(draw, 28, torso + 12, 31, torso + 14, p["metal"])
        block(draw, 48, torso + 20, 51, torso + 22, p["accent"])
        if pose in (4, 5):
            shape(draw, [(51, torso + 7), (56, torso + 4),
                         (55, torso + 9), (61, torso + 7),
                         (56, torso + 12), (53, torso + 11)], p["accent"])
            block(draw, 57, torso + 5, 60, torso + 7, p["white"])
        if pose == 5:
            block(draw, 58, 18, 61, 20, p["white"])
            block(draw, 12, 28, 15, 30, p["accent"])

    elif character == "diego":
        # Broad shoulder seams, heavier leg armor and taped boxing fists.
        block(draw, 19, torso + 4, 23, torso + 5, p["light"])
        block(draw, 46, torso + 4, 50, torso + 5, p["light"])
        block(draw, 18, torso + 8, 21, torso + 10, p["accent"])
        block(draw, 47, torso + 8, 50, torso + 10, p["accent"])
        block(draw, 34, torso + 9, 37, torso + 13, p["dark"])
        block(draw, 22, 59 + bob, 29, 61 + bob, p["accent"])
        block(draw, 41, 59 + bob, 48, 61 + bob, p["accent"])
        if pose in (3, 4, 5):
            block(draw, 52, torso + 12, 58, torso + 14, p["white"])
        if pose == 5:
            shape(draw, [(12, 45), (17, 42), (15, 48), (21, 46),
                         (19, 51), (12, 52)], p["light"])
            block(draw, 54, 34, 60, 37, p["accent"])
            block(draw, 58, 37, 62, 39, p["white"])

    elif character == "nadia":
        # Asymmetric long hair, headset, signal sash and small recorder.
        block(draw, 19, head + 23, 21, head + 31, p["hair_light"])
        block(draw, 23, head + 30, 25, head + 38, p["hair_light"])
        block(draw, 41, head + 6, 44, head + 8, p["accent"])
        block(draw, 25, torso + 13, 28, torso + 15, p["accent"])
        block(draw, 32, torso + 11, 41, torso + 12, p["white"])
        block(draw, 18, torso + 27, 21, torso + 33, p["hair_light"])
        block(draw, 48, torso + 31, 51, torso + 35, p["accent"])
        if pose in (4, 5):
            for x, y in ((51, 28), (56, 22), (59, 31)):
                block(draw, x, y, x + 2, y + 4, p["accent"])
                block(draw, x + 2, y, x + 4, y + 2, p["white"])
        if pose == 5:
            shape(draw, [(49, 15), (52, 12), (55, 14), (52, 17)], p["white"])
            block(draw, 12, 31, 15, 34, p["accent"])

    else:  # Vera
        # Court uniform, ponytail and stitched ball read separately from Nadia.
        block(draw, 15, head + 20, 18, head + 25, p["hair_light"])
        block(draw, 13, head + 26, 16, head + 30, p["hair_light"])
        block(draw, 31, torso + 8, 35, torso + 10, p["white"])
        block(draw, 36, torso + 16, 40, torso + 18, p["accent"])
        block(draw, 22, torso + 15, 25, torso + 20, p["light"])
        if pose in (0, 1, 3, 4, 5):
            ball_y = torso + (4 if pose in (4, 5) else 17)
            block(draw, 53 if pose in (4, 5) else 50, ball_y + 3,
                  56 if pose in (4, 5) else 53, ball_y + 5, p["white"])
        if pose in (4, 5):
            block(draw, 45, 17, 50, 19, p["accent"])
            block(draw, 48, 14, 51, 16, p["white"])


def chilo_finish(draw, palette, pose):
    """Sharpen crest, feathers, jersey and clawed boots of the bird mascot."""
    p = palette
    if pose == 7:
        block(draw, 31, 27, 37, 29, p["feather_light"])
        block(draw, 31, 54, 40, 55, p["light"])
        block(draw, 21, 71, 26, 73, p["accent"])
        return
    bob = -1 if pose == 2 else 1 if pose == 1 else 0
    # A longer fan tail and outer wing tips keep the boss birdlike at a glance.
    shape(draw, [(17, 45 + bob), (5, 40 + bob), (10, 48 + bob),
                 (3, 55 + bob), (18, 56 + bob)], p["outline"])
    shape(draw, [(16, 46 + bob), (8, 43 + bob), (13, 49 + bob),
                 (6, 53 + bob), (17, 53 + bob)], p["feather_shadow"])
    shape(draw, [(12, 43 + bob), (15, 45 + bob), (16, 51 + bob),
                 (10, 48 + bob)], p["feather_light"])
    if pose in (0, 1, 3, 6):
        shape(draw, [(17, 36 + bob), (11, 34 + bob), (7, 39 + bob),
                     (9, 50 + bob), (16, 53 + bob)], p["outline"])
        shape(draw, [(15, 37 + bob), (10, 37 + bob), (9, 42 + bob),
                     (12, 49 + bob), (16, 50 + bob)], p["feather_shadow"])
        block(draw, 10, 43 + bob, 14, 45 + bob, p["feather_light"])
    block(draw, 32, 7 + bob, 35, 11 + bob, p["accent"])
    block(draw, 39, 8 + bob, 42, 12 + bob, p["feather_shadow"])
    block(draw, 28, 18 + bob, 31, 22 + bob, p["feather_light"])
    block(draw, 32, 26 + bob, 40, 27 + bob, p["feather_shadow"])
    block(draw, 39, 18 + bob, 41, 19 + bob, p["feather_light"])
    block(draw, 45, 23 + bob, 53, 24 + bob, p["accent"])
    block(draw, 32, 37 + bob, 38, 39 + bob, p["feather_light"])
    block(draw, 31, 47 + bob, 41, 49 + bob, p["dark"])
    block(draw, 34, 45 + bob, 38, 47 + bob, p["accent"])
    block(draw, 19, 53 + bob, 23, 55 + bob, p["feather_light"])
    for x in (22, 38):
        block(draw, x, 70 if pose != 2 else 62,
              x + 3, 72 if pose != 2 else 64, p["feather_light"])
    if pose in (2, 4, 5):
        for x, y in ((11, 32), (16, 38), (51, 35), (56, 31)):
            block(draw, x, y + bob, x + 4, y + 1 + bob, p["feather_shadow"])
    if pose == 5:
        shape(draw, [(49, 25), (55, 19), (54, 25),
                     (62, 21), (58, 29)], p["accent"])
        block(draw, 58, 22, 61, 24, p["feather_light"])


def catodo_finish(draw, palette, pose):
    """Give the robot layered armor, a readable screen and electrical motion."""
    p = palette
    if pose == 7:
        block(draw, 26, 24, 30, 26, p["metal_light"])
        block(draw, 37, 27, 42, 29, p["warning"])
        block(draw, 25, 45, 29, 48, p["dark"])
        return
    bob = -1 if pose == 2 else 1 if pose == 1 else 0
    # Side battery housings distinguish the robot from a human in gray armor.
    for x in (8, 54):
        shape(draw, [(x + 2, 30 + bob), (x + 8, 30 + bob),
                     (x + 10, 35 + bob), (x + 9, 49 + bob),
                     (x + 1, 49 + bob), (x, 36 + bob)], p["outline"])
        block(draw, x + 2, 34 + bob, x + 8, 44 + bob, p["metal_shadow"])
        block(draw, x + 3, 36 + bob, x + 7, 39 + bob, p["accent"])
        block(draw, x + 3, 42 + bob, x + 7, 44 + bob, p["warning"])
    block(draw, 30, 9 + bob, 40, 10 + bob, p["metal_light"])
    block(draw, 27, 14 + bob, 29, 19 + bob, p["metal_shadow"])
    block(draw, 40, 14 + bob, 42, 19 + bob, p["metal_light"])
    block(draw, 28, 21 + bob, 40, 22 + bob, p["metal_light"])
    block(draw, 31, 32 + bob, 39, 34 + bob, p["metal_shadow"])
    block(draw, 29, 48 + bob, 32, 51 + bob, p["metal_light"])
    block(draw, 40, 48 + bob, 43, 51 + bob, p["metal_light"])
    block(draw, 27, 54 + bob, 30, 56 + bob, p["warning"])
    block(draw, 39, 54 + bob, 42, 56 + bob, p["warning"])
    for x in (17, 51):
        block(draw, x, 42 + bob, x + 3, 44 + bob, p["metal_light"])
    if pose == 3:
        block(draw, 29, 16 + bob, 39, 18 + bob, p["warning"])
    if pose in (4, 5):
        block(draw, 57, 40 + bob, 61, 42 + bob, p["white"])
    if pose == 5:
        shape(draw, [(53, 23), (57, 17), (57, 24),
                     (63, 21), (59, 29)], p["accent"])
        block(draw, 11, 25, 14, 28, p["accent"])


def null_finish(draw, palette, pose):
    """Increase contrast in the mask and make the floating mantle feel faceted."""
    p = palette
    if pose == 7:
        block(draw, 32, 23, 37, 25, p["white"])
        block(draw, 28, 48, 33, 50, p["light"])
        block(draw, 38, 55, 41, 58, p["accent"])
        return
    bob = -1 if pose == 2 else 1 if pose == 1 else 0
    # Layered outer shards give NULL a wider silhouette than the other bosses.
    shape(draw, [(18, 33 + bob), (7, 27 + bob), (4, 39 + bob),
                 (12, 51 + bob), (19, 48 + bob)], p["outline"])
    shape(draw, [(16, 35 + bob), (8, 31 + bob), (7, 39 + bob),
                 (12, 47 + bob), (18, 45 + bob)], p["main"])
    shape(draw, [(48, 33 + bob), (59, 25 + bob), (63, 37 + bob),
                 (56, 51 + bob), (47, 47 + bob)], p["outline"])
    shape(draw, [(49, 35 + bob), (58, 29 + bob), (60, 37 + bob),
                 (55, 47 + bob), (48, 44 + bob)], p["dark"])
    block(draw, 33, 6 + bob, 35, 12 + bob, p["white"])
    block(draw, 22, 17 + bob, 25, 21 + bob, p["dark"])
    block(draw, 42, 17 + bob, 45, 21 + bob, p["dark"])
    block(draw, 30, 23 + bob, 35, 24 + bob, p["white"])
    block(draw, 36, 24 + bob, 40, 25 + bob, p["pink"])
    block(draw, 29, 34 + bob, 40, 36 + bob, p["dark"])
    block(draw, 31, 47 + bob, 35, 49 + bob, p["white"])
    block(draw, 22, 44 + bob, 24, 49 + bob, p["pink"])
    block(draw, 44, 45 + bob, 46, 50 + bob, p["accent"])
    block(draw, 26, 59 + bob, 30, 61 + bob, p["light"])
    block(draw, 39, 59 + bob, 43, 61 + bob, p["main"])
    if pose in (4, 5):
        block(draw, 52, 32, 59, 34, p["white"])
    if pose == 5:
        shape(draw, [(7, 28), (12, 23), (11, 30),
                     (18, 27), (14, 36)], p["accent"])
        shape(draw, [(57, 23), (62, 19), (60, 27),
                     (63, 30), (55, 31)], p["white"])


FINISHERS = {
    "alma": human_finish,
    "diego": human_finish,
    "nadia": human_finish,
    "vera": human_finish,
    "chilo": chilo_finish,
    "catodo3": catodo_finish,
    "null": null_finish,
}


def build():
    """Create seven transparent 1024×160 PNG sheets with eight 128×160 poses."""
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for character, palette in PALETTES.items():
        sheet = Image.new("RGBA", (FRAME_WIDTH * FRAME_COUNT, FRAME_HEIGHT))
        for pose in range(FRAME_COUNT):
            cell = Image.new("RGBA", (BASE_FRAME_WIDTH, BASE_FRAME_HEIGHT))
            draw = ImageDraw.Draw(cell)
            draw_frame(draw, character, pose)
            if character in ("alma", "diego", "nadia", "vera"):
                FINISHERS[character](draw, palette, character, pose)
            else:
                FINISHERS[character](draw, palette, pose)
            sheet.alpha_composite(
                cell.resize((FRAME_WIDTH, FRAME_HEIGHT), Image.Resampling.NEAREST),
                (pose * FRAME_WIDTH, 0),
            )
        sheet.save(OUTPUT / f"{character}.png", optimize=True)


if __name__ == "__main__":
    build()
