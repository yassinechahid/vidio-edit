"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioWaveform, Check, Download, FileAudio2, Music2, Pause, Play, UploadCloud, Volume2 } from "lucide-react";
import { formatTime } from "@/utils/time";

const ASPECT_RATIOS = {
  "16:9": { width: 1920, height: 1080, label: "Landscape" },
  "9:16": { width: 1080, height: 1920, label: "Vertical" },
  "1:1": { width: 1080, height: 1080, label: "Square" },
  "4:5": { width: 1080, height: 1350, label: "Portrait" },
} as const;

const TEMPLATES = [
  { id: "andromeda", label: "Andromeda", note: "Hubble galaxy", background: ["#02040b", "#081329", "#160d2c"], accent: "#9cb5ff", secondary: "#d6b8ff", backgroundImage: "/assets/music-visualizer/ngc-5335.jpg", position: [0.5, 0.48], filter: "brightness(.68) contrast(1.12) saturate(.88)", credit: "NASA / ESA / STScI" },
  { id: "blue-hour", label: "Blue Hour", note: "Webb + Hubble", background: ["#02050a", "#061b34", "#0a3150"], accent: "#7cd4ff", secondary: "#d6f3ff", backgroundImage: "/assets/music-visualizer/galaxy-pair.png", position: [0.68, 0.48], filter: "brightness(.56) contrast(1.16) saturate(.72) hue-rotate(12deg)", credit: "NASA / ESA / CSA / STScI" },
  { id: "aurora", label: "Aurora", note: "NGC 3603", background: ["#010807", "#06231d", "#07182d"], accent: "#79efc5", secondary: "#85d7ff", backgroundImage: "/assets/music-visualizer/ngc-3603.png", position: [0.52, 0.46], filter: "brightness(.62) contrast(1.13) saturate(.78) hue-rotate(22deg)", credit: "NASA / ESA / STScI" },
  { id: "cosmic-rose", label: "Cosmic Rose", note: "Orion Nebula", background: ["#09030a", "#2a0b25", "#130d2d"], accent: "#ff9bd3", secondary: "#e0c2ff", backgroundImage: "/assets/music-visualizer/orion.jpg", position: [0.38, 0.52], filter: "brightness(.58) contrast(1.13) saturate(.82)", credit: "NASA / ESA / STScI" },
  { id: "lunar", label: "Lunar Dust", note: "Monochrome galaxy", background: ["#030405", "#12151a", "#080b11"], accent: "#f1f4f7", secondary: "#aeb8c5", backgroundImage: "/assets/music-visualizer/ngc-5335.jpg", position: [0.5, 0.5], filter: "grayscale(1) brightness(.6) contrast(1.2)", credit: "NASA / ESA / STScI" },
  { id: "violet-void", label: "Violet Void", note: "Orion detail", background: ["#04020a", "#170c30", "#0a1730"], accent: "#c4a9ff", secondary: "#8be5ff", backgroundImage: "/assets/music-visualizer/orion.jpg", position: [0.72, 0.44], filter: "brightness(.5) contrast(1.2) saturate(.7) hue-rotate(26deg)", credit: "NASA / ESA / STScI" },
  { id: "red-dwarf", label: "Red Dwarf", note: "Interacting galaxies", background: ["#080302", "#2c0d0b", "#180817"], accent: "#ffab82", secondary: "#ffe0a8", backgroundImage: "/assets/music-visualizer/galaxy-pair.png", position: [0.47, 0.52], filter: "brightness(.62) contrast(1.12) saturate(.9)", credit: "NASA / ESA / CSA / STScI" },
  { id: "midnight", label: "Midnight", note: "Deep galaxy field", background: ["#01030a", "#071126", "#020817"], accent: "#f4f7ff", secondary: "#8299ff", backgroundImage: "/assets/music-visualizer/ngc-5335.jpg", position: [0.5, 0.38], filter: "brightness(.48) contrast(1.22) saturate(.72) hue-rotate(8deg)", credit: "NASA / ESA / STScI" },
  { id: "neptune", label: "Neptune", note: "Stellar nursery", background: ["#010509", "#03223a", "#071431"], accent: "#6eeaf0", secondary: "#8ca6ff", backgroundImage: "/assets/music-visualizer/ngc-3603.png", position: [0.34, 0.5], filter: "brightness(.52) contrast(1.16) saturate(.66) hue-rotate(34deg)", credit: "NASA / ESA / STScI" },
  { id: "solar-veil", label: "Solar Veil", note: "Orion starlight", background: ["#060503", "#211a0d", "#11101b"], accent: "#f3d28b", secondary: "#d2c7ff", backgroundImage: "/assets/music-visualizer/orion.jpg", position: [0.5, 0.56], filter: "brightness(.58) contrast(1.12) saturate(.55) sepia(.18)", credit: "NASA / ESA / STScI" },
] as const;

