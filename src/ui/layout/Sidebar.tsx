'use client';

import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Scissors, Search, LogIn, Loader2, User } from 'lucide-react';
import { ViewMode } from '@/shared/types';
import { createSupabaseBrowserClient } from '@/services/supabase/client';

interface SidebarProps {
  view: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'client' | 'artist' | null;
  avatar_url: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ view, onChangeView }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUserProfile() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Check authentication status
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (cancelled) return;

        if (authError || !user) {
          setIsAuthenticated(false);
          setProfile(null);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Fetch user profile with role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (cancelled) return;

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfile(null);
        } else {
          setProfile(profileData as UserProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUserProfile();

    // Subscribe to auth state changes
    const supabase = createSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setIsAuthenticated(true);
            // Refetch profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, email, full_name, role, avatar_url')
              .eq('id', session.user.id)
              .single();

            if (profileData) {
              setProfile(profileData as UserProfile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setProfile(null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is an artist
  const isArtist = profile?.role === 'artist';

  // Handle navigation to login
  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  // Handle navigation to profile
  const handleProfileClick = () => {
    window.location.href = '/profile';
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#111] border-r border-white/5 z-50 flex flex-col items-center py-8">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-2 px-6">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
          <Scissors className="text-black" size={24} />
        </div>
        <span className="hidden md:block font-display text-2xl tracking-tight text-amber-500">Ink &amp; Fade</span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 w-full space-y-2 px-4">
        {/* Client/Search View - Always visible */}
        <button
          onClick={() => onChangeView(ViewMode.CLIENT)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === ViewMode.CLIENT
              ? 'bg-amber-500 text-black font-semibold'
              : 'hover:bg-white/5 text-gray-400'
            }`}
        >
          <Search size={24} className="flex-shrink-0" />
          <span className="hidden md:block">Buscar artista</span>
        </button>

        {/* Artist Portal - Only visible for artists */}
        {isArtist && (
          <button
            onClick={() => onChangeView(ViewMode.ARTIST)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${view === ViewMode.ARTIST
                ? 'bg-amber-500 text-black font-semibold'
                : 'hover:bg-white/5 text-gray-400'
              }`}
          >
            <LayoutDashboard size={24} className="flex-shrink-0" />
            <span className="hidden md:block">Portal del artista</span>
          </button>
        )}

        {/* Show loading state while checking auth */}
        {loading && (
          <div className="flex items-center justify-center p-3">
            <Loader2 size={20} className="animate-spin text-gray-500" />
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="w-full px-4 mt-auto">
        {loading ? (
          // Loading skeleton
          <div className="p-4 bg-white/5 rounded-2xl flex items-center gap-3 overflow-hidden animate-pulse">
            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
            <div className="hidden md:block flex-1 space-y-2">
              <div className="h-3 bg-white/10 rounded w-24" />
              <div className="h-2 bg-white/10 rounded w-16" />
            </div>
          </div>
        ) : isAuthenticated && profile ? (
          // Authenticated user
          <button
            onClick={handleProfileClick}
            className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 overflow-hidden transition-colors text-left"
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-black" />
              </div>
            )}
            <div className="hidden md:block truncate">
              <p className="text-sm font-medium text-white truncate">
                {profile.full_name || profile.email.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile.role === 'artist' ? '🎨 Artista' : '👤 Cliente'}
              </p>
            </div>
          </button>
        ) : (
          // Guest user
          <button
            onClick={handleLoginClick}
            className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center gap-3 overflow-hidden transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 group-hover:from-amber-500 group-hover:to-orange-600 transition-all">
              <LogIn size={18} className="text-white group-hover:text-black transition-colors" />
            </div>
            <div className="hidden md:block truncate">
              <p className="text-sm font-medium text-white">Usuario invitado</p>
              <p className="text-xs text-amber-500 group-hover:underline">Inicia sesión para reservar</p>
            </div>
          </button>
        )}
      </div>

      {/* Artist Badge (if user is an artist) */}
      {isArtist && !loading && (
        <div className="w-full px-4 mt-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-xs text-amber-500 text-center hidden md:block">
              ⚡ Modo Artista Activo
            </p>
            <div className="md:hidden flex justify-center">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Sidebar;
