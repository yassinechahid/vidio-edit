export function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safe / 60);
  const remainingSeconds = Math.floor(safe % 60);
  const frames = Math.floor((safe % 1) * 30);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

