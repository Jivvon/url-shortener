export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          plan_id: string
          url_count_this_month: number
          month_reset_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          plan_id?: string
          url_count_this_month?: number
          month_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          plan_id?: string
          url_count_this_month?: number
          month_reset_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          url_limit: number | null
          custom_alias: boolean
          price_monthly: number | null
          features: Json
        }
        Insert: {
          id: string
          name: string
          url_limit?: number | null
          custom_alias?: boolean
          price_monthly?: number | null
          features?: Json
        }
        Update: {
          id?: string
          name?: string
          url_limit?: number | null
          custom_alias?: boolean
          price_monthly?: number | null
          features?: Json
        }
      }
      links: {
        Row: {
          id: string
          user_id: string
          short_code: string
          original_url: string
          title: string | null
          is_active: boolean
          total_clicks: number
          expires_at: string | null
          click_limit: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          short_code: string
          original_url: string
          title?: string | null
          is_active?: boolean
          total_clicks?: number
          expires_at?: string | null
          click_limit?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          short_code?: string
          original_url?: string
          title?: string | null
          is_active?: boolean
          total_clicks?: number
          expires_at?: string | null
          click_limit?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      clicks: {
        Row: {
          id: string
          link_id: string
          country: string | null
          device: string | null
          browser: string | null
          os: string | null
          referer: string | null
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          link_id: string
          country?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          link_id?: string
          country?: string | null
          device?: string | null
          browser?: string | null
          os?: string | null
          referer?: string | null
          ip_hash?: string | null
          created_at?: string
        }
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
  }
}
