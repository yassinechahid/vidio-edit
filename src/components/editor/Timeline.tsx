"use client";

import { Minus, Plus, Scissors } from "lucide-react";
import type { MediaAsset, TimelineTrack } from "@/types/editor";
import { formatTime } from "@/utils/time";

interface TimelineProps {
  tracks: TimelineTrack[];
  assets: MediaAsset[];
  duration: number;
  currentTime: number;
  zoom: number;
  selectedClipId: string | null;
  onZoomChange: (zoom: number) => void;
  onSeek: (time: number) => void;
  onDropAsset: (assetId: string, trackId: string, time: number) => void;
  onSelectClip: (clipId: string) => void;
}

export function Timeline({ tracks, assets, duration, currentTime, zoom, selectedClipId, onZoomChange, onSeek, onDropAsset, onSelectClip }: TimelineProps) {
  const seconds = Math.max(20, Math.ceil(duration + 5));
  const pxPerSecond = 48 * zoom;
  const width = seconds * pxPerSecond;
  const ticks = Array.from({ length: Math.ceil(seconds / 5) + 1 }, (_, index) => index * 5);

  return (
    <section className="timeline-section">
      <div className="timeline-toolbar">
        <div><Scissors size={15} /><strong>Timeline</strong></div>
        <div className="timeline-zoom"><button onClick={() => onZoomChange(Math.max(.5, zoom - .25))} aria-label="Zoom timeline out"><Minus size={14} /></button><input aria-label="Timeline zoom" type="range" min=".5" max="2" step=".25" value={zoom} onChange={(event) => onZoomChange(Number(event.target.value))} /><button onClick={() => onZoomChange(Math.min(2, zoom + .25))} aria-label="Zoom timeline in"><Plus size={14} /></button></div>
      </div>
      <div className="timeline-body">
        <div className="track-labels"><div className="ruler-label">TRACKS</div>{tracks.map((track) => <div key={track.id} className="track-label"><strong>{track.name}</strong><span>{track.kind}</span></div>)}</div>
        <div className="timeline-scroll">
          <div className="timeline-content" style={{ width }}>
            <button className="time-ruler" onClick={(event) => onSeek(event.nativeEvent.offsetX / pxPerSecond)} aria-label="Seek timeline">
              {ticks.map((tick) => <span key={tick} style={{ left: tick * pxPerSecond }}>{formatTime(tick).slice(0, 5)}</span>)}
            </button>
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
                  return <button key={clip.id} className={`timeline-clip ${asset?.kind ?? "video"} ${selectedClipId === clip.id ? "selected" : ""}`} style={{ left: clip.start * pxPerSecond, width: Math.max(34, clip.duration * pxPerSecond) }} onClick={(event) => { event.stopPropagation(); onSelectClip(clip.id); onSeek(clip.start); }} title={asset?.name}><span>{asset?.name ?? "Missing media"}</span><small>{formatTime(clip.duration).slice(0, 5)}</small></button>;
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

