
-- First, let's drop the existing problematic policies
DROP POLICY IF EXISTS "Only admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can manage admin users" ON public.admin_users;

-- Create a security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE admin_users.user_id = is_admin.user_id
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Users can view admin users if they are admin" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert admin users if they are admin" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can update admin users if they are admin" 
  ON public.admin_users 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can delete admin users if they are admin" 
  ON public.admin_users 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));
