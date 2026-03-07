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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          account_number_last4: string | null
          avatar_url: string | null
          bank_account_name: string | null
          bank_name: string | null
          business_name: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          farm_size: number | null
          farm_size_unit: string | null
          font_size: string | null
          full_name: string | null
          gender: string | null
          gstin: string | null
          high_contrast: boolean | null
          id: string
          ifsc_code: string | null
          irrigation_type: string | null
          language_preference: string | null
          mobile_number: string | null
          notify_community: boolean | null
          notify_email_orders: boolean | null
          notify_email_weekly: boolean | null
          notify_marketing: boolean | null
          notify_orders: boolean | null
          notify_price: boolean | null
          notify_sms_critical: boolean | null
          notify_storage: boolean | null
          notify_weather: boolean | null
          notify_whatsapp: boolean | null
          ph_level: number | null
          pin_code: string | null
          primary_crops: string[] | null
          soil_type: string | null
          state: string | null
          theme_preference: string | null
          updated_at: string
          upi_id: string | null
          user_id: string
          village: string | null
        }
        Insert: {
          account_number_last4?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          farm_size?: number | null
          farm_size_unit?: string | null
          font_size?: string | null
          full_name?: string | null
          gender?: string | null
          gstin?: string | null
          high_contrast?: boolean | null
          id?: string
          ifsc_code?: string | null
          irrigation_type?: string | null
          language_preference?: string | null
          mobile_number?: string | null
          notify_community?: boolean | null
          notify_email_orders?: boolean | null
          notify_email_weekly?: boolean | null
          notify_marketing?: boolean | null
          notify_orders?: boolean | null
          notify_price?: boolean | null
          notify_sms_critical?: boolean | null
          notify_storage?: boolean | null
          notify_weather?: boolean | null
          notify_whatsapp?: boolean | null
          ph_level?: number | null
          pin_code?: string | null
          primary_crops?: string[] | null
          soil_type?: string | null
          state?: string | null
          theme_preference?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id: string
          village?: string | null
        }
        Update: {
          account_number_last4?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          farm_size?: number | null
          farm_size_unit?: string | null
          font_size?: string | null
          full_name?: string | null
          gender?: string | null
          gstin?: string | null
          high_contrast?: boolean | null
          id?: string
          ifsc_code?: string | null
          irrigation_type?: string | null
          language_preference?: string | null
          mobile_number?: string | null
          notify_community?: boolean | null
          notify_email_orders?: boolean | null
          notify_email_weekly?: boolean | null
          notify_marketing?: boolean | null
          notify_orders?: boolean | null
          notify_price?: boolean | null
          notify_sms_critical?: boolean | null
          notify_storage?: boolean | null
          notify_weather?: boolean | null
          notify_whatsapp?: boolean | null
          ph_level?: number | null
          pin_code?: string | null
          primary_crops?: string[] | null
          soil_type?: string | null
          state?: string | null
          theme_preference?: string | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string
          village?: string | null
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
    Enums: {},
  },
} as const
