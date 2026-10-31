import { PACKAGE_CATEGORY_LABELS } from "../types/invoice";
import type { InvoiceRenderData } from "../types/invoice";
import { getLogoDataUri } from "../utils/assets";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escapes text and preserves line breaks entered by the user. */
const multiline = (value: string): string =>
  escapeHtml(value).replace(/\r?\n/g, "<br />");

const formatDate = (iso: string): string => {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const formatMoney = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

const partyBlock = (
  title: string,
  rows: Array<[string, string]>
): string => `
  <div class="party">
    <div class="party-title">${escapeHtml(title)}</div>
    ${rows
      .filter(([, value]) => value.trim() !== "")
      .map(
        ([label, value]) => `
        <div class="row">
          <span class="label">${escapeHtml(label)}</span>
          <span class="value">${multiline(value)}</span>
        </div>`
      )
      .join("")}
  </div>`;

export function renderInvoiceHtml(data: InvoiceRenderData): string {
  const { customer, business, invoice, financial, terms } = data;

  const logo = getLogoDataUri();
  const watermarkHtml = logo
    ? `<img class="watermark" src="${logo}" alt="" />`
    : "";

  const termsHtml = terms
    .map(
      (section, index) => `
      <div class="term">
        <div class="term-heading">${index + 1}. ${escapeHtml(section.heading)}</div>
        <div class="term-body">${multiline(section.description)}</div>
      </div>`
    )
    .join("");

  const dueClass = financial.dueAmount > 0 ? "due-pending" : "due-clear";
  const categoryLabel = PACKAGE_CATEGORY_LABELS[invoice.packageCategory];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    @page { size: A4; margin: 0; }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      width: 210mm;
      background: #ffffff;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #1f2933;
      font-size: 10pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Centered, faded logo. Fixed = centered on every printed page. */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      width: 168mm;
      height: auto;
      transform: translate(-50%, -50%);
      opacity: 0.07;
      z-index: 0;
      pointer-events: none;
    }

    /* Content box: 210mm wide, 12mm top/bottom and 14mm side padding */
    #page {
      position: relative;
      z-index: 1;
      width: 210mm;
      padding: 12mm 14mm;
      overflow: hidden;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2.5px solid #111827;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .header .title {
      font-size: 22pt;
      font-weight: 800;
      letter-spacing: 3px;
      color: #111827;
    }
    .header .number {
      font-size: 12pt;
      font-weight: 700;
      color: #374151;
    }

    .parties {
      display: flex;
      gap: 12mm;
      margin-bottom: 16px;
    }
    .party { flex: 1; }
    .party-title {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 3px;
      margin-bottom: 6px;
    }
    .party .row { display: flex; gap: 6px; margin-bottom: 2px; }
    .party .label { width: 62px; flex-shrink: 0; font-weight: 700; color: #374151; }
    .party .value { flex: 1; word-break: break-word; }

    table.info {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin-bottom: 16px;
    }
    table.info th {
      background: #111827;
      color: #ffffff;
      font-size: 8pt;
      letter-spacing: 1px;
      text-transform: uppercase;
      text-align: left;
      padding: 7px 8px;
    }
    table.info td {
      border-bottom: 1px solid #d1d5db;
      padding: 8px;
      font-size: 10pt;
      vertical-align: top;
      word-break: break-word;
    }
    table.info th.num, table.info td.num { text-align: right; }
    .pkg-cat {
      font-size: 7pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #6b7280;
      margin-bottom: 2px;
    }
    .pkg-name { font-weight: 600; }

    .summary-wrap { display: flex; justify-content: flex-end; margin-bottom: 18px; }
    table.summary { width: 82mm; border-collapse: collapse; }
    table.summary td { padding: 4px 8px; border-bottom: 1px solid #e5e7eb; }
    table.summary td.num { text-align: right; font-variant-numeric: tabular-nums; }
    table.summary tr.final td { font-weight: 700; border-top: 1.5px solid #111827; }
    table.summary tr.due td {
      font-weight: 800;
      font-size: 11pt;
      background: rgba(243, 244, 246, 0.7);
      border-bottom: 2px solid #111827;
    }
    .due-pending { color: #b91c1c; }
    .due-clear { color: #047857; }

    .terms-title {
      font-size: 10pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      border-bottom: 1.5px solid #111827;
      padding-bottom: 4px;
      margin-bottom: 14px;
    }
    .term {
      break-inside: avoid;
      page-break-inside: avoid;
      margin-bottom: 14px;
    }
    .term-heading {
      font-weight: 700;
      font-size: 10pt;
      color: #111827;
      margin-bottom: 4px;
    }
    .term-body {
      font-size: 8.5pt;
      color: #4b5563;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  ${watermarkHtml}
  <div id="page">
    <div class="header">
      <div class="title">INVOICE</div>
      <div class="number">No: ${escapeHtml(invoice.invoiceNumber)}</div>
    </div>

    <div class="parties">
      ${partyBlock("Billed To", [
        ["Name", customer.name],
        ["Address", customer.address],
        ["Email", customer.email],
        ["Phone", customer.phone],
        ["Member ID", customer.memberId],
      ])}
      ${partyBlock("From", [
        ["Name", business.name],
        ["Address", business.address],
        ["Email", business.email],
        ["Phone", business.phone],
      ])}
    </div>

    <table class="info">
      <colgroup>
        <col style="width: 17%" />
        <col style="width: 33%" />
        <col style="width: 17%" />
        <col style="width: 17%" />
        <col style="width: 16%" />
      </colgroup>
      <thead>
        <tr>
          <th>Invoice Date</th>
          <th>Package</th>
          <th>Start Date</th>
          <th>Expiry Date</th>
          <th class="num">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${formatDate(invoice.invoiceDate)}</td>
          <td>
            <div class="pkg-cat">${escapeHtml(categoryLabel)}</div>
            <div class="pkg-name">${escapeHtml(invoice.packageName)}</div>
          </td>
          <td>${formatDate(invoice.startDate)}</td>
          <td>${formatDate(invoice.expiryDate)}</td>
          <td class="num">${formatMoney(financial.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-wrap">
      <table class="summary">
        <tr><td>Discount</td><td class="num">${formatMoney(financial.discount)}</td></tr>
        <tr><td>Subtotal</td><td class="num">${formatMoney(financial.subtotal)}</td></tr>
        <tr class="final"><td>Final Amount</td><td class="num">${formatMoney(financial.finalAmount)}</td></tr>
        <tr><td>Paid Amount</td><td class="num">${formatMoney(financial.paidAmount)}</td></tr>
        <tr class="due"><td>Due Amount</td><td class="num ${dueClass}">${formatMoney(financial.dueAmount)}</td></tr>
      </table>
    </div>

    ${
      terms.length > 0
        ? `<div class="terms-title">Terms &amp; Conditions</div>
           <div class="terms">${termsHtml}</div>`
        : ""
    }
  </div>
</body>
</html>`;
}