// Database type definitions for Supabase
// Generated types for the Ink & Fade application

export type UserRole = 'client' | 'artist';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

// =============================================================================
// Working Hours Configuration (JSONB in database)
// =============================================================================

export interface WorkingHoursConfig {
    start: string;   // "HH:mm" format (e.g., "09:00")
    end: string;     // "HH:mm" format (e.g., "18:00")
    enabled: boolean;
}

export interface WorkingHours {
    '0': WorkingHoursConfig; // Sunday
    '1': WorkingHoursConfig; // Monday
    '2': WorkingHoursConfig; // Tuesday
    '3': WorkingHoursConfig; // Wednesday
    '4': WorkingHoursConfig; // Thursday
    '5': WorkingHoursConfig; // Friday
    '6': WorkingHoursConfig; // Saturday
}

// =============================================================================
// Database Schema Types
// =============================================================================

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    role: UserRole | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    role?: UserRole | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    role?: UserRole | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            artists: {
                Row: {
                    id: string;
                    name: string;
                    title: string;
                    bio: string;
                    avatar: string;
                    rating: number;
                    review_count: number;
                    styles: string[];
                    location: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    title: string;
                    bio: string;
                    avatar: string;
                    rating?: number;
                    review_count?: number;
                    styles?: string[];
                    location: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    title?: string;
                    bio?: string;
                    avatar?: string;
                    rating?: number;
                    review_count?: number;
                    styles?: string[];
                    location?: string;
                    created_at?: string;
                };
            };
            artist_settings: {
                Row: {
                    id: string;
                    artist_id: string;
                    working_hours: WorkingHours;
                    slot_interval: number;      // 15, 30, or 60 minutes
                    buffer_minutes: number;     // Buffer between appointments
                    timezone: string;           // IANA timezone (e.g., "America/Santiago")
                    min_advance_hours: number;  // Minimum hours in advance to book
                    max_advance_days: number;   // Maximum days in advance to book
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    working_hours?: WorkingHours;
                    slot_interval?: number;
                    buffer_minutes?: number;
                    timezone?: string;
                    min_advance_hours?: number;
                    max_advance_days?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    working_hours?: WorkingHours;
                    slot_interval?: number;
                    buffer_minutes?: number;
                    timezone?: string;
                    min_advance_hours?: number;
                    max_advance_days?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            services: {
                Row: {
                    id: string;
                    artist_id: string;
                    name: string;
                    duration: number;
                    price: number;
                    deposit: number;
                    description: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    name: string;
                    duration: number;
                    price: number;
                    deposit: number;
                    description: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    name?: string;
                    duration?: number;
                    price?: number;
                    deposit?: number;
                    description?: string;
                    created_at?: string;
                };
            };
            portfolio_items: {
                Row: {
                    id: string;
                    artist_id: string;
                    image_url: string;
                    description: string;
                    tags: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    image_url: string;
                    description: string;
                    tags?: string[];
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    image_url?: string;
                    description?: string;
                    tags?: string[];
                    created_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    artist_id: string;
                    author: string;
                    rating: number;
                    content: string;
                    date: string;
                    verified: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    author: string;
                    rating: number;
                    content: string;
                    date: string;
                    verified?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    author?: string;
                    rating?: number;
                    content?: string;
                    date?: string;
                    verified?: boolean;
                    created_at?: string;
                };
            };
            bookings: {
                Row: {
                    id: string;
                    artist_id: string;
                    service_id: string | null;
                    client_name: string;
                    start_time: string;
                    end_time: string;           // Calculated from duration
                    status: BookingStatus;
                    deposit_paid: boolean;
                    // Snapshot fields for historical accuracy
                    price_snapshot: number | null;
                    duration_snapshot: number | null;
                    service_name_snapshot: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    service_id?: string | null;
                    client_name: string;
                    start_time: string;
                    end_time?: string;          // Optional - trigger will calculate
                    status?: BookingStatus;
                    deposit_paid?: boolean;
                    price_snapshot?: number | null;
                    duration_snapshot?: number | null;
                    service_name_snapshot?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    service_id?: string | null;
                    client_name?: string;
                    start_time?: string;
                    end_time?: string;
                    status?: BookingStatus;
                    deposit_paid?: boolean;
                    price_snapshot?: number | null;
                    duration_snapshot?: number | null;
                    service_name_snapshot?: string | null;
                    created_at?: string;
                };
            };
        };
        Views: Record<string, never>;
        Functions: {
            user_has_completed_onboarding: {
                Args: { user_id: string };
                Returns: boolean;
            };
            check_booking_conflict: {
                Args: {
                    p_artist_id: string;
                    p_start_time: string;
                    p_end_time: string;
                    p_exclude_booking_id?: string;
                };
                Returns: boolean;
            };
            get_available_slots: {
                Args: {
                    p_artist_id: string;
                    p_date: string;
                    p_duration_minutes?: number;
                };
                Returns: Array<{
                    slot_start: string;
                    slot_end: string;
                }>;
            };
        };
        Enums: {
            user_role: UserRole;
            booking_status: BookingStatus;
        };
    };
}

// =============================================================================
// Convenience Type Exports
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
export type ArtistSettings = Database['public']['Tables']['artist_settings']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];

// =============================================================================
// Availability API Types
// =============================================================================

export interface AvailableSlot {
    start: string;   // ISO 8601 UTC
    end: string;     // ISO 8601 UTC
    local: string;   // "HH:mm" in artist's timezone (for display)
}

export interface AvailabilityResponse {
    slots: AvailableSlot[];
    workingHours: { start: string; end: string } | null;
    timezone: string;
    date: string;
    message?: string;
}
