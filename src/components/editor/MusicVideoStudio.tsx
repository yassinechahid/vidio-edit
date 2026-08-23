"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioWaveform,
  Check,
  Download,
  FileAudio2,
  Music2,
  Pause,
  Play,
  UploadCloud,
  Volume2,
} from "lucide-react";
import {
  loadMusicVideoAudio,
  loadMusicVideoSettings,
  saveMusicVideoAudio,
  saveMusicVideoSettings,
} from "@/editor/persistence";
import { formatTime } from "@/utils/time";

const ASPECT_RATIOS = {
  "16:9": { width: 1920, height: 1080, label: "Landscape" },
  "9:16": { width: 1080, height: 1920, label: "Vertical" },
  "1:1": { width: 1080, height: 1080, label: "Square" },
  "4:5": { width: 1080, height: 1350, label: "Portrait" },
} as const;

const TEMPLATES = [
  {
    id: "andromeda",
    label: "Andromeda",
    note: "Hubble galaxy",
    background: ["#02040b", "#081329", "#160d2c"],
    accent: "#9cb5ff",
    secondary: "#d6b8ff",
    backgroundImage: "/assets/music-visualizer/ngc-5335.jpg",
    position: [0.5, 0.48],
    filter: "brightness(.68) contrast(1.12) saturate(.88)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "blue-hour",
    label: "Blue Hour",
    note: "Webb + Hubble",
    background: ["#02050a", "#061b34", "#0a3150"],
    accent: "#7cd4ff",
    secondary: "#d6f3ff",
    backgroundImage: "/assets/music-visualizer/galaxy-pair.png",
    position: [0.68, 0.48],
    filter: "brightness(.56) contrast(1.16) saturate(.72) hue-rotate(12deg)",
    credit: "NASA / ESA / CSA / STScI",
  },
  {
    id: "aurora",
    label: "Aurora",
    note: "NGC 3603",
    background: ["#010807", "#06231d", "#07182d"],
    accent: "#79efc5",
    secondary: "#85d7ff",
    backgroundImage: "/assets/music-visualizer/ngc-3603.png",
    position: [0.52, 0.46],
    filter: "brightness(.62) contrast(1.13) saturate(.78) hue-rotate(22deg)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "cosmic-rose",
    label: "Cosmic Rose",
    note: "Orion Nebula",
    background: ["#09030a", "#2a0b25", "#130d2d"],
    accent: "#ff9bd3",
    secondary: "#e0c2ff",
    backgroundImage: "/assets/music-visualizer/orion.jpg",
    position: [0.38, 0.52],
    filter: "brightness(.58) contrast(1.13) saturate(.82)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "lunar",
    label: "Lunar Dust",
    note: "Monochrome galaxy",
    background: ["#030405", "#12151a", "#080b11"],
    accent: "#f1f4f7",
    secondary: "#aeb8c5",
    backgroundImage: "/assets/music-visualizer/ngc-5335.jpg",
    position: [0.5, 0.5],
    filter: "grayscale(1) brightness(.6) contrast(1.2)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "violet-void",
    label: "Violet Void",
    note: "Orion detail",
    background: ["#04020a", "#170c30", "#0a1730"],
    accent: "#c4a9ff",
    secondary: "#8be5ff",
    backgroundImage: "/assets/music-visualizer/orion.jpg",
    position: [0.72, 0.44],
    filter: "brightness(.5) contrast(1.2) saturate(.7) hue-rotate(26deg)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "red-dwarf",
    label: "Red Dwarf",
    note: "Interacting galaxies",
    background: ["#080302", "#2c0d0b", "#180817"],
    accent: "#ffab82",
    secondary: "#ffe0a8",
    backgroundImage: "/assets/music-visualizer/galaxy-pair.png",
    position: [0.47, 0.52],
    filter: "brightness(.62) contrast(1.12) saturate(.9)",
    credit: "NASA / ESA / CSA / STScI",
  },
  {
    id: "midnight",
    label: "Midnight",
    note: "Deep galaxy field",
    background: ["#01030a", "#071126", "#020817"],
    accent: "#f4f7ff",
    secondary: "#8299ff",
    backgroundImage: "/assets/music-visualizer/ngc-5335.jpg",
    position: [0.5, 0.38],
    filter: "brightness(.48) contrast(1.22) saturate(.72) hue-rotate(8deg)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "neptune",
    label: "Neptune",
    note: "Stellar nursery",
    background: ["#010509", "#03223a", "#071431"],
    accent: "#6eeaf0",
    secondary: "#8ca6ff",
    backgroundImage: "/assets/music-visualizer/ngc-3603.png",
    position: [0.34, 0.5],
    filter: "brightness(.52) contrast(1.16) saturate(.66) hue-rotate(34deg)",
    credit: "NASA / ESA / STScI",
  },
  {
    id: "solar-veil",
    label: "Solar Veil",
    note: "Orion starlight",
    background: ["#060503", "#211a0d", "#11101b"],
    accent: "#f3d28b",
    secondary: "#d2c7ff",
    backgroundImage: "/assets/music-visualizer/orion.jpg",
    position: [0.5, 0.56],
    filter: "brightness(.58) contrast(1.12) saturate(.55) sepia(.18)",
    credit: "NASA / ESA / STScI",
  },
] as const;

