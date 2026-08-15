"use client";

import { useCallback, useMemo, useReducer, useState } from "react";
import type { MediaAsset, TimelineTrack } from "@/types/editor";
import { initialProject, projectReducer } from "@/editor/project-state";
import { useMediaImport } from "@/hooks/useMediaImport";
import { Inspector } from "./Inspector";
import { PreviewCanvas } from "./PreviewCanvas";
import { Timeline } from "./Timeline";
import { ToolPanel } from "./ToolPanel";
import { ToolSidebar, type ToolId } from "./ToolSidebar";
import { TopBar } from "./TopBar";

export function EditorShell() {
  const [project, dispatch] = useReducer(projectReducer, initialProject);
  const [activeTool, setActiveTool] = useState<ToolId>("media");
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);

  const handleImported = useCallback((assets: MediaAsset[]) => dispatch({ type: "add-assets", assets }), []);
  const mediaImport = useMediaImport(handleImported);

  const allClips = useMemo(() => project.tracks.flatMap((track) => track.clips), [project.tracks]);
  const duration = useMemo(() => Math.max(0, ...allClips.map((clip) => clip.start + clip.duration)), [allClips]);
  const activeClip = useMemo(() => {
    const atPlayhead = [...allClips].reverse().find((clip) => currentTime >= clip.start && currentTime <= clip.start + clip.duration);
    return atPlayhead ?? allClips.find((clip) => clip.id === selectedClipId);
  }, [allClips, currentTime, selectedClipId]);
  const activeAsset = project.assets.find((asset) => asset.id === activeClip?.assetId);

  const addAssetToTrack = useCallback((asset: MediaAsset, requestedTrack?: TimelineTrack, at = currentTime) => {
    const compatible = requestedTrack && (asset.kind === "audio" ? requestedTrack.kind === "audio" : requestedTrack.kind !== "audio");
    const track = compatible ? requestedTrack : project.tracks.find((item) => asset.kind === "audio" ? item.kind === "audio" : item.kind === "video");
    if (!track) return;
    const id = crypto.randomUUID();
    dispatch({ type: "add-clip", clip: { id, assetId: asset.id, trackId: track.id, start: at, duration: Math.max(.1, asset.duration || 5), sourceStart: 0 } });
    setSelectedClipId(id);
    setCurrentTime(at);
  }, [currentTime, project.tracks]);

  return (
    <main className="editor-shell">
      <TopBar project={project} onNameChange={(name) => dispatch({ type: "set-name", name })} onAspectRatioChange={(value) => dispatch({ type: "set-aspect-ratio", value })} onResolutionChange={(value) => dispatch({ type: "set-resolution", value })} />
      <div className="editor-workspace">
        <ToolSidebar active={activeTool} onChange={setActiveTool} />
        <ToolPanel activeTool={activeTool} assets={project.assets} {...mediaImport} onAddToTimeline={(asset) => addAssetToTrack(asset)} />
        <PreviewCanvas asset={activeAsset} clip={activeClip} currentTime={currentTime} duration={duration} isPlaying={isPlaying} aspectRatio={project.aspectRatio} onPlayingChange={setIsPlaying} onTimeChange={(time) => setCurrentTime(Math.min(duration, Math.max(0, time)))} />
        <Inspector asset={activeAsset} />
      </div>
      <Timeline tracks={project.tracks} assets={project.assets} duration={duration} currentTime={currentTime} zoom={timelineZoom} selectedClipId={selectedClipId} onZoomChange={setTimelineZoom} onSeek={(time) => { setCurrentTime(Math.min(duration, Math.max(0, time))); setIsPlaying(false); }} onSelectClip={setSelectedClipId} onDropAsset={(assetId, trackId, time) => { const asset = project.assets.find((item) => item.id === assetId); const track = project.tracks.find((item) => item.id === trackId); if (asset && track) addAssetToTrack(asset, track, time); }} />
    </main>
  );
}

