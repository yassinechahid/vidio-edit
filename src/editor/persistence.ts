import type { EditorProject, MediaAsset } from "@/types/editor";

const PROJECT_KEY = "framecraft-project-v1";
const SELECTION_KEY = "framecraft-selection-v1";
const DATABASE_NAME = "framecraft-media";
const MEDIA_STORE = "media-files";
const MUSIC_VIDEO_SETTINGS_KEY = "framecraft-music-video-v1";
const MUSIC_VIDEO_AUDIO_KEY = "music-video-current-audio-v1";
const ACTIVE_TOOL_KEY = "framecraft-active-tool-v1";

type StoredAsset = Omit<MediaAsset, "url">;
type StoredProject = Omit<EditorProject, "assets"> & { assets: StoredAsset[] };

export type PersistedMusicVideoSettings = {
  fileName: string;
  aspectRatio: string;
  templateId: string;
  exportQuality: string;
  volume: number;
  currentTime: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(MEDIA_STORE)) {
        request.result.createObjectStore(MEDIA_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open media storage"));
  });
}

export async function saveMediaBlob(assetId: string, blob: Blob): Promise<void> {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(MEDIA_STORE, "readwrite");
      transaction.objectStore(MEDIA_STORE).put(blob, assetId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save media"));
      transaction.onabort = () => reject(transaction.error ?? new Error("Media save was interrupted"));
    });
  } finally {
    database.close();
  }
}

async function loadMediaBlob(assetId: string): Promise<Blob | undefined> {
  const database = await openDatabase();
  try {
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = database.transaction(MEDIA_STORE, "readonly").objectStore(MEDIA_STORE).get(assetId);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error ?? new Error("Could not restore media"));
    });
  } finally {
    database.close();
  }
}

export function saveMusicVideoSettings(settings: PersistedMusicVideoSettings): void {
  localStorage.setItem(MUSIC_VIDEO_SETTINGS_KEY, JSON.stringify(settings));
}

export function loadMusicVideoSettings(): PersistedMusicVideoSettings | null {
  const raw = localStorage.getItem(MUSIC_VIDEO_SETTINGS_KEY);
  if (!raw) return null;
  try {
    const settings = JSON.parse(raw) as Partial<PersistedMusicVideoSettings>;
    if (typeof settings.fileName !== "string" || typeof settings.aspectRatio !== "string" || typeof settings.templateId !== "string") return null;
    return {
      fileName: settings.fileName,
      aspectRatio: settings.aspectRatio,
      templateId: settings.templateId,
      exportQuality: typeof settings.exportQuality === "string" ? settings.exportQuality : "fast",
      volume: typeof settings.volume === "number" ? settings.volume : 0.85,
      currentTime: typeof settings.currentTime === "number" ? settings.currentTime : 0,
    };
  } catch {
    return null;
  }
}

export function saveMusicVideoAudio(blob: Blob): Promise<void> {
  return saveMediaBlob(MUSIC_VIDEO_AUDIO_KEY, blob);
}

export function loadMusicVideoAudio(): Promise<Blob | undefined> {
  return loadMediaBlob(MUSIC_VIDEO_AUDIO_KEY);
}

export function saveActiveTool(tool: string): void {
  localStorage.setItem(ACTIVE_TOOL_KEY, tool);
}

export function loadActiveTool(): string | null {
  return localStorage.getItem(ACTIVE_TOOL_KEY);
}

export function saveProjectMetadata(project: EditorProject): void {
  const stored: StoredProject = {
    ...project,
    assets: project.assets.map(({ id, name, kind, mimeType, duration, width, height }) => ({
      id, name, kind, mimeType, duration, width, height,
    })),
  };
  localStorage.setItem(PROJECT_KEY, JSON.stringify(stored));
}

export function saveSelectedClipId(clipId: string | null): void {
  if (clipId) localStorage.setItem(SELECTION_KEY, clipId);
  else localStorage.removeItem(SELECTION_KEY);
}

export function loadSelectedClipId(): string | null {
  return localStorage.getItem(SELECTION_KEY);
}

export async function loadPersistedProject(): Promise<EditorProject | null> {
  const raw = localStorage.getItem(PROJECT_KEY);
  if (!raw) return null;
  const stored = JSON.parse(raw) as StoredProject;
  if (!stored || !Array.isArray(stored.assets) || !Array.isArray(stored.tracks)) return null;
  const assets = await Promise.all(stored.assets.map(async (asset) => {
    const blob = await loadMediaBlob(asset.id);
    return blob ? { ...asset, url: URL.createObjectURL(blob) } : null;
  }));
  return { ...stored, assets: assets.filter((asset): asset is MediaAsset => asset !== null) };
}