type AspectRatio = keyof typeof ASPECT_RATIOS;
type TemplateId = typeof TEMPLATES[number]["id"];
type ExportState = "idle" | "rendering" | "downloaded" | "error";

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function safeBaseName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "music-visualizer";
}

export function MusicVideoStudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const recordingDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [templateId, setTemplateId] = useState<TemplateId>("andromeda");
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [error, setError] = useState<string | null>(null);

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) throw new Error("Choose an audio file first.");
    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      const recordingDestination = context.createMediaStreamDestination();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.32;
      source.connect(analyser);
      analyser.connect(context.destination);
      analyser.connect(recordingDestination);
      audioContextRef.current = context;
      mediaSourceRef.current = source;
      analyserRef.current = analyser;
      recordingDestinationRef.current = recordingDestination;
    }
    if (audioContextRef.current.state === "suspended") await audioContextRef.current.resume();
    return recordingDestinationRef.current;
  }, []);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    audioRef.current?.pause();
    mediaSourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    recordingDestinationRef.current?.disconnect();
    void audioContextRef.current?.close();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = ASPECT_RATIOS[aspectRatio];
    const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const frequencyData = new Uint8Array(512);
    const timeData = new Uint8Array(1024);
    const spectrumLevels = new Float32Array(96);
    const spectrumTargets = new Float32Array(96);
    const backgroundCanvas = document.createElement("canvas");
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    const backgroundContext = backgroundCanvas.getContext("2d", { alpha: false });
    if (!backgroundContext) return;
    const backgroundImage = new Image();
    let imageReady = false;
    let cancelled = false;
    setBackgroundReady(false);

    const drawImageCover = (target: CanvasRenderingContext2D) => {
      const imageWidth = backgroundImage.naturalWidth;
      const imageHeight = backgroundImage.naturalHeight;
      const scale = Math.max(width / imageWidth, height / imageHeight);
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      const sourceX = Math.max(0, (imageWidth - sourceWidth) * template.position[0]);
      const sourceY = Math.max(0, (imageHeight - sourceHeight) * template.position[1]);
      target.save();
      target.filter = template.filter;
      target.drawImage(backgroundImage, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, width, height);
      target.restore();
    };

    const renderCachedBackground = () => {
      const background = backgroundContext.createLinearGradient(0, 0, width, height);
      background.addColorStop(0, template.background[0]);
      background.addColorStop(0.48, template.background[1]);
      background.addColorStop(1, template.background[2]);
      backgroundContext.fillStyle = background;
      backgroundContext.fillRect(0, 0, width, height);
      if (imageReady) drawImageCover(backgroundContext);

      const shade = backgroundContext.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, "rgba(1, 3, 10, .48)");
      shade.addColorStop(0.48, "rgba(1, 3, 10, .18)");
      shade.addColorStop(1, "rgba(1, 3, 10, .68)");
      backgroundContext.fillStyle = shade;
      backgroundContext.fillRect(0, 0, width, height);
      const vignette = backgroundContext.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.18, width / 2, height / 2, Math.max(width, height) * 0.7);
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0, 0, 0, .48)");
      backgroundContext.fillStyle = vignette;
      backgroundContext.fillRect(0, 0, width, height);
    };

    renderCachedBackground();
    backgroundImage.onload = () => {
      imageReady = true;
      renderCachedBackground();
      if (!cancelled) setBackgroundReady(true);
    };
    backgroundImage.src = template.backgroundImage;

    const draw = () => {
      const analyser = analyserRef.current;
      const audio = audioRef.current;
      if (analyser) {
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(timeData);
      } else {
        frequencyData.fill(0);
        timeData.fill(128);
      }
      context.drawImage(backgroundCanvas, 0, 0);

      const audioIsActive = Boolean(audio && !audio.paused && !audio.ended && audio.currentTime > 0);
      if (audioIsActive && analyser) {
        const barCount = aspectRatio === "9:16" ? 64 : 96;
        const graphWidth = width * (aspectRatio === "9:16" ? 0.82 : 0.76);
        const startX = (width - graphWidth) / 2;
        const gap = graphWidth * 0.0042;
        const barWidth = Math.max(2, (graphWidth - gap * (barCount - 1)) / barCount);
        const baseline = height * 0.57;
        const maxHeight = height * (aspectRatio === "9:16" ? 0.15 : 0.18);
        const spectrumGradient = context.createLinearGradient(0, baseline - maxHeight, 0, baseline + maxHeight);
        spectrumGradient.addColorStop(0, withAlpha(template.secondary, 0.92));
        spectrumGradient.addColorStop(0.5, "rgba(255,255,255,.96)");
        spectrumGradient.addColorStop(1, withAlpha(template.accent, 0.92));
        context.globalCompositeOperation = "screen";
        context.fillStyle = spectrumGradient;
        context.shadowBlur = 0;

        let frameFloor = Number.POSITIVE_INFINITY;
        let framePeak = 0;
        for (let index = 0; index < barCount; index += 1) {
          const sourceIndex = Math.min(frequencyData.length - 1, Math.floor((index / barCount) ** 1.65 * frequencyData.length * 0.72));
          const frequencyStart = Math.max(0, sourceIndex - 2);
          const frequencyEnd = Math.min(frequencyData.length - 1, sourceIndex + 2);
          let frequencyTotal = 0;
          for (let frequencyIndex = frequencyStart; frequencyIndex <= frequencyEnd; frequencyIndex += 1) {
            frequencyTotal += frequencyData[frequencyIndex];
          }
          const frequencyAverage = frequencyTotal / (frequencyEnd - frequencyStart + 1);
          const frequencyLevel = Math.max(0, (frequencyAverage - 8) / 247);

          const sampleStart = Math.floor((index / barCount) * timeData.length);
          const sampleEnd = Math.max(sampleStart + 1, Math.floor(((index + 1) / barCount) * timeData.length));
          let squaredAmplitude = 0;
          for (let sampleIndex = sampleStart; sampleIndex < sampleEnd; sampleIndex += 1) {
            const amplitude = (timeData[sampleIndex] - 128) / 128;
            squaredAmplitude += amplitude * amplitude;
          }
          const waveformLevel = Math.sqrt(squaredAmplitude / (sampleEnd - sampleStart));
          const rawLevel = waveformLevel * 0.78 + Math.pow(frequencyLevel, 0.82) * 0.52;
          spectrumTargets[index] = rawLevel;
          frameFloor = Math.min(frameFloor, rawLevel);
          framePeak = Math.max(framePeak, rawLevel);
        }

        const frameRange = Math.max(0.035, framePeak - frameFloor);
        const frameStrength = Math.min(1, framePeak * 1.7);
        for (let index = 0; index < barCount; index += 1) {
          const contrastedLevel = Math.max(0, (spectrumTargets[index] - frameFloor) / frameRange);
          const target = Math.min(1, Math.pow(contrastedLevel, 1.28) * frameStrength);
          const speed = target > spectrumLevels[index] ? 0.82 : 0.28;
          spectrumLevels[index] += (target - spectrumLevels[index]) * speed;
          const edgeShape = 0.78 + Math.sin(((index + 0.5) / barCount) * Math.PI) * 0.22;
          const barHeight = Math.max(height * 0.004, spectrumLevels[index] * maxHeight * edgeShape);
          const x = startX + index * (barWidth + gap);
          context.beginPath();
          context.roundRect(x, baseline - barHeight, barWidth, barHeight * 2, barWidth / 2);
          context.fill();
        }
      } else {
        spectrumLevels.fill(0);
        spectrumTargets.fill(0);
      }

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      const side = width * 0.075;
      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.96)";
      context.font = `650 ${Math.round(Math.min(width, height) * 0.04)}px Inter, Arial, sans-serif`;
      const title = fileName ? fileName.replace(/\.[^.]+$/, "") : "YOUR MUSIC";
      context.fillText(title.slice(0, 46), side, height * 0.16);
      context.fillStyle = withAlpha(template.accent, 0.86);
      context.font = `700 ${Math.round(Math.min(width, height) * 0.012)}px Inter, Arial, sans-serif`;
      context.fillText(`${template.label.toUpperCase()}  /  AUDIO VISUAL`, side, height * 0.205);

      const progress = audio && Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration : 0;
      const progressX = side;
      const progressY = height * 0.82;
      const progressWidth = width - side * 2;
      context.fillStyle = "rgba(255,255,255,.13)";
      context.fillRect(progressX, progressY, progressWidth, Math.max(3, height * 0.0026));
      context.fillStyle = template.accent;
      context.fillRect(progressX, progressY, progressWidth * progress, Math.max(3, height * 0.0026));
      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.62)";
      context.font = `500 ${Math.round(Math.min(width, height) * 0.011)}px ui-monospace, monospace`;
      context.fillText(formatTime(audio?.currentTime ?? 0), progressX, progressY + height * 0.035);
      context.textAlign = "right";
      context.fillText(formatTime(Number.isFinite(audio?.duration) ? audio?.duration ?? 0 : 0), progressX + progressWidth, progressY + height * 0.035);

      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.38)";
      context.font = `600 ${Math.round(Math.min(width, height) * 0.0095)}px Inter, Arial, sans-serif`;
      context.fillText("© 2026 YASSINE CHAHID. ALL RIGHTS RESERVED.", side, height * 0.93);
      context.textAlign = "right";
      context.fillStyle = "rgba(255,255,255,.34)";
      context.font = `550 ${Math.round(Math.min(width, height) * 0.008)}px Inter, Arial, sans-serif`;
      context.fillText(`BACKGROUND: ${template.credit}`, width - side, height * 0.905);
      context.fillStyle = "rgba(255,255,255,.7)";
      context.font = `700 ${Math.round(Math.min(width, height) * 0.0105)}px Inter, Arial, sans-serif`;
      context.fillText("YASSINE CHAHID", width - side, height * 0.93);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelled = true;
      backgroundImage.onload = null;
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [aspectRatio, audioUrl, fileName, templateId]);

  const chooseAudio = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please choose an MP3, WAV, M4A, or another browser-supported audio file.");
      return;
    }
    audioRef.current?.pause();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setAudioUrl(url); setFileName(file.name); setCurrentTime(0); setDuration(0); setIsPlaying(false); setExportState("idle"); setError(null);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audioUrl || !audio) { inputRef.current?.click(); return; }
    if (!audio.paused) { audio.pause(); return; }
    try {
      await ensureAudioGraph();
      await audio.play();
      setError(null);
    } catch { setError("This audio could not be played by the browser."); }
  };

  const exportVideo = async () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!audioUrl || !canvas || !audio || !Number.isFinite(duration) || duration <= 0) {
      setError("Choose a valid audio file before rendering the video."); return;
    }
    if (typeof MediaRecorder === "undefined" || typeof canvas.captureStream !== "function") {
      setError("Video recording is not supported in this browser. Use a current Chrome, Edge, or Firefox version."); setExportState("error"); return;
    }

    let canvasStream: MediaStream | null = null;
    try {
      setError(null); setExportState("rendering");
      const recordingDestination = await ensureAudioGraph();
      if (!recordingDestination) throw new Error("Audio recording is unavailable.");
      audio.pause(); audio.currentTime = 0;
      canvasStream = canvas.captureStream(30);
      const outputStream = new MediaStream([...canvasStream.getVideoTracks(), ...recordingDestination.stream.getAudioTracks()]);
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(outputStream, { ...(mimeType ? { mimeType } : {}), videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
      const finished = new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("The video recorder stopped unexpectedly."));
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
      });
      const songFinished = new Promise<void>((resolve, reject) => {
        audio.addEventListener("ended", () => resolve(), { once: true });
        audio.addEventListener("error", () => reject(new Error("The audio stopped during rendering.")), { once: true });
      });
      recorder.start(1000);
      await audio.play();
      await songFinished;
      recorder.stop();
      const video = await finished;
      const downloadUrl = URL.createObjectURL(video);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${safeBaseName(fileName)}-${aspectRatio.replace(":", "x")}.webm`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      setExportState("downloaded"); setIsPlaying(false);
    } catch (exportError) {
      audio.pause(); setIsPlaying(false); setExportState("error");
      setError(exportError instanceof Error ? exportError.message : "The video could not be rendered.");
    } finally { canvasStream?.getTracks().forEach((track) => track.stop()); }
  };

  const selectedRatio = ASPECT_RATIOS[aspectRatio];
  const isRendering = exportState === "rendering";

  return (
    <section className="music-video-studio" aria-labelledby="music-video-title">
      <header className="music-video-header">
        <div><span>Yassine Chahid presents</span><h1 id="music-video-title">Nightwave visualizer</h1><p>Real telescope photography and a studio-quality frequency spectrum—independent from the editor timeline.</p></div>
        <span className="studio-format"><AudioWaveform size={14} /> Live frequency spectrum</span>
      </header>
      <div className="music-video-layout">
        <aside className="music-video-controls">
          <input ref={inputRef} className="sr-only" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" onChange={(event) => chooseAudio(event.target.files?.[0])} />
          <button type="button" className="music-upload" onClick={() => inputRef.current?.click()} disabled={isRendering}><UploadCloud size={19} /><span><strong>{audioUrl ? "Replace music" : "Add your music"}</strong><small>MP3, WAV, M4A, AAC or OGG</small></span></button>
          <div className={`selected-song ${audioUrl ? "has-song" : ""}`}><span className="selected-song-icon"><FileAudio2 size={18} /></span><span><strong>{fileName || "No song selected"}</strong><small>{duration > 0 ? formatTime(duration) : "Choose a local audio file"}</small></span></div>

          <fieldset><legend>Aspect ratio</legend><div className="ratio-options">
            {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => <button type="button" key={ratio} className={aspectRatio === ratio ? "active" : ""} onClick={() => setAspectRatio(ratio)} disabled={isRendering}><span className={`ratio-shape ratio-${ratio.replace(":", "-")}`} /><strong>{ratio}</strong><small>{ASPECT_RATIOS[ratio].label}</small></button>)}
          </div></fieldset>
          <fieldset className="visualizer-templates"><legend><span>Night-sky templates</span><small>{TEMPLATES.length} curated looks</small></legend><div className="visualizer-template-grid">{TEMPLATES.map((template) => <button type="button" key={template.id} className={templateId === template.id ? "active" : ""} onClick={() => setTemplateId(template.id)} disabled={isRendering} aria-pressed={templateId === template.id}>
            <span className="visualizer-template-art" style={{ backgroundImage: `linear-gradient(rgba(2,4,12,.12), rgba(2,4,12,.58)), url(${template.backgroundImage})`, backgroundPosition: `${template.position[0] * 100}% ${template.position[1] * 100}%`, filter: template.filter }}><i style={{ background: `linear-gradient(90deg, ${template.accent}, ${template.secondary})` }} /></span>
            <span><strong>{template.label}</strong><small>{template.note}</small></span>{templateId === template.id && <Check size={12} />}
          </button>)}</div></fieldset>

          <div className="download-video-panel"><div><strong>Your video</strong><small>Full-resolution WebM · original audio · {aspectRatio}</small></div><button type="button" className="render-music-video" onClick={() => void exportVideo()} disabled={!audioUrl || isRendering || !backgroundReady}>{isRendering ? <AudioWaveform size={17} /> : <Download size={17} />}<span>{isRendering ? `Creating video — ${duration > 0 ? Math.min(100, Math.round(currentTime / duration * 100)) : 0}%` : !backgroundReady ? "Loading background…" : exportState === "downloaded" ? "Download video again" : "Download video (.WEBM)"}</span></button></div>
          <p className="render-note">The export records in real time so the waveform remains synchronized with every beat.</p>
          {error && <p className="music-video-error" role="alert">{error}</p>}
          {exportState === "downloaded" && !error && <p className="music-video-success" role="status"><Check size={13} /> Video downloaded successfully.</p>}
          <p className="studio-copyright">© 2026 Yassine Chahid. All rights reserved.</p>
        </aside>

        <div className="music-video-preview">
          <div className="music-canvas-wrap" style={{ aspectRatio: `${selectedRatio.width} / ${selectedRatio.height}` }}>
            <canvas ref={canvasRef} aria-label="Audio-reactive music video preview" />
            {!audioUrl && <div className="music-canvas-empty"><span><Music2 size={30} /></span><strong>Add a song to start</strong><small>The spectrum appears only during real music playback.</small></div>}
            {audioUrl && !isPlaying && !isRendering && <div className="spectrum-paused-hint"><Play size={11} fill="currentColor" /> Press play to reveal the audio spectrum</div>}
            {isRendering && <div className="rendering-badge"><AudioWaveform size={13} /> Recording video · {Math.min(100, Math.round(currentTime / duration * 100))}%</div>}
          </div>
          <audio ref={audioRef} src={audioUrl ?? undefined} preload="metadata" onLoadedMetadata={(event) => { setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0); setCurrentTime(0); }} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
          <div className="music-transport">
            <button type="button" className="music-play" onClick={() => void togglePlayback()} disabled={isRendering} aria-label={isPlaying ? "Pause music" : "Play music"}>{isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
            <span>{formatTime(currentTime)}</span>
            <input className="music-seek" aria-label="Seek music" type="range" min="0" max={Math.max(duration, 0.01)} step="0.01" value={Math.min(currentTime, Math.max(duration, 0.01))} disabled={!audioUrl || isRendering} onChange={(event) => { if (audioRef.current) { audioRef.current.currentTime = Number(event.target.value); setCurrentTime(Number(event.target.value)); } }} />
            <span>{formatTime(duration)}</span><Volume2 size={15} />
            <input className="music-volume" aria-label="Music volume" type="range" min="0" max="1" step="0.01" value={volume} disabled={isRendering} onChange={(event) => { const next = Number(event.target.value); setVolume(next); if (audioRef.current) audioRef.current.volume = next; }} />
          </div>
        </div>
      </div>
    </section>
  );
}
