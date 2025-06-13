import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, Order } from "@/types/database";
import PaymentPage from "./PaymentPage";

interface OrderFormProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const OrderForm = ({ product, onClose, onSuccess }: OrderFormProps) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'payment'>('form');
  const [orderData, setOrderData] = useState<Omit<Order, 'id' | 'created_at' | 'updated_at' | 'payment_id' | 'payment_url'> | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    size: "" as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | "",
    quantity: 1,
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    return product.price * formData.quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.size) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pilih ukuran terlebih dahulu",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create order data without saving to database yet
      const order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'payment_id' | 'payment_url'> = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        product_id: product.id,
        size: formData.size as 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL',
        quantity: formData.quantity,
        total_price: calculateTotal(),
        notes: formData.notes || null,
        status: 'pending',
        payment_method: 'qris',
        payment_type: 'full',
        payment_amount: null,
        remaining_amount: null,
      };

      setOrderData(order);
      setCurrentStep('payment');
    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memproses pesanan. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStep === 'payment' && orderData) {
    return (
      <PaymentPage
        order={orderData}
        product={product}
        onBack={() => setCurrentStep('form')}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Produk
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pre-Order: {product.name}</CardTitle>
            <div className="flex items-center gap-4 mt-4">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop"}
                alt={product.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Nomor HP *</label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    required
                    placeholder="Contoh: 08123456789"
                    type="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
                <Textarea
                  value={formData.customer_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                  required
                  placeholder="Masukkan alamat lengkap untuk pengiriman"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ukuran *</label>
                  <Select 
                    value={formData.size} 
                    onValueChange={(value: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL') => 
                      setFormData(prev => ({ ...prev, size: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ukuran" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.available_sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Jumlah *</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan untuk pesanan Anda"
                  rows={2}
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total Pembayaran:</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Memproses..." : "Lanjut ke Pembayaran"}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Dengan melakukan pre-order, Anda menyetujui syarat dan ketentuan yang berlaku
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default OrderForm;
