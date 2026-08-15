"use client";

import { Maximize, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaAsset, TimelineClip } from "@/types/editor";
import { getClipFilter } from "@/editor/clip-style";
import { formatTime } from "@/utils/time";

interface PreviewCanvasProps {
  asset?: MediaAsset;
  clip?: TimelineClip;
  audioTracks: { clip: TimelineClip; asset: MediaAsset }[];
  layers: TimelineClip[];
  selectedClipId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  aspectRatio: string;
  onPlayingChange: (playing: boolean) => void;
  onTimeChange: (time: number) => void;
  onSelectLayer: (clipId: string) => void;
  onUpdateLayer: (clipId: string, changes: Partial<TimelineClip>) => void;
}

function TimelineAudioPlayback({ clip, asset, currentTime, isPlaying, muted }: { clip: TimelineClip; asset: MediaAsset; currentTime: number; isPlaying: boolean; muted: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const isActive = currentTime >= clip.start && currentTime < clip.start + clip.duration;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const rawTarget = Math.max(0, currentTime - clip.start + clip.sourceStart);
    const target = clip.loop && asset.duration > 0 ? rawTarget % asset.duration : rawTarget;
    if (isActive && Math.abs(audio.currentTime - target) > .2) audio.currentTime = target;
    if (isPlaying && isActive) void audio.play().catch(() => undefined);
    else audio.pause();
  }, [asset.duration, clip.loop, clip.sourceStart, clip.start, currentTime, isActive, isPlaying]);

  return <audio ref={audioRef} src={asset.url} muted={muted} preload="auto" loop={clip.loop} />;
}

