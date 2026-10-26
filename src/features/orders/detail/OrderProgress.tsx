import { Check } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const pipeline = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = pipeline.current;
    const selected = container?.querySelector<HTMLButtonElement>(".viewing");
    if (container && selected) {
      container.scrollLeft += selected.getBoundingClientRect().left - container.getBoundingClientRect().left - (container.clientWidth - selected.offsetWidth) / 2;
    }
  }, [inspected]);
  return (
    <div ref={pipeline} className="detail-pipeline" aria-label="Order progress">
      {STAGES.map((s, i) => (
        <button
          key={s}
          data-stage={i}
          disabled={i > stage}
          className={`${i < stage ? "done" : ""} ${i === inspected ? "viewing" : ""} ${i === stage ? "current" : ""}`}
          onClick={() => onInspect(i)}
          aria-label={`${s}${i < stage ? " complete" : i === stage ? " current" : " upcoming"}`}
          aria-current={i === stage ? "step" : undefined}
          aria-pressed={i === inspected}
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
