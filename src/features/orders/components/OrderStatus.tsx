import {
  ClipboardList,
  CreditCard,
  Box,
  PackageCheck,
  Truck,
  CheckCheck,
} from "lucide-react";
import type { Stage } from "@/lib/workflow";

const stageIcons = [
  ClipboardList,
  CreditCard,
  Box,
  PackageCheck,
  Truck,
  CheckCheck,
];
const statusLabels = [
  "New order",
  "Check payment",
  "Checking stock",
  "Packing",
  "Delivery",
  "Completed",
];

export function StageIcon({
  stage,
  size = 16,
}: {
  stage: number;
  size?: number;
}) {
  const Icon = stageIcons[stage];
  return (
    <Icon
      size={size}
      className="stage-icon"
      data-stage={stage}
      aria-hidden="true"
    />
  );
}

export function OrderStatus({ stage }: { stage: Stage }) {
  return (
    <span className={`status stage-${stage}`} data-stage={stage}>
      <StageIcon stage={stage} size={15} />
      {statusLabels[stage]}
    </span>
  );
}
