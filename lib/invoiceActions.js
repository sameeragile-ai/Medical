import { fmtDate, fmtMoney } from "@/lib/format";

// Edit these to your pharmacy's real details — they appear on every printed invoice.
export const COMPANY = {
  name: "Medical",
  address: "",
  phone: "",
  email: "",
};

function invoiceItems(inquiry) {
  if (Array.isArray(inquiry.items) && inquiry.items.length) return inquiry.items;
  if (inquiry.product_name) {
    return [{ productName: inquiry.product_name, qty: inquiry.qty, price: inquiry.qty ? inquiry.value / inquiry.qty : 0, amount: inquiry.value }];
  }
  return [];
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function buildInvoiceHtml(inquiry) {
  const items = invoiceItems(inquiry);
  const rows = items
    .map(
      (it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(it.productName)}</td>
        <td class="num">${escapeHtml(it.qty)}</td>
        <td class="num">${fmtMoney(it.price)}</td>
        <td class="num">${fmtMoney(it.amount)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(inquiry.invoice)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
  .company { font-size: 22px; font-weight: 800; letter-spacing: 0.03em; }
  .company small { display: block; font-size: 12px; font-weight: 400; color: #444; margin-top: 4px; }
  .invoice-meta { text-align: right; font-size: 12.5px; color: #333; }
  .invoice-meta div { margin-bottom: 2px; }
  .invoice-meta b { font-size: 15px; }
  .profile { border: 1px solid #999; border-radius: 4px; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; }
  .profile-title { font-weight: 700; text-align: center; border-bottom: 1px solid #ccc; margin-bottom: 8px; padding-bottom: 6px; letter-spacing: 0.08em; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  th, td { border: 1px solid #999; padding: 8px 10px; font-size: 12.5px; }
  th { background: #f0f0f0; text-align: left; }
  td.num, th.num { text-align: right; }
  tfoot td { font-weight: 700; }
  .totals { width: 320px; margin-left: auto; font-size: 13px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid #111; font-weight: 800; font-size: 15px; padding-top: 8px; margin-top: 4px; }
  .footer { margin-top: 30px; font-size: 11px; color: #666; text-align: center; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="company">${escapeHtml(COMPANY.name)}
      <small>${escapeHtml(COMPANY.address)}</small>
      <small>${[COMPANY.phone, COMPANY.email].filter(Boolean).join(" · ")}</small>
    </div>
    <div class="invoice-meta">
      <div><b>SALES INVOICE</b></div>
      <div>Invoice No.: ${escapeHtml(inquiry.invoice)}</div>
      <div>Date: ${fmtDate(inquiry.date)}</div>
    </div>
  </div>

  <div class="profile">
    <div class="profile-title">CUSTOMER PROFILE</div>
    <div><b>Name:</b> ${escapeHtml(inquiry.customer_name)}</div>
    ${inquiry.address ? `<div><b>Address:</b> ${escapeHtml(inquiry.address)}</div>` : ""}
    ${inquiry.contact_primary ? `<div><b>Contact No.:</b> ${escapeHtml(inquiry.contact_primary)}</div>` : ""}
    ${inquiry.prescriber ? `<div><b>Prescriber:</b> ${escapeHtml(inquiry.prescriber)}</div>` : ""}
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product</th>
        <th class="num">Qty</th>
        <th class="num">Rate</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Total quantity</span><span>${escapeHtml(inquiry.qty)}</span></div>
    <div class="grand"><span>NET AMOUNT</span><span>${fmtMoney(inquiry.value)}</span></div>
  </div>

  <div class="footer">This is a computer-generated invoice.</div>
</body>
</html>`;
}

export function printInquiryInvoice(inquiry) {
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  win.document.open();
  win.document.write(buildInvoiceHtml(inquiry));
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  setTimeout(() => win.print(), 300);
}

export function printInquiriesInvoices(inquiries) {
  if (!inquiries.length) return;
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  const pages = inquiries
    .map((inquiry) => buildInvoiceHtml(inquiry).replace(/^[\s\S]*<body>|<\/body>[\s\S]*$/g, ""))
    .join('<div style="page-break-after: always;"></div>');
  win.document.open();
  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoices</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 32px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 18px; }
  .company { font-size: 22px; font-weight: 800; letter-spacing: 0.03em; }
  .company small { display: block; font-size: 12px; font-weight: 400; color: #444; margin-top: 4px; }
  .invoice-meta { text-align: right; font-size: 12.5px; color: #333; }
  .invoice-meta div { margin-bottom: 2px; }
  .invoice-meta b { font-size: 15px; }
  .profile { border: 1px solid #999; border-radius: 4px; padding: 10px 14px; margin-bottom: 18px; font-size: 13px; line-height: 1.6; }
  .profile-title { font-weight: 700; text-align: center; border-bottom: 1px solid #ccc; margin-bottom: 8px; padding-bottom: 6px; letter-spacing: 0.08em; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  th, td { border: 1px solid #999; padding: 8px 10px; font-size: 12.5px; }
  th { background: #f0f0f0; text-align: left; }
  td.num, th.num { text-align: right; }
  tfoot td { font-weight: 700; }
  .totals { width: 320px; margin-left: auto; font-size: 13px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid #111; font-weight: 800; font-size: 15px; padding-top: 8px; margin-top: 4px; }
  .footer { margin-top: 30px; font-size: 11px; color: #666; text-align: center; }
  @media print { body { padding: 10px; } }
</style>
</head>
<body>${pages}</body>
</html>`);
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  setTimeout(() => win.print(), 300);
}

function invoiceSummaryText(inquiry) {
  const items = invoiceItems(inquiry);
  const lines = items.map((it) => `- ${it.productName} x${it.qty} = ${fmtMoney(it.amount)}`);
  return [
    `Invoice ${inquiry.invoice}`,
    `Customer: ${inquiry.customer_name}`,
    `Date: ${fmtDate(inquiry.date)}`,
    "",
    ...lines,
    "",
    `Total: ${fmtMoney(inquiry.value)}`,
  ].join("\n");
}

export function buildOrderSheetHtml(dateLabel, inquiries) {
  const rows = inquiries
    .map((inq, i) => {
      const items = invoiceItems(inq);
      const itemsText = items.length
        ? items.map((it) => `${escapeHtml(it.productName)} x${escapeHtml(it.qty)}`).join("<br/>")
        : escapeHtml(inq.product_name || "—");
      const contacts = [inq.contact_primary, inq.contact_alt1, inq.contact_alt2].filter(Boolean).map(escapeHtml).join("<br/>");
      return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(inq.invoice)}</td>
        <td>${escapeHtml(inq.customer_name)}${inq.care_of ? `<br/><small>C/O ${escapeHtml(inq.care_of)}</small>` : ""}</td>
        <td>${escapeHtml(inq.address) || "—"}</td>
        <td>${contacts || "—"}</td>
        <td>${itemsText}</td>
        <td class="num">${escapeHtml(inq.qty)}</td>
        <td class="num">${fmtMoney(inq.value)}</td>
        <td class="chk-cell"><span class="chk"></span></td>
        <td class="chk-cell"><span class="chk"></span></td>
        <td class="chk-cell"><span class="chk"></span></td>
        <td class="sign"></td>
      </tr>`;
    })
    .join("");

  const totalValue = inquiries.reduce((s, i) => s + Number(i.value || 0), 0);

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Rider Order Sheet — ${escapeHtml(dateLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 14px; }
  .company { font-size: 20px; font-weight: 800; letter-spacing: 0.03em; }
  .meta { text-align: right; font-size: 12.5px; color: #333; }
  .meta b { font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #999; padding: 6px 7px; font-size: 11.5px; vertical-align: top; }
  th { background: #f0f0f0; text-align: left; }
  td.num, th.num { text-align: right; }
  td.chk-cell, th.chk-col { text-align: center; width: 46px; }
  .chk { display: inline-block; width: 16px; height: 16px; border: 1.5px solid #333; }
  td.sign, th.sign-col { width: 90px; }
  tfoot td { font-weight: 700; }
  .rider-info { display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 12.5px; }
  .rider-info div { border: 1px solid #999; padding: 8px 12px; border-radius: 4px; flex: 1; margin-right: 10px; }
  .rider-info div:last-child { margin-right: 0; }
  .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
  @media print { body { padding: 8px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="company">${escapeHtml(COMPANY.name)}</div>
    <div class="meta">
      <div><b>RIDER ORDER SHEET</b></div>
      <div>Date: ${escapeHtml(dateLabel)}</div>
      <div>Total orders: ${inquiries.length}</div>
    </div>
  </div>

  <div class="rider-info">
    <div><b>Rider name:</b> ________________________</div>
    <div><b>Signature:</b> ________________________</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Invoice</th>
        <th>Customer</th>
        <th>Address</th>
        <th>Contact</th>
        <th>Items</th>
        <th class="num">Qty</th>
        <th class="num">Amount</th>
        <th class="chk-col">Cash</th>
        <th class="chk-col">Online</th>
        <th class="chk-col">Cheque</th>
        <th class="sign-col">Received by (sign)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="7">Total</td>
        <td class="num">${fmtMoney(totalValue)}</td>
        <td colspan="4"></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">Rider must tick the exact payment method received and sign against each order before handing over collections to admin.</div>
</body>
</html>`;
}

export function printOrderSheet(dateLabel, inquiries) {
  if (!inquiries.length) return;
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  win.document.open();
  win.document.write(buildOrderSheetHtml(dateLabel, inquiries));
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  setTimeout(() => win.print(), 300);
}

export function emailInquiryInvoice(inquiry) {
  const subject = `Invoice ${inquiry.invoice} — ${inquiry.customer_name}`;
  const body = invoiceSummaryText(inquiry);
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
