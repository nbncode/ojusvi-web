export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      coupon_redemptions: {
        Row: {
          coupon_code: string
          created_at: string
          discount_applied: number
          id: string
          member_name: string | null
          member_phone: string | null
          order_id: string | null
          user_id: string | null
        }
        Insert: {
          coupon_code: string
          created_at?: string
          discount_applied?: number
          id?: string
          member_name?: string | null
          member_phone?: string | null
          order_id?: string | null
          user_id?: string | null
        }
        Update: {
          coupon_code?: string
          created_at?: string
          discount_applied?: number
          id?: string
          member_name?: string | null
          member_phone?: string | null
          order_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          max_discount: number | null
          max_redemptions: number | null
          per_user_limit: number
          times_redeemed: number
          updated_at: string
          valid_from: string
          valid_until: string | null
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type: string
          max_discount?: number | null
          max_redemptions?: number | null
          per_user_limit?: number
          times_redeemed?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          max_discount?: number | null
          max_redemptions?: number | null
          per_user_limit?: number
          times_redeemed?: number
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          value?: number
        }
        Relationships: []
      }
      entitlements: {
        Row: {
          beneficiary_phone: string
          created_at: string
          expires_at: string
          id: string
          payer_phone: string | null
          plan_id: string
          razorpay_payment_id: string
          source: Database["public"]["Enums"]["entitlement_source"]
          starts_at: string
          status: Database["public"]["Enums"]["entitlement_status"]
        }
        Insert: {
          beneficiary_phone: string
          created_at?: string
          expires_at: string
          id?: string
          payer_phone?: string | null
          plan_id: string
          razorpay_payment_id: string
          source: Database["public"]["Enums"]["entitlement_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["entitlement_status"]
        }
        Update: {
          beneficiary_phone?: string
          created_at?: string
          expires_at?: string
          id?: string
          payer_phone?: string | null
          plan_id?: string
          razorpay_payment_id?: string
          source?: Database["public"]["Enums"]["entitlement_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["entitlement_status"]
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      instructor_applications: {
        Row: {
          availability: string
          created_at: string
          email: string
          id: string
          name: string
          skill: string
          social: string
          whatsapp: string
        }
        Insert: {
          availability: string
          created_at?: string
          email: string
          id?: string
          name: string
          skill: string
          social: string
          whatsapp: string
        }
        Update: {
          availability?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          skill?: string
          social?: string
          whatsapp?: string
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          expires_at: string
          last_sent_at: string
          phone: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          expires_at: string
          last_sent_at?: string
          phone: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          expires_at?: string
          last_sent_at?: string
          phone?: string
        }
        Relationships: []
      }
      payment_intents: {
        Row: {
          beneficiary_phone: string
          created_at: string
          expires_at: string | null
          id: string
          intent_type: Database["public"]["Enums"]["payment_intent_type"]
          member_name: string | null
          member_phone: string | null
          payer_phone: string | null
          plan_id: string
          razorpay_order_id: string | null
          status: Database["public"]["Enums"]["payment_intent_status"]
          token: string | null
          user_id: string | null
        }
        Insert: {
          beneficiary_phone: string
          created_at?: string
          expires_at?: string | null
          id?: string
          intent_type: Database["public"]["Enums"]["payment_intent_type"]
          member_name?: string | null
          member_phone?: string | null
          payer_phone?: string | null
          plan_id: string
          razorpay_order_id?: string | null
          status?: Database["public"]["Enums"]["payment_intent_status"]
          token?: string | null
          user_id?: string | null
        }
        Update: {
          beneficiary_phone?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          intent_type?: Database["public"]["Enums"]["payment_intent_type"]
          member_name?: string | null
          member_phone?: string | null
          payer_phone?: string | null
          plan_id?: string
          razorpay_order_id?: string | null
          status?: Database["public"]["Enums"]["payment_intent_status"]
          token?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          alerted_at: string | null
          amount: number | null
          coupon_code: string | null
          created_at: string
          currency: string
          discount_applied: number | null
          id: string
          member_name: string | null
          member_phone: string | null
          plan: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          alerted_at?: string | null
          amount?: number | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_applied?: number | null
          id?: string
          member_name?: string | null
          member_phone?: string | null
          plan?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status: string
          user_id?: string | null
        }
        Update: {
          alerted_at?: string | null
          amount?: number | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_applied?: number | null
          id?: string
          member_name?: string | null
          member_phone?: string | null
          plan?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          amount_paise: number
          created_at: string
          duration_days: number
          id: string
          is_default: boolean
          name: string
        }
        Insert: {
          amount_paise: number
          created_at?: string
          duration_days: number
          id: string
          is_default?: boolean
          name: string
        }
        Update: {
          amount_paise?: number
          created_at?: string
          duration_days?: number
          id?: string
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          created_at: string
          email: string | null
          id: string
          member_name: string | null
          member_phone: string | null
          payer_name: string | null
          payer_phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          member_name?: string | null
          member_phone?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_type?: string | null
          created_at?: string
          email?: string | null
          id?: string
          member_name?: string | null
          member_phone?: string | null
          payer_name?: string | null
          payer_phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          bucket: string
          created_at: string
          id: string
          key: string
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          key: string
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          key?: string
        }
        Relationships: []
      }
      razorpay_orders: {
        Row: {
          beneficiary_user_id: string | null
          coupon_code: string | null
          created_at: string
          discount_applied: number | null
          expected_amount: number
          order_id: string
          plan: string | null
          user_id: string | null
        }
        Insert: {
          beneficiary_user_id?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_applied?: number | null
          expected_amount: number
          order_id: string
          plan?: string | null
          user_id?: string | null
        }
        Update: {
          beneficiary_user_id?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_applied?: number | null
          expected_amount?: number
          order_id?: string
          plan?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          current_period_start: string | null
          member_name: string | null
          member_phone: string | null
          plan: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          current_period_start?: string | null
          member_name?: string | null
          member_phone?: string | null
          plan?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          current_period_start?: string | null
          member_name?: string | null
          member_phone?: string | null
          plan?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_id_by_phone: { Args: { p_phone: string }; Returns: string }
      increment_coupon_redeemed: {
        Args: { p_code: string }
        Returns: undefined
      }
      normalize_phone: { Args: { p: string }; Returns: string }
    }
    Enums: {
      entitlement_source: "self" | "family"
      entitlement_status: "active" | "expired"
      payment_intent_status: "created" | "paid" | "expired"
      payment_intent_type: "self" | "parent" | "family" | "self_magic"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entitlement_source: ["self", "family"],
      entitlement_status: ["active", "expired"],
      payment_intent_status: ["created", "paid", "expired"],
      payment_intent_type: ["self", "parent", "family", "self_magic"],
    },
  },
} as const