export function PreviewCanvas({ asset, clip, audioTracks, layers, selectedClipId, currentTime, duration, isPlaying, aspectRatio, onPlayingChange, onTimeChange, onSelectLayer, onUpdateLayer }: PreviewCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const ratio = aspectRatio.replace(":", " / ");
  const mediaStyle = clip ? { filter: getClipFilter(clip.style), opacity: clip.style.opacity, transform: `scale(${clip.style.scale}) rotate(${clip.style.rotation}deg)`, animationDuration: `${clip.transition.duration}s` } : undefined;
  const mediaClass = clip ? `preview-media transition-${clip.transition.type}` : "preview-media";

  const beginLayerDrag = (event: React.PointerEvent<HTMLButtonElement>, layer: TimelineClip) => {
    event.preventDefault();
    onSelectLayer(layer.id);
    const surface = event.currentTarget.parentElement;
    const target = event.currentTarget;
    if (!surface) return;
    target.setPointerCapture(event.pointerId);
    target.onpointermove = (moveEvent) => {
      const bounds = surface.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((moveEvent.clientX - bounds.left) / bounds.width) * 100));
      const y = Math.min(100, Math.max(0, ((moveEvent.clientY - bounds.top) / bounds.height) * 100));
      onUpdateLayer(layer.id, { style: { ...layer.style, x, y } });
    };
    target.onpointerup = () => { target.onpointermove = null; target.onpointerup = null; };
  };

  useEffect(() => {
    const media = asset?.kind === "audio" ? audioRef.current : videoRef.current;
    if (!media || !clip || (asset?.kind !== "video" && asset?.kind !== "audio")) return;
    const target = Math.max(0, currentTime - clip.start + clip.sourceStart);
    if (Math.abs(media.currentTime - target) > 0.18) media.currentTime = target;
  }, [asset?.kind, clip, currentTime]);

  useEffect(() => {
    const media = asset?.kind === "audio" ? audioRef.current : videoRef.current;
    if (!media) return;
    if (isPlaying) void media.play().catch(() => onPlayingChange(false));
    else media.pause();
  }, [isPlaying, asset?.id, asset?.kind, onPlayingChange]);

  return (
    <section className="preview-section">
      <div className="preview-stage" ref={containerRef}>
        <div className="preview-surface" style={{ aspectRatio: ratio, width: `${zoom}%`, maxWidth: `${zoom}%` }}>
          {!asset && layers.length === 0 && <div className="preview-empty"><Play size={29} /><strong>Your canvas is ready</strong><span>Import media or add a creative layer.</span></div>}
          {asset?.kind === "video" && <video ref={videoRef} className={mediaClass} style={mediaStyle} src={asset.url} muted={muted} playsInline onTimeUpdate={(event) => clip && onTimeChange(clip.start + event.currentTarget.currentTime - clip.sourceStart)} onEnded={() => onPlayingChange(false)} />}
          {asset?.kind === "image" && <Image className={mediaClass} src={asset.url} alt={asset.name} fill sizes="80vw" unoptimized style={{ ...mediaStyle, objectFit: "contain" }} />}
          {asset && clip?.style.effect !== "none" && <span className={`media-effect-overlay ${clip?.style.effect}`} />}
          {asset?.kind === "audio" && <div className="audio-preview"><Volume2 size={42} /><span>{asset.name}</span><audio ref={audioRef} src={asset.url} muted={muted} onTimeUpdate={(event) => clip && onTimeChange(clip.start + event.currentTarget.currentTime - clip.sourceStart)} onEnded={() => onPlayingChange(false)} /></div>}
          {layers.map((layer) => {
            const style = layer.style;
            const layerStyle: React.CSSProperties = { left: `${style.x}%`, top: `${style.y}%`, color: style.color, backgroundColor: style.backgroundColor, fontSize: style.fontSize, fontWeight: style.fontWeight, textAlign: style.textAlign, opacity: style.opacity, filter: getClipFilter(style), transform: `translate(-50%, -50%) scale(${style.scale}) rotate(${style.rotation}deg)`, animationDuration: `${layer.transition.duration}s` };
            return <button key={layer.id} className={`canvas-layer ${layer.kind} effect-${style.effect} transition-${layer.transition.type} ${selectedClipId === layer.id ? "selected" : ""}`} style={layerStyle} onPointerDown={(event) => beginLayerDrag(event, layer)} aria-label={`Select and move ${layer.label}`}>
              {layer.kind === "shape" ? <span className={`canvas-shape ${layer.shape}`} style={{ backgroundColor: style.color }} /> : layer.content}
              {selectedClipId === layer.id && <><i className="handle top-left" /><i className="handle top-right" /><i className="handle bottom-left" /><i className="handle bottom-right" /></>}
            </button>;
          })}
        </div>
      </div>
      <div className="playback-bar">
        <div className="playback-time"><strong>{formatTime(currentTime)}</strong><span>/ {formatTime(duration)}</span></div>
        <div className="transport-controls">
          <button onClick={() => onTimeChange(Math.max(0, currentTime - 1 / 30))} aria-label="Previous frame"><SkipBack size={17} /></button>
          <button className="play-button" onClick={() => onPlayingChange(!isPlaying)} aria-label={isPlaying ? "Pause" : "Play"}>{isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}</button>
          <button onClick={() => onTimeChange(Math.min(duration, currentTime + 1 / 30))} aria-label="Next frame"><SkipForward size={17} /></button>
        </div>
        <div className="preview-options">
          <button onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute" : "Mute"}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <button onClick={() => setZoom((value) => value >= 120 ? 80 : value + 20)} aria-label="Preview zoom"><ZoomIn size={17} /><span>{zoom}%</span></button>
          <button onClick={() => void containerRef.current?.requestFullscreen()} aria-label="Fullscreen preview"><Maximize size={17} /></button>
        </div>
      </div>
      <div className="timeline-audio-output" aria-hidden="true">
        {audioTracks.map((item) => <TimelineAudioPlayback key={item.clip.id} {...item} currentTime={currentTime} isPlaying={isPlaying} muted={muted} />)}
      </div>
    </section>
  );
}
