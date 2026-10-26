# UI review — October 26, 2026

Two independent GPT-6.1 Sol reviewers evaluated the rendered interface and connected source across two rounds. These scores are expert judgments of this prototype, not results from operator usability studies.

| Reviewer | Round 1 | Round 2 | Main reason for the improvement |
| --- | --- | --- | --- |
| A: hierarchy and space | 8.1/10 | 9.0/10 | More work visible on mobile, six desktop board stages visible, stronger text hierarchy |
| B: task clarity and accessibility | 8.3/10 | 9.0/10 | Clearer queue, deadlines and owners retained on board, appropriate control semantics and modal navigation |

## Findings and changes

- **Excessive queue chrome:** merged Download list with New order in the page heading and removed the duplicate Order list heading. Mobile uses one native view selector; search and Filters share a row.
- **Oversized mobile cards:** removed the repeated next-action label and placed the deadline alongside the amount. At 390 × 844, the first card starts at 258 px instead of 437 px; card height falls from about 337 px to 245 px. Two full orders are initially visible.
- **Hidden board stages and missing urgency:** six columns fit the 1440 px desktop viewport. Every card shows its deadline and assigned owner. Smaller screens retain a horizontally scrollable board. Compact dates preserve their full timestamp and Philippine time in accessible labels and tooltips.
- **Flat stock/history typography:** product names and activity descriptions use 14 px dark medium/bold text; identifiers and timestamps remain secondary.
- **Clipped progress focus:** stage buttons use a rounded, contained focus outline.
- **Mobile drawer keyboard gaps:** replaced the scrim/sidebar toggle with a Radix modal drawer. Opening moves focus inside; Tab stays inside; Escape closes it and returns focus to the trigger. The background is hidden from assistive technology while open.
- **Incorrect queue tab semantics:** filters use a labeled button group with pressed states; mobile uses a labeled select.
- **Empty history:** added an explicit empty state.

Both reviewers found no remaining blocker to a 9 after inspecting the second-round screenshots and source. Reviewer A's optional clipped-search-placeholder finding was also fixed. The creation form remains scrollable because its fields are necessary; no filler was added to short stock lists.

## Evidence and limits

Each round covered Orders, board, Stock checks, Order history, payment, packing, delivery, completion, and creation on desktop, plus Orders, payment, and creation at 390 px. A further screenshot covered the mobile drawer.

Root-agent browser verification covered drawer focus wrapping, Escape and focus return, background hiding, mobile attention selection, full deadline labels, and no page overflow at 320 px and 390 px. All six board columns fit at 1440 px. The filter panel scrolls when screen height is limited. The console showed no errors. The production build, 17 domain/filter tests, and whitespace checks passed.

Reviewers inspected screenshots and source; they did not independently operate a screen reader. Physical-device testing, a full screen-reader audit, and studies with real operators remain outstanding. Workflow transition rules and the prototype's local-storage/integration boundaries remain unchanged.

## Subsequent desktop order-flow pass

This pass followed one order through all six stages at 1440 × 1000. It did not introduce a new reviewer score.

| Stage | Main action | Secondary action | Information in focus |
| --- | --- | --- | --- |
| Intake | Confirm order | Edit order details | Items and delivery requirements |
| Payment | Attach receipt, then Approve payment | Review receipt once attached | Expected payment and receipt |
| Stock check | Save shortage quantities, then Reserve stock | None | Required versus available stock |
| Packing | Confirm packing, then Mark ready for delivery | None | Items and packing confirmation |
| Delivery | Attach proof, then Complete order once ready | Review proof once attached | Recipient/address and delivery reference/evidence |
| Completed | Download summary | Review delivery proof | Completion timestamp and delivery record |

Navigation, disclosures, form choices, and the standard dialog dismissal remain separate from task actions. Approval confirmation shows only Go back and the handoff action.

Intake editing now shares the action footer with confirmation. Contextual evidence views show only the requested evidence type and omit the redundant type selector. Successful contextual uploads return to Details and focus the handoff, or the delivery reference when still missing. The general Documents archive retains its type selector and stays open after an upload. Each handoff resets scroll and focuses the new stage. Saving replenished stock focuses Reserve stock. Intake edit cancellation returns focus to Edit order details.

