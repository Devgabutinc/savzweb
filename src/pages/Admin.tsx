import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminAuth from "@/components/AdminAuth";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";
import OrderListPage from "@/components/admin/OrderListPage";
import BankConfigPage from "@/components/admin/BankConfigPage";
import { Product } from "@/types/database";
import { LogOut } from "lucide-react";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [tab, setTab] = useState<'products'|'orders'|'banks'>('products');
  const { toast } = useToast();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setIsAuthenticated(!!adminData);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products",
      });
    }
  };

  const BUCKET = "product-images";

  const uploadFiles = async (files: FileList | null): Promise<{ image_path: string | null; image_paths: string[] | null }> => {
    if (!files || files.length === 0) return { image_path: null, image_paths: null };

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        upsert: false,
      });
      if (error) throw error;
      uploaded.push(fileName);
    }
    return { image_path: uploaded[0] ?? null, image_paths: uploaded.length > 0 ? uploaded : null };
  };

  const handleProductSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { image_path: string | null; image_paths: string[] | null }) => {
    setFormLoading(true);
    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setShowForm(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save product",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleProductDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      
      fetchProducts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">
          SAVZ <span className="text-accent">ADMIN</span>
        </h1>
        <nav className="flex flex-col gap-2">
          <Button variant={tab==='products'?"default":"outline"} onClick={()=>setTab('products')}>Products</Button>
          <Button variant={tab==='orders'?"default":"outline"} onClick={()=>setTab('orders')}>Orders</Button>
          <Button variant={tab==='banks'?"default":"outline"} onClick={()=>setTab('banks')}>Bank Config</Button>
        </nav>
        <Button variant="outline" className="mt-auto w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2"/> Logout
        </Button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {tab==='products' && (
          showForm ? (
            <ProductForm
              product={editingProduct}
              onSubmit={handleProductSubmit}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              isLoading={formLoading}
            />
          ) : (
            <ProductList
              products={products}
              onEdit={(product) => { setEditingProduct(product); setShowForm(true); }}
              onDelete={handleProductDelete}
              onAdd={() => { setEditingProduct(null); setShowForm(true); }}
            />
          )
        )}

        {tab==='orders' && <OrderListPage />}
        {tab==='banks' && <BankConfigPage />}
      </main>
    </div>
  );
};

export default Admin;
