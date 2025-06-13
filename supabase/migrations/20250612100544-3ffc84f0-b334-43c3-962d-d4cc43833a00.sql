
-- Add payment_type column to orders table to track DP or full payment
ALTER TABLE public.orders ADD COLUMN payment_type TEXT DEFAULT 'full' CHECK (payment_type IN ('dp50', 'full'));

-- Add payment_amount column to track actual amount paid
ALTER TABLE public.orders ADD COLUMN payment_amount NUMERIC;

-- Add remaining_amount column to track remaining balance for DP payments
ALTER TABLE public.orders ADD COLUMN remaining_amount NUMERIC DEFAULT 0;

-- Update the orders table to handle the new payment flow
ALTER TABLE public.orders ALTER COLUMN payment_method DROP DEFAULT;
ALTER TABLE public.orders ALTER COLUMN payment_method SET DEFAULT 'qris';
