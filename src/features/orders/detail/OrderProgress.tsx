import { Check } from "lucide-react";
import { STAGES, type Stage } from "@/lib/workflow";

export function OrderProgress({
  stage,
  inspected,
  onInspect,
}: {
  stage: Stage;
  inspected: number;
  onInspect: (stage: number) => void;
}) {
  return (
    <div className="detail-pipeline" aria-label="Order progress">
      {STAGES.map((s, i) => (
        <button
          key={s}
          data-stage={i}
          disabled={i > stage}
          className={`${i < stage ? "done" : ""} ${i === inspected ? "viewing" : ""} ${i === stage ? "current" : ""}`}
          onClick={() => onInspect(i)}
          aria-label={`${s}${i < stage ? " complete" : i === stage ? " current" : " upcoming"}`}
        >
          <span>
            {i < stage ? (
              <Check size={13} className="stage-icon" data-stage={i} />
            ) : (
              i + 1
            )}
          </span>
          <small>{s}</small>
        </button>
      ))}
    </div>
  );
}
