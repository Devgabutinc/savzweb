
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product, Order } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";

interface PaymentPageProps {
  order: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'payment_id' | 'payment_url'>;
  product: Product;
  onBack: () => void;
  onSuccess: () => void;
}

interface PayAcc {
  id: string;
  method: "bank" | "qris";
  bank_name: string;
  account_number: string;
  account_name: string;
  barcode_path: string | null;
  is_active: boolean;
}

const BUCKET = "payment-barcodes"; // Menggunakan bucket yang sudah ada untuk menyimpan bukti pembayaran

const PaymentPage = ({ order, product, onBack, onSuccess }: PaymentPageProps) => {
  const [selectedPayment, setSelectedPayment] = useState<'qris' | 'bank' | ''>('');
  const [paymentType, setPaymentType] = useState<'dp50' | 'full'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null); // State untuk bukti pembayaran
  const [paymentProofError, setPaymentProofError] = useState<string>(''); // State untuk error upload
  const [paymentAccounts, setPaymentAccounts] = useState<PayAcc[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PayAcc | null>(null);
  const { toast } = useToast();

  // Fetch payment accounts from database
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_accounts')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching payment accounts:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Gagal mengambil data rekening pembayaran",
          });
          return;
        }

        setPaymentAccounts(data || []);
        
        // Set default account based on selected payment method
        if (data) {
          const defaultAccount = data.find(acc => {
            if (!selectedPayment) return false;
            return acc.method === selectedPayment;
          });
          setSelectedAccount(defaultAccount);
        }
      } catch (error) {
        console.error('Error fetching payment accounts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal mengambil data rekening pembayaran",
        });
      }
    };

    fetchAccounts();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculatePaymentAmount = () => {
    return paymentType === 'dp50' ? order.total_price * 0.5 : order.total_price;
  };

  const calculateRemainingAmount = () => {
    return paymentType === 'dp50' ? order.total_price * 0.5 : 0;
  };

  const handlePaymentSelect = (method: 'qris' | 'bank') => {
    setSelectedPayment(method);
    setSelectedAccount(null); // Reset selected account
    
    // Find account based on selected method
    const account = paymentAccounts.find(acc => acc.method === method);
    if (account) {
      setSelectedAccount(account);
    }

    setShowQRIS(method === 'qris');
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    
    try {
      if (!paymentProof) {
        throw new Error('Silakan upload bukti pembayaran terlebih dahulu');
      }

      // Upload bukti pembayaran ke storage jika ada
      let paymentProofPath = '';
      if (paymentProof) {
        try {
          // Extract MIME type from data URL
          const match = paymentProof.match(/data:(.*?);base64/);
          if (!match) throw new Error('Format gambar tidak valid');
          const mimeType = match[1];
          
          // Convert base64 to Blob
          const base64Data = paymentProof.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType });

          // Generate filename with correct extension
          const prefix = selectedPayment === 'qris' ? 'qris_' : 'proof_';
          const fileExt = mimeType.split('/')[1] || 'png';
          const filename = `${prefix}${crypto.randomUUID()}.${fileExt}`;

          console.log('Uploading payment proof:', filename);
          
          // Upload to Supabase with explicit content type
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET)
            .upload(filename, blob, {
              contentType: mimeType,
              upsert: false,
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error(`Gagal mengunggah bukti pembayaran: ${uploadError.message}`);
          }

          console.log('Upload successful:', uploadData);
          paymentProofPath = filename;
        } catch (error) {
          console.error('Error uploading payment proof:', error);
          throw new Error('Gagal mengunggah bukti pembayaran');
        }
      }

      const orderData = {
        ...order,
        payment_method: selectedPayment || 'qris',
        payment_type: paymentType,
        payment_amount: calculatePaymentAmount(),
        remaining_amount: calculateRemainingAmount(),
        payment_proof: paymentProofPath, // Menyimpan path ke file bukti pembayaran
      };

      console.log('Saving order to database:', orderData);

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error saving order:', error);
        // Try to get more detailed error message
        const errorMessage = error.message || 'Gagal menyimpan pesanan. Silakan coba lagi.';
        throw new Error(errorMessage);
      }

      console.log('Order saved successfully:', data);

      toast({
        title: "Pembayaran Berhasil! 🎉",
        description: `Pre-order Anda telah dikonfirmasi${paymentType === 'dp50' ? ' dengan DP 50%' : ' dengan pembayaran penuh'}. Terima kasih!`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memproses pembayaran. Silakan coba lagi.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-20 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Form Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Pembayaran Pre-Order</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Ringkasan Pesanan</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={product.image_url || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ukuran: {order.size} | Qty: {order.quantity}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nama:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>HP:</span>
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alamat:</span>
                  <span className="text-right max-w-48">{order.customer_address}</span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span>Catatan:</span>
                    <span className="text-right max-w-48">{order.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Harga:</span>
                  <span>{formatPrice(order.total_price)}</span>
                </div>
                {paymentType === 'dp50' && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sisa Pembayaran:</span>
                    <span>{formatPrice(calculateRemainingAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Bayar Sekarang:</span>
                  <span className="text-primary">{formatPrice(calculatePaymentAmount())}</span>
                </div>
              </div>
            </div>

            {/* Payment Type Selection */}
            {!showQRIS && (
              <div>
                <h3 className="font-semibold mb-4">Pilih Jenis Pembayaran</h3>
                <div className="grid gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${paymentType === 'full' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => setPaymentType('full')}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex-1">
                        <h4 className="font-medium">Bayar Lunas</h4>
                        <p className="text-sm text-muted-foreground">Bayar penuh sekarang</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(order.total_price)}</p>
                        <Badge variant="secondary">Rekomendasi</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${paymentType === 'dp50' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => setPaymentType('dp50')}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex-1">
                        <h4 className="font-medium">DP 50%</h4>
                        <p className="text-sm text-muted-foreground">Bayar setengah dulu, sisanya saat barang ready</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatPrice(calculatePaymentAmount())}</p>
                        <p className="text-xs text-muted-foreground">Sisa: {formatPrice(calculateRemainingAmount())}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {!showQRIS && (
              <div>
                <h3 className="font-semibold mb-4">Pilih Metode Pembayaran</h3>
                <div className="grid gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${selectedPayment === 'qris' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => handlePaymentSelect('qris')}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <Smartphone className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium">QRIS</h4>
                        <p className="text-sm text-muted-foreground">Bayar dengan scan QR code</p>
                      </div>
                      <Badge variant="secondary">Instan</Badge>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${selectedPayment === 'bank' ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
                    onClick={() => handlePaymentSelect('bank')}
                  >
                    <CardContent className="flex items-center gap-3 p-4">
                      <CreditCard className="h-8 w-8 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium">Transfer Bank</h4>
                        <p className="text-sm text-muted-foreground">Transfer manual ke rekening</p>
                      </div>
                      <Badge variant="outline">Manual</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

              {/* QRIS Payment */}
            {showQRIS && (
              <div className="space-y-4">
                {selectedAccount && selectedAccount.method === 'qris' && (
                  <div className="bg-white p-6 rounded-lg border-2 border-dashed border-muted-foreground/30">
                    <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <img
                        src={`${supabase.storage.from(BUCKET).getPublicUrl(selectedAccount.barcode_path).data.publicUrl}`}
                        alt="QRIS Code"
                        className="max-w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">QRIS {selectedAccount.bank_name}</p>
                    <p className="font-bold text-lg mt-2">{formatPrice(calculatePaymentAmount())}</p>
                  </div>
                )}
                
                {!selectedAccount && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Mohon tunggu sebentar...</p>
                  </div>
                )}
                
                {selectedAccount && selectedAccount.method !== 'qris' && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">QRIS tidak tersedia. Silakan pilih metode pembayaran lain.</p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <p className="font-medium">Scan QR Code untuk membayar</p>
                  <p className="text-sm text-muted-foreground">
                    Buka aplikasi e-wallet atau mobile banking Anda dan scan QR code di atas
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-yellow-600 mt-0.5">⚠️</div>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Penting:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Pastikan nominal yang dibayar sesuai: <strong>{formatPrice(calculatePaymentAmount())}</strong></li>
                        <li>• Simpan bukti pembayaran untuk konfirmasi</li>
                        <li>• Upload bukti pembayaran setelah selesai membayar</li>
                        {paymentType === 'dp50' && (
                          <li>• Sisa pembayaran <strong>{formatPrice(calculateRemainingAmount())}</strong> dibayar saat barang ready</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Upload Bukti Pembayaran */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) {
                                setPaymentProof(reader.result as string);
                                setPaymentProofError('');
                              }
                            };
                            reader.onerror = () => {
                              setPaymentProofError('Gagal membaca file');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="paymentProof"
                      />
                      <label htmlFor="paymentProof" className="cursor-pointer hover:text-primary">
                        <div className="text-center">
                          <div className="mb-2">
                            <span className="text-xl">+</span>
                          </div>
                          <div>Upload Bukti Pembayaran</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentProof && (
                    <div className="space-y-2">
                      <img
                        src={paymentProof}
                        alt="Bukti Pembayaran"
                        className="max-w-full rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPaymentProof(null);
                          setPaymentProofError('');
                        }}
                      >
                        Hapus Bukti
                      </Button>
                    </div>
                  )}

                  {paymentProofError && (
                    <p className="text-sm text-destructive">{paymentProofError}</p>
                  )}
                </div>

                <Button 
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memverifikasi Pembayaran...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sudah Bayar? Klik Disini
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Bank Transfer */}
            {selectedPayment === 'bank' && !showQRIS && (
              <div className="space-y-4">
                <h3 className="font-semibold">Transfer ke Rekening</h3>
                {selectedAccount && selectedAccount.method === 'bank' && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold`}>
                          {selectedAccount.bank_name.substring(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{selectedAccount.bank_name}</p>
                          <p className="text-sm text-muted-foreground">a.n. {selectedAccount.account_name}</p>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-3">
                        <p className="text-xs text-muted-foreground mb-1">Nomor Rekening:</p>
                        <p className="font-mono text-lg font-bold">{selectedAccount.account_number}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {!selectedAccount && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Mohon tunggu sebentar...</p>
                  </div>
                )}
                
                {selectedAccount && selectedAccount.method !== 'bank' && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Rekening bank tidak tersedia. Silakan pilih metode pembayaran lain.</p>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">ℹ️</div>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Instruksi Transfer:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Transfer tepat sesuai nominal: <strong>{formatPrice(calculatePaymentAmount())}</strong></li>
                        <li>• Upload bukti transfer setelah selesai membayar</li>
                        <li>• Sertakan nama dan nomor order dalam pesan</li>
                        {paymentType === 'dp50' && (
                          <li>• Sisa pembayaran <strong>{formatPrice(calculatePaymentAmount())}</strong> dibayar saat barang ready</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Upload Bukti Pembayaran */}
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (reader.result) {
                                setPaymentProof(reader.result as string);
                                setPaymentProofError('');
                              }
                            };
                            reader.onerror = () => {
                              setPaymentProofError('Gagal membaca file');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="paymentProofBank"
                      />
                      <label htmlFor="paymentProofBank" className="cursor-pointer hover:text-primary">
                        <div className="text-center">
                          <div className="mb-2">
                            <span className="text-xl">+</span>
                          </div>
                          <div>Upload Bukti Transfer</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentProof && (
                    <div className="space-y-2">
                      <img
                        src={paymentProof}
                        alt="Bukti Transfer"
                        className="max-w-full rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPaymentProof(null);
                          setPaymentProofError('');
                        }}
                      >
                        Hapus Bukti
                      </Button>
                    </div>
                  )}

                  {paymentProofError && (
                    <p className="text-sm text-destructive">{paymentProofError}</p>
                  )}
                </div>

                <Button 
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Memproses Pesanan...
                    </>
                  ) : (
                    "Konfirmasi Pesanan"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PaymentPage;