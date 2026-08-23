"use client";

import { AudioWaveform, Captions, Circle, Clapperboard, Image, Layers3, Music2, SlidersHorizontal, Sparkles, Sticker, Type, WandSparkles } from "lucide-react";

export const tools = [
  { id: "media", label: "Media", icon: Image }, { id: "audio", label: "Audio", icon: Music2 },
  { id: "music-video", label: "Music video", icon: AudioWaveform },
  { id: "text", label: "Text", icon: Type }, { id: "captions", label: "Captions", icon: Captions },
  { id: "stickers", label: "Stickers", icon: Sticker }, { id: "shapes", label: "Shapes", icon: Circle },
  { id: "transitions", label: "Transitions", icon: Clapperboard }, { id: "effects", label: "Effects", icon: Sparkles },
  { id: "filters", label: "Filters", icon: WandSparkles }, { id: "adjustments", label: "Adjust", icon: SlidersHorizontal },
  { id: "templates", label: "Templates", icon: Layers3 },
] as const;

export type ToolId = typeof tools[number]["id"];

export function ToolSidebar({ active, onChange }: { active: ToolId; onChange: (tool: ToolId) => void }) {
  return (
    <nav className="tool-sidebar" aria-label="Editor tools">
      {tools.map(({ id, label, icon: Icon }) => (
        <button key={id} className={active === id ? "active" : ""} onClick={() => onChange(id)} aria-pressed={active === id}>
          <Icon size={18} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
