
export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  image_path: string | null;
  image_paths: string[] | null;
  orders_count: number | null;
  status: 'draft' | 'active' | 'closed';
  po_start_date: string | null;
  po_end_date: string | null;
  available_sizes: ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[];
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  product_id: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  total_price: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  payment_type: 'dp50' | 'full';
  payment_amount: number | null;
  remaining_amount: number | null;
  payment_id: string | null;
  payment_url: string | null;
  payment_proof: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
