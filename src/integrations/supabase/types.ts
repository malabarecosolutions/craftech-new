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
      expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          expense_date: string
          id: number
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: number
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          expense_date?: string
          id?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string | null
          id: number
          model: string | null
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          model?: string | null
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          model?: string | null
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string | null
          current_stock: number
          id: number
          min_quantity: number
          name: string
          purchase_price: number
          selling_price: number
          thickness: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock: number
          id?: number
          min_quantity: number
          name: string
          purchase_price: number
          selling_price: number
          thickness: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number
          id?: number
          min_quantity?: number
          name?: string
          purchase_price?: number
          selling_price?: number
          thickness?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      order_staff: {
        Row: {
          order_id: number
          staff_id: number
        }
        Insert: {
          order_id: number
          staff_id: number
        }
        Update: {
          order_id?: number
          staff_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_staff_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          additional_charges: number | null
          base_price: number | null
          client_name: string
          created_at: string | null
          final_price: number | null
          id: number
          location: string | null
          machine_id: number | null
          material_id: number | null
          material_qty: number | null
          order_status: string
          phone: string | null
          service_id: number | null
          updated_at: string | null
        }
        Insert: {
          additional_charges?: number | null
          base_price?: number | null
          client_name: string
          created_at?: string | null
          final_price?: number | null
          id?: number
          location?: string | null
          machine_id?: number | null
          material_id?: number | null
          material_qty?: number | null
          order_status: string
          phone?: string | null
          service_id?: number | null
          updated_at?: string | null
        }
        Update: {
          additional_charges?: number | null
          base_price?: number | null
          client_name?: string
          created_at?: string | null
          final_price?: number | null
          id?: number
          location?: string | null
          machine_id?: number | null
          material_id?: number | null
          material_qty?: number | null
          order_status?: string
          phone?: string | null
          service_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          id: number
          order_id: number | null
          payment_date: string | null
          payment_mode: string
        }
        Insert: {
          amount: number
          id?: number
          order_id?: number | null
          payment_date?: string | null
          payment_mode: string
        }
        Update: {
          amount?: number
          id?: number
          order_id?: number | null
          payment_date?: string | null
          payment_mode?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: number
          is_available: boolean | null
          name: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          is_available?: boolean | null
          name: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          is_available?: boolean | null
          name?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: number
          name: string
          outstanding_payment: number | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          name: string
          outstanding_payment?: number | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: number
          name?: string
          outstanding_payment?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