Completion now shows its actual recorded approval timestamp, address, and reference without requiring a disclosure. Operational notes remain visible at intake, packing, and delivery; other stages keep them with supporting information. The creation icon and repeated footer status helpers were removed.

Browser verification created a temporary order, corrected its quantity, uploaded a receipt, resolved a shortage, confirmed packing, uploaded delivery proof before entering its missing reference, and completed all five guarded handoffs. Completion retained all five approval records after refresh. Past payment inspection exposed its recorded approval and no current handoff. Evidence review filtered out unrelated documents; the general archive remained available. Temporary order and upload data were restored afterward. Build, 17 tests, and whitespace checks passed. This pass focused on desktop; mobile and full screen-reader testing were not repeated.


## Direct evidence and guided handoffs

This desktop refinement supersedes the earlier tab-based evidence behavior. Two independent GPT-6.1 Sol council reviewers assessed the requested flow through three rounds. Initial scores used source review; subsequent rounds used rendered screenshots and connected source. Scores are expert assessments of the prototype, not operator study results.

| Reviewer | Existing flow | First implementation | Final refinement |
| --- | --- | --- | --- |
| A | 6.5/10 | 8.6/10 | **9.0/10** |
| B | 7.2/10 | 9.0/10 | **9.2/10** |

The initial findings were an unmarked required delivery reference, hidden blocked handoffs, extra upload navigation, and a general document selector that allowed delivery proof during Payment. The first implementation removed the section tabs, added visible requirements and direct stage-derived uploads, and kept a stable guided handoff footer. Reviewers then identified notifications covering the footer, inconsistent upload focus, and validation appearing too far from the task.

Final changes:

- Delivery reference, stage evidence, stock correction, and packing confirmation visibly identify required work.
- Attach payment receipt and Attach delivery proof open the file chooser directly. The document type is automatic and enforced in the domain layer; other stages cannot upload, including while inspecting completed steps.
- Stage work stays visible. Order information, a read-only Documents archive, and History expand below it.
- Every unfinished stage retains its handoff. It is muted while blocked but remains operable to guide the missing requirement: intake editing, receipt chooser, shortage input, packing confirmation, delivery reference, or proof chooser. Business guards still prevent advancement.
- Missing uploads are primary; attaching another file is secondary. Once ready, the handoff is primary. Approval still has only Go back and Confirm.
- Upload errors sit beside evidence. Successful uploads focus the handoff or remaining delivery reference after rendering completes.
- Compact notifications sit above desktop dialog controls. At 1280 px, a long top-right notification had covered Close; final top-center placement clears Close, header text, and the footer. Positioning the table scroll container also contains its absolute screen-reader header and prevents page overflow at that width.

Root browser checks followed a temporary order through all six stages with real local test-file uploads, a shortage correction, packing confirmation, and all five approvals. Checks verified direct input activation, keyboard activation of a blocked payment/proof handoff, focused stock/packing/reference controls, invalid-file rejection without recording evidence, automatic receipt/delivery types, visible inline validation, post-upload focus, past-step read-only evidence, and refresh persistence. Desktop checks used 1440 × 1000 and 1280 × 800; the smaller viewport had no page overflow after the table fix. Original browser records were restored after testing.

The reviewers inspected ten first-implementation and nine refinement screenshots. The final 1280 px screenshot used a disclosed DOM notification fixture with actual toast styles and a standard long handoff message for stable capture; separate live browser measurements confirmed no intersection with Close or the footer. Both reviewers confirmed their final scores after the responsive correction. Evidence is under `/tmp/orderflow-flow-council/` for this session.

Production build, 18 domain/filter tests, and whitespace checks passed. A new domain test checks receipt, delivery, and other evidence against all six stages, rejects missing file data, and confirms accepted evidence preserves stage and records history. Mobile, full screen-reader testing, and studies with operators were not repeated in this desktop pass. Local storage and external-integration limits remain as described in README and DESIGN.
