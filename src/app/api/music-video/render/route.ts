import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const OUTPUTS = {
  sd: {
    "16:9": { width: 854, height: 480 },
    "9:16": { width: 480, height: 854 },
    "1:1": { width: 480, height: 480 },
    "4:5": { width: 480, height: 600 },
  },
  fast: {
    "16:9": { width: 1280, height: 720 },
    "9:16": { width: 720, height: 1280 },
    "1:1": { width: 720, height: 720 },
    "4:5": { width: 720, height: 900 },
  },
  hd: {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
  },
} as const;

const TEMPLATES = {
  andromeda: { image: "ngc-5335.jpg", accent: "9cb5ff", secondary: "d6b8ff", credit: "NASA / ESA / STScI" },
  "blue-hour": { image: "galaxy-pair.png", accent: "7cd4ff", secondary: "d6f3ff", credit: "NASA / ESA / CSA / STScI" },
  aurora: { image: "ngc-3603.png", accent: "79efc5", secondary: "85d7ff", credit: "NASA / ESA / STScI" },
  "cosmic-rose": { image: "orion.jpg", accent: "ff9bd3", secondary: "e0c2ff", credit: "NASA / ESA / STScI" },
  lunar: { image: "ngc-5335.jpg", accent: "f1f4f7", secondary: "aeb8c5", credit: "NASA / ESA / STScI" },
  "violet-void": { image: "orion.jpg", accent: "c4a9ff", secondary: "8be5ff", credit: "NASA / ESA / STScI" },
  "red-dwarf": { image: "galaxy-pair.png", accent: "ffab82", secondary: "ffe0a8", credit: "NASA / ESA / CSA / STScI" },
  midnight: { image: "ngc-5335.jpg", accent: "f4f7ff", secondary: "8299ff", credit: "NASA / ESA / STScI" },
  neptune: { image: "ngc-3603.png", accent: "6eeaf0", secondary: "8ca6ff", credit: "NASA / ESA / STScI" },
  "solar-veil": { image: "orion.jpg", accent: "f3d28b", secondary: "d2c7ff", credit: "NASA / ESA / STScI" },
} as const;

type ExportQuality = keyof typeof OUTPUTS;
type AspectRatio = keyof typeof OUTPUTS.fast;
type TemplateId = keyof typeof TEMPLATES;

type ExportJob = {
  status: "preparing" | "rendering" | "complete" | "error";
  progress: number;
  error?: string;
  updatedAt: number;
};

const serverState = globalThis as typeof globalThis & {
  framecraftMusicVideoJobs?: Map<string, ExportJob>;
  framecraftBackgrounds?: Map<string, Promise<string>>;
};
const exportJobs = serverState.framecraftMusicVideoJobs ??= new Map<string, ExportJob>();
const backgroundJobs = serverState.framecraftBackgrounds ??= new Map<string, Promise<string>>();

function safeText(value: string) {
  return value.replace(/[^a-zA-Z0-9 ._-]/g, "").trim().slice(0, 64) || "YOUR MUSIC";
}

function escapeFilterPath(value: string) {
  return value.replace(/\\/g, "/").replace(":", "\\:").replace(/'/g, "\\'");
}

function findFont() {
  const candidates = [
    process.env.WINDIR ? path.join(process.env.WINDIR, "Fonts", "arial.ttf") : "",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
  ];
  return candidates.find((candidate) => candidate && existsSync(candidate));
}

function runFfmpeg(args: string[], onProgress?: (seconds: number) => void) {
  return new Promise<void>((resolve, reject) => {
    if (!ffmpegPath) {
      reject(new Error("The FFmpeg binary is unavailable."));
      return;
    }
    const process = spawn(ffmpegPath, args, { windowsHide: true });
    let errorOutput = "";
    let progressOutput = "";
    process.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      errorOutput = `${errorOutput}${text}`.slice(-12_000);
      if (onProgress) {
        progressOutput += text;
        const lines = progressOutput.split(/\r?\n/);
        progressOutput = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("out_time_us=")) continue;
          const microseconds = Number(line.slice("out_time_us=".length));
          if (Number.isFinite(microseconds)) onProgress(microseconds / 1_000_000);
        }
      }
    });
    process.on("error", reject);
    process.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(errorOutput || `FFmpeg exited with code ${code ?? "unknown"}.`));
    });
  });
}

