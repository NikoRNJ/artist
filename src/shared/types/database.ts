// Database type definitions for Supabase
// Generated types for the Ink & Fade application

export type UserRole = 'client' | 'artist';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

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
                    status: BookingStatus;
                    deposit_paid: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    artist_id: string;
                    service_id?: string | null;
                    client_name: string;
                    start_time: string;
                    status?: BookingStatus;
                    deposit_paid?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    artist_id?: string;
                    service_id?: string | null;
                    client_name?: string;
                    start_time?: string;
                    status?: BookingStatus;
                    deposit_paid?: boolean;
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
        };
        Enums: {
            user_role: UserRole;
            booking_status: BookingStatus;
        };
    };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
