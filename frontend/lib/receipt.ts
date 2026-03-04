import { formatDate, formatPrice } from '@/lib/formatters';

export interface ReceiptParty {
  name?: string;
  email?: string;
}

export interface ReceiptLineItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptPayload {
  reference: string;
  orderId?: string;
  createdAt?: string;
  buyer?: ReceiptParty;
  seller?: ReceiptParty;
  items: ReceiptLineItem[];
  totalAmount: number;
  notes?: string;
}

function safeText(value: string | undefined, fallback = 'N/A'): string {
  if (!value || !value.trim()) return fallback;
  return value.trim();
}

export async function downloadReceiptPdf(payload: ReceiptPayload) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw new Error('Unable to generate receipt: itemized product list is missing.');
  }

  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const now = new Date().toISOString();
  const purchaseDate = payload.createdAt ? formatDate(payload.createdAt) : formatDate(now);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('CampusBazar Receipt', 48, 52);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Receipt Ref: ${safeText(payload.reference)}`, 48, 76);
  doc.text(`Order ID: ${safeText(payload.orderId)}`, 48, 94);
  doc.text(`Date of Purchase: ${purchaseDate}`, 48, 112);

  doc.setDrawColor(220);
  doc.line(48, 124, 548, 124);

  doc.setFont('helvetica', 'bold');
  doc.text('Buyer', 48, 148);
  doc.text('Seller', 300, 148);

  doc.setFont('helvetica', 'normal');
  doc.text(safeText(payload.buyer?.name), 48, 166);
  doc.text(safeText(payload.buyer?.email), 48, 184);
  doc.text(safeText(payload.seller?.name), 300, 166);
  doc.text(safeText(payload.seller?.email), 300, 184);

  doc.line(48, 198, 548, 198);

  doc.setFont('helvetica', 'bold');
  doc.text('Item', 48, 220);
  doc.text('Qty', 360, 220);
  doc.text('Unit Price', 420, 220);
  doc.text('Total', 510, 220, { align: 'right' });

  doc.setFont('helvetica', 'normal');

  let y = 242;
  payload.items.forEach((item) => {
    const rowTotal = item.quantity * item.unitPrice;
    const titleLines = doc.splitTextToSize(item.title || 'Item', 300);

    doc.text(titleLines, 48, y);
    doc.text(String(item.quantity), 360, y);
    doc.text(formatPrice(item.unitPrice), 420, y);
    doc.text(formatPrice(rowTotal), 510, y, { align: 'right' });

    y += Math.max(22, titleLines.length * 14);
  });

  y += 8;
  doc.line(48, y, 548, y);

  y += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`Grand Total: ${formatPrice(payload.totalAmount)}`, 510, y, { align: 'right' });

  if (payload.notes) {
    y += 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(`Notes: ${payload.notes}`, 500);
    doc.text(lines, 48, y);
  }

  doc.save(`receipt-${payload.reference || payload.orderId || Date.now()}.pdf`);
}
