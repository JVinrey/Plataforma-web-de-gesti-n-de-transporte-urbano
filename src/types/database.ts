// =====================================================================
// Tipos generados automáticamente desde el esquema de Supabase.
// Regenerar con: el MCP de Supabase o `supabase gen types typescript`.
// No editar a mano.
// =====================================================================
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          route_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          route_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          route_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_route_id_fkey'
            columns: ['route_id']
            isOneToOne: false
            referencedRelation: 'routes'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          accessibility_preferences: Json
          created_at: string
          email: string | null
          full_name: string
          id: string
          user_type: Database['public']['Enums']['user_type']
        }
        Insert: {
          accessibility_preferences?: Json
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          user_type?: Database['public']['Enums']['user_type']
        }
        Update: {
          accessibility_preferences?: Json
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          user_type?: Database['public']['Enums']['user_type']
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          position: number
          route_id: string
          stop_id: string
        }
        Insert: {
          position: number
          route_id: string
          stop_id: string
        }
        Update: {
          position?: number
          route_id?: string
          stop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'route_stops_route_id_fkey'
            columns: ['route_id']
            isOneToOne: false
            referencedRelation: 'routes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'route_stops_stop_id_fkey'
            columns: ['stop_id']
            isOneToOne: false
            referencedRelation: 'stops'
            referencedColumns: ['id']
          },
        ]
      }
      routes: {
        Row: {
          code: string
          cost: number
          created_at: string
          destination: string | null
          estimated_time_minutes: number
          frequency_minutes: number
          id: string
          name: string
          origin: string | null
          status: Database['public']['Enums']['route_status']
        }
        Insert: {
          code: string
          cost?: number
          created_at?: string
          destination?: string | null
          estimated_time_minutes?: number
          frequency_minutes?: number
          id?: string
          name: string
          origin?: string | null
          status?: Database['public']['Enums']['route_status']
        }
        Update: {
          code?: string
          cost?: number
          created_at?: string
          destination?: string | null
          estimated_time_minutes?: number
          frequency_minutes?: number
          id?: string
          name?: string
          origin?: string | null
          status?: Database['public']['Enums']['route_status']
        }
        Relationships: []
      }
      stops: {
        Row: {
          accessible: boolean
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
        }
        Insert: {
          accessible?: boolean
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
        }
        Update: {
          accessible?: boolean
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          created_at: string
          destination_stop_id: string | null
          id: string
          origin_stop_id: string | null
          route_id: string | null
          scheduled_at: string
          status: Database['public']['Enums']['trip_status']
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_stop_id?: string | null
          id?: string
          origin_stop_id?: string | null
          route_id?: string | null
          scheduled_at?: string
          status?: Database['public']['Enums']['trip_status']
          user_id: string
        }
        Update: {
          created_at?: string
          destination_stop_id?: string | null
          id?: string
          origin_stop_id?: string | null
          route_id?: string | null
          scheduled_at?: string
          status?: Database['public']['Enums']['trip_status']
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trips_destination_stop_id_fkey'
            columns: ['destination_stop_id']
            isOneToOne: false
            referencedRelation: 'stops'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trips_origin_stop_id_fkey'
            columns: ['origin_stop_id']
            isOneToOne: false
            referencedRelation: 'stops'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trips_route_id_fkey'
            columns: ['route_id']
            isOneToOne: false
            referencedRelation: 'routes'
            referencedColumns: ['id']
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          driver_id: string | null
          id: string
          last_update: string
          lat: number | null
          lng: number | null
          load_percent: number
          plate: string
          route_id: string | null
          status: Database['public']['Enums']['vehicle_status']
        }
        Insert: {
          created_at?: string
          driver_id?: string | null
          id?: string
          last_update?: string
          lat?: number | null
          lng?: number | null
          load_percent?: number
          plate: string
          route_id?: string | null
          status?: Database['public']['Enums']['vehicle_status']
        }
        Update: {
          created_at?: string
          driver_id?: string | null
          id?: string
          last_update?: string
          lat?: number | null
          lng?: number | null
          load_percent?: number
          plate?: string
          route_id?: string | null
          status?: Database['public']['Enums']['vehicle_status']
        }
        Relationships: [
          {
            foreignKeyName: 'vehicles_driver_id_fkey'
            columns: ['driver_id']
            isOneToOne: false
            referencedRelation: 'drivers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'vehicles_route_id_fkey'
            columns: ['route_id']
            isOneToOne: false
            referencedRelation: 'routes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      route_status: 'on_time' | 'delayed' | 'off_line'
      trip_status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
      user_type: 'comun' | 'adulto_mayor' | 'turista' | 'operador' | 'admin'
      vehicle_status: 'on_time' | 'delayed' | 'maintenance'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update']
export type Enums<T extends keyof PublicSchema['Enums']> =
  PublicSchema['Enums'][T]
