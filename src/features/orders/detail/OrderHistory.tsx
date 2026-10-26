import type { ReactNode } from "react";
import { Check, Circle } from "lucide-react";
import { formatTime } from "@/lib/format";
import type { Activity } from "@/lib/workflow";

export function OrderHistory({
  activity,
  children,
}: {
  activity: Activity[];
  children: ReactNode;
}) {
  return (
    <section className="detail-section">
      <div className="timeline">
        {activity.map((a, i) => (
          <div className="timeline-entry" key={`${a.at}-${i}`}>
            <span className="timeline-dot">
              {i === 0 ? <Check size={12} /> : <Circle size={9} />}
            </span>
            <div>
              <strong>{a.text}</strong>
              <time>{formatTime(a.at)}</time>
            </div>
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}
