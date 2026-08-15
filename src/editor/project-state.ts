import type { EditorProject, MediaAsset, TimelineClip } from "@/types/editor";

export const initialProject: EditorProject = {
  id: "local-project",
  name: "Untitled project",
  aspectRatio: "16:9",
  resolution: "1080p",
  assets: [],
  tracks: [
    { id: "overlay-1", name: "V2", kind: "overlay", clips: [] },
    { id: "video-1", name: "V1", kind: "video", clips: [] },
    { id: "audio-1", name: "A1", kind: "audio", clips: [] },
    { id: "audio-2", name: "A2", kind: "audio", clips: [] },
  ],
};

export type ProjectAction =
  | { type: "add-assets"; assets: MediaAsset[] }
  | { type: "add-clip"; clip: TimelineClip }
  | { type: "set-name"; name: string }
  | { type: "set-aspect-ratio"; value: EditorProject["aspectRatio"] }
  | { type: "set-resolution"; value: EditorProject["resolution"] };

export function projectReducer(project: EditorProject, action: ProjectAction): EditorProject {
  switch (action.type) {
    case "add-assets":
      return { ...project, assets: [...project.assets, ...action.assets] };
    case "add-clip":
      return {
        ...project,
        tracks: project.tracks.map((track) =>
          track.id === action.clip.trackId
            ? { ...track, clips: [...track.clips, action.clip] }
            : track,
        ),
      };
    case "set-name":
      return { ...project, name: action.name };
    case "set-aspect-ratio":
      return { ...project, aspectRatio: action.value };
    case "set-resolution":
      return { ...project, resolution: action.value };
  }
}

