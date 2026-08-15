"use client";

import { Maximize, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaAsset, TimelineClip } from "@/types/editor";
import { formatTime } from "@/utils/time";

interface PreviewCanvasProps {
  asset?: MediaAsset;
  clip?: TimelineClip;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  aspectRatio: string;
  onPlayingChange: (playing: boolean) => void;
  onTimeChange: (time: number) => void;
}

export function PreviewCanvas({ asset, clip, currentTime, duration, isPlaying, aspectRatio, onPlayingChange, onTimeChange }: PreviewCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const ratio = aspectRatio.replace(":", " / ");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !clip || asset?.kind !== "video") return;
    const target = Math.max(0, currentTime - clip.start + clip.sourceStart);
    if (Math.abs(video.currentTime - target) > 0.18) video.currentTime = target;
  }, [asset?.kind, clip, currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) void video.play().catch(() => onPlayingChange(false));
    else video.pause();
  }, [isPlaying, asset?.id, onPlayingChange]);

  return (
    <section className="preview-section">
      <div className="preview-stage" ref={containerRef}>
        <div className="preview-surface" style={{ aspectRatio: ratio, width: `${zoom}%`, maxWidth: `${zoom}%` }}>
          {!asset && <div className="preview-empty"><Play size={29} /><strong>Your canvas is ready</strong><span>Import media and add it to the timeline.</span></div>}
          {asset?.kind === "video" && <video ref={videoRef} src={asset.url} muted={muted} playsInline onTimeUpdate={(event) => clip && onTimeChange(clip.start + event.currentTarget.currentTime - clip.sourceStart)} onEnded={() => onPlayingChange(false)} />}
          {asset?.kind === "image" && <img src={asset.url} alt={asset.name} />}
          {asset?.kind === "audio" && <div className="audio-preview"><Volume2 size={42} /><span>{asset.name}</span></div>}
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
    </section>
  );
}