function updateJob(jobId: string, changes: Partial<ExportJob>) {
  const current = exportJobs.get(jobId);
  if (current) exportJobs.set(jobId, { ...current, ...changes, updatedAt: Date.now() });
}

async function prepareBackground(templateId: TemplateId, aspectRatio: AspectRatio, quality: ExportQuality, width: number, height: number, sourcePath: string) {
  const cacheKey = `${templateId}-${aspectRatio.replace(":", "x")}-${quality}`;
  const existing = backgroundJobs.get(cacheKey);
  if (existing) return existing;
  const preparation = (async () => {
    const cacheDirectory = path.join(tmpdir(), "framecraft-music-backgrounds-v2");
    await mkdir(cacheDirectory, { recursive: true });
    const cachedPath = path.join(cacheDirectory, `${cacheKey}.jpg`);
    if (!existsSync(cachedPath)) {
      await runFfmpeg([
        "-y", "-hide_banner", "-loglevel", "error", "-i", sourcePath,
        "-vf", `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},eq=brightness=-0.08:contrast=1.08:saturation=0.82,vignette=PI/5`,
        "-frames:v", "1", "-q:v", "2", cachedPath,
      ]);
    }
    return cachedPath;
  })();
  backgroundJobs.set(cacheKey, preparation);
  try {
    return await preparation;
  } catch (error) {
    backgroundJobs.delete(cacheKey);
    throw error;
  }
}

let videoEncoderPromise: Promise<string[]> | null = null;

function resolveVideoEncoder() {
  if (!videoEncoderPromise) {
    videoEncoderPromise = (async () => {
      try {
        await runFfmpeg([
          "-y", "-hide_banner", "-loglevel", "error",
          "-f", "lavfi", "-i", "color=black:s=64x64:d=0.1",
          "-frames:v", "1", "-c:v", "h264_qsv", "-f", "null", process.platform === "win32" ? "NUL" : "/dev/null",
        ]);
        return ["-c:v", "h264_qsv", "-preset", "veryfast", "-global_quality", "25"];
      } catch {
        return ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "25"];
      }
    })();
  }
  return videoEncoderPromise;
}

function tuneVideoEncoder(argumentsList: string[], quality: ExportQuality) {
  const tuned = [...argumentsList];
  const qualityIndex = tuned.indexOf("-global_quality");
  if (qualityIndex >= 0) tuned[qualityIndex + 1] = quality === "hd" ? "16" : quality === "fast" ? "18" : "20";
  const crfIndex = tuned.indexOf("-crf");
  if (crfIndex >= 0) tuned[crfIndex + 1] = quality === "hd" ? "16" : quality === "fast" ? "18" : "20";
  return tuned;
}

export async function GET(request: Request) {
  const jobId = new URL(request.url).searchParams.get("jobId") ?? "";
  const job = exportJobs.get(jobId);
  if (!job) return NextResponse.json({ status: "waiting", progress: 0 });
  return NextResponse.json(job);
}

