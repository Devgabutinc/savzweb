import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Order, Product } from "@/types/database";
import { useState } from "react";
import { X, Download, Loader2, ArrowLeft, Home } from "lucide-react";
import generateReceiptPDF from "./ReceiptGenerator";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetailModalProps {
  order: Order;
  product: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrderDetailModal = ({ order, product, onClose, onSuccess }: OrderDetailModalProps) => {
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Order</DialogTitle>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Status: {order.status}
              </p>
              <p className="text-sm text-muted-foreground">
                No. Order: ORD#{order.id.toString().slice(-4).toUpperCase()}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </>
              )}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Informasi Produk</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Produk: {product.name}</p>
              <p className="text-sm text-muted-foreground">Ukuran: {order.size}</p>
              <p className="text-sm text-muted-foreground">Jumlah: {order.quantity}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Informasi Pembayaran</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                No. Order: ORD#{order.id.toString().slice(-4).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Metode: {order.payment_method === 'qris' ? 'QRIS' : 'Transfer Bank'}
              </p>
              <p className="text-sm text-muted-foreground">
                Tipe: {order.payment_type === 'dp50' ? 'DP 50%' : 'Pembayaran Penuh'}
              </p>
              <p className="text-sm text-muted-foreground">
                Jumlah: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.payment_amount)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Informasi Pengiriman</h3>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nama: {order.customer_name}</p>
              <p className="text-sm text-muted-foreground">No. HP: {order.customer_phone}</p>
              <p className="text-sm text-muted-foreground">Alamat: {order.customer_address}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Catatan</h3>
            <p className="text-sm text-muted-foreground">{order.notes || 'Tidak ada catatan'} </p>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => {
                onClose();
                if (onSuccess) {
                  onSuccess();
                }
              }}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
