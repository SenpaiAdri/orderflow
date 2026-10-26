# Design rationale

The main design question is: **“Which order needs me, and what should I do next?”**

The prototype assumes a small physical-goods business, a shared operations team, bank-transfer payments, and local delivery. PHP currency and sample Metro Manila addresses ground the demo. All people and business records are fictional.

## Information architecture

Three workspace destinations reflect operational jobs. The interface labels Inventory as **Stock checks** and Activity as **Order history**:

| Destination | User question                      | Primary information                                 |
| ----------- | ---------------------------------- | --------------------------------------------------- |
| Orders      | What should I work on?             | Attention, current stage, next action, delivery due |
| Inventory   | What is blocking preparation?      | Order-specific stock requirements and shortages     |
| Activity    | What changed, and who approved it? | Timestamped decisions, notes, and handoffs          |

The Orders screen leads with New order and a secondary Download list action. One set of queue controls provides All orders, Needs attention, Assigned to me, and Completed. Desktop uses a button group; mobile uses a native selector. Search stays visible; owner, priority, stage, and list/board settings share one Filters disclosure. Duplicate count cards and pipeline filters are removed. Each order has one action to open its next task. On phones, rows become compact cards with deadline and amount on the same row. The full timestamp remains available in the date label.

The detail dialog preserves the user's place in the queue. It keeps the order identifier and current status visible while the content scrolls. A handoff footer appears only on the current Details step when its prerequisites are ready. Intake keeps its Edit action available alongside confirmation. The owner appears beside the order identity and in the queue. On opening, keyboard focus moves to the current stage; the progress strip scrolls to keep the selected step visible on phones.

## Four questions the interface answers

| Question              | Interface decision                                                               |
| --------------------- | -------------------------------------------------------------------------------- |
| Where am I?           | Workspace breadcrumb, order identifier, current status, numbered stage indicator |
| What needs attention? | Attention count and tab, overdue-first ordering, explicit blocker messages       |
| What is next?         | A shared immediate-task label in the queue, board, and detail panel; one guarded handoff action |
| What matters now?     | Stage-specific prerequisites; secondary evidence and history behind tabs         |

A stage describes **where work is**. Attention describes **why someone should intervene**. Keeping both visible avoids treating every order at the same stage as equally urgent.

## Workflow and progressive disclosure

| Stage                | Essential information                    | Required handoff                        |
| -------------------- | ---------------------------------------- | --------------------------------------- |
| Order intake         | Customer, items, delivery address, total | Confirm the order                       |
| Payment verification | Expected amount, method, receipt         | Review evidence and approve payment     |
| Inventory checking   | Required vs. available stock             | Resolve shortages and reserve items     |
| Order preparation    | Items and packing confirmation           | Confirm picked, checked, and packed     |
| Delivery             | Address, reference, proof                | Confirm delivery and complete           |
| Order completion     | Confirmed status, history, summary       | Download summary; no further transition |

Completed steps show read-only information, evidence links, and their recorded approval. Older demo records without a recorded approval say so explicitly. Future steps are visible but unavailable, making sequence and progress clear. Selecting a step opens its Details view, and a successful handoff opens the next stage's task, resets the scroll, and focuses the current stage. Attachments and activity remain available across stages. Supporting metadata is collapsed until requested. Notes are added in History. Completion presents its recorded completion time and delivery record directly, with summary download as its main action and delivery evidence review as its secondary action.

At New order, **Edit order details** sits beside **Confirm order** in the action footer and reuses the intake fields to correct the customer, products, quantities, address, notes, and deadline. Saving validates the order and records the correction. Confirming intake locks those values; later changes would need a business-approved rework policy because payment and stock decisions depend on them.

Stage-specific controls come before supporting information. Payment leads with the expected amount and receipt; stock checking and packing lead with the items; delivery leads with the address, reference, and proof. Payment and delivery provide contextual attachment buttons that open Documents with the correct evidence type. Contextual evidence views show only the requested evidence type and one upload action; the type is already known from the stage. A successful upload returns to the stage task and focuses its next action or remaining delivery reference. The general Documents archive keeps all files and its type selector. Downloading requires an actual stored file; seeded records without one show Original file unavailable. The interface does not generate sample evidence.

The queue names the work needed now, such as **Confirm packing** or **Attach delivery proof**, before offering a handoff such as **Complete order**. The Delivery stage is labeled **Delivery** because entering it confirms readiness for delivery, without claiming that a courier has dispatched the order.

The approval footer offers one forward action with a separate confirmation. When prerequisites are missing, the stage shows the work needed to resolve them; the handoff appears once ready. Documents, History, and past steps do not display a current-stage handoff. Approval confirmation hides the task content and offers only Confirm and Go back. The same constraints exist in the domain functions, so the UI is not the only guard.

## Cognitive load and hierarchy

