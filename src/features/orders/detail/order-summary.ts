import { jsPDF } from "jspdf";
import { STAGES, stageApproval, total, type Order } from "../../../lib/workflow.ts";
import { deliveryLabel } from "../../../lib/delivery.ts";

export function createOrderSummary(order: Order, fonts: { normal: string; bold: string }) {
  const doc = new jsPDF({ format: "a4", unit: "mm", compress: true, putOnlyUsedFonts: true });
  for (const style of ["normal", "bold"] as const) {
    const file = `NotoSans-${style}.ttf`;
    doc.addFileToVFS(file, fonts[style]);
    doc.addFont(file, "NotoSans", style);
  }
  doc.setProperties({ title: `${order.id} — Order summary`, author: "Orderflow", subject: "Order record" });
  const left = 18;
  const right = 192;
  const bottom = 276;
  let y = 44;
  const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
  const date = (value: string) => Number.isFinite(Date.parse(value)) ? `${deliveryLabel(value)} PHT` : "Not recorded";

  function font(size = 10, bold = false, muted = false) {
    doc.setFont("NotoSans", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(muted ? 90 : 28);
  }
  function space(height: number) {
    if (y + height <= bottom) return false;
    doc.addPage();
    y = 44;
    return true;
  }
  function paragraph(value: string, muted = false) {
    font(10, false, muted);
    const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
    const lines: string[] = doc.splitTextToSize(text, right - left);
    for (const line of lines) {
      space(6);
      doc.text(line, left, y);
      y += 5.5;
    }
    y += 2;
  }
  function section(title: string) {
    space(21);
    y += 4;
    doc.setDrawColor(220);
    doc.line(left, y - 4, right, y - 4);
    font(12, true);
    doc.text(title, left, y + 3);
    y += 12;
  }
  function tableHeader() {
    space(12);
    font(9, true, true);
    doc.text("Item / SKU", left, y);
    doc.text("Qty", 128, y, { align: "right" });
    doc.text("Unit price", 158, y, { align: "right" });
    doc.text("Amount", right, y, { align: "right" });
    y += 8;
  }

  paragraph(`Status: ${STAGES[order.stage]}   ·   Assigned to ${order.owner}   ·   Priority: ${order.priority}`);
  section("Customer");
  paragraph(order.customer);
  if (order.company) paragraph(order.company);
  if (order.email) paragraph(`Email: ${order.email}`);
  paragraph(`Delivery address: ${order.address}`);

  section("Items");
  tableHeader();
  for (const item of order.items) {
    font();
    const names: string[] = doc.splitTextToSize(item.name, 98);
    const skus: string[] = doc.splitTextToSize(item.sku, 98);
    const lines = [...names, ...skus];
    for (let index = 0; index < lines.length; index++) {
      if (space(6)) tableHeader();
      font(10, false, index >= names.length);
      doc.text(lines[index], left, y);
      if (index === 0) {
        doc.text(String(item.qty), 128, y, { align: "right" });
        doc.text(currency.format(item.price), 158, y, { align: "right" });
        doc.text(currency.format(item.price * item.qty), right, y, { align: "right" });
      }
      y += 5.5;
    }
    y += 4;
  }
  space(14);
  doc.setDrawColor(220);
  doc.line(left, y, right, y);
  y += 8;
  font(12, true);
  doc.text("Order total", left, y);
  doc.text(currency.format(total(order)), right, y, { align: "right" });
  y += 10;

  section("Payment");
  paragraph(`Payment method: ${order.paymentMethod || "Not recorded"}`);
  paragraph(`Amount: ${currency.format(total(order))}`);
  const paymentApproval = stageApproval(order, 1);
  paragraph(`Approved: ${paymentApproval ? date(paymentApproval.at) : "Approval record unavailable"}`);

  section("Delivery");
  paragraph(`Delivery due: ${date(order.due)}`);
  paragraph(`Delivery reference: ${order.tracking || "Not recorded"}`);
  paragraph(`Packing confirmed: ${order.prepared ? "Yes" : "No"}`);
  const completion = stageApproval(order, 4);
  if (order.stage === 5) paragraph(`Completed: ${completion ? date(completion.at) : "Approval record unavailable"}`);
  if (order.note) {
    section("Customer notes");
    paragraph(order.note);
  }

  section("Documents");
  if (!order.attachments.length) paragraph("No documents attached.");
  for (const file of order.attachments) {
    const type = file.type === "receipt" ? "Payment receipt" : file.type === "delivery" ? "Delivery proof" : "Supporting document";
    paragraph(`${type}: ${file.name}${file.data ? "" : " (original file unavailable)"}`);
  }

  section("History and approvals");
  if (!order.activity.length) paragraph("No activity recorded.");
  for (const entry of [...order.activity].reverse()) {
    space(15);
    paragraph(date(entry.at), true);
    paragraph(entry.text);
  }

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    font(10, true);
    doc.text("orderflow.", left, 16);
    font(10, false, true);
    doc.text(order.id, right, 16, { align: "right" });
    font(21, true);
    doc.text("Order summary", left, 29);
    doc.setDrawColor(220);
    doc.line(left, 284, right, 284);
    font(8, false, true);
    doc.text(`${order.id} · Order record`, left, 290);
    doc.text(`${page} / ${pages}`, right, 290, { align: "right" });
  }
  return doc;
}
