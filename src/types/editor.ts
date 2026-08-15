export type MediaKind = "video" | "audio" | "image";

export interface MediaAsset {
  id: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  url: string;
  duration: number;
  width?: number;
  height?: number;
}

export type TrackKind = "video" | "audio" | "overlay";

export type TimelineItemKind = "media" | "text" | "caption" | "shape" | "sticker";
export type TransitionKind = "none" | "fade" | "dissolve" | "slide" | "wipe" | "zoom";

export interface ClipStyle {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: number;
  textAlign: "left" | "center" | "right";
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  filter: "none" | "mono" | "warm" | "cool" | "vivid";
  effect: "none" | "soft-glow" | "vignette" | "dreamy";
}

export interface TimelineClip {
  id: string;
  assetId?: string;
  trackId: string;
  start: number;
  duration: number;
  sourceStart: number;
  kind: TimelineItemKind;
  label: string;
  content?: string;
  shape?: "rectangle" | "circle" | "line";
  loop?: boolean;
  style: ClipStyle;
  transition: { type: TransitionKind; duration: number };
}

export interface TimelineTrack {
  id: string;
  name: string;
  kind: TrackKind;
  clips: TimelineClip[];
}

export interface EditorProject {
  id: string;
  name: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5" | "21:9";
  resolution: "720p" | "1080p" | "1440p" | "4K";
  assets: MediaAsset[];
  tracks: TimelineTrack[];
}
