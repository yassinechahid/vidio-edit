"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { MediaAsset, TimelineClip } from "@/types/editor";

interface InspectorProps {
  asset?: MediaAsset;
  clip?: TimelineClip;
  onUpdate: (changes: Partial<TimelineClip>) => void;
}

export function Inspector({ asset, clip, onUpdate }: InspectorProps) {
  const updateStyle = (changes: Partial<TimelineClip["style"]>) => clip && onUpdate({ style: { ...clip.style, ...changes } });
  return (
    <aside className="inspector-panel">
      <div className="panel-heading"><div><span>Properties</span><h2>Inspector</h2></div><SlidersHorizontal size={17} /></div>
      {clip ? <div className="inspector-content">
        <div className="inspector-asset"><strong title={clip.label}>{clip.label}</strong><span>{asset ? `${asset.kind}${asset.width && asset.height ? ` · ${asset.width} × ${asset.height}` : ""}` : clip.kind}</span></div>
        {(clip.kind === "text" || clip.kind === "caption") && <label className="inspector-field">Content<textarea value={clip.content ?? ""} onChange={(event) => onUpdate({ content: event.target.value })} /></label>}
        <div className="inspector-section-title"><strong>Transform</strong><button onClick={() => updateStyle({ x: 50, y: 50, scale: 1, rotation: 0, opacity: 1 })} aria-label="Reset transform"><RotateCcw size={13} /></button></div>
        <div className="inspector-grid">
          <label>X<input type="number" value={clip.style.x} onChange={(event) => updateStyle({ x: Number(event.target.value) })} /></label>
          <label>Y<input type="number" value={clip.style.y} onChange={(event) => updateStyle({ y: Number(event.target.value) })} /></label>
          <label>Scale<input type="number" min=".1" max="5" step=".1" value={clip.style.scale} onChange={(event) => updateStyle({ scale: Number(event.target.value) })} /></label>
          <label>Rotate<input type="number" min="-180" max="180" value={clip.style.rotation} onChange={(event) => updateStyle({ rotation: Number(event.target.value) })} /></label>
        </div>
        <div className="range-control"><label><span>Opacity</span><output>{Math.round(clip.style.opacity * 100)}%</output></label><input type="range" min="0" max="1" step=".01" value={clip.style.opacity} onChange={(event) => updateStyle({ opacity: Number(event.target.value) })} /></div>
        {asset?.kind === "audio" && <label className="loop-toggle"><span>Repeat to video end</span><input type="checkbox" checked={clip.loop ?? true} onChange={(event) => onUpdate(event.target.checked ? { loop: true } : { loop: false, duration: Math.min(clip.duration, Math.max(1 / 30, asset.duration - clip.sourceStart)) })} /></label>}
        {clip.kind !== "media" && <div className="inspector-colors"><label>Foreground<input type="color" value={clip.style.color.slice(0, 7)} onChange={(event) => updateStyle({ color: event.target.value })} /></label>{clip.kind !== "sticker" && <label>Background<input type="color" value={clip.style.backgroundColor === "transparent" ? "#000000" : clip.style.backgroundColor.slice(0, 7)} onChange={(event) => updateStyle({ backgroundColor: event.target.value })} /></label>}</div>}
      </div> : <div className="inspector-empty"><SlidersHorizontal size={23} /><p>Select a timeline clip to edit its properties.</p></div>}
    </aside>
  );
}
