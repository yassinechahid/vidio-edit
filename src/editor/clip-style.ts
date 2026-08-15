import type { ClipStyle } from "@/types/editor";

export const defaultClipStyle: ClipStyle = {
  x: 50,
  y: 50,
  scale: 1,
  rotation: 0,
  opacity: 1,
  color: "#ffffff",
  backgroundColor: "transparent",
  fontSize: 36,
  fontWeight: 700,
  textAlign: "center",
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  filter: "none",
  effect: "none",
};

export function getClipFilter(style: ClipStyle): string {
  const filters = [
    `brightness(${style.brightness}%)`,
    `contrast(${style.contrast}%)`,
    `saturate(${style.saturation}%)`,
    `blur(${style.blur}px)`,
  ];
  if (style.filter === "mono") filters.push("grayscale(1)");
  if (style.filter === "warm") filters.push("sepia(.28) saturate(1.18)");
  if (style.filter === "cool") filters.push("hue-rotate(175deg) saturate(.88)");
  if (style.filter === "vivid") filters.push("saturate(1.45) contrast(1.08)");
  if (style.effect === "dreamy") filters.push("contrast(.9) saturate(.82)");
  return filters.join(" ");
}
