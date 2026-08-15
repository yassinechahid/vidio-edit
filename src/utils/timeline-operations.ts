import type { MediaAsset, TimelineClip, TimelineTrack } from "@/types/editor";

const MIN_CLIP_DURATION = 1 / 30;

function cutClipForRipple(clip: TimelineClip, rangeStart: number, rangeEnd: number): TimelineClip[] {
  const clipEnd = clip.start + clip.duration;
  if (clipEnd <= rangeStart) return [clip];
  if (clip.start >= rangeEnd) return [{ ...clip, start: clip.start - (rangeEnd - rangeStart) }];

  const beforeDuration = Math.max(0, rangeStart - clip.start);
  const afterDuration = Math.max(0, clipEnd - rangeEnd);
  const segments: TimelineClip[] = [];

  if (beforeDuration >= MIN_CLIP_DURATION) {
    segments.push({ ...clip, duration: beforeDuration });
  }
  if (afterDuration >= MIN_CLIP_DURATION) {
    segments.push({
      ...clip,
      id: segments.length ? crypto.randomUUID() : clip.id,
      start: rangeStart,
      duration: afterDuration,
      sourceStart: clip.sourceStart + Math.max(0, rangeEnd - clip.start),
    });
  }
  return segments;
}

export function rippleDeleteRange(tracks: TimelineTrack[], firstTime: number, secondTime: number): TimelineTrack[] {
  const rangeStart = Math.min(firstTime, secondTime);
  const rangeEnd = Math.max(firstTime, secondTime);
  if (rangeEnd - rangeStart < MIN_CLIP_DURATION) return tracks;
  return tracks.map((track) => ({
    ...track,
    clips: track.clips.flatMap((clip) => cutClipForRipple(clip, rangeStart, rangeEnd)),
  }));
}

export function extendLoopingAudioToVideoEnd(tracks: TimelineTrack[], assets: MediaAsset[]): TimelineTrack[] {
  const visualEnd = Math.max(0, ...tracks.flatMap((track) => track.clips).map((clip) => {
    const asset = assets.find((item) => item.id === clip.assetId);
    return asset?.kind !== "audio" ? clip.start + clip.duration : 0;
  }));
  if (visualEnd === 0) return tracks;
  let changed = false;
  const next = tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => {
      const asset = assets.find((item) => item.id === clip.assetId);
      if (asset?.kind !== "audio" || clip.loop === false || clip.start + clip.duration >= visualEnd) return clip;
      changed = true;
      return { ...clip, loop: true, duration: visualEnd - clip.start };
    }),
  }));
  return changed ? next : tracks;
}