type AspectRatio = keyof typeof ASPECT_RATIOS;
type TemplateId = (typeof TEMPLATES)[number]["id"];
type ExportState = "idle" | "rendering" | "ready" | "downloaded" | "error";
type LocalSaveState = "restoring" | "saving" | "saved" | "error";

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function safeBaseName(name: string) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9-_]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "music-visualizer"
  );
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
  const recordingDestinationRef =
    useRef<MediaStreamAudioDestinationNode | null>(null);
  const playbackGainRef = useRef<GainNode | null>(null);
  const renderedVideoRef = useRef<Blob | null>(null);
  const volumeRef = useRef(0.85);
  const restoredTimeRef = useRef<number | null>(null);

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
  const [localSaveState, setLocalSaveState] =
    useState<LocalSaveState>("restoring");
  const [restoreComplete, setRestoreComplete] = useState(false);

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) throw new Error("Choose an audio file first.");
    if (!audioContextRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      const recordingDestination = context.createMediaStreamDestination();
      const playbackGain = context.createGain();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.32;
      source.connect(analyser);
      analyser.connect(playbackGain);
      playbackGain.connect(context.destination);
      analyser.connect(recordingDestination);
      audioContextRef.current = context;
      mediaSourceRef.current = source;
      analyserRef.current = analyser;
      recordingDestinationRef.current = recordingDestination;
      playbackGainRef.current = playbackGain;
    }
    if (audioContextRef.current.state === "suspended")
      await audioContextRef.current.resume();
    return recordingDestinationRef.current;
  }, []);

  useEffect(
    () => () => {
      if (animationFrameRef.current !== null)
        cancelAnimationFrame(animationFrameRef.current);
      audioRef.current?.pause();
      mediaSourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      recordingDestinationRef.current?.disconnect();
      playbackGainRef.current?.disconnect();
      void audioContextRef.current?.close();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const restoreMusicStudio = async () => {
      const settings = loadMusicVideoSettings();
      if (settings) {
        if (settings.aspectRatio in ASPECT_RATIOS)
          setAspectRatio(settings.aspectRatio as AspectRatio);
        if (TEMPLATES.some((template) => template.id === settings.templateId))
          setTemplateId(settings.templateId as TemplateId);
        const restoredVolume = Math.min(1, Math.max(0, settings.volume));
        setVolume(restoredVolume);
        volumeRef.current = restoredVolume;
        restoredTimeRef.current = Math.max(0, settings.currentTime);
      }
      try {
        const blob = await loadMusicVideoAudio();
        if (!cancelled && blob && settings?.fileName) {
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          setAudioUrl(url);
          setFileName(settings.fileName);
        }
        if (!cancelled) setLocalSaveState("saved");
      } catch {
        if (!cancelled) setLocalSaveState("error");
      } finally {
        if (!cancelled) setRestoreComplete(true);
      }
    };
    void restoreMusicStudio();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!restoreComplete) return;
    try {
      saveMusicVideoSettings({
        fileName,
        aspectRatio,
        templateId,
        volume,
        currentTime,
      });
    } catch {
      setLocalSaveState("error");
    }
  }, [aspectRatio, currentTime, fileName, restoreComplete, templateId, volume]);

  useEffect(() => {
    renderedVideoRef.current = null;
    setExportState((state) => (state === "rendering" ? state : "idle"));
  }, [aspectRatio, audioUrl, templateId]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = ASPECT_RATIOS[aspectRatio];
    const template =
      TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const frequencyData = new Uint8Array(512);
    const timeData = new Uint8Array(1024);
    const ecgLevels = new Float32Array(aspectRatio === "9:16" ? 360 : 520);
    const cycleEnergyLevels = new Float32Array(7);
    const backgroundCanvas = document.createElement("canvas");
    backgroundCanvas.width = width;
    backgroundCanvas.height = height;
    const backgroundContext = backgroundCanvas.getContext("2d", {
      alpha: false,
    });
    if (!backgroundContext) return;
    const backgroundImage = new Image();
    let imageReady = false;
    let cancelled = false;
    let musicLevel = 0;
    setBackgroundReady(false);

    const drawImageCover = (target: CanvasRenderingContext2D) => {
      const imageWidth = backgroundImage.naturalWidth;
      const imageHeight = backgroundImage.naturalHeight;
      const scale = Math.max(width / imageWidth, height / imageHeight);
      const sourceWidth = width / scale;
      const sourceHeight = height / scale;
      const sourceX = Math.max(
        0,
        (imageWidth - sourceWidth) * template.position[0],
      );
      const sourceY = Math.max(
        0,
        (imageHeight - sourceHeight) * template.position[1],
      );
      target.save();
      target.filter = template.filter;
      target.drawImage(
        backgroundImage,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height,
      );
      target.restore();
    };

    const renderCachedBackground = () => {
      const background = backgroundContext.createLinearGradient(
        0,
        0,
        width,
        height,
      );
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
      const vignette = backgroundContext.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.18,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7,
      );
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

    const gaussian = (value: number, center: number, spread: number) => {
      const distance = (value - center) / spread;
      return Math.exp(-0.5 * distance * distance);
    };

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

      const audioIsActive = Boolean(
        audio && !audio.paused && !audio.ended && audio.currentTime > 0,
      );
      if (audioIsActive && analyser) {
        const graphWidth = width * (aspectRatio === "9:16" ? 0.8 : 0.84);
        const startX = (width - graphWidth) / 2;
        const baseline = height * 0.57;
        const ecgHeight = height * (aspectRatio === "9:16" ? 0.14 : 0.2);
        let frameSquaredAmplitude = 0;
        for (let index = 0; index < timeData.length; index += 1) {
          const amplitude = (timeData[index] - 128) / 128;
          frameSquaredAmplitude += amplitude * amplitude;
        }
        const frameRms = Math.sqrt(frameSquaredAmplitude / timeData.length);
        const volumeResponse = Math.pow(volumeRef.current, 1.15);
        const energyTarget =
          Math.min(1, Math.max(0, (frameRms - 0.004) / 0.12)) * volumeResponse;
        const energySpeed = energyTarget > musicLevel ? 0.72 : 0.2;
        musicLevel += (energyTarget - musicLevel) * energySpeed;
        const cycleCount = aspectRatio === "9:16" ? 5 : 7;
        const middleCycle = Math.floor(cycleCount / 2);
        const frequencyBands =
          cycleCount === 5
            ? [
                [40, 180],
                [120, 700],
                [250, 3600],
                [900, 5000],
                [4000, 14000],
              ]
            : [
                [35, 140],
                [70, 300],
                [150, 900],
                [250, 3600],
                [700, 2600],
                [2200, 7000],
                [6000, 15000],
              ];
        const binFrequency = analyser.context.sampleRate / analyser.fftSize;
        const readBandEnergy = (
          minimumFrequency: number,
          maximumFrequency: number,
        ) => {
          const startBin = Math.max(
            1,
            Math.floor(minimumFrequency / binFrequency),
          );
          const endBin = Math.min(
            frequencyData.length - 1,
            Math.ceil(maximumFrequency / binFrequency),
          );
          let total = 0;
          let peak = 0;
          for (let bin = startBin; bin <= endBin; bin += 1) {
            const value = frequencyData[bin] / 255;
            total += value;
            peak = Math.max(peak, value);
          }
          const average = total / Math.max(1, endBin - startBin + 1);
          return Math.min(
            1,
            Math.max(0, (average * 0.72 + peak * 0.28 - 0.07) / 0.72),
          );
        };
        const bassEnergy = readBandEnergy(35, 180);
        const highEnergy = readBandEnergy(4200, 15000);
        for (let cycle = 0; cycle < cycleCount; cycle += 1) {
          const [minimumFrequency, maximumFrequency] = frequencyBands[cycle];
          const bandEnergy = readBandEnergy(minimumFrequency, maximumFrequency);
          let bandTarget: number;
          if (cycle === middleCycle) {
            const vocalBed = bassEnergy * 0.28 + highEnergy * 0.18;
            const vocalPresence = Math.min(
              1,
              Math.max(0, (bandEnergy - vocalBed - 0.1) / 0.58),
            );
            bandTarget = Math.pow(vocalPresence, 1.42) * volumeResponse;
          } else {
            const musicPresence = Math.min(
              1,
              Math.max(0, (bandEnergy - 0.045) / 0.76),
            );
            bandTarget = Math.pow(musicPresence, 1.05) * volumeResponse * 0.9;
          }
          const bandSpeed = bandTarget > cycleEnergyLevels[cycle] ? 0.76 : 0.22;
          cycleEnergyLevels[cycle] +=
            (bandTarget - cycleEnergyLevels[cycle]) * bandSpeed;
        }
        const visualEnergy = Math.max(
          musicLevel,
          ...cycleEnergyLevels.slice(0, cycleCount),
        );
        for (let index = 0; index < ecgLevels.length; index += 1) {
          const progress = index / (ecgLevels.length - 1);
          const sampleIndex = Math.min(
            timeData.length - 1,
            Math.floor(progress * timeData.length),
          );
          const rawAmplitude = (timeData[sampleIndex] - 128) / 128;
          const cyclePosition = progress * cycleCount;
          const cycleIndex = Math.min(
            cycleCount - 1,
            Math.floor(cyclePosition),
          );
          const cyclePhase = cyclePosition % 1;
          const pWave = gaussian(cyclePhase, 0.32, 0.035) * 0.1;
          const qWave = gaussian(cyclePhase, 0.465, 0.012) * -0.13;
          const rWave = gaussian(cyclePhase, 0.5, 0.009) * 1.08;
          const sWave = gaussian(cyclePhase, 0.535, 0.014) * -0.31;
          const tWave = gaussian(cyclePhase, 0.8, 0.065) * 0.3;
          const recoveryWave = gaussian(cyclePhase, 0.91, 0.025) * -0.055;
          const monitorRipple = Math.sin(cyclePhase * Math.PI * 6) * 0.018;
          const ecgShape =
            pWave +
            qWave +
            rWave +
            sWave +
            tWave +
            recoveryWave +
            monitorRipple;
          const cycleEnergy =
            cycleEnergyLevels[cycleIndex] *
            (cycleIndex === middleCycle ? 1.72 : 0.36);
          const vibrationAmount = cycleIndex === middleCycle ? 0.012 : 0.045;
          const liveMovement =
            rawAmplitude *
            vibrationAmount *
            (0.16 + cycleEnergyLevels[cycleIndex]);
          const target = ecgShape * cycleEnergy + liveMovement;
          ecgLevels[index] += (target - ecgLevels[index]) * 0.74;
        }

        const lineGradient = context.createLinearGradient(
          startX,
          0,
          startX + graphWidth,
          0,
        );
        lineGradient.addColorStop(0, withAlpha(template.secondary, 0.72));
        lineGradient.addColorStop(0.24, withAlpha(template.accent, 1));
        lineGradient.addColorStop(0.5, "rgba(244,255,252,1)");
        lineGradient.addColorStop(0.76, withAlpha(template.accent, 1));
        lineGradient.addColorStop(1, withAlpha(template.secondary, 0.9));
        context.save();
        context.globalCompositeOperation = "screen";
        context.strokeStyle = withAlpha(template.accent, 0.16);
        context.lineWidth = Math.max(1, height * 0.0011);
        context.beginPath();
        context.moveTo(startX, baseline);
        context.lineTo(startX + graphWidth, baseline);
        context.stroke();

        const traceEcg = () => {
          context.beginPath();
          for (let index = 0; index < ecgLevels.length; index += 1) {
            const x = startX + (index / (ecgLevels.length - 1)) * graphWidth;
            const y = baseline - ecgLevels[index] * ecgHeight;
            if (index === 0) context.moveTo(x, y);
            else context.lineTo(x, y);
          }
          context.stroke();
        };
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = withAlpha(
          template.secondary,
          0.22 + visualEnergy * 0.24,
        );
        context.lineWidth = Math.max(6, height * 0.0085);
        context.shadowColor = template.secondary;
        context.shadowBlur = height * (0.009 + visualEnergy * 0.011);
        traceEcg();
        context.strokeStyle = lineGradient;
        context.lineWidth = Math.max(3, height * 0.0034);
        context.shadowColor = template.accent;
        context.shadowBlur = height * 0.008;
        traceEcg();
        context.restore();
      } else {
        ecgLevels.fill(0);
        cycleEnergyLevels.fill(0);
        musicLevel = 0;
      }

      context.globalCompositeOperation = "source-over";
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      const side = width * 0.075;
      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.96)";
      context.font = `700 ${Math.round(Math.min(width, height) * 0.05)}px Inter, Arial, sans-serif`;
      const title = fileName ? fileName.replace(/\.[^.]+$/, "") : "YOUR MUSIC";
      context.fillText(title.slice(0, 46), side, height * 0.16);
      context.fillStyle = withAlpha(template.accent, 0.86);
      context.font = `750 ${Math.round(Math.min(width, height) * 0.018)}px Inter, Arial, sans-serif`;
      context.fillText(
        `${template.label.toUpperCase()}  /  LIVE MUSIC ECG`,
        side,
        height * 0.205,
      );

      const progress =
        audio && Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.currentTime / audio.duration
          : 0;
      const progressX = side;
      const progressY = height * 0.82;
      const progressWidth = width - side * 2;
      context.fillStyle = "rgba(255,255,255,.13)";
      context.fillRect(
        progressX,
        progressY,
        progressWidth,
        Math.max(3, height * 0.0026),
      );
      context.fillStyle = template.accent;
      context.fillRect(
        progressX,
        progressY,
        progressWidth * progress,
        Math.max(3, height * 0.0026),
      );
      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.62)";
      context.font = `600 ${Math.round(Math.min(width, height) * 0.016)}px ui-monospace, monospace`;
      context.fillText(
        formatTime(audio?.currentTime ?? 0),
        progressX,
        progressY + height * 0.035,
      );
      context.textAlign = "right";
      context.fillText(
        formatTime(
          Number.isFinite(audio?.duration) ? (audio?.duration ?? 0) : 0,
        ),
        progressX + progressWidth,
        progressY + height * 0.035,
      );

      context.textAlign = "left";
      context.fillStyle = "rgba(255,255,255,.92)";
      context.font = `800 ${Math.round(Math.min(width, height) * 0.026)}px Inter, Arial, sans-serif`;
      context.fillText("YASSINE CHAHID", side, height * 0.915);
      context.fillStyle = "rgba(255,255,255,.48)";
      context.font = `650 ${Math.round(Math.min(width, height) * 0.012)}px Inter, Arial, sans-serif`;
      context.fillText("© 2026 · ALL RIGHTS RESERVED", side, height * 0.94);
      context.textAlign = "right";
      context.fillStyle = "rgba(255,255,255,.48)";
      context.font = `600 ${Math.round(Math.min(width, height) * 0.011)}px Inter, Arial, sans-serif`;
      context.fillText(
        `BACKGROUND: ${template.credit}`,
        width - side,
        height * 0.94,
      );
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelled = true;
      backgroundImage.onload = null;
      if (animationFrameRef.current !== null)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, [aspectRatio, audioUrl, fileName, templateId]);

  const chooseAudio = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError(
        "Please choose an MP3, WAV, M4A, or another browser-supported audio file.",
      );
      return;
    }
    audioRef.current?.pause();
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    restoredTimeRef.current = 0;
    setAudioUrl(url);
    setFileName(file.name);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setExportState("idle");
    setError(null);
    setLocalSaveState("saving");
    try {
      await saveMusicVideoAudio(file);
      saveMusicVideoSettings({
        fileName: file.name,
        aspectRatio,
        templateId,
        volume,
        currentTime: 0,
      });
      setLocalSaveState("saved");
    } catch {
      setLocalSaveState("error");
      setError(
        "The music is loaded, but the browser could not save it for the next session.",
      );
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audioUrl || !audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await ensureAudioGraph();
      await audio.play();
      setError(null);
    } catch {
      setError("This audio could not be played by the browser.");
    }
  };

  const exportVideo = async () => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (
      !audioUrl ||
      !canvas ||
      !audio ||
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      setError("Choose a valid audio file before rendering the video.");
      return;
    }
    if (
      typeof MediaRecorder === "undefined" ||
      typeof canvas.captureStream !== "function"
    ) {
      setError(
        "Video recording is not supported in this browser. Use a current Chrome, Edge, or Firefox version.",
      );
      setExportState("error");
      return;
    }

    let canvasStream: MediaStream | null = null;
    const previousTime = audio.currentTime;
    try {
      setError(null);
      setExportState("rendering");
      const recordingDestination = await ensureAudioGraph();
      if (!recordingDestination)
        throw new Error("Audio recording is unavailable.");
      if (playbackGainRef.current) playbackGainRef.current.gain.value = 0;
      audio.pause();
      audio.currentTime = 0;
      canvasStream = canvas.captureStream(30);
      const outputStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...recordingDestination.stream.getAudioTracks(),
      ]);
      const mimeType = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(outputStream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 8_000_000,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      const finished = new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () =>
          reject(new Error("The video recorder stopped unexpectedly."));
        recorder.onstop = () =>
          resolve(
            new Blob(chunks, { type: recorder.mimeType || "video/webm" }),
          );
      });
      const songFinished = new Promise<void>((resolve, reject) => {
        audio.addEventListener("ended", () => resolve(), { once: true });
        audio.addEventListener(
          "error",
          () => reject(new Error("The audio stopped during rendering.")),
          { once: true },
        );
      });
      recorder.start(1000);
      await audio.play();
      await songFinished;
      recorder.stop();
      const video = await finished;
      renderedVideoRef.current = video;
      setExportState("ready");
      setIsPlaying(false);
    } catch (exportError) {
      audio.pause();
      setIsPlaying(false);
      setExportState("error");
      setError(
        exportError instanceof Error
          ? exportError.message
          : "The video could not be rendered.",
      );
    } finally {
      canvasStream?.getTracks().forEach((track) => track.stop());
      if (playbackGainRef.current) playbackGainRef.current.gain.value = 1;
      audio.pause();
      const maximumTime = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - 0.05) : 0;
      audio.currentTime = Math.min(previousTime, maximumTime);
      setCurrentTime(audio.currentTime);
    }
  };

  const downloadRenderedVideo = () => {
    const video = renderedVideoRef.current;
    if (!video) {
      void exportVideo();
      return;
    }
    const downloadUrl = URL.createObjectURL(video);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${safeBaseName(fileName)}-${aspectRatio.replace(":", "x")}.webm`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    setExportState("downloaded");
  };

  const selectedRatio = ASPECT_RATIOS[aspectRatio];
  const isRendering = exportState === "rendering";

  return (
    <section className="music-video-studio" aria-labelledby="music-video-title">
      <header className="music-video-header">
        <div>
          <span>Yassine Chahid presents</span>
          <h1 id="music-video-title">Nightwave visualizer</h1>
          <p>
            Real telescope photography and a studio-quality frequency
            spectrum—independent from the editor timeline.
          </p>
        </div>
        <span className="studio-format">
          <AudioWaveform size={14} /> Live frequency spectrum
        </span>
      </header>
      <div className="music-video-layout">
        <aside className="music-video-controls">
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
            onChange={(event) => void chooseAudio(event.target.files?.[0])}
          />
          <button
            type="button"
            className="music-upload"
            onClick={() => inputRef.current?.click()}
            disabled={isRendering}>
            <UploadCloud size={19} />
            <span>
              <strong>
                {audioUrl ? "Import different music" : "Import music"}
              </strong>
              <small>MP3, WAV, M4A, AAC or OGG</small>
            </span>
          </button>
          <div className={`selected-song ${audioUrl ? "has-song" : ""}`}>
            <span className="selected-song-icon">
              <FileAudio2 size={18} />
            </span>
            <span>
              <strong>{fileName || "No song selected"}</strong>
              <small>
                {audioUrl
                  ? `${duration > 0 ? formatTime(duration) : "Loading audio"} · ${localSaveState === "saving" ? "Saving locally…" : localSaveState === "error" ? "Local save failed" : "Saved locally"}`
                  : localSaveState === "restoring"
                    ? "Restoring local audio…"
                    : "Choose a local audio file"}
              </small>
            </span>
          </div>

          <fieldset>
            <legend>Aspect ratio</legend>
            <div className="ratio-options">
              {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  className={aspectRatio === ratio ? "active" : ""}
                  onClick={() => setAspectRatio(ratio)}
                  disabled={isRendering}>
                  <span
                    className={`ratio-shape ratio-${ratio.replace(":", "-")}`}
                  />
                  <strong>{ratio}</strong>
                  <small>{ASPECT_RATIOS[ratio].label}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="visualizer-templates">
            <legend>
              <span>Night-sky templates</span>
              <small>{TEMPLATES.length} curated looks</small>
            </legend>
            <div className="visualizer-template-grid">
              {TEMPLATES.map((template) => (
                <button
                  type="button"
                  key={template.id}
                  className={templateId === template.id ? "active" : ""}
                  onClick={() => setTemplateId(template.id)}
                  disabled={isRendering}
                  aria-pressed={templateId === template.id}>
                  <span
                    className="visualizer-template-art"
                    style={{
                      backgroundImage: `linear-gradient(rgba(2,4,12,.12), rgba(2,4,12,.58)), url(${template.backgroundImage})`,
                      backgroundPosition: `${template.position[0] * 100}% ${template.position[1] * 100}%`,
                      filter: template.filter,
                    }}>
                    <i
                      style={{
                        background: `linear-gradient(90deg, ${template.accent}, ${template.secondary})`,
                      }}
                    />
                  </span>
                  <span>
                    <strong>{template.label}</strong>
                    <small>{template.note}</small>
                  </span>
                  {templateId === template.id && <Check size={12} />}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="download-video-panel">
            <div>
              <strong>Your video</strong>
              <small>
                Full-resolution WebM · original audio · {aspectRatio}
              </small>
            </div>
            <button
              type="button"
              className="render-music-video"
              onClick={() =>
                exportState === "ready" || exportState === "downloaded"
                  ? downloadRenderedVideo()
                  : void exportVideo()
              }
              disabled={!audioUrl || isRendering || !backgroundReady}>
              {isRendering || exportState === "idle" || exportState === "error" ? (
                <AudioWaveform size={17} />
              ) : (
                <Download size={17} />
              )}
              <span>
                {isRendering
                  ? `Creating video — ${duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0}%`
                  : !backgroundReady
                    ? "Loading background…"
                    : exportState === "ready"
                      ? "Download video (.WEBM)"
                      : exportState === "downloaded"
                        ? "Download video again"
                        : "Create video"}
              </span>
            </button>
          </div>
          <p className="render-note">
            Create renders the synchronized video once in real time and without
            speaker audio. Download then saves the finished file instantly.
          </p>
          {error && (
            <p className="music-video-error" role="alert">
              {error}
            </p>
          )}
          {exportState === "ready" && !error && (
            <p className="music-video-success" role="status">
              <Check size={13} /> Video ready. Click Download video.
            </p>
          )}
          {exportState === "downloaded" && !error && (
            <p className="music-video-success" role="status">
              <Check size={13} /> Video downloaded successfully.
            </p>
          )}
          <div className="studio-copyright">
            <strong>Yassine Chahid</strong>
            <span>© 2026 · All rights reserved</span>
          </div>
        </aside>

        <div className="music-video-preview">
          <div
            className="music-canvas-wrap"
            style={{
              aspectRatio: `${selectedRatio.width} / ${selectedRatio.height}`,
            }}>
            <canvas
              ref={canvasRef}
              aria-label="Audio-reactive music video preview"
            />
            {!audioUrl && (
              <div className="music-canvas-empty">
                <span>
                  <Music2 size={30} />
                </span>
                <strong>No music imported</strong>
                <small>Use the “Import music” button in the controls.</small>
              </div>
            )}
            {isRendering && (
              <div className="rendering-badge">
                <AudioWaveform size={13} /> Creating video ·{" "}
                {Math.min(100, Math.round((currentTime / duration) * 100))}%
              </div>
            )}
          </div>
          <audio
            ref={audioRef}
            src={audioUrl ?? undefined}
            preload="metadata"
            onLoadedMetadata={(event) => {
              const nextDuration = Number.isFinite(event.currentTarget.duration)
                ? event.currentTarget.duration
                : 0;
              const restoredTime = Math.min(
                restoredTimeRef.current ?? 0,
                Math.max(0, nextDuration - 0.05),
              );
              event.currentTarget.currentTime = restoredTime;
              setDuration(nextDuration);
              setCurrentTime(restoredTime);
              restoredTimeRef.current = null;
            }}
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="music-transport">
            <button
              type="button"
              className="music-play"
              onClick={() => void togglePlayback()}
              disabled={!audioUrl || isRendering}
              aria-label={isPlaying ? "Pause music" : "Play music"}>
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
            </button>
            <span>{formatTime(currentTime)}</span>
            <input
              className="music-seek"
              aria-label="Seek music"
              type="range"
              min="0"
              max={Math.max(duration, 0.01)}
              step="0.01"
              value={Math.min(currentTime, Math.max(duration, 0.01))}
              disabled={!audioUrl || isRendering}
              onChange={(event) => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Number(event.target.value);
                  setCurrentTime(Number(event.target.value));
                }
              }}
            />
            <span>{formatTime(duration)}</span>
            <Volume2 size={15} />
            <input
              className="music-volume"
              aria-label="Music volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              disabled={isRendering}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                if (audioRef.current) audioRef.current.volume = next;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
