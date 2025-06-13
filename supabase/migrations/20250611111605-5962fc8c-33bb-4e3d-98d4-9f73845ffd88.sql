
-- Create enum for order status
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- Create enum for product status
CREATE TYPE product_status AS ENUM ('draft', 'active', 'closed');

-- Create enum for size options
CREATE TYPE size_option AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- Create products table for pre-order items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  status product_status NOT NULL DEFAULT 'draft',
  po_start_date TIMESTAMP WITH TIME ZONE,
  po_end_date TIMESTAMP WITH TIME ZONE,
  available_sizes size_option[] NOT NULL DEFAULT ARRAY['S', 'M', 'L', 'XL']::size_option[],
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  size size_option NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method TEXT DEFAULT 'QRIS',
  payment_id TEXT,
  payment_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table (for admin authentication)
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public can read active products, only admins can modify)
CREATE POLICY "Anyone can view active products" 
  ON public.products 
  FOR SELECT 
  USING (status = 'active' OR auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Only admins can insert products" 
  ON public.products 
  FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Only admins can update products" 
  ON public.products 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Only admins can delete products" 
  ON public.products 
  FOR DELETE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policies for orders (public can insert, only admins can view all)
CREATE POLICY "Anyone can create orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Only admins can view all orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Only admins can update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create policies for admin_users
CREATE POLICY "Only admins can view admin users" 
  ON public.admin_users 
  FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

CREATE POLICY "Only admins can manage admin users" 
  ON public.admin_users 
  FOR ALL 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON public.products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.products (name, description, price, status, po_start_date, po_end_date, available_sizes, stock_quantity) VALUES
('Oversized Hoodie SAVZ Black', 'Hoodie oversized premium dengan material cotton fleece berkualitas tinggi. Desain eksklusif SAVZ Official dengan print terbaru.', 299000, 'active', now(), now() + interval '7 days', ARRAY['S', 'M', 'L', 'XL', 'XXL']::size_option[], 50),
('T-Shirt Essential White', 'Kaos basic essential dengan cutting modern dan bahan cotton combed 30s yang nyaman dipakai sehari-hari.', 149000, 'active', now(), now() + interval '5 days', ARRAY['S', 'M', 'L', 'XL']::size_option[], 100),
('Crewneck Vintage Brown', 'Crewneck dengan warna vintage brown yang trendy. Material premium dan desain timeless untuk tampilan kasual yang stylish.', 249000, 'draft', now() + interval '1 day', now() + interval '10 days', ARRAY['M', 'L', 'XL']::size_option[], 30);
