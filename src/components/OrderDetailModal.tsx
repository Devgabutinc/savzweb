import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Order, Product } from "@/types/database";
import { useState } from "react";
import { X, Download } from "lucide-react";
import generateReceiptPDF from "./ReceiptGenerator";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetailModalProps {
  order: Order;
  product: Product;
  onClose: () => void;
}

const OrderDetailModal = ({ order, product, onClose }: OrderDetailModalProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReceipt = async () => {
    setIsDownloading(true);
    try {
      const { pdf, filename } = await generateReceiptPDF({ order, product });
      pdf.save(filename);
    } catch (error) {
      console.error('Error downloading receipt:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose} modal={false}>
      <DialogContent className="sm:max-w-[600px] bg-background h-full sm:h-auto overflow-y-auto max-h-[90vh] sm:max-h-[70vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detail Pesanan Anda</DialogTitle>
          <p className="sr-only">Detail pesanan Anda</p>
        </DialogHeader>
        <div className="grid gap-4 p-4 sm:p-6 overflow-y-auto max-h-[80vh] sm:max-h-[60vh]">
          <div className="space-y-2">
            <h4 className="font-medium">Informasi Produk</h4>
            <p className="text-sm text-muted-foreground mb-2">
              No. Order: {order.id ? `ORD#${order.id.toString().slice(-4)}` : 'ORD#XXXX'}
            </p>
            <div className="flex items-center gap-4">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop"}
                alt={product.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
                <p className="text-muted-foreground">
                  Ukuran: {order.size} | Qty: {order.quantity}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Informasi Pembayaran</h4>
            <p className="text-sm text-muted-foreground mb-2">
              No. Order: {order.id ? `ORD#${order.id.toString().slice(-4)}` : 'ORD#XXXX'}
            </p>
            <div className="space-y-1">
              <div className="space-y-3">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Badge variant="outline">{order.payment_method}</Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-600">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-lg font-semibold">
                  Rp {order.total_price.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="space-y-3">
                {order.payment_type === 'dp50' && (
                  <div className="mt-2">
                    <p className="text-lg font-semibold">
                      Sisa Pembayaran: Rp {order.remaining_amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={handleDownloadReceipt}
                    disabled={isDownloading}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {isDownloading ? 'Mengunduh...' : 'Unduh Bukti Pemesanan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Informasi Pengiriman</h4>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Nama: {order.customer_name}
              </p>
              <p className="text-sm text-muted-foreground">
                No. HP: {order.customer_phone}
              </p>
              <p className="text-sm text-muted-foreground">
                Alamat: {order.customer_address}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Catatan</h4>
            <p className="text-sm text-muted-foreground">{order.notes || "-"}</p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <Button variant="outline" onClick={onClose} className="w-full">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
