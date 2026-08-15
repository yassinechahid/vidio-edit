"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaAsset, MediaKind } from "@/types/editor";

const ACCEPTED_TYPES = [
  "video/mp4", "video/webm", "video/quicktime", "audio/mpeg", "audio/wav",
  "audio/x-wav", "image/png", "image/jpeg", "image/webp",
];

function getKind(type: string): MediaKind | null {
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("image/")) return "image";
  return null;
}

async function inspectFile(file: File): Promise<MediaAsset> {
  const kind = getKind(file.type);
  if (!kind || !ACCEPTED_TYPES.includes(file.type)) throw new Error(`${file.name} is not supported`);
  const url = URL.createObjectURL(file);
  const id = crypto.randomUUID();

  try {
    if (kind === "image") {
      const image = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => reject(new Error(`Could not read ${file.name}`));
        image.src = url;
      });
      return { id, name: file.name, kind, mimeType: file.type, url, duration: 5, ...dimensions };
    }

    const media = document.createElement(kind === "video" ? "video" : "audio");
    media.preload = "metadata";
    const metadata = await new Promise<{ duration: number; width?: number; height?: number }>((resolve, reject) => {
      media.onloadedmetadata = () => resolve({
        duration: Number.isFinite(media.duration) ? media.duration : 0,
        width: kind === "video" ? (media as HTMLVideoElement).videoWidth : undefined,
        height: kind === "video" ? (media as HTMLVideoElement).videoHeight : undefined,
      });
      media.onerror = () => reject(new Error(`Could not read ${file.name}`));
      media.src = url;
    });
    media.removeAttribute("src");
    media.load();
    return { id, name: file.name, kind, mimeType: file.type, url, ...metadata };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function useMediaImport(onImported: (assets: MediaAsset[]) => void) {
  const urls = useRef<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const importFiles = useCallback(async (files: FileList | File[]) => {
    setIsImporting(true);
    setError(null);
    const results = await Promise.allSettled(Array.from(files).map(inspectFile));
    const assets = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    const failures = results.flatMap((result) => result.status === "rejected" ? [String(result.reason)] : []);
    urls.current.push(...assets.map((asset) => asset.url));
    if (assets.length) onImported(assets);
    if (failures.length) setError(failures.join(". "));
    setIsImporting(false);
  }, [onImported]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  return { importFiles, isImporting, error };
}

