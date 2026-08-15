"use client";

import { ChevronDown, Cloud, Download, Redo2, Undo2, Video } from "lucide-react";
import type { EditorProject } from "@/types/editor";

interface TopBarProps {
  project: EditorProject;
  saveStatus: "saving" | "saved" | "unsaved";
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNameChange: (value: string) => void;
  onAspectRatioChange: (value: EditorProject["aspectRatio"]) => void;
  onResolutionChange: (value: EditorProject["resolution"]) => void;
}

export function TopBar({ project, saveStatus, canUndo, canRedo, onUndo, onRedo, onNameChange, onAspectRatioChange, onResolutionChange }: TopBarProps) {
  return (
    <header className="editor-topbar">
      <div className="editor-brand"><span><Video size={17} /></span><strong>Framecraft</strong></div>
      <div className="project-title-wrap">
        <input aria-label="Project name" value={project.name} onChange={(event) => onNameChange(event.target.value)} />
        <span className={`save-status ${saveStatus}`}><Cloud size={12} /> {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved locally" : "Unsaved changes"}</span>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Undo" disabled={!canUndo} title="Undo (Ctrl/Cmd + Z)" onClick={onUndo}><Undo2 size={17} /></button>
        <button className="icon-button" aria-label="Redo" disabled={!canRedo} title="Redo (Ctrl/Cmd + Shift + Z)" onClick={onRedo}><Redo2 size={17} /></button>
        <label className="compact-select">
          <span className="sr-only">Aspect ratio</span>
          <select value={project.aspectRatio} onChange={(event) => onAspectRatioChange(event.target.value as EditorProject["aspectRatio"])}>
            {(["16:9", "9:16", "1:1", "4:5", "21:9"] as const).map((value) => <option key={value}>{value}</option>)}
          </select><ChevronDown size={13} />
        </label>
        <label className="compact-select resolution-select">
          <span className="sr-only">Resolution</span>
          <select value={project.resolution} onChange={(event) => onResolutionChange(event.target.value as EditorProject["resolution"])}>
            {(["720p", "1080p", "1440p", "4K"] as const).map((value) => <option key={value}>{value}</option>)}
          </select><ChevronDown size={13} />
        </label>
        <button className="export-button" title="Export pipeline is planned for Phase 4" disabled><Download size={15} /> <span>Export</span></button>
      </div>
    </header>
  );
}
