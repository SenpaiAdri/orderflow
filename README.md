# Orderflow

An interactive operations prototype that takes an order from intake to completion. Built for evaluating information architecture, workflow clarity, and progressive disclosure.

## Run locally

Use Node.js **22.18+** (or a newer supported release).

```bash
cd /home/eydriannn/my-projects/orderflow
npm install
npm run dev
```

Open the Local URL printed by Vite, normally http://localhost:5173.

```bash
npm test          # Domain rules and a complete order journey
npm run build     # Strict TypeScript checks and production bundle
npm run preview   # Serve the production bundle locally
```

## Stack choice

React + Vite + TypeScript, Tailwind CSS v4, Lucide icons, and manually installed shadcn/ui Button and Dialog components built on Radix primitives. `components.json` and the `@/` alias support adding further shadcn components. Dialogs provide focus management, keyboard navigation, Escape dismissal, and screen reader titles.

Vite suits this brief because the behavior is client-side: the evaluation centers on understanding and moving work forward. Next.js would be useful if the brief required server-rendered pages, server-side authentication, or a specific full-stack deployment. The domain model and workflow transitions are separate from React, so a backend can be introduced without redesigning the interface.

References: [Vite guide](https://vite.dev/guide/), [shadcn Vite installation](https://ui.shadcn.com/docs/installation/vite).

## What works

- Orders dashboard with live counts, stage filtering, and an attention queue sorted by overdue status and urgency.
- Search by order, customer, or company; filter by owner or priority.
- List and board views of the same orders.
- Create an order with customer, product, quantities, delivery details, and optional notes.
- Order detail dialog with a six-stage progress indicator, assigned owner, priority, next action, and prerequisites.
- Explicit approval before each handoff, with a timestamped activity entry.
- Payment evidence, stock shortage resolution, preparation confirmation, and delivery proof.
- Upload and download attachments, using PDF, PNG, JPG, or text files up to 2 MB.
- Labeled sample evidence for demo journeys when you do not have documents to upload.
- Notes, per-order history, a workspace activity feed, and inventory exceptions.
- CSV export of the currently filtered order list; downloadable completed-order summaries.
- Browser persistence, responsive layouts, reduced-motion support, and a search keyboard shortcut.

## Suggested demo (about five minutes)

1. Open **Needs attention**. The overdue delivery appears first; explain that the queue separates urgency from workflow stage.
2. Open **ORD-1047**. Its inventory shortage blocks reservation. Enter **12** as the available mug stock and move focus to save. Review, reserve stock, and confirm the handoff.
3. In Preparation, confirm the items are picked, checked, and packed. Mark ready and approve the handoff.
4. In Delivery, enter a reference and attach proof through **Documents**, or choose **Use demo proof**. Complete the order and review the activity history.
5. Open **ORD-1043** to demonstrate a missing payment receipt, then add demo evidence or upload a file before approving payment.
6. Create a new order. It starts at New order with only the information needed to accept it. Refresh to demonstrate browser persistence.

Read [DESIGN.md](./DESIGN.md) for the UX rationale, evaluation mapping, and production boundary.

## Storage and reset

Orders and attachments are saved under `orderflow-demo-v1` in localStorage. To reset, clear this key in browser developer tools and refresh:

```js
localStorage.removeItem("orderflow-demo-v1");
location.reload();
```

Browser storage is limited; a visible warning appears if saving fails. Use sample documents or small files for the demo. Do not use real customer or payment data.

## Verification

Strict TypeScript checks and the production build pass. Nine domain tests cover required intake information, payment proof, shortages, packing confirmation, delivery evidence, attention detection, and a full six-stage journey.

The October 2026 monochrome redesign was checked in Chrome DevTools at desktop and 390 px mobile widths. Checks covered attention filtering, missing payment proof, stock replenishment, packing confirmation, demo delivery evidence, completion, order creation, refresh persistence, and modal keyboard focus. The mobile page fits without horizontal overflow. A full screen reader audit and testing with real operators remain outstanding.
