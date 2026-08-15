"use client";

import { Flag, Minus, Plus, Scissors, Trash2 } from "lucide-react";
import type { MediaAsset, TimelineClip, TimelineTrack } from "@/types/editor";
import { formatTime } from "@/utils/time";

interface TimelineProps {
  tracks: TimelineTrack[];
  assets: MediaAsset[];
  duration: number;
  currentTime: number;
  zoom: number;
  selectedClipId: string | null;
  rangeIn: number | null;
  rangeOut: number | null;
  onZoomChange: (zoom: number) => void;
  onSeek: (time: number) => void;
  onDropAsset: (assetId: string, trackId: string, time: number) => void;
  onSelectClip: (clipId: string) => void;
  onDeleteSelected: () => void;
  onSetRangeIn: () => void;
  onSetRangeOut: () => void;
  onRippleDelete: () => void;
  onTrimClip: (clipId: string, changes: Partial<TimelineClip>) => void;
}

export function Timeline({ tracks, assets, duration, currentTime, zoom, selectedClipId, rangeIn, rangeOut, onZoomChange, onSeek, onDropAsset, onSelectClip, onDeleteSelected, onSetRangeIn, onSetRangeOut, onRippleDelete, onTrimClip }: TimelineProps) {
  const seconds = Math.max(20, Math.ceil(duration + 5));
  const pxPerSecond = 48 * zoom;
  const width = seconds * pxPerSecond;
  const ticks = Array.from({ length: Math.ceil(seconds / 5) + 1 }, (_, index) => index * 5);

  const beginTrim = (event: React.PointerEvent<HTMLButtonElement>, clip: TimelineClip, asset: MediaAsset | undefined, edge: "left" | "right") => {
    event.stopPropagation();
    const handle = event.currentTarget;
    const clipElement = handle.parentElement;
    if (!clipElement) return;
    const pointerStart = event.clientX;
    const initialStart = clip.start;
    const initialDuration = clip.duration;
    const initialSourceStart = clip.sourceStart;
    let finalChanges: Partial<TimelineClip> = {};
    handle.setPointerCapture(event.pointerId);
    handle.onpointermove = (moveEvent) => {
      const delta = (moveEvent.clientX - pointerStart) / pxPerSecond;
      if (edge === "left") {
        const earliestStart = Math.max(0, initialStart - initialSourceStart);
        const nextStart = Math.min(initialStart + initialDuration - 1 / 30, Math.max(earliestStart, initialStart + delta));
        const nextDuration = initialDuration - (nextStart - initialStart);
        finalChanges = { start: nextStart, duration: nextDuration, sourceStart: initialSourceStart + (nextStart - initialStart) };
        clipElement.style.left = `${nextStart * pxPerSecond}px`;
        clipElement.style.width = `${Math.max(34, nextDuration * pxPerSecond)}px`;
      } else {
        const availableSource = asset && asset.kind !== "image" && !clip.loop ? Math.max(1 / 30, asset.duration - initialSourceStart) : Number.POSITIVE_INFINITY;
        const nextDuration = Math.min(availableSource, Math.max(1 / 30, initialDuration + delta));
        finalChanges = { duration: nextDuration };
        clipElement.style.width = `${Math.max(34, nextDuration * pxPerSecond)}px`;
      }
    };
    handle.onpointerup = () => {
      handle.onpointermove = null;
      handle.onpointerup = null;
      if (Object.keys(finalChanges).length) onTrimClip(clip.id, finalChanges);
    };
  };

  return (
    <section className="timeline-section">
      <div className="timeline-toolbar">
        <div><Scissors size={15} /><strong>Timeline</strong></div>
        <div className="timeline-edit-tools">
          <button onClick={onDeleteSelected} disabled={!selectedClipId} title="Remove selected clip (Delete)"><Trash2 size={13} /><span>Delete</span></button>
          <button onClick={onSetRangeIn} title="Set range start at playhead"><Flag size={12} /><span>In {rangeIn === null ? "" : formatTime(rangeIn).slice(0, 5)}</span></button>
          <button onClick={onSetRangeOut} title="Set range end at playhead"><Flag size={12} /><span>Out {rangeOut === null ? "" : formatTime(rangeOut).slice(0, 5)}</span></button>
          <button className="ripple-button" onClick={onRippleDelete} disabled={rangeIn === null || rangeOut === null || Math.abs(rangeOut - rangeIn) < 1 / 30} title="Remove marked range and close the gap"><Scissors size={13} /><span>Remove range</span></button>
        </div>
        <div className="timeline-zoom"><button onClick={() => onZoomChange(Math.max(.5, zoom - .25))} aria-label="Zoom timeline out"><Minus size={14} /></button><input aria-label="Timeline zoom" type="range" min=".5" max="2" step=".25" value={zoom} onChange={(event) => onZoomChange(Number(event.target.value))} /><button onClick={() => onZoomChange(Math.min(2, zoom + .25))} aria-label="Zoom timeline in"><Plus size={14} /></button></div>
      </div>
      <div className="timeline-body">
        <div className="track-labels"><div className="ruler-label">TRACKS</div>{tracks.map((track) => <div key={track.id} className="track-label"><strong>{track.name}</strong><span>{track.kind}</span></div>)}</div>
        <div className="timeline-scroll">
          <div className="timeline-content" style={{ width }}>
            <button className="time-ruler" onClick={(event) => onSeek(event.nativeEvent.offsetX / pxPerSecond)} aria-label="Seek timeline">
              {ticks.map((tick) => <span key={tick} style={{ left: tick * pxPerSecond }}>{formatTime(tick).slice(0, 5)}</span>)}
            </button>
            {rangeIn !== null && <div className="range-marker range-in" style={{ left: rangeIn * pxPerSecond }}><span>IN</span></div>}
            {rangeOut !== null && <div className="range-marker range-out" style={{ left: rangeOut * pxPerSecond }}><span>OUT</span></div>}
            {rangeIn !== null && rangeOut !== null && <div className="range-selection" style={{ left: Math.min(rangeIn, rangeOut) * pxPerSecond, width: Math.abs(rangeOut - rangeIn) * pxPerSecond }} />}
            <div className="playhead" style={{ left: currentTime * pxPerSecond }}><span /></div>
            {tracks.map((track) => (
              <div
                key={track.id}
                className="timeline-track"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { const id = event.dataTransfer.getData("application/x-framecraft-asset"); if (id) onDropAsset(id, track.id, Math.max(0, event.nativeEvent.offsetX / pxPerSecond)); }}
                onClick={(event) => { if (event.target === event.currentTarget) onSeek(event.nativeEvent.offsetX / pxPerSecond); }}
              >
                {track.clips.map((clip) => {
                  const asset = assets.find((item) => item.id === clip.assetId);
                  const isLooping = asset?.kind === "audio" && clip.loop && clip.duration > asset.duration + .05;
                  return <div key={clip.id} role="button" tabIndex={0} className={`timeline-clip ${asset?.kind ?? clip.kind} ${isLooping ? "looping" : ""} ${selectedClipId === clip.id ? "selected" : ""}`} style={{ left: clip.start * pxPerSecond, width: Math.max(34, clip.duration * pxPerSecond) }} onClick={(event) => { event.stopPropagation(); onSelectClip(clip.id); onSeek(clip.start); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectClip(clip.id); onSeek(clip.start); } }} title={clip.label}><button className="trim-handle left" onPointerDown={(event) => beginTrim(event, clip, asset, "left")} aria-label={`Trim start of ${clip.label}`} /><span>{clip.label}{isLooping ? " · ↻ repeated" : ""}</span><small>{formatTime(clip.duration).slice(0, 5)}</small><button className="trim-handle right" onPointerDown={(event) => beginTrim(event, clip, asset, "right")} aria-label={`Trim end of ${clip.label}`} /></div>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