export async function POST(request: Request) {
  let temporaryDirectory: string | null = null;
  let jobId = "";
  try {
    const data = await request.formData();
    const audio = data.get("audio");
    const recording = data.get("recording");
    const aspectRatioValue = String(data.get("aspectRatio") ?? "16:9");
    const templateIdValue = String(data.get("templateId") ?? "andromeda");
    const qualityValue = String(data.get("quality") ?? "fast");
    const duration = Number(data.get("duration") ?? 0);
    const captureSpeed = Number(data.get("captureSpeed") ?? 1);
    jobId = String(data.get("jobId") ?? "");
    const title = safeText(String(data.get("title") ?? "YOUR MUSIC"));
    if (!/^[a-zA-Z0-9-]{8,64}$/.test(jobId)) return NextResponse.json({ error: "Invalid export job." }, { status: 400 });
    if (!(audio instanceof File) || audio.size === 0) return NextResponse.json({ error: "A valid audio file is required." }, { status: 400 });
    if (audio.size > 250 * 1024 * 1024) return NextResponse.json({ error: "The audio file must be smaller than 250 MB." }, { status: 413 });
    if (!(aspectRatioValue in OUTPUTS.fast) || !(templateIdValue in TEMPLATES) || !(qualityValue in OUTPUTS)) return NextResponse.json({ error: "Invalid export settings." }, { status: 400 });

    const aspectRatio = aspectRatioValue as AspectRatio;
    const templateId = templateIdValue as TemplateId;
    const quality = qualityValue as ExportQuality;
    const { width, height } = OUTPUTS[quality][aspectRatio];
    const frameRate = 30;
    const template = TEMPLATES[templateId];
    if (recording instanceof File && recording.size > 0) {
      if (!Number.isFinite(captureSpeed) || captureSpeed < 1 || captureSpeed > 4) {
        return NextResponse.json({ error: "Invalid canvas capture speed." }, { status: 400 });
      }
      exportJobs.set(jobId, { status: "preparing", progress: 2, updatedAt: Date.now() });
      temporaryDirectory = await mkdtemp(path.join(tmpdir(), "framecraft-music-video-"));
      const audioExtension = path.extname(audio.name).replace(/[^a-zA-Z0-9.]/g, "") || ".audio";
      const recordingExtension = path.extname(recording.name).replace(/[^a-zA-Z0-9.]/g, "") || ".webm";
      const audioPath = path.join(temporaryDirectory, `source${audioExtension}`);
      const recordingPath = path.join(temporaryDirectory, `preview${recordingExtension}`);
      const outputPath = path.join(temporaryDirectory, "music-video.mp4");
      await Promise.all([
        writeFile(audioPath, Buffer.from(await audio.arrayBuffer())),
        writeFile(recordingPath, Buffer.from(await recording.arrayBuffer())),
      ]);
      updateJob(jobId, { progress: 8, status: "rendering" });
      const videoEncoder = tuneVideoEncoder(await resolveVideoEncoder(), quality);
      await runFfmpeg([
        "-y", "-hide_banner", "-loglevel", "error", "-fflags", "+genpts",
        "-i", recordingPath, "-i", audioPath,
        "-filter:v", `setpts=${captureSpeed}*PTS,tpad=stop_mode=clone:stop_duration=1,scale=${width}:${height}:flags=lanczos`,
        "-map", "0:v:0", "-map", "1:a:0",
        ...videoEncoder, "-pix_fmt", "yuv420p", "-r", String(frameRate),
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
        "-t", String(duration), "-shortest", "-movflags", "+faststart", "-threads", "0",
        "-progress", "pipe:2", "-nostats", outputPath,
      ], (seconds) => {
        const encodedRatio = duration > 0 ? Math.min(1, seconds / duration) : 0;
        updateJob(jobId, { progress: Math.max(8, Math.min(98, Math.round(8 + encodedRatio * 90))) });
      });
      const output = await readFile(outputPath);
      updateJob(jobId, { progress: 100, status: "complete" });
      setTimeout(() => exportJobs.delete(jobId), 5 * 60_000);
      return new Response(output, {
        headers: {
          "Content-Type": "video/mp4",
          "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "-").toLowerCase()}-${aspectRatio.replace(":", "x")}-${quality}.mp4"`,
          "Cache-Control": "no-store",
        },
      });
    }
    const backgroundPath = path.join(process.cwd(), "public", "assets", "music-visualizer", template.image);
    if (!existsSync(backgroundPath)) throw new Error("The selected background image is missing.");
    exportJobs.set(jobId, { status: "preparing", progress: 1, updatedAt: Date.now() });

    temporaryDirectory = await mkdtemp(path.join(tmpdir(), "framecraft-music-video-"));
    const extension = path.extname(audio.name).replace(/[^a-zA-Z0-9.]/g, "") || ".audio";
    const audioPath = path.join(temporaryDirectory, `source${extension}`);
    const outputPath = path.join(temporaryDirectory, "music-video.mp4");
    await writeFile(audioPath, Buffer.from(await audio.arrayBuffer()));
    updateJob(jobId, { progress: 5 });
    const preparedBackgroundPath = await prepareBackground(templateId, aspectRatio, quality, width, height, backgroundPath);
    updateJob(jobId, { progress: 12, status: "rendering" });

    const cycleCount = aspectRatio === "9:16" ? 5 : 7;
    const graphWidth = Math.floor(width * (aspectRatio === "9:16" ? 0.8 : 0.84));
    const segmentWidth = Math.max(120, Math.floor(graphWidth / cycleCount));
    const graphStart = Math.floor((width - segmentWidth * cycleCount) / 2);
    const baseline = Math.floor(height * 0.57);
    const smallHeight = Math.floor(height * (aspectRatio === "9:16" ? 0.09 : 0.12));
    const centerHeight = Math.floor(height * (aspectRatio === "9:16" ? 0.28 : 0.38));
    const middleCycle = Math.floor(cycleCount / 2);
    const centerX = graphStart + segmentWidth * middleCycle;
    const filters = [
      `[0:v]format=yuv420p[background]`,
      `[1:a]asplit=2[music][voice]`,
      `[music]showwaves=s=${graphWidth}x${smallHeight}:mode=line:colors=0x${template.accent}|0x${template.secondary}:scale=sqrt:draw=full:rate=${frameRate},format=rgba,colorkey=0x000000:0.08:0.0[musicwave]`,
      `[voice]highpass=f=250,lowpass=f=3600,showwaves=s=${segmentWidth}x${centerHeight}:mode=line:colors=0xf4fffc:scale=sqrt:draw=full:rate=${frameRate},format=rgba,colorkey=0x000000:0.08:0.0[voicewave]`,
      `[background][musicwave]overlay=x=${graphStart}:y=${baseline - Math.floor(smallHeight / 2)}:format=auto[musiclayer]`,
      `[musiclayer][voicewave]overlay=x=${centerX}:y=${baseline - Math.floor(centerHeight / 2)}:format=auto[wavelayer]`,
    ];

    const font = findFont();
    const fontOption = font ? `fontfile='${escapeFilterPath(font)}':` : "";
    const side = Math.floor(width * 0.075);
    const titleSize = Math.round(Math.min(width, height) * 0.05);
    const detailSize = Math.round(Math.min(width, height) * 0.016);
    const nameSize = Math.round(Math.min(width, height) * 0.026);
    filters.push(
      `[wavelayer]drawtext=${fontOption}text='${title}':x=${side}:y=${Math.floor(height * 0.11)}:fontsize=${titleSize}:fontcolor=white:shadowcolor=black@0.55:shadowx=2:shadowy=2,` +
      `drawtext=${fontOption}text='FAST ECG AUDIO VISUAL':x=${side}:y=${Math.floor(height * 0.19)}:fontsize=${detailSize}:fontcolor=0x${template.accent},` +
      `drawtext=${fontOption}text='YASSINE CHAHID':x=${side}:y=${Math.floor(height * 0.89)}:fontsize=${nameSize}:fontcolor=white,` +
      `drawtext=${fontOption}text='2026 - ALL RIGHTS RESERVED':x=${side}:y=${Math.floor(height * 0.94)}:fontsize=${detailSize}:fontcolor=white@0.58,` +
      `drawtext=${fontOption}text='BACKGROUND ${safeText(template.credit)}':x=w-tw-${side}:y=${Math.floor(height * 0.94)}:fontsize=${Math.max(10, Math.round(detailSize * 0.78))}:fontcolor=white@0.45[final]`,
    );

    const videoEncoder = tuneVideoEncoder(await resolveVideoEncoder(), quality);
    await runFfmpeg([
      "-y", "-hide_banner", "-loglevel", "error",
      "-loop", "1", "-framerate", String(frameRate), "-i", preparedBackgroundPath,
      "-i", audioPath,
      "-filter_complex_threads", "0", "-filter_complex", filters.join(";"),
      "-map", "[final]", "-map", "1:a:0",
      ...videoEncoder, "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
      "-shortest", "-movflags", "+faststart", "-threads", "0",
      "-progress", "pipe:2", "-nostats", outputPath,
    ], (seconds) => {
      const encodedRatio = duration > 0 ? Math.min(1, seconds / duration) : 0;
      updateJob(jobId, { progress: Math.max(12, Math.min(98, Math.round(12 + encodedRatio * 86))) });
    });

    const output = await readFile(outputPath);
    updateJob(jobId, { progress: 100, status: "complete" });
    setTimeout(() => exportJobs.delete(jobId), 5 * 60_000);
    return new Response(output, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "-").toLowerCase()}-${aspectRatio.replace(":", "x")}-${quality}.mp4"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The fast video export failed.";
    if (jobId) updateJob(jobId, { status: "error", error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
  }
}
