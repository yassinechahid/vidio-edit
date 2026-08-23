"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MediaAsset, TimelineTrack } from "@/types/editor";
import { defaultClipStyle } from "@/editor/clip-style";
import { useMediaImport } from "@/hooks/useMediaImport";
import { useEditorHistory } from "@/hooks/useEditorHistory";
import { loadActiveTool, loadPersistedProject, loadSelectedClipId, saveActiveTool, saveProjectMetadata, saveSelectedClipId } from "@/editor/persistence";
import { extendLoopingAudioToVideoEnd, rippleDeleteRange } from "@/utils/timeline-operations";
import { Inspector } from "./Inspector";
import { MusicVideoStudio } from "./MusicVideoStudio";
import { PreviewCanvas } from "./PreviewCanvas";
import { Timeline } from "./Timeline";
import { ToolPanel, type LayerDraft } from "./ToolPanel";
import { ToolSidebar, tools, type ToolId } from "./ToolSidebar";
import { TopBar } from "./TopBar";

export function EditorShell() {
  const { project, dispatch, undo, redo, restore, canUndo, canRedo } = useEditorHistory();
  const [activeTool, setActiveTool] = useState<ToolId>("media");
  const [toolHydrated, setToolHydrated] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [rangeIn, setRangeIn] = useState<number | null>(null);
  const [rangeOut, setRangeOut] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "unsaved">("saving");
  const restoredUrls = useRef<string[]>([]);

  const handleImported = useCallback((assets: MediaAsset[]) => dispatch({ type: "add-assets", assets }), [dispatch]);
  const mediaImport = useMediaImport(handleImported);

  useEffect(() => {
    const storedTool = loadActiveTool();
    if (storedTool && tools.some((tool) => tool.id === storedTool)) setActiveTool(storedTool as ToolId);
    setToolHydrated(true);
  }, []);

  useEffect(() => {
    if (toolHydrated) saveActiveTool(activeTool);
  }, [activeTool, toolHydrated]);

  useEffect(() => {
    let cancelled = false;
    void loadPersistedProject().then((storedProject) => {
      if (cancelled) {
        storedProject?.assets.forEach((asset) => URL.revokeObjectURL(asset.url));
        return;
      }
      if (storedProject) {
        restoredUrls.current = storedProject.assets.map((asset) => asset.url);
        restore(storedProject);
        const storedSelection = loadSelectedClipId();
        const selected = storedProject.tracks.flatMap((track) => track.clips).find((clip) => clip.id === storedSelection);
        if (selected) {
          setSelectedClipId(selected.id);
          setCurrentTime(selected.start);
        }
      }
      setIsHydrated(true);
      setSaveStatus("saved");
    }).catch(() => {
      setIsHydrated(true);
      setSaveStatus("unsaved");
    });
    return () => {
      cancelled = true;
      restoredUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [restore]);

  useEffect(() => {
    if (!isHydrated) return;
    setSaveStatus("unsaved");
    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      try {
        saveProjectMetadata(project);
        setSaveStatus("saved");
      } catch {
        setSaveStatus("unsaved");
      }
    }, 450);
    const saveBeforeExit = () => {
      try { saveProjectMetadata(project); } catch { /* Keep the last successful save. */ }
    };
    window.addEventListener("pagehide", saveBeforeExit);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", saveBeforeExit);
    };
  }, [isHydrated, project]);

  useEffect(() => {
    if (isHydrated) saveSelectedClipId(selectedClipId);
  }, [isHydrated, selectedClipId]);

  useEffect(() => {
    const handleHistoryShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", handleHistoryShortcut);
    return () => window.removeEventListener("keydown", handleHistoryShortcut);
  }, [redo, undo]);

  const allClips = useMemo(() => project.tracks.flatMap((track) => track.clips), [project.tracks]);
  const selectedClip = allClips.find((clip) => clip.id === selectedClipId);
  const duration = useMemo(() => Math.max(0, ...allClips.map((clip) => clip.start + clip.duration)), [allClips]);
  const selectedAsset = project.assets.find((asset) => asset.id === selectedClip?.assetId);
  const activeMediaClip = useMemo(() => {
    const timed = [...allClips].reverse().find((clip) => clip.kind === "media" && project.assets.find((asset) => asset.id === clip.assetId)?.kind !== "audio" && currentTime >= clip.start && currentTime <= clip.start + clip.duration);
    if (timed) return timed;
    return selectedClip?.kind === "media" ? selectedClip : undefined;
  }, [allClips, currentTime, project.assets, selectedClip]);
  const activeMediaAsset = project.assets.find((asset) => asset.id === activeMediaClip?.assetId);
  const audioTracks = allClips.flatMap((clip) => {
    const asset = project.assets.find((item) => item.id === clip.assetId);
    return asset?.kind === "audio" && clip.id !== activeMediaClip?.id ? [{ clip, asset }] : [];
  });
  const visibleLayers = allClips.filter((clip) => clip.kind !== "media" && currentTime >= clip.start && currentTime <= clip.start + clip.duration);

  useEffect(() => {
    const extendedTracks = extendLoopingAudioToVideoEnd(project.tracks, project.assets);
    if (extendedTracks !== project.tracks) dispatch({ type: "replace-tracks", tracks: extendedTracks });
  }, [dispatch, project.assets, project.tracks]);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClipId) return;
    dispatch({ type: "delete-clip", clipId: selectedClipId });
    setSelectedClipId(null);
    setIsPlaying(false);
  }, [dispatch, selectedClipId]);

  const removeMarkedRange = useCallback(() => {
    if (rangeIn === null || rangeOut === null || Math.abs(rangeOut - rangeIn) < 1 / 30) return;
    const start = Math.min(rangeIn, rangeOut);
    dispatch({ type: "replace-tracks", tracks: rippleDeleteRange(project.tracks, rangeIn, rangeOut) });
    setCurrentTime(start);
    setRangeIn(null);
    setRangeOut(null);
    setSelectedClipId(null);
    setIsPlaying(false);
  }, [dispatch, project.tracks, rangeIn, rangeOut]);

  useEffect(() => {
    const handleDeleteShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      event.preventDefault();
      deleteSelectedClip();
    };
    window.addEventListener("keydown", handleDeleteShortcut);
    return () => window.removeEventListener("keydown", handleDeleteShortcut);
  }, [deleteSelectedClip]);

  useEffect(() => {
    if (!isPlaying || activeMediaAsset?.kind !== "image") return;
    const timer = window.setInterval(() => {
      setCurrentTime((time) => {
        const next = Math.min(duration, time + .033);
        if (next >= duration) setIsPlaying(false);
        return next;
      });
    }, 33);
    return () => window.clearInterval(timer);
  }, [activeMediaAsset?.kind, duration, isPlaying]);

  const addAssetToTrack = useCallback((asset: MediaAsset, requestedTrack?: TimelineTrack, at = currentTime) => {
    const compatible = requestedTrack && (asset.kind === "audio" ? requestedTrack.kind === "audio" : requestedTrack.kind !== "audio");
    const track = compatible ? requestedTrack : project.tracks.find((item) => asset.kind === "audio" ? item.kind === "audio" : item.kind === "video");
    if (!track) return;
    const id = crypto.randomUUID();
    const visualEnd = Math.max(0, ...project.tracks.flatMap((item) => item.clips).map((clip) => project.assets.find((media) => media.id === clip.assetId)?.kind !== "audio" ? clip.start + clip.duration : 0));
    const clipDuration = asset.kind === "audio" && visualEnd > at ? Math.max(asset.duration, visualEnd - at) : Math.max(.1, asset.duration || 5);
    dispatch({ type: "add-clip", clip: { id, assetId: asset.id, trackId: track.id, start: at, duration: clipDuration, sourceStart: 0, kind: "media", label: asset.name, loop: asset.kind === "audio", style: { ...defaultClipStyle }, transition: { type: "none", duration: .5 } } });
    setSelectedClipId(id);
    setCurrentTime(at);
  }, [currentTime, dispatch, project.assets, project.tracks]);

  const createLayer = useCallback((draft: LayerDraft) => {
    const id = crypto.randomUUID();
    dispatch({ type: "add-clip", clip: { id, trackId: "overlay-1", start: currentTime, duration: draft.duration ?? 5, sourceStart: 0, kind: draft.kind, label: draft.label, content: draft.content, shape: draft.shape, style: { ...defaultClipStyle, ...draft.style }, transition: { type: "none", duration: .5 } } });
    setSelectedClipId(id);
  }, [currentTime, dispatch]);

  return (
    <main className={`editor-shell p-4 ${activeTool === "music-video" ? "music-video-mode" : ""}`} dir="ltr">
      <TopBar project={project} saveStatus={saveStatus} canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo} onNameChange={(name) => dispatch({ type: "set-name", name })} onAspectRatioChange={(value) => dispatch({ type: "set-aspect-ratio", value })} onResolutionChange={(value) => dispatch({ type: "set-resolution", value })} />
      <div className="editor-workspace">
        <ToolSidebar active={activeTool} onChange={setActiveTool} />
        {activeTool === "music-video" ? <MusicVideoStudio /> : <>
          <ToolPanel activeTool={activeTool} assets={project.assets} {...mediaImport} selectedClip={selectedClip} onAddToTimeline={(asset) => addAssetToTrack(asset)} onCreateLayer={createLayer} onUpdateClip={(changes) => selectedClipId && dispatch({ type: "update-clip", clipId: selectedClipId, changes })} />
          <PreviewCanvas asset={activeMediaAsset} clip={activeMediaClip} audioTracks={audioTracks} layers={visibleLayers} selectedClipId={selectedClipId} currentTime={currentTime} duration={duration} isPlaying={isPlaying} aspectRatio={project.aspectRatio} onPlayingChange={setIsPlaying} onTimeChange={(time) => setCurrentTime(Math.min(duration, Math.max(0, time)))} onSelectLayer={setSelectedClipId} onUpdateLayer={(clipId, changes) => dispatch({ type: "update-clip", clipId, changes })} />
          <Inspector asset={selectedAsset} clip={selectedClip} onUpdate={(changes) => selectedClipId && dispatch({ type: "update-clip", clipId: selectedClipId, changes })} />
        </>}
      </div>
      {activeTool !== "music-video" && <Timeline tracks={project.tracks} assets={project.assets} duration={duration} currentTime={currentTime} zoom={timelineZoom} selectedClipId={selectedClipId} rangeIn={rangeIn} rangeOut={rangeOut} onZoomChange={setTimelineZoom} onSeek={(time) => { setCurrentTime(Math.min(duration, Math.max(0, time))); setIsPlaying(false); }} onSelectClip={setSelectedClipId} onDeleteSelected={deleteSelectedClip} onSetRangeIn={() => setRangeIn(currentTime)} onSetRangeOut={() => setRangeOut(currentTime)} onRippleDelete={removeMarkedRange} onTrimClip={(clipId, changes) => dispatch({ type: "update-clip", clipId, changes })} onDropAsset={(assetId, trackId, time) => { const asset = project.assets.find((item) => item.id === assetId); const track = project.tracks.find((item) => item.id === trackId); if (asset && track) addAssetToTrack(asset, track, time); }} />}
    </main>
  );
}
