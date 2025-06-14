import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/database";
import OrderForm from "./OrderForm";
import ImageCarousel from "./ImageCarousel";
import Lightbox from "./Lightbox";

interface ProductWithAvailableStock extends Product {
  available_stock: number;
  total_orders: number;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<ProductWithAvailableStock[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithAvailableStock | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[] | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: string } = {};
      
      products.forEach(product => {
        if (product.po_end_date) {
          const now = new Date().getTime();
          const endTime = new Date(product.po_end_date).getTime();
          const difference = endTime - now;
          
          if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            
            newTimeLeft[product.id] = `${days}h ${hours}j ${minutes}m`;
          } else {
            newTimeLeft[product.id] = "Berakhir";
          }
        }
      });
      
      setTimeLeft(newTimeLeft);
    }, 60000);

    // Initial calculation
    const initialTimeLeft: { [key: string]: string } = {};
    products.forEach(product => {
      if (product.po_end_date) {
        const now = new Date().getTime();
        const endTime = new Date(product.po_end_date).getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          
          initialTimeLeft[product.id] = `${days}h ${hours}j ${minutes}m`;
        } else {
          initialTimeLeft[product.id] = "Berakhir";
        }
      }
    });
    setTimeLeft(initialTimeLeft);

    return () => clearInterval(timer);
  }, [products]);

  const BUCKET = "product-images";

  const makePublicUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  };

  const fetchProducts = async () => {
    try {
      // Fetch products with orders count using a single query with join
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          orders!orders_product_id_fkey(quantity)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const processed = (data || []).map((p) => {
        // Calculate total orders quantity for this product
        const totalOrders = p.orders?.reduce((sum: number, order: any) => sum + (order.quantity || 0), 0) || 0;
        
        // Calculate available stock
        const availableStock = Math.max(0, (p.stock_quantity || 0) - totalOrders);

        return {
          ...p,
          orders: undefined, // Remove orders array from the final object
          total_orders: totalOrders,
          available_stock: availableStock,
          image_url: p.image_url ? p.image_url : makePublicUrl(p.image_path),
          image_paths: p.image_paths ? p.image_paths.map((path: string) => makePublicUrl(path)) : null,
        };
      });

      setProducts(processed as ProductWithAvailableStock[]);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreOrder = (product: ProductWithAvailableStock) => {
    // Check if stock is available
    if (product.available_stock <= 0) {
      toast({
        variant: "destructive",
        title: "Stok Habis",
        description: "Maaf, produk ini sudah tidak tersedia.",
      });
      return;
    }

    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  const calculateDiscount = (price: number, originalPrice?: number) => {
    if (!originalPrice) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockBadgeColor = (availableStock: number, totalStock: number) => {
    const percentage = totalStock > 0 ? (availableStock / totalStock) * 100 : 0;
    
    if (availableStock === 0) return "destructive";
    if (percentage <= 20) return "secondary";
    if (percentage <= 50) return "outline";
    return "default";
  };

  const getStockText = (availableStock: number) => {
    if (availableStock === 0) return "Habis";
    if (availableStock <= 5) return `Tersisa ${availableStock}`;
    return `${availableStock} tersedia`;
  };

  if (showOrderForm && selectedProduct) {
    return (
      <OrderForm
        product={selectedProduct}
        onClose={() => {
          setShowOrderForm(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          setShowOrderForm(false);
          setSelectedProduct(null);
          // Refresh products to update stock
          fetchProducts();
          toast({
            title: "Order berhasil! 🎉",
            description: "Pre-order Anda telah berhasil dibuat.",
          });
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <section id="products" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pre-Order Aktif
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Memuat produk...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="p-0">
                  <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pre-Order Aktif
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Koleksi terbatas yang hanya tersedia melalui pre-order. 
            Jangan sampai terlewat, stok sangat terbatas!
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="p-0">
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    {product.image_paths && product.image_paths.length > 0 ? (
                      <ImageCarousel
                        images={product.image_paths}
                        alt={product.name}
                        onClick={() => {
                          setLightboxImages(product.image_paths!);
                          setLightboxOpen(true);
                        }}
                      />
                    ) : (
                      <img
                        src={product.image_url || "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => {
                          if (product.image_url) {
                            setLightboxImages([product.image_url]);
                            setLightboxOpen(true);
                          }
                        }}
                      />
                    )}
                    
                    {/* Top badges container */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      {/* Discount Badge */}
                      {product.original_price && (
                        <Badge className="bg-accent text-accent-foreground">
                          {calculateDiscount(product.price, product.original_price)}% OFF
                        </Badge>
                      )}
                      
                      {/* Countdown Badge */}
                      {product.po_end_date && (
                        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-1 text-sm">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="font-medium text-foreground">
                              {timeLeft[product.id] || "Loading..."}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stock Badge - Bottom Right */}
                    <div className="absolute bottom-4 right-4">
                      <Badge 
                        variant={getStockBadgeColor(product.available_stock, product.stock_quantity || 0)}
                        className="flex items-center space-x-1"
                      >
                        <Package className="h-3 w-3" />
                        <span>{getStockText(product.available_stock)}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Product Info */}
                  <h3 className="text-xl font-semibold text-foreground mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  {/* Sizes */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">Ukuran tersedia:</p>
                    <div className="flex flex-wrap gap-2">
                      {product.available_sizes.map((size) => (
                        <Badge key={size} variant="outline" className="text-xs">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stock Info */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-muted-foreground">
                        Stok: {product.available_stock} / {product.stock_quantity || 0}
                      </span>
                      <span className="text-muted-foreground">
                        Terjual: {product.total_orders}
                      </span>
                    </div>
                    
                    {/* Stock Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          product.available_stock === 0 
                            ? 'bg-red-500' 
                            : product.available_stock <= 5 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${product.stock_quantity ? (product.available_stock / product.stock_quantity) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <Button
                    className={`w-full font-semibold ${
                      product.available_stock <= 0
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                    onClick={() => handlePreOrder(product)}
                    disabled={product.available_stock <= 0}
                  >
                    {product.available_stock <= 0 ? 'Stok Habis' : 'Pre-Order Sekarang'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Belum ada produk pre-order aktif saat ini</p>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-accent/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Tidak menemukan yang Anda cari?
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe newsletter kami untuk mendapatkan notifikasi pre-order terbaru dan penawaran eksklusif.
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Subscribe Newsletter
            </Button>
          </div>
        </div>
      </div>
      {lightboxImages && (
        <Lightbox
          open={lightboxOpen}
          images={lightboxImages}
          onOpenChange={setLightboxOpen}
        />
      )}
    </section>
  );
};

export default ProductGrid;