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

React + Vite + TypeScript, Tailwind CSS v4, Lucide icons, jsPDF for downloadable reports, and manually installed shadcn/ui Button and Dialog components built on Radix primitives. `components.json` and the `@/` alias support adding further shadcn components. Dialogs provide focus management, keyboard navigation, Escape dismissal, and screen reader titles.

Vite suits this brief because the behavior is client-side: the evaluation centers on understanding and moving work forward. Next.js would be useful if the brief required server-rendered pages, server-side authentication, or a specific full-stack deployment. The domain model and workflow transitions are separate from React, so a backend can be introduced without redesigning the interface.

References: [Vite guide](https://vite.dev/guide/), [shadcn Vite installation](https://ui.shadcn.com/docs/installation/vite).

## Source structure

```text
src/
  index.css                 # CSS imports, Tailwind theme tokens, and animations
  styles/                   # Base defaults and shared page headings/states
  App.tsx                   # Navigation, shared state, and dialogs
  components/
    layout/                 # Workspace shell and sidebar
    feedback/               # Notifications
    ui/                     # Shared Button and Dialog primitives
  features/
    orders/
      components/           # Filters, table, board, status, avatar
      create/               # Order form and customer fields
      detail/               # Order details, documents, history, and approvals
      order-filters.ts      # Search, filtering, and queue sorting
      export-orders.ts      # CSV download
      useOrders.ts          # Browser persistence and order updates
      status.css            # Status, action, and delivery-date palette
    stock/                  # Stock-check page and order cards
    activity/               # Workspace order history
  data/                     # Fictional orders and team members
  lib/                      # Workflow rules, formatting, and shared helpers
```

Keep workflow rules in `src/lib/workflow.ts`. Feature components handle presentation and call those rules; storage keeps the existing `orderflow-demo-v1` key.

## Styling

`src/index.css` is the stylesheet entry point. It declares Tailwind theme tokens and imports styles in a fixed order. Feature CSS lives beside its components, including its responsive rules: sidebar and workspace layout, order filters, tables and boards, order details and documents, intake, stock, and activity. The shared stage palette remains in `src/features/orders/status.css`.

The existing shadcn/ui Button and Dialog primitives use Tailwind utilities, with Button variants defined through `class-variance-authority`. Reuse those primitives and use Tailwind for simple layout and state styling. Keep feature-specific selectors in the owning CSS file. Browser defaults and focus styles live in the base layer so Tailwind utilities can override them without adding selector specificity.

## What works

- Orders dashboard with live counts, stage filtering, and an attention queue sorted by overdue status and urgency.
- Search by order, customer, or company; filter by owner or priority.
- List and board views of the same orders.
- Create an order with customer, product, quantities, delivery details, and optional notes.
- Correct customer details, products, quantities, notes, and the delivery deadline before confirming intake. Corrections are recorded in history; later stages keep those details read-only.
- Actual delivery deadlines in Philippine time, automatic overdue detection, and migration of older saved relative dates without resetting orders.
- Order detail dialog with a six-stage progress indicator and stage-specific work. Supporting information is collapsed; notes live in History.
- Explicit approval before each handoff, with a timestamped activity entry.
- Immediate tasks shared by the list, board, and order details: resolve missing prerequisites before the handoff action. Completed steps show read-only evidence and approval summaries.
- Payment method selection (Bank transfer, GCash, Maya, or Cash), payment evidence, stock shortage resolution, preparation confirmation, and delivery proof. Method selection is required before approval, saved to history, and read-only afterward.
- Upload and download attachments, using PDF, PNG, JPG, or text files up to 2 MB.
- Attach payment receipts and delivery proof directly from their stage tasks. The stage assigns the document type automatically; other stages and the read-only Documents archive cannot upload files. Downloads are available for stored files; seeded records without a file show Original file unavailable.
- Notes, per-order history, a workspace activity feed, and inventory exceptions.
- CSV export of the currently filtered order list; downloadable PDF summaries with customer details, itemized prices and totals, payment, delivery, notes, document names, and complete history.
- Browser persistence, responsive layouts, reduced-motion support, and a search keyboard shortcut.

## Suggested demo (about five minutes)

1. Open **Needs attention**. Overdue work appears first, with the oldest deadline first when urgency is equal. Explain that the queue separates urgency from workflow stage.
2. Open **ORD-1047**. Its inventory shortage blocks reservation. Enter **12** as the available mug stock and choose **Save stock quantities**. Review, reserve stock, and confirm the handoff.
3. In Preparation, confirm the items are picked, checked, and packed. Mark ready and approve the handoff.
4. In Delivery, enter the required reference and choose **Attach delivery proof**. The file chooser opens directly and the evidence type is recorded automatically. Complete the order and review the activity history.
5. Open **ORD-1043** to demonstrate a missing payment receipt, select a payment method and upload a receipt file before approving payment.
6. Create a new order. It starts at New order with only the information needed to accept it. Choose **Edit order details**, correct the address or quantity, and save. Refresh to demonstrate browser persistence.

The Delivery stage means delivery work is in progress. Entering it after packing does not claim that a courier has dispatched the order. Dispatch booking and tracking remain outside the demo.

Read [DESIGN.md](./DESIGN.md) for the UX rationale, evaluation mapping, and production boundary.

## Storage and reset

Orders and attachments are saved under `orderflow-demo-v1` in localStorage. To reset, clear this key in browser developer tools and refresh:

```js
localStorage.removeItem("orderflow-demo-v1");
location.reload();
```

Browser storage is limited; a visible warning appears if saving fails. Use sample documents or small files for the demo. Do not use real customer or payment data.

Older saved delivery labels are converted once to timestamps using the date of the earliest recorded order activity. That date is an approximation because the old format did not preserve an actual deadline. New orders use a date and time explicitly labeled as Philippine time; deadlines and attention counts refresh every minute while the app is open.

## Verification

Strict TypeScript checks and the production build pass. Twenty-three tests cover combined list filters, attention ordering, required intake information and valid items, guarded intake corrections, next-action labels, retained approval records, deadline migration and time zones, stage-restricted evidence uploads, required payment methods and legacy migration, PDF generation and pagination, centavo precision, payment proof, shortages, packing confirmation, delivery evidence, attention detection, and a full six-stage journey.

The October 2026 workflow fixes were checked in Chrome DevTools at desktop and an emulated 390 px mobile viewport. Checks covered attention filtering, intake corrections, missing payment proof, payment and delivery file uploads with the correct document type, stock replenishment, packing confirmation, completion, read-only stage evidence and approvals, order creation, refresh persistence, and modal keyboard focus. Mobile dates do not overlap amounts, the current step is visible in the progress strip, and the page fits without horizontal overflow. A full screen reader audit and testing with real operators remain outstanding.

The earlier UX simplification was checked at 1440 px and 390 px: stage filtering, board selection, filter dismissal and focus return, missing payment evidence, the two-action approval state, explicit stock saving, packing, delivery evidence, and completion. Temporary browser test changes were restored. Operator usability testing and a full screen reader audit remain outstanding.

The subsequent polish removed demo chrome and sample-generation shortcuts. Browser checks verified receipt upload and approval readiness, unavailable seeded-file downloads, simplified packing details, and mobile navigation at 390 px without page overflow. Existing browser records were restored after verification.

The two-round [UI review](./docs/UI_REVIEW.md) records both GPT-6.1 Sol reviewers' findings, changes, and final 9.0/10 scores. It also distinguishes screenshot/source review from browser interaction checks and outstanding operator testing.


The latest [desktop flow review](./docs/UI_REVIEW.md#direct-evidence-and-guided-handoffs) records three council rounds ending at 9.0/10 and 9.2/10. Required fields are visible, blocked handoffs stay available to guide the missing task, and stage work stays on one screen with supporting disclosures. Browser checks covered direct uploads, invalid file rejection, required-control focus, all five handoffs, approval persistence, and notification placement at 1440 px and 1280 px. This pass did not repeat mobile or full screen-reader testing.


Payment methods are selected in Payment rather than intake. Older saved orders that had already reached Payment retain the previously displayed Bank transfer method; intake orders start without a selection. Existing explicit choices are preserved. The list records how payment was made; it does not process payments. Cash still requires receipt evidence before approval, consistent with the six-stage sequence.

Completed orders use **Download summary (PDF)**. Reports are generated locally using [jsPDF](https://github.com/parallax/jsPDF), with bundled Noto Sans fonts loaded only when downloading. The font license is distributed at `public/licenses/NotoSans-OFL.txt`. PDFs preserve centavos and accented names, wrap long content, repeat table headings across pages, and include the full activity record. Attachment files remain separate; the report lists their names and types. A failed download displays a retryable error beside the summary button.

Payment/PDF browser checks verified method-required guidance, GCash persistence after refresh, read-only payment inspection after approval, subsequent handoffs through completion, and a real PDF download. PDF text extraction confirmed names, amount, method, delivery reference, and approvals; a 26-page stress report retained long notes, all items/documents, and its first/last history entries. A simulated font-load failure displayed the error and a successful retry. Temporary test records were restored. Full mobile, screen-reader and operator tests were not repeated. Dependency audit reported an existing Vite development-tool advisory; the PDF library introduced no reported advisory. Vite was not upgraded in this feature change.
