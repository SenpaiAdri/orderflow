import regularFont from "@/assets/fonts/NotoSans-Regular.ttf?url";
import boldFont from "@/assets/fonts/NotoSans-Bold.ttf?url";
import type { Order } from "@/lib/workflow";
import { createOrderSummary } from "./order-summary";

async function loadFont(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to load the PDF font.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  }
  return btoa(binary);
}

export async function downloadOrderSummary(order: Order) {
  const [normal, bold] = await Promise.all([loadFont(regularFont), loadFont(boldFont)]);
  const doc = createOrderSummary(order, { normal, bold });
  await doc.save(`${order.id}-summary.pdf`, { returnPromise: true });
}
