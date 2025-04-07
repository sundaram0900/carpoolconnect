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
      bookings: {
        Row: {
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          ride_id: string
          seats: number
          user_id: string
        }
        Insert: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          ride_id: string
          seats: number
          user_id: string
        }
        Update: {
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          ride_id?: string
          seats?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          email_notifications: boolean | null
          marketing_emails: boolean | null
          new_ride_alerts: boolean | null
          push_notifications: boolean | null
          ride_reminders: boolean | null
          sms_notifications: boolean | null
          user_id: string
        }
        Insert: {
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          new_ride_alerts?: boolean | null
          push_notifications?: boolean | null
          ride_reminders?: boolean | null
          sms_notifications?: boolean | null
          user_id: string
        }
        Update: {
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          new_ride_alerts?: boolean | null
          push_notifications?: boolean | null
          ride_reminders?: boolean | null
          sms_notifications?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar: string | null
          bio: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          rating: number | null
          review_count: number | null
          username: string | null
          verified_driver: boolean | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          username?: string | null
          verified_driver?: boolean | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          username?: string | null
          verified_driver?: boolean | null
          zip_code?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          recipient_id: string
          ride_id: string
        }
        Insert: {
          author_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          recipient_id: string
          ride_id: string
        }
        Update: {
          author_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          recipient_id?: string
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string
          date: string
          description: string | null
          end_address: string
          end_city: string
          end_country: string | null
          end_lat: number | null
          end_lng: number | null
          end_state: string | null
          id: string
          max_price: number | null
          number_of_seats: number
          start_address: string
          start_city: string
          start_country: string | null
          start_lat: number | null
          start_lng: number | null
          start_state: string | null
          status: string | null
          time: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          end_address: string
          end_city: string
          end_country?: string | null
          end_lat?: number | null
          end_lng?: number | null
          end_state?: string | null
          id?: string
          max_price?: number | null
          number_of_seats: number
          start_address: string
          start_city: string
          start_country?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_state?: string | null
          status?: string | null
          time: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          end_address?: string
          end_city?: string
          end_country?: string | null
          end_lat?: number | null
          end_lng?: number | null
          end_state?: string | null
          id?: string
          max_price?: number | null
          number_of_seats?: number
          start_address?: string
          start_city?: string
          start_country?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_state?: string | null
          status?: string | null
          time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          available_seats: number
          booked_by: string[] | null
          car_color: string | null
          car_license_plate: string | null
          car_make: string | null
          car_model: string | null
          car_year: number | null
          created_at: string
          date: string
          description: string | null
          driver_id: string
          end_address: string
          end_city: string
          end_country: string | null
          end_lat: number | null
          end_lng: number | null
          end_state: string | null
          id: string
          price: number
          start_address: string
          start_city: string
          start_country: string | null
          start_lat: number | null
          start_lng: number | null
          start_state: string | null
          status: string | null
          time: string
        }
        Insert: {
          available_seats: number
          booked_by?: string[] | null
          car_color?: string | null
          car_license_plate?: string | null
          car_make?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          date: string
          description?: string | null
          driver_id: string
          end_address: string
          end_city: string
          end_country?: string | null
          end_lat?: number | null
          end_lng?: number | null
          end_state?: string | null
          id?: string
          price: number
          start_address: string
          start_city: string
          start_country?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_state?: string | null
          status?: string | null
          time: string
        }
        Update: {
          available_seats?: number
          booked_by?: string[] | null
          car_color?: string | null
          car_license_plate?: string | null
          car_make?: string | null
          car_model?: string | null
          car_year?: number | null
          created_at?: string
          date?: string
          description?: string | null
          driver_id?: string
          end_address?: string
          end_city?: string
          end_country?: string | null
          end_lat?: number | null
          end_lng?: number | null
          end_state?: string | null
          id?: string
          price?: number
          start_address?: string
          start_city?: string
          start_country?: string | null
          start_lat?: number | null
          start_lng?: number | null
          start_state?: string | null
          status?: string | null
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
