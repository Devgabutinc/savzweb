export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      banks: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at: string
          id: number
          is_active: boolean
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          created_at?: string
          id?: number
          is_active?: boolean
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string
          id?: number
          is_active?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          payment_amount: number | null
          payment_id: string | null
          payment_method: string | null
          payment_type: string | null
          payment_url: string | null
          product_id: string
          quantity: number
          remaining_amount: number | null
          size: Database["public"]["Enums"]["size_option"]
          status: Database["public"]["Enums"]["order_status"]
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_address: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_method?: string | null
          payment_type?: string | null
          payment_url?: string | null
          product_id: string
          quantity?: number
          remaining_amount?: number | null
          size: Database["public"]["Enums"]["size_option"]
          status?: Database["public"]["Enums"]["order_status"]
          total_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_address?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_method?: string | null
          payment_type?: string | null
          payment_url?: string | null
          product_id?: string
          quantity?: number
          remaining_amount?: number | null
          size?: Database["public"]["Enums"]["size_option"]
          status?: Database["public"]["Enums"]["order_status"]
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_sizes: Database["public"]["Enums"]["size_option"][]
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          image_paths: string[] | null
          image_url: string | null
          name: string
          orders_count: number | null
          original_price: number | null
          po_end_date: string | null
          po_start_date: string | null
          price: number
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          available_sizes?: Database["public"]["Enums"]["size_option"][]
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_paths?: string[] | null
          image_url?: string | null
          name: string
          orders_count?: number | null
          original_price?: number | null
          po_end_date?: string | null
          po_start_date?: string | null
          price: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          available_sizes?: Database["public"]["Enums"]["size_option"][]
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          image_paths?: string[] | null
          image_url?: string | null
          name?: string
          orders_count?: number | null
          original_price?: number | null
          po_end_date?: string | null
          po_start_date?: string | null
          price?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_product_with_order_count: {
        Args: { p_id: string }
        Returns: {
          id: string
          created_at: string
          name: string
          description: string
          price: number
          image_urls: string[]
          sizes: string[]
          po_start_date: string
          po_end_date: string
          stock_quantity: number
          original_price: number
          orders_count: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      order_status: "pending" | "paid" | "shipped" | "delivered" | "cancelled"
      product_status: "draft" | "active" | "closed"
      size_option: "XS" | "S" | "M" | "L" | "XL" | "XXL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "paid", "shipped", "delivered", "cancelled"],
      product_status: ["draft", "active", "closed"],
      size_option: ["XS", "S", "M", "L", "XL", "XXL"],
    },
  },
} as const
