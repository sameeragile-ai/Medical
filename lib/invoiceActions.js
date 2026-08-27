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

const INVOICE_PDF_WIDTH = 794;

function loadIframeDocument(html) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "-99999px";
    iframe.style.width = `${INVOICE_PDF_WIDTH}px`;
    iframe.style.height = "1px";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    iframe.onload = () => {
      const body = iframe.contentDocument?.body;
      if (!body) {
        document.body.removeChild(iframe);
        reject(new Error("Failed to render invoice document"));
        return;
      }
      // scrollHeight isn't reliable yet at "load" — layout can still be
      // settling for a variable number of frames. Poll until it stops
      // changing instead of guessing a fixed number of frames to wait.
      const win = iframe.contentWindow || window;
      const start = Date.now();
      let lastHeight = -1;
      let stableFrames = 0;
      const poll = () => {
        const h = body.scrollHeight;
        stableFrames = h === lastHeight ? stableFrames + 1 : 0;
        lastHeight = h;
        if (stableFrames >= 3 || Date.now() - start > 1000) {
          iframe.style.height = `${h}px`;
          resolve({ iframe, body });
          return;
        }
        win.requestAnimationFrame(poll);
      };
      win.requestAnimationFrame(poll);
    };
    iframe.onerror = () => {
      document.body.removeChild(iframe);
      reject(new Error("Failed to render invoice document"));
    };

    document.body.appendChild(iframe);
    iframe.srcdoc = html;
  });
}

async function renderInvoicePdf(inquiry, mode) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const { iframe, body } = await loadIframeDocument(buildInvoiceHtml(inquiry));

  try {
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: INVOICE_PDF_WIDTH,
      width: INVOICE_PDF_WIDTH,
      windowHeight: body.scrollHeight,
      height: body.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const usableHeight = pageHeight - margin * 2;

    let heightLeft = imgHeight;
    let position = margin;
    pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    }

    const filename = `invoice-${inquiry.invoice || inquiry.id}.pdf`;
    if (mode === "blob") return pdf.output("blob");
    pdf.save(filename);
    return null;
  } finally {
    document.body.removeChild(iframe);
  }
}

export async function downloadInquiryInvoicePdf(inquiry) {
  await renderInvoicePdf(inquiry, "save");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

export function buildRecoverySheetHtml(rangeLabel, inquiries) {
  const methodLabel = (i) => {
    const m = [];
    if (i.received_cash) m.push("Cash");
    if (i.received_online) m.push("Online");
    if (i.received_cheque) m.push("Cheque");
    return m.join(", ") || "—";
  };

  const totals = inquiries.reduce(
    (acc, i) => {
      const v = Number(i.value || 0);
      acc.total += v;
      if (i.received_cash) acc.cash += v;
      if (i.received_online) acc.online += v;
      if (i.received_cheque) acc.cheque += v;
      return acc;
    },
    { total: 0, cash: 0, online: 0, cheque: 0 }
  );

  const rows = inquiries
    .map(
      (inq, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${fmtDate(inq.received_at)}</td>
        <td>${escapeHtml(inq.invoice)}</td>
        <td>${escapeHtml(inq.customer_name)}</td>
        <td>${escapeHtml(inq.address) || "—"}</td>
        <td>${escapeHtml(inq.contact_primary) || "—"}</td>
        <td>${escapeHtml(methodLabel(inq))}</td>
        <td class="num">${fmtMoney(inq.value)}</td>
      </tr>`
    )
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Daily Recovery Sheet — ${escapeHtml(rangeLabel)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 24px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 14px; }
  .company { font-size: 20px; font-weight: 800; letter-spacing: 0.03em; }
  .meta { text-align: right; font-size: 12.5px; color: #333; }
  .meta b { font-size: 15px; }
  .summary { display: flex; gap: 10px; margin-bottom: 16px; }
  .summary div { border: 1px solid #999; border-radius: 4px; padding: 8px 12px; flex: 1; font-size: 12px; }
  .summary b { display: block; font-size: 15px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid #999; padding: 6px 8px; font-size: 12px; vertical-align: top; }
  th { background: #f0f0f0; text-align: left; }
  td.num, th.num { text-align: right; }
  tfoot td { font-weight: 700; }
  .footer { margin-top: 20px; font-size: 11px; color: #666; text-align: center; }
  @media print { body { padding: 8px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="company">${escapeHtml(COMPANY.name)}</div>
    <div class="meta">
      <div><b>DAILY RECOVERY SHEET</b></div>
      <div>Period: ${escapeHtml(rangeLabel)}</div>
      <div>Total entries: ${inquiries.length}</div>
    </div>
  </div>

  <div class="summary">
    <div>Total recovered<b>${fmtMoney(totals.total)}</b></div>
    <div>Cash<b>${fmtMoney(totals.cash)}</b></div>
    <div>Online<b>${fmtMoney(totals.online)}</b></div>
    <div>Cheque<b>${fmtMoney(totals.cheque)}</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Received</th>
        <th>Invoice</th>
        <th>Customer</th>
        <th>Address</th>
        <th>Contact</th>
        <th>Method</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="7">Total</td>
        <td class="num">${fmtMoney(totals.total)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">This is a computer-generated recovery sheet.</div>
</body>
</html>`;
}

export function printRecoverySheet(rangeLabel, inquiries) {
  if (!inquiries.length) return;
  const win = window.open("", "_blank", "width=1100,height=800");
  if (!win) return;
  win.document.open();
  win.document.write(buildRecoverySheetHtml(rangeLabel, inquiries));
  win.document.close();
  win.focus();
  win.onload = () => win.print();
  setTimeout(() => win.print(), 300);
}

export async function emailInquiryInvoice(inquiry) {
  const subject = `Invoice ${inquiry.invoice} — ${inquiry.customer_name}`;
  const body = `${invoiceSummaryText(inquiry)}\n\n(The invoice PDF has been downloaded to your device — please attach it to this email before sending.)`;
  const blob = await renderInvoicePdf(inquiry, "blob");
  if (blob) downloadBlob(blob, `invoice-${inquiry.invoice || inquiry.id}.pdf`);
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function whatsappInquiryInvoice(inquiry) {
  const text = `${invoiceSummaryText(inquiry)}\n\n(Invoice PDF downloaded to your device — please attach it to this chat.)`;
  const blob = await renderInvoicePdf(inquiry, "blob");
  if (blob) downloadBlob(blob, `invoice-${inquiry.invoice || inquiry.id}.pdf`);
  const contact = (inquiry.contact_primary || "").replace(/[^\d+]/g, "");
  const base = contact ? `https://wa.me/${contact.replace(/^\+/, "")}` : "https://wa.me/";
  window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank");
}
