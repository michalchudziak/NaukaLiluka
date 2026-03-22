#!/usr/bin/env python3

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT_DIR = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT_DIR / "assets" / "images"
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Trebuchet MS Bold.ttf")
FONT_REGULAR = Path("/System/Library/Fonts/Supplemental/Trebuchet MS.ttf")

COLORS = {
    "background": "#2f8653",
    "background_alt": "#3f9b61",
    "background_deep": "#205f3b",
    "card": "#fffdf5",
    "card_edge": "#d8be85",
    "accent": "#f8f6df",
    "warning": "#e7b95a",
    "warning_deep": "#c8871d",
    "leaf": "#9ed14c",
    "leaf_deep": "#4f8b3e",
    "hill": "#8ec947",
    "hill_deep": "#1f6a35",
    "spark": "#ffe37a",
    "trunk": "#7b4b1d",
    "fire": "#ff9d2b",
    "fire_deep": "#df5d20",
    "white": "#ffffff",
}


def hex_rgba(value: str, alpha: int = 255) -> tuple[int, int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def make_canvas(width: int, height: int, background: str | None = None) -> Image.Image:
    fill = (0, 0, 0, 0) if background is None else hex_rgba(background)
    return Image.new("RGBA", (width, height), fill)


def scale_box(box: tuple[int, int, int, int], x: float, y: float) -> tuple[int, int]:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    return (round(left + (x / 1024) * width), round(top + (y / 1024) * height))


def scale_value(box: tuple[int, int, int, int], value: float) -> int:
    left, top, right, bottom = box
    return round((value / 1024) * min(right - left, bottom - top))


def centered_box(center_x: int, center_y: int, width: int, height: int) -> tuple[int, int, int, int]:
    half_width = width / 2
    half_height = height / 2
    return (
        round(center_x - half_width),
        round(center_y - half_height),
        round(center_x + half_width),
        round(center_y + half_height),
    )


def draw_crescent(
    image: Image.Image,
    center: tuple[int, int],
    radius: int,
    fill: str,
    cut_shift_x: float = 0.36,
    cut_shift_y: float = -0.04,
    cut_scale: float = 0.86,
) -> None:
    mask = Image.new("L", image.size, 0)
    draw = ImageDraw.Draw(mask)
    outer = centered_box(center[0], center[1], radius * 2, radius * 2)
    inner = centered_box(
        round(center[0] + radius * cut_shift_x),
        round(center[1] + radius * cut_shift_y),
        round(radius * 2 * cut_scale),
        round(radius * 2 * cut_scale),
    )
    draw.ellipse(outer, fill=255)
    draw.ellipse(inner, fill=0)
    image.paste(hex_rgba(fill), (0, 0), mask)


def draw_pine(
    draw: ImageDraw.ImageDraw,
    center_x: int,
    ground_y: int,
    height: int,
    foliage: str,
    trunk: str,
    trunk_width_scale: float = 0.12,
) -> None:
    trunk_width = round(height * trunk_width_scale)
    trunk_height = round(height * 0.22)
    draw.rectangle(
        (
            center_x - trunk_width // 2,
            ground_y - trunk_height,
            center_x + trunk_width // 2,
            ground_y,
        ),
        fill=hex_rgba(trunk),
    )

    widths = [0.58, 0.42, 0.3]
    heights = [0.45, 0.32, 0.24]
    offsets = [0.02, -0.18, -0.34]
    for width_scale, height_scale, offset_scale in zip(widths, heights, offsets, strict=True):
        section_width = round(height * width_scale)
        section_height = round(height * height_scale)
        section_center_y = round(ground_y - height * (0.2 - offset_scale))
        draw.polygon(
            [
                (center_x, section_center_y - section_height),
                (center_x - section_width // 2, section_center_y + section_height // 3),
                (center_x + section_width // 2, section_center_y + section_height // 3),
            ],
            fill=hex_rgba(foliage),
        )


def draw_campfire(draw: ImageDraw.ImageDraw, center_x: int, center_y: int, scale: int) -> None:
    log_width = round(scale * 0.32)
    log_height = round(scale * 0.1)
    draw.rounded_rectangle(
        centered_box(center_x - round(scale * 0.12), center_y + round(scale * 0.08), log_width, log_height),
        radius=round(scale * 0.04),
        fill=hex_rgba(COLORS["trunk"]),
    )
    draw.rounded_rectangle(
        centered_box(center_x + round(scale * 0.12), center_y + round(scale * 0.08), log_width, log_height),
        radius=round(scale * 0.04),
        fill=hex_rgba(COLORS["trunk"]),
    )
    draw.polygon(
        [
            (center_x, center_y - round(scale * 0.26)),
            (center_x - round(scale * 0.16), center_y + round(scale * 0.12)),
            (center_x, center_y + round(scale * 0.22)),
            (center_x + round(scale * 0.16), center_y + round(scale * 0.12)),
        ],
        fill=hex_rgba(COLORS["fire"]),
    )
    draw.polygon(
        [
            (center_x, center_y - round(scale * 0.14)),
            (center_x - round(scale * 0.08), center_y + round(scale * 0.08)),
            (center_x, center_y + round(scale * 0.12)),
            (center_x + round(scale * 0.08), center_y + round(scale * 0.08)),
        ],
        fill=hex_rgba(COLORS["accent"]),
    )
    draw.polygon(
        [
            (center_x, center_y - round(scale * 0.08)),
            (center_x - round(scale * 0.05), center_y + round(scale * 0.06)),
            (center_x, center_y + round(scale * 0.1)),
            (center_x + round(scale * 0.05), center_y + round(scale * 0.06)),
        ],
        fill=hex_rgba(COLORS["fire_deep"]),
    )


def draw_tent(draw: ImageDraw.ImageDraw, center_x: int, center_y: int, width: int, height: int) -> None:
    left = center_x - width // 2
    right = center_x + width // 2
    top = center_y - height // 2
    bottom = center_y + height // 2

    draw.polygon(
        [
            (left, bottom),
            (center_x - round(width * 0.06), top + round(height * 0.06)),
            (right, bottom),
        ],
        fill=hex_rgba(COLORS["warning"]),
    )
    draw.polygon(
        [
            (left, bottom),
            (center_x - round(width * 0.06), top + round(height * 0.06)),
            (center_x - round(width * 0.02), bottom),
        ],
        fill=hex_rgba("#f6d788"),
    )
    draw.polygon(
        [
            (center_x - round(width * 0.06), top + round(height * 0.06)),
            (right, bottom),
            (center_x + round(width * 0.06), bottom),
        ],
        fill=hex_rgba(COLORS["warning"]),
    )
    draw.polygon(
        [
            (center_x - round(width * 0.06), top + round(height * 0.06)),
            (center_x + round(width * 0.02), bottom),
            (center_x + round(width * 0.18), bottom),
        ],
        fill=hex_rgba(COLORS["warning_deep"]),
    )
    pole_width = round(width * 0.015)
    draw.rectangle(
        (
            center_x - pole_width,
            top + round(height * 0.06),
            center_x + pole_width,
            bottom - round(height * 0.08),
        ),
        fill=hex_rgba("#7d561f"),
    )
    peg_y = bottom - round(height * 0.06)
    draw.line(
        [(left + round(width * 0.06), peg_y), (left - round(width * 0.12), peg_y + round(height * 0.16))],
        fill=hex_rgba("#7d561f"),
        width=max(2, pole_width),
    )
    draw.line(
        [(right - round(width * 0.06), peg_y), (right + round(width * 0.1), peg_y + round(height * 0.16))],
        fill=hex_rgba("#7d561f"),
        width=max(2, pole_width),
    )


def draw_book(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], monochrome: bool = False) -> None:
    left, top, right, bottom = box
    colors = {
        "cover": COLORS["white"] if monochrome else COLORS["background_deep"],
        "page": COLORS["white"] if monochrome else COLORS["card"],
        "edge": COLORS["white"] if monochrome else COLORS["card_edge"],
        "binding": COLORS["white"] if monochrome else COLORS["warning_deep"],
    }

    cover_points = [
        scale_box(box, 86, 710),
        scale_box(box, 938, 710),
        scale_box(box, 992, 776),
        scale_box(box, 32, 776),
    ]
    draw.polygon(cover_points, fill=hex_rgba(colors["cover"]))

    left_page = [
        scale_box(box, 138, 678),
        scale_box(box, 474, 618),
        scale_box(box, 508, 676),
        scale_box(box, 504, 812),
        scale_box(box, 182, 792),
        scale_box(box, 112, 736),
    ]
    right_page = [
        scale_box(box, 550, 618),
        scale_box(box, 886, 678),
        scale_box(box, 912, 736),
        scale_box(box, 842, 792),
        scale_box(box, 520, 812),
        scale_box(box, 516, 676),
    ]
    draw.polygon(left_page, fill=hex_rgba(colors["page"]))
    draw.polygon(right_page, fill=hex_rgba(colors["page"]))

    line_width = max(3, scale_value(box, 8))
    draw.line([scale_box(box, 504, 674), scale_box(box, 512, 812)], fill=hex_rgba(colors["edge"]), width=line_width)
    draw.line(
        [scale_box(box, 176, 742), scale_box(box, 494, 704)],
        fill=hex_rgba(colors["edge"]),
        width=max(2, scale_value(box, 5)),
    )
    draw.line(
        [scale_box(box, 530, 704), scale_box(box, 848, 742)],
        fill=hex_rgba(colors["edge"]),
        width=max(2, scale_value(box, 5)),
    )
    draw.arc(
        centered_box(
            (left + right) // 2,
            round(top + (bottom - top) * 0.79),
            scale_value(box, 122),
            scale_value(box, 84),
        ),
        start=180,
        end=360,
        fill=hex_rgba(colors["binding"]),
        width=max(4, scale_value(box, 10)),
    )


def draw_scene(
    image: Image.Image,
    box: tuple[int, int, int, int],
    *,
    background: bool,
    monochrome: bool = False,
    include_wordmark: bool = False,
) -> None:
    draw = ImageDraw.Draw(image)
    left, top, right, bottom = box

    if background:
        draw.ellipse(centered_box(round(right - (right - left) * 0.12), round(top + (bottom - top) * 0.12), scale_value(box, 520), scale_value(box, 520)), fill=hex_rgba(COLORS["background_alt"]))
        draw.ellipse(centered_box(round(left + (right - left) * 0.14), round(bottom - (bottom - top) * 0.08), scale_value(box, 420), scale_value(box, 420)), fill=hex_rgba("#28774b"))

    draw_book(draw, box, monochrome=monochrome)

    hill_back = COLORS["white"] if monochrome else COLORS["hill_deep"]
    hill_front = COLORS["white"] if monochrome else COLORS["hill"]
    field = COLORS["white"] if monochrome else COLORS["leaf"]

    draw.ellipse(
        (
            *scale_box(box, 420, 346),
            *scale_box(box, 838, 676),
        ),
        fill=hex_rgba(hill_back),
    )
    draw.ellipse(
        (
            *scale_box(box, 282, 404),
            *scale_box(box, 594, 676),
        ),
        fill=hex_rgba(hill_front),
    )
    draw.ellipse(
        (
            *scale_box(box, 232, 590),
            *scale_box(box, 804, 742),
        ),
        fill=hex_rgba(field),
    )
    draw.ellipse(
        (
            *scale_box(box, 304, 624),
            *scale_box(box, 726, 724),
        ),
        fill=hex_rgba(COLORS["background"] if monochrome else "#71b73b"),
    )

    draw_pine(
        draw,
        scale_box(box, 282, 0)[0],
        scale_box(box, 0, 654)[1],
        scale_value(box, 246),
        COLORS["white"] if monochrome else COLORS["background_deep"],
        COLORS["white"] if monochrome else COLORS["trunk"],
    )
    draw_pine(
        draw,
        scale_box(box, 748, 0)[0],
        scale_box(box, 0, 654)[1],
        scale_value(box, 292),
        COLORS["white"] if monochrome else "#0d5a30",
        COLORS["white"] if monochrome else COLORS["trunk"],
    )

    draw_tent(
        draw,
        scale_box(box, 592, 0)[0],
        scale_box(box, 0, 578)[1],
        scale_value(box, 232),
        scale_value(box, 194),
    )
    draw_campfire(
        draw,
        scale_box(box, 436, 0)[0],
        scale_box(box, 0, 660)[1],
        scale_value(box, 112),
    )

    for x, y, radius in [
        (188, 318, 22),
        (292, 268, 12),
        (642, 300, 18),
        (738, 324, 12),
        (842, 356, 20),
        (560, 264, 10),
    ]:
        dot = centered_box(scale_box(box, x, 0)[0], scale_box(box, 0, y)[1], scale_value(box, radius * 2), scale_value(box, radius * 2))
        draw.ellipse(dot, fill=hex_rgba(COLORS["white"] if monochrome else COLORS["spark"]))

    if background:
        draw_crescent(
            image,
            scale_box(box, 368, 308),
            scale_value(box, 76),
            COLORS["white"] if monochrome else COLORS["accent"],
        )

    if include_wordmark:
        title_font = ImageFont.truetype(str(FONT_BOLD), size=round((bottom - top) * 0.12))
        subtitle_font = ImageFont.truetype(str(FONT_REGULAR), size=round((bottom - top) * 0.038))
        title_y = round(top + (bottom - top) * 0.93)
        subtitle_y = round(top + (bottom - top) * 1.04)
        wordmark_color = COLORS["white"] if monochrome else COLORS["card"]
        shadow_color = COLORS["background_deep"] if not monochrome else COLORS["white"]
        draw.text(
            (round((left + right) / 2), title_y + round((bottom - top) * 0.01)),
            "NaukaLiluka",
            font=title_font,
            fill=hex_rgba(shadow_color, 90 if not monochrome else 255),
            anchor="mm",
        )
        draw.text(
            (round((left + right) / 2), title_y),
            "NaukaLiluka",
            font=title_font,
            fill=hex_rgba(wordmark_color),
            anchor="mm",
        )
        draw.text(
            (round((left + right) / 2), subtitle_y),
            "czytanie i matematyka",
            font=subtitle_font,
            fill=hex_rgba(COLORS["accent"] if not monochrome else COLORS["white"], 220),
            anchor="mm",
        )


def create_icon() -> Image.Image:
    canvas = make_canvas(2048, 2048, COLORS["background"])
    draw_scene(canvas, (176, 184, 1872, 1904), background=True)
    return canvas.resize((1024, 1024), Image.Resampling.LANCZOS)


def create_adaptive_icon(monochrome: bool = False) -> Image.Image:
    canvas = make_canvas(2048, 2048)
    draw_scene(canvas, (420, 364, 1628, 1572), background=False, monochrome=monochrome)
    return canvas.resize((1024, 1024), Image.Resampling.LANCZOS)


def draw_splash_wordmark(
    image: Image.Image,
    *,
    title_center: tuple[int, int],
    title_size: int,
    subtitle_center: tuple[int, int] | None = None,
) -> None:
    draw = ImageDraw.Draw(image)
    title_font = ImageFont.truetype(str(FONT_BOLD), size=title_size)
    draw.text(
        (title_center[0], title_center[1] + round(title_size * 0.06)),
        "NaukaLiluka",
        font=title_font,
        fill=hex_rgba(COLORS["background_deep"], 90),
        anchor="mm",
    )
    draw.text(
        title_center,
        "NaukaLiluka",
        font=title_font,
        fill=hex_rgba(COLORS["card"]),
        anchor="mm",
    )
    if subtitle_center is not None:
        subtitle_font = ImageFont.truetype(str(FONT_REGULAR), size=round(title_size * 0.34))
        draw.text(
            subtitle_center,
            "czytanie i matematyka",
            font=subtitle_font,
            fill=hex_rgba(COLORS["accent"], 220),
            anchor="mm",
        )


def create_phone_splash() -> Image.Image:
    canvas = make_canvas(2048, 2048)
    draw_scene(canvas, (388, 226, 1660, 1498), background=False)
    draw_splash_wordmark(
        canvas,
        title_center=(1024, 1632),
        title_size=180,
        subtitle_center=(1024, 1760),
    )
    return canvas


def create_tablet_splash() -> Image.Image:
    canvas = make_canvas(2732, 1536)
    draw_scene(canvas, (180, 140, 1360, 1320), background=False)
    draw_splash_wordmark(
        canvas,
        title_center=(1978, 688),
        title_size=188,
        subtitle_center=(1978, 824),
    )
    return canvas


def create_favicon(source: Image.Image) -> Image.Image:
    return source.resize((128, 128), Image.Resampling.LANCZOS)


def save_image(image: Image.Image, file_name: str) -> None:
    output_path = ASSETS_DIR / file_name
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path)
    print(f"Generated {output_path.relative_to(ROOT_DIR)}")


def main() -> None:
    icon = create_icon()
    adaptive = create_adaptive_icon()
    monochrome = create_adaptive_icon(monochrome=True)
    phone_splash = create_phone_splash()
    tablet_splash = create_tablet_splash()
    favicon = create_favicon(icon)

    save_image(icon, "app-icon.png")
    save_image(icon, "icon.png")
    save_image(adaptive, "adaptive-icon.png")
    save_image(monochrome, "adaptive-icon-monochrome.png")
    save_image(phone_splash, "splash-icon.png")
    save_image(tablet_splash, "splash-tablet.png")
    save_image(favicon, "favicon.png")


if __name__ == "__main__":
    main()
