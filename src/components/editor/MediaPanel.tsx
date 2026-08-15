"use client";

import { useRef, useState } from "react";
import { FileAudio2, Film, ImageIcon, Plus, UploadCloud } from "lucide-react";
import type { MediaAsset } from "@/types/editor";
import { formatTime } from "@/utils/time";

interface MediaPanelProps {
  assets: MediaAsset[];
  importFiles: (files: FileList | File[]) => void;
  isImporting: boolean;
  error: string | null;
  onAddToTimeline: (asset: MediaAsset) => void;
}

const ACCEPT = ".mp4,.webm,.mov,.mp3,.wav,.png,.jpg,.jpeg,.webp";

export function MediaPanel({ assets, importFiles, isImporting, error, onAddToTimeline }: MediaPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <section className="asset-panel" aria-label="Media library">
      <div className="panel-heading"><div><span>Project</span><h2>Media</h2></div><button className="icon-button" onClick={() => inputRef.current?.click()} aria-label="Import media"><Plus size={17} /></button></div>
      <input ref={inputRef} className="sr-only" type="file" accept={ACCEPT} multiple onChange={(event) => event.target.files && importFiles(event.target.files)} />
      <button
        className={`drop-zone ${dragging ? "dragging" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); importFiles(event.dataTransfer.files); }}
      >
        <UploadCloud size={22} /><strong>{isImporting ? "Reading media…" : "Import media"}</strong><span>or drop files here</span>
      </button>
      {error && <p className="import-error" role="alert">{error}</p>}
      <div className="asset-list">
        {assets.length === 0 && <div className="empty-assets"><Film size={25} /><p>Your imported videos, images, and audio will appear here.</p></div>}
        {assets.map((asset) => (
          <article
            className="asset-card"
            key={asset.id}
            draggable
            onDragStart={(event) => { event.dataTransfer.setData("application/x-framecraft-asset", asset.id); event.dataTransfer.effectAllowed = "copy"; }}
          >
            <div className="asset-thumbnail">
              {asset.kind === "image" && <img src={asset.url} alt="" />}
              {asset.kind === "video" && <video src={asset.url} muted preload="metadata" />}
              {asset.kind === "audio" && <FileAudio2 size={26} />}
              <span>{asset.kind === "video" ? <Film size={11} /> : asset.kind === "image" ? <ImageIcon size={11} /> : <FileAudio2 size={11} />}{asset.duration > 0 && formatTime(asset.duration).slice(0, 5)}</span>
              <button onClick={() => onAddToTimeline(asset)} aria-label={`Add ${asset.name} to timeline`} title="Add to timeline"><Plus size={14} /></button>
            </div>
            <p title={asset.name}>{asset.name}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

