'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/services/supabase/client';
import { User, Palette, ChevronRight, Loader2, Sparkles } from 'lucide-react';

type UserRole = 'client' | 'artist';

interface RoleOption {
    role: UserRole;
    title: string;
    description: string;
    features: string[];
    icon: React.ReactNode;
    gradient: string;
}

const roleOptions: RoleOption[] = [
    {
        role: 'client',
        title: 'I\'m a Client',
        description: 'Looking for talented artists to bring my vision to life',
        features: [
            'Browse verified artists & portfolios',
            'Book appointments seamlessly',
            'Secure deposit payments',
            'Real-time booking updates',
        ],
        icon: <User className="w-8 h-8" />,
        gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    },
    {
        role: 'artist',
        title: 'I\'m an Artist',
        description: 'Ready to showcase my work and grow my clientele',
        features: [
            'Professional portfolio showcase',
            'Smart booking management',
            'Automated scheduling',
            'Revenue analytics & insights',
        ],
        icon: <Palette className="w-8 h-8" />,
        gradient: 'from-purple-500/20 via-purple-600/10 to-transparent',
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const supabase = createSupabaseBrowserClient();
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    router.replace('/login');
                    return;
                }

                // Check if user already has a role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                }

                if (profile?.role) {
                    // User already has a role, redirect accordingly
                    if (profile.role === 'artist') {
                        router.replace('/artist/dashboard');
                    } else {
                        router.replace('/');
                    }
                    return;
                }

                setUserId(user.id);
                setLoading(false);
            } catch (err) {
                console.error('Auth check error:', err);
                setError('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    const handleRoleSelect = async (role: UserRole) => {
        if (!userId || updating) return;

        setSelectedRole(role);
        setUpdating(true);
        setError(null);

        try {
            const supabase = createSupabaseBrowserClient();

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);

            if (updateError) {
                throw updateError;
            }

            // Redirect based on role
            if (role === 'artist') {
                router.push('/artist/dashboard');
            } else {
                router.push('/');
            }
        } catch (err) {
            console.error('Error updating role:', err);
            setError('Failed to save your selection. Please try again.');
            setSelectedRole(null);
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <p className="text-white/60 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-amber-500/5 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-purple-500/5 via-transparent to-transparent rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-white/60">Welcome to Ink & Fade</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Choose Your Path
                    </h1>
                    <p className="text-lg text-white/60 max-w-md mx-auto">
                        Tell us who you are so we can personalize your experience
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 px-6 py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-center max-w-md">
                        {error}
                    </div>
                )}

                {/* Role Selection Cards */}
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {roleOptions.map((option) => (
                        <button
                            key={option.role}
                            onClick={() => handleRoleSelect(option.role)}
                            disabled={updating}
                            className={`
                group relative p-8 rounded-2xl text-left transition-all duration-500
                bg-gradient-to-br ${option.gradient}
                border border-white/10 hover:border-amber-500/50
                ${selectedRole === option.role ? 'border-amber-500 ring-2 ring-amber-500/30' : ''}
                ${updating && selectedRole !== option.role ? 'opacity-40 cursor-not-allowed' : ''}
                hover:transform hover:scale-[1.02]
                focus:outline-none focus:ring-2 focus:ring-amber-500/50
              `}
                        >
                            {/* Card Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="relative z-10">
                                {/* Icon & Title */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`
                    p-4 rounded-xl bg-white/5 border border-white/10
                    group-hover:border-amber-500/30 transition-colors duration-300
                    ${option.role === 'artist' ? 'text-purple-400' : 'text-amber-500'}
                  `}>
                                        {option.icon}
                                    </div>

                                    {updating && selectedRole === option.role ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                                    ) : (
                                        <ChevronRight className="w-6 h-6 text-white/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-50 transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-white/50 mb-6">
                                    {option.description}
                                </p>

                                {/* Features List */}
                                <ul className="space-y-3">
                                    {option.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-sm text-white/60">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Updating Overlay */}
                            {updating && selectedRole === option.role && (
                                <div className="absolute inset-0 rounded-2xl bg-[#0a0a0a]/60 flex items-center justify-center backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                        <span className="text-sm text-white/80">Setting up your account...</span>
                                    </div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer Note */}
                <p className="mt-10 text-sm text-white/40 text-center max-w-md">
                    You can always change your account type later in your profile settings
                </p>
            </div>
        </div>
    );
}
