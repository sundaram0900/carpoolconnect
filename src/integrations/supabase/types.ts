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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
