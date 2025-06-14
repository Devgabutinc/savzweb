import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Order, Product } from '@/types/database';

interface ReceiptGeneratorProps {
  order: Order;
  product: Product;
}

const formatOrderNumber = (id: string): string => {
  return `ORD#${id.toString().slice(-4)}`;
};

const formatPrice = (amount: number): string => {
  return `Rp ${amount.toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const socialMediaInfo = {
  instagram: '@savz.ofc',
  whatsapp: '+62 812-3456-7890',
  email: 'info@savz.ofc.com',
  address: 'Jl. Raya SAVZ OFC No. 123, Bandung',
  website: 'www.savz.ofc.com'
};

// Helper function to draw lines
const drawLine = (pdf: jsPDF, x1: number, y1: number, x2: number, y2: number, lineWidth = 0.1) => {
  pdf.setLineWidth(lineWidth);
  pdf.line(x1, y1, x2, y2);
};

// Helper function to draw rectangles
const drawRect = (pdf: jsPDF, x: number, y: number, width: number, height: number, style: 'S' | 'F' | 'FD' = 'S') => {
  pdf.setLineWidth(0.1);
  pdf.rect(x, y, width, height, style);
};

// Helper function to add text with background
const addTextWithBackground = (pdf: jsPDF, text: string, x: number, y: number, options?: any) => {
  const textWidth = pdf.getTextWidth(text);
  const padding = 2;
  
  // Draw background
  pdf.setFillColor(240, 240, 240);
  pdf.rect(x - padding, y - 4, textWidth + (padding * 2), 6, 'F');
  
  // Add text
  pdf.setTextColor(0, 0, 0);
  pdf.text(text, x, y, options);
};

export const generateReceiptPDF = async ({ order, product }: ReceiptGeneratorProps) => {
  try {
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set default colors
    pdf.setTextColor('black');
    pdf.setDrawColor('black');

    // ========== HEADER SECTION ==========
    let currentY = 20;
    
    // Company Name
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('SAVZ OFC', 15, currentY);
    
    // Invoice title on the right
    pdf.setFontSize(16);
    pdf.text('INVOICE', 195, currentY, { align: 'right' });
    
    currentY += 8;
    
    // Company tagline
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor('gray');
    pdf.text('Professional Office Solutions', 15, currentY);
    
    // Order number and date on the right
    pdf.setTextColor('black');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(formatOrderNumber(order.id.toString()), 195, currentY, { align: 'right' });
    
    currentY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(format(new Date(order.created_at), 'dd MMMM yyyy', { locale: id }), 195, currentY, { align: 'right' });
    
    currentY += 10;
    
    // Header separator line
    drawLine(pdf, 15, currentY, 195, currentY, 0.5);
    currentY += 10;

    // ========== COMPANY INFO SECTION ==========
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('DARI:', 15, currentY);
    
    currentY += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('SAVZ OFC', 15, currentY);
    currentY += 4;
    pdf.text(socialMediaInfo.address, 15, currentY);
    currentY += 4;
    pdf.text(`Email: ${socialMediaInfo.email}`, 15, currentY);
    currentY += 4;
    pdf.text(`WhatsApp: ${socialMediaInfo.whatsapp}`, 15, currentY);
    currentY += 4;
    pdf.text(`Instagram: ${socialMediaInfo.instagram}`, 15, currentY);

    // ========== CUSTOMER INFO SECTION ==========
    let customerY = currentY - 20;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('KEPADA:', 120, customerY);
    
    customerY += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(order.customer_name, 120, customerY);
    customerY += 4;
    pdf.text(order.customer_phone, 120, customerY);
    customerY += 4;
    
    // Split address into multiple lines if too long
    const maxWidth = 75;
    const addressLines = pdf.splitTextToSize(order.customer_address, maxWidth);
    addressLines.forEach((line: string) => {
      pdf.text(line, 120, customerY);
      customerY += 4;
    });

    currentY = Math.max(currentY, customerY) + 10;

    // ========== PRODUCT IMAGE SECTION ==========
    if (product.image_url) {
      try {
        pdf.addImage(product.image_url, 'JPEG', 15, currentY, 40, 40);
      } catch (error) {
        console.error('Error adding product image:', error);
      }
    }

    currentY += 50;

    // ========== ITEMS TABLE ==========
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('DETAIL PEMESANAN', 15, currentY);
    currentY += 8;

    // Table header background
    pdf.setFillColor(230, 230, 230);
    drawRect(pdf, 15, currentY - 2, 180, 8, 'F');
    
    // Table header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('PRODUK', 18, currentY + 3);
    pdf.text('HARGA SATUAN', 120, currentY + 3, { align: 'center' });
    pdf.text('QTY', 150, currentY + 3, { align: 'center' });
    pdf.text('SUBTOTAL', 180, currentY + 3, { align: 'center' });
    
    currentY += 8;
    
    // Table border
    drawRect(pdf, 15, currentY - 10, 180, 8);
    
    // Product row
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(product.name, 18, currentY + 3);
    pdf.text(formatPrice(order.total_price), 120, currentY + 3, { align: 'center' });
    pdf.text('1', 150, currentY + 3, { align: 'center' });
    pdf.text(formatPrice(order.total_price), 180, currentY + 3, { align: 'center' });
    
    currentY += 8;
    
    // Product row border
    drawRect(pdf, 15, currentY - 8, 180, 8);
    
    // Add more space before total section
    currentY += 15;
    
    // Total section
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('TOTAL:', 150, currentY);
    pdf.setFontSize(12);
    pdf.text(formatPrice(order.total_price), 180, currentY, { align: 'center' });
    
    // Total border with spacing
    drawLine(pdf, 140, currentY - 6, 195, currentY - 6, 0.5);
    drawLine(pdf, 140, currentY + 6, 195, currentY + 6, 0.5);
    
    currentY += 15;

    // ========== PAYMENT INFORMATION ==========
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('INFORMASI PEMBAYARAN', 15, currentY);
    currentY += 8;

    // Payment details box
    drawRect(pdf, 15, currentY - 2, 90, 30);  // Increased width and height
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Metode Pembayaran:', 18, currentY + 3);
    pdf.setFont('helvetica', 'bold');
    pdf.text(order.payment_method.toUpperCase(), 18, currentY + 8);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text('Status Pembayaran:', 18, currentY + 13);
    const statusColor = getStatusColor(order.status);
    pdf.setTextColor(statusColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(getStatusText(order.status), 18, currentY + 18);
    pdf.setTextColor('black');

    // Payment amount box
    drawRect(pdf, 115, currentY - 2, 90, 30);  // Increased width and height
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Jumlah Dibayar:', 118, currentY + 3);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);  // Increased font size
    pdf.text(formatPrice(order.payment_amount), 118, currentY + 8);
    
    if (order.payment_type === 'dp50') {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text('Sisa Pembayaran:', 118, currentY + 13);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);  // Increased font size
      pdf.setTextColor('red');
      pdf.text(formatPrice(order.remaining_amount), 118, currentY + 18);
      pdf.setTextColor('black');
    }

    currentY += 40;  // Increased spacing

    // ========== NOTES SECTION ==========
    if (order.notes) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('CATATAN:', 15, currentY);
      currentY += 6;
      
      // Notes box
      const notesHeight = 15;
      pdf.setFillColor(250, 250, 250);
      drawRect(pdf, 15, currentY - 2, 180, notesHeight, 'F');
      drawRect(pdf, 15, currentY - 2, 180, notesHeight);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      const noteLines = pdf.splitTextToSize(order.notes, 170);
      pdf.text(noteLines, 18, currentY + 3);
      
      currentY += notesHeight + 5;
    }

    // ========== FOOTER ==========
    currentY = 260; // Fixed footer position
    
    // Footer separator
    drawLine(pdf, 15, currentY, 195, currentY, 0.5);
    currentY += 8;
    
    // Thank you message
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor('gray');
    pdf.text('Terima kasih telah berbelanja di SAVZ OFC!', 105, currentY, { align: 'center' });
    
    currentY += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('Simpan bukti pemesanan ini sebagai referensi.', 105, currentY, { align: 'center' });
    
    currentY += 5;
    pdf.text(`Website: ${socialMediaInfo.website}`, 105, currentY, { align: 'center' });
    
    // Page number
    pdf.setFontSize(7);
    pdf.setTextColor('gray');
    pdf.text('Halaman 1 dari 1', 195, 287, { align: 'right' });
    
    // Generation date
    pdf.setTextColor('gray');
    pdf.text(`Dicetak: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 287);
    
    // Save the PDF
    const filename = `invoice-${formatOrderNumber(order.id.toString())}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    return { pdf, filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const getStatusColor = (status: string): string => {
  const statusColors = {
    pending: '#FFA500',
    confirmed: '#008000',
    processing: '#0000FF',
    shipped: '#00008B',
    completed: '#006400',
    cancelled: '#8B0000',
  };
  return statusColors[status as keyof typeof statusColors] || 'black';
};

const getStatusText = (status: string): string => {
  const statusTexts = {
    pending: 'PENDING',
    confirmed: 'DIKONFIRMASI',
    processing: 'DIPROSES',
    shipped: 'DIKIRIM',
    completed: 'SELESAI',
    cancelled: 'DIBATALKAN',
  };
  return statusTexts[status as keyof typeof statusTexts] || status.toUpperCase();
};

export default generateReceiptPDF;