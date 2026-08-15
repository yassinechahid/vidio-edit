"use client";

import { useRef, useState } from "react";
import { Captions, Circle, ExternalLink, FileAudio2, Film, Layers3, Minus, Music2, Plus, RectangleHorizontal, ShieldCheck, Sparkles, Sticker, Type, WandSparkles } from "lucide-react";
import type { ClipStyle, MediaAsset, TimelineClip, TimelineItemKind, TransitionKind } from "@/types/editor";
import { MediaPanel } from "./MediaPanel";
import type { ToolId } from "./ToolSidebar";

export interface LayerDraft {
  kind: Exclude<TimelineItemKind, "media">;
  label: string;
  content?: string;
  shape?: TimelineClip["shape"];
  duration?: number;
  style?: Partial<ClipStyle>;
}

interface ToolPanelProps {
  activeTool: ToolId;
  assets: MediaAsset[];
  importFiles: (files: FileList | File[]) => void;
  isImporting: boolean;
  error: string | null;
  selectedClip?: TimelineClip;
  onAddToTimeline: (asset: MediaAsset) => void;
  onCreateLayer: (draft: LayerDraft) => void;
  onUpdateClip: (changes: Partial<TimelineClip>) => void;
}

function PanelShell({ title, eyebrow, icon, children }: { title: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="asset-panel creative-panel"><div className="panel-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{icon}</div>{children}</section>;
}

function SelectionHint() {
  return <p className="selection-hint">Select a timeline clip, then choose a preset to apply it.</p>;
}

const textPresets = [
  { label: "Title", fontSize: 48, fontWeight: 800 }, { label: "Heading", fontSize: 36, fontWeight: 700 },
  { label: "Subtitle", fontSize: 24, fontWeight: 600 }, { label: "Lower third", fontSize: 22, fontWeight: 700 },
];
const transitions: TransitionKind[] = ["fade", "dissolve", "slide", "wipe", "zoom"];
const effects: ClipStyle["effect"][] = ["none", "soft-glow", "vignette", "dreamy"];
const filters: ClipStyle["filter"][] = ["none", "mono", "warm", "cool", "vivid"];
const royaltyFreeTracks = [
  { title: "Driving Ambition", artist: "Ahjay Stelino", duration: "1:42", genre: "Uplifting", url: "https://mixkit.co/free-stock-music/corporate-music/" },
  { title: "Sun and His Daughter", artist: "Eugenio Mininni", duration: "2:48", genre: "World", url: "https://mixkit.co/free-stock-music/world/" },
  { title: "Tech House Vibes", artist: "Alejandro Magaña", duration: "1:42", genre: "Electronic", url: "https://mixkit.co/free-stock-music/electronica/" },
  { title: "Feeling Happy", artist: "Ahjay Stelino", duration: "2:28", genre: "Pop", url: "https://mixkit.co/free-stock-music/pop/" },
  { title: "Piano Reflections", artist: "Ahjay Stelino", duration: "3:19", genre: "Reflective", url: "https://mixkit.co/free-stock-music/corporate-music/" },
  { title: "Cyberpunk City", artist: "Alejandro Magaña", duration: "1:40", genre: "Ambient", url: "https://mixkit.co/free-stock-music/electronica/" },
];

export function ToolPanel(props: ToolPanelProps) {
  const [text, setText] = useState("Your story starts here");
  const [caption, setCaption] = useState("Add your caption");
  const audioInput = useRef<HTMLInputElement>(null);

  if (props.activeTool === "media") return <MediaPanel {...props} />;

  if (props.activeTool === "audio") {
    const audioAssets = props.assets.filter((asset) => asset.kind === "audio");
    return <PanelShell title="Audio" eyebrow="Library" icon={<Music2 size={17} />}>
      <input ref={audioInput} className="sr-only" type="file" accept=".mp3,.wav" multiple onChange={(event) => event.target.files && props.importFiles(event.target.files)} />
      <button className="panel-primary-action" onClick={() => audioInput.current?.click()}><Plus size={14} /> Import audio</button>
      <div className="audio-asset-list">{audioAssets.length === 0 ? <div className="tool-empty"><FileAudio2 size={23} /><span>Import music or voice audio to add it to A1 or A2.</span></div> : audioAssets.map((asset) => <button key={asset.id} onClick={() => props.onAddToTimeline(asset)}><FileAudio2 size={17} /><span>{asset.name}</span><Plus size={13} /></button>)}</div>
      <div className="catalog-heading"><div><ShieldCheck size={14} /><strong>Royalty-free music</strong></div><a href="https://mixkit.co/license/" target="_blank" rel="noreferrer">License <ExternalLink size={10} /></a></div>
      <p className="catalog-note">Curated from Mixkit. Download from the official source, then import the MP3 above.</p>
      <div className="music-catalog">{royaltyFreeTracks.map((track) => <a key={track.title} href={track.url} target="_blank" rel="noreferrer"><span className="music-art"><Music2 size={16} /></span><span><strong>{track.title}</strong><small>{track.artist} · {track.genre}</small></span><span className="music-duration">{track.duration}<ExternalLink size={10} /></span></a>)}</div>
    </PanelShell>;
  }

  if (props.activeTool === "text") return <PanelShell title="Text" eyebrow="Create" icon={<Type size={17} />}>
    <div className="panel-form"><label>Text content<textarea value={text} onChange={(event) => setText(event.target.value)} /></label></div>
    <div className="preset-list">{textPresets.map((preset) => <button key={preset.label} onClick={() => props.onCreateLayer({ kind: "text", label: preset.label, content: text || preset.label, style: { fontSize: preset.fontSize, fontWeight: preset.fontWeight, y: preset.label === "Lower third" ? 78 : 50 } })}><span style={{ fontSize: Math.min(16, preset.fontSize / 2.5), fontWeight: preset.fontWeight }}>Aa</span><div><strong>{preset.label}</strong><small>Add to timeline</small></div><Plus size={13} /></button>)}</div>
  </PanelShell>;

  if (props.activeTool === "captions") return <PanelShell title="Captions" eyebrow="Manual subtitles" icon={<Captions size={17} />}>
    <div className="panel-form"><label>Caption text<textarea value={caption} onChange={(event) => setCaption(event.target.value)} /></label><button className="panel-primary-action full" onClick={() => props.onCreateLayer({ kind: "caption", label: "Caption", content: caption, duration: 3, style: { fontSize: 25, fontWeight: 700, y: 84, backgroundColor: "#000000cc" } })}><Plus size={14} /> Add at playhead</button></div>
    <p className="panel-note">Manual captions are real timeline layers. Automatic transcription is not connected.</p>
  </PanelShell>;

  if (props.activeTool === "stickers") return <PanelShell title="Stickers" eyebrow="Elements" icon={<Sticker size={17} />}>
    <div className="sticker-grid">{["✨", "🔥", "❤️", "👍", "🎉", "⭐", "📍", "▶️", "💬", "🚀", "✅", "⚡"].map((item) => <button key={item} onClick={() => props.onCreateLayer({ kind: "sticker", label: `Sticker ${item}`, content: item, style: { fontSize: 58 } })}>{item}</button>)}</div>
  </PanelShell>;

  if (props.activeTool === "shapes") return <PanelShell title="Shapes" eyebrow="Elements" icon={<Circle size={17} />}>
    <div className="shape-grid"><button onClick={() => props.onCreateLayer({ kind: "shape", label: "Rectangle", shape: "rectangle", style: { color: "#8b5cf6" } })}><RectangleHorizontal /><span>Rectangle</span></button><button onClick={() => props.onCreateLayer({ kind: "shape", label: "Circle", shape: "circle", style: { color: "#22d3ee" } })}><Circle /><span>Circle</span></button><button onClick={() => props.onCreateLayer({ kind: "shape", label: "Line", shape: "line", style: { color: "#f59e0b" } })}><Minus /><span>Line</span></button></div>
  </PanelShell>;

  if (props.activeTool === "transitions") return <PanelShell title="Transitions" eyebrow="Clip entrance" icon={<Film size={17} />}>
    {!props.selectedClip && <SelectionHint />}<div className="visual-preset-grid">{transitions.map((type) => <button key={type} disabled={!props.selectedClip} className={props.selectedClip?.transition.type === type ? "active" : ""} onClick={() => props.onUpdateClip({ transition: { type, duration: .5 } })}><span className={`transition-preview ${type}`} /><strong>{type}</strong></button>)}</div>
    {props.selectedClip && <div className="range-control"><label><span>Duration</span><output>{props.selectedClip.transition.duration.toFixed(1)}s</output></label><input type="range" min=".1" max="2" step=".1" value={props.selectedClip.transition.duration} onChange={(event) => props.onUpdateClip({ transition: { ...props.selectedClip!.transition, duration: Number(event.target.value) } })} /></div>}
  </PanelShell>;

  if (props.activeTool === "effects") return <PanelShell title="Effects" eyebrow="Visual style" icon={<Sparkles size={17} />}>
    {!props.selectedClip && <SelectionHint />}<div className="visual-preset-grid">{effects.map((effect) => <button key={effect} disabled={!props.selectedClip} className={props.selectedClip?.style.effect === effect ? "active" : ""} onClick={() => props.selectedClip && props.onUpdateClip({ style: { ...props.selectedClip.style, effect } })}><span className={`effect-preview ${effect}`} /><strong>{effect.replace("-", " ")}</strong></button>)}</div>
  </PanelShell>;

  if (props.activeTool === "filters") return <PanelShell title="Filters" eyebrow="Color looks" icon={<WandSparkles size={17} />}>
    {!props.selectedClip && <SelectionHint />}<div className="filter-grid">{filters.map((filter) => <button key={filter} disabled={!props.selectedClip} className={props.selectedClip?.style.filter === filter ? "active" : ""} onClick={() => props.selectedClip && props.onUpdateClip({ style: { ...props.selectedClip.style, filter } })}><span className={filter} /><strong>{filter}</strong></button>)}</div>
  </PanelShell>;

  if (props.activeTool === "adjustments") {
    const fields: { key: "brightness" | "contrast" | "saturation" | "blur"; min: number; max: number; unit: string }[] = [{ key: "brightness", min: 0, max: 200, unit: "%" }, { key: "contrast", min: 0, max: 200, unit: "%" }, { key: "saturation", min: 0, max: 200, unit: "%" }, { key: "blur", min: 0, max: 20, unit: "px" }];
    const selected = props.selectedClip;
    return <PanelShell title="Adjustments" eyebrow="Fine tune" icon={<WandSparkles size={17} />}>{!selected ? <SelectionHint /> : <div className="adjustment-list">{fields.map(({ key, min, max, unit }) => <div className="range-control" key={key}><label><span>{key}</span><output>{selected.style[key]}{unit}</output></label><input type="range" min={min} max={max} value={selected.style[key]} onChange={(event) => props.onUpdateClip({ style: { ...selected.style, [key]: Number(event.target.value) } })} /></div>)}<button className="secondary-action" onClick={() => props.onUpdateClip({ style: { ...selected.style, brightness: 100, contrast: 100, saturation: 100, blur: 0 } })}>Reset adjustments</button></div>}</PanelShell>;
  }

  return <PanelShell title="Templates" eyebrow="Quick layouts" icon={<Layers3 size={17} />}>
    <div className="template-list"><button onClick={() => props.onCreateLayer({ kind: "text", label: "Cinematic title", content: "A STORY WORTH TELLING", duration: 5, style: { fontSize: 44, fontWeight: 800, y: 46 } })}><span className="template-preview cinematic">A STORY<br />WORTH TELLING</span><div><strong>Cinematic title</strong><small>Add editable text layer</small></div></button><button onClick={() => props.onCreateLayer({ kind: "text", label: "Creator lower third", content: "YOUR NAME  •  CREATOR", duration: 5, style: { fontSize: 22, fontWeight: 800, y: 80, backgroundColor: "#8b5cf6" } })}><span className="template-preview lower-third">YOUR NAME</span><div><strong>Creator lower third</strong><small>Add editable text layer</small></div></button></div>
  </PanelShell>;
}
