import { LockKeyhole } from "lucide-react";
import type { MediaAsset } from "@/types/editor";
import { MediaPanel } from "./MediaPanel";
import type { ToolId } from "./ToolSidebar";

interface ToolPanelProps {
  activeTool: ToolId;
  assets: MediaAsset[];
  importFiles: (files: FileList | File[]) => void;
  isImporting: boolean;
  error: string | null;
  onAddToTimeline: (asset: MediaAsset) => void;
}

export function ToolPanel(props: ToolPanelProps) {
  if (props.activeTool === "media") return <MediaPanel {...props} />;
  return (
    <section className="asset-panel unavailable-panel">
      <div className="panel-heading"><div><span>Tool</span><h2>{props.activeTool[0].toUpperCase() + props.activeTool.slice(1)}</h2></div></div>
      <LockKeyhole size={24} /><p>This editor module is scheduled for a later implementation phase.</p><small>It is intentionally unavailable until its editing behavior is real.</small>
    </section>
  );
}

