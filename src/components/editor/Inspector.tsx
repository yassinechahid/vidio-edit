import { SlidersHorizontal } from "lucide-react";
import type { MediaAsset } from "@/types/editor";

export function Inspector({ asset }: { asset?: MediaAsset }) {
  return (
    <aside className="inspector-panel">
      <div className="panel-heading"><div><span>Properties</span><h2>Inspector</h2></div><SlidersHorizontal size={17} /></div>
      {asset ? <div className="inspector-content"><div className="inspector-asset"><strong title={asset.name}>{asset.name}</strong><span>{asset.kind} · {asset.width && asset.height ? `${asset.width} × ${asset.height}` : "Local media"}</span></div><div className="inspector-placeholder"><span>Transform and adjustment controls arrive in Phase 3.</span></div></div> : <div className="inspector-empty"><SlidersHorizontal size={23} /><p>Select a timeline clip to inspect it.</p></div>}
    </aside>
  );
}

