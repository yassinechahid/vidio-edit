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

export interface TimelineClip {
  id: string;
  assetId: string;
  trackId: string;
  start: number;
  duration: number;
  sourceStart: number;
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