- The default is a scan-friendly list. A board fits all six stages on wide desktop screens and scrolls horizontally on smaller screens. Its cards retain deadline and owner context.
- Blockers and urgency appear alongside the next action, so users can decide without opening every order.
- All views derive their counts from the same order collection. Moving an order updates the pipeline, queue, dashboard, and history.
- White surfaces, black primary actions, dark body text, and gray borders keep the interface neutral. Muted slate, amber, teal, purple, blue, and green connect stage badges, action links, stage filters, and order details. Light tints group statuses without coloring entire table rows. Muted red highlights overdue deliveries and urgency; amber marks deliveries due today and missing prerequisites; green marks completed delivery. Labels and explicit blocker messages keep status understandable without color.
- Each task area has one main action and at most one secondary action. Navigation and field choices stay visually separate from task actions. Essential stage information leads; supporting details are disclosed on demand. Repeated helper copy and duplicated actions are removed.
- Stock shortages use an explicit Save stock quantities action rather than saving when a field loses focus.
- Workspace banners, onboarding help, repeated counters, and redundant totals are removed. Stock checks and packing focus on product identifiers and quantities rather than prices.
- Body and table text use a system sans-serif font, with 14 px main text and a 13 px minimum for supporting text. Decorative subtitles, fabricated charts, and promotional copy are removed.
- Search, owner, priority, and stage filters combine. An empty result provides a clear reset.
- Intake asks for essentials first. Evidence and operational confirmations appear at the stage that needs them.
- Delivery deadlines are stored as timestamps and displayed in Philippine time. Overdue detection uses the current time, refreshes every minute, and breaks equal-urgency overdue ties by the oldest deadline. Existing relative labels migrate using the earliest recorded activity date as an approximation.
- Mobile navigation uses a modal drawer with managed focus, Escape dismissal, and focus return. Stage progress uses a contained focus ring.
- Motion is limited to small interface transitions and honors reduced-motion preferences.

## Implementation structure

- `src/lib/workflow.ts`: typed domain model, readiness checks, transitions, totals, and attention detection.
- `src/lib/workflow.test.ts`: domain tests, including the complete journey and blocked transitions.
- `src/data/orders.ts`: fictional demonstration records across all six stages.
- `src/features/orders/detail/`: contextual order workspace composed from progress, overview, items, stage-specific details, documents, history, notes, and approval actions.
- `src/features/orders/create/`: minimal intake form and customer fields.
- `src/features/stock/`: stock exceptions and order cards.
- `src/features/activity/`: workspace history.
- `src/features/orders/components/`: list and board views, filters, and shared status/avatar components.
- `src/features/orders/order-filters.ts`: search, combined filters, and queue sorting, covered by public-function tests.
- `src/features/orders/useOrders.ts`: loading, saving, and updating orders using the existing browser-storage key.
- `src/features/orders/status.css`: one muted palette for stage badges, action links, delivery dates, stage filters, and order details.
- `src/components/layout/` and `feedback/`: workspace navigation and notifications.
- `src/components/ui/`: reusable shadcn-style primitives using Radix.
- `src/index.css`: Tailwind imports, theme tokens, and shared animations. Feature CSS and its responsive rules live beside the owning components; shared defaults live in `src/styles/`. Button and Dialog use Tailwind utilities in their shadcn primitives.
- `src/App.tsx`: shared state, page selection, and dialog coordination.

## Production boundary

This prototype demonstrates workflow behavior; it is not a deployed multi-user order system.

| Prototype behavior               | Production requirement                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| Browser storage                  | Database, migrations, backup, retention, validated schemas                         |
| Simulated Alex/Mia/Sam ownership | Authentication, team membership, role-based approval permissions                   |
| Frontend transition checks       | Server-authoritative transitions, transactions, concurrency checks, idempotency    |
| Per-order stock quantities       | Shared inventory ledger with atomic reservations and releases                      |
| Uploaded files in localStorage   | Object storage, access control, upload validation, scanning, signed download links |
| Seeded payment documents         | Real receipt provenance and payment reconciliation                                 |
| Timestamped deadlines and a browser timer | Server-side reminders, business SLA rules, and overdue automation while nobody has the app open |
| Local activity entries           | Server-authored, immutable audit events and actor identity                         |
| Confirmation dialogs             | Permission-aware approvals, rejection/rework routes, cancellation/refund policy    |
| Sample delivery references       | Courier integration, booking state, failed delivery and return handling            |

The current stock controls intentionally update an order's demo availability; they do not allocate shared warehouse inventory. The sample-evidence generator and demo messaging are removed from the interface. Previously saved sample evidence keeps its original identifying filename. None of the actions sends messages, charges money, or books a delivery.

Before production, validate the stage model with operators and include the exception paths the actual business needs: rejected payments, partial fulfillment, cancellations, returns, and failed delivery. Run keyboard, screen reader, mobile, and visual browser checks with representative users. Measure time to identify the next action, time to resolve a blocker, and handoff error rate.

Production implementation should start with authenticated actors and server-enforced transitions, then shared inventory reservations. Agree on who can reject payment, cancel an order, release stock, and retry a failed delivery before implementing those paths. The demo intentionally does not invent refund, partial-fulfillment, or courier policies.
