import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { ChevronLeft, LogOut, Trash2, Crown, ChevronRight } from 'lucide-react';

interface ProfileProps {
    onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onBack }) => {
    const { user, login, logout } = useAuth();
    const { aiModel, setAiModel } = useSettings();

    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] text-white relative">
            {/* Header with Back Button */}
            <div className="px-6 pt-8 pb-4 flex justify-between items-center relative z-20">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white active:scale-90 transition-transform"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-nav text-sm font-bold tracking-widest text-[#888]">SETTINGS</span>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            <div className="flex-1 px-6 pt-4 overflow-y-auto no-scrollbar">
                {/* Profile Card */}
                <div className="bg-[#161616] border border-white/5 rounded-3xl p-8 flex flex-col items-center mb-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />

                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-violet-500 to-fuchsia-500">
                            <img
                                src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
                                alt="Profile"
                                className="w-full h-full rounded-full bg-[#0B0B0B] object-cover"
                            />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-white mb-2">
                        {user?.displayName || "Guest User"}
                    </h2>

                    <div className="bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full">
                        <span className="text-xs text-violet-300 font-medium tracking-wide">
                            {user?.email || "No account synced"}
                        </span>
                    </div>
                </div>

                {/* Subscription Section */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-bold text-[#666] tracking-widest mb-3 uppercase">Subscription</h3>
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 relative overflow-hidden">

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20">
                                    <Crown className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-white">Pro Member</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Valid until Oct 24, 2026</p>
                                </div>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded border border-emerald-500/20">
                                ACTIVE
                            </span>
                        </div>

                        <button className="w-full text-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors py-2 border-t border-white/5 mt-2">
                            Manage Subscription
                        </button>
                    </div>
                </div>

                {/* AI Settings */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-bold text-[#666] tracking-widest mb-3 uppercase">AI Settings</h3>
                    <div className="bg-[#161616] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold text-white">Model Selection</label>
                            <div className="grid grid-cols-1 gap-2">
                                {(
                                    [
                                        'gemini-3-pro-preview',
                                        'gemini-3-flash-preview',
                                        'gemini-2.5-pro',
                                        'gemini-2.5-flash',
                                        'gemini-2.5-flash-preview-09-2025',
                                        'gemini-2.5-flash-image',
                                        'gemini-2.5-flash-native-audio-preview-12-2025',
                                        'gemini-2.0-flash-exp',
                                        'gemini-1.5-pro-latest',
                                        'gemini-1.5-pro',
                                        'gemini-1.5-flash'
                                    ] as const
                                ).map((model) => (
                                    <button
                                        key={model}
                                        onClick={() => setAiModel(model)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all ${aiModel === model
                                            ? 'bg-violet-600/20 border-violet-500 text-white'
                                            : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-medium">{model}</span>
                                            {aiModel === model && <div className="w-2 h-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="mb-8">
                    <h3 className="text-[10px] font-bold text-[#666] tracking-widest mb-3 uppercase">Account</h3>

                    <div className="space-y-3">
                        {user ? (
                            <button
                                onClick={logout}
                                className="w-full bg-[#161616] border border-white/5 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Log Out</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        ) : (
                            <button
                                onClick={login}
                                className="w-full bg-violet-600 rounded-xl p-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg shadow-violet-900/20"
                            >
                                <span className="text-sm font-bold text-white">Log In with Google</span>
                            </button>
                        )}

                        <button className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-all group hover:bg-red-500/20">
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-5 h-5 text-red-400" />
                                <span className="text-sm font-medium text-red-400">Delete Account</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="text-center pb-8">
                    <p className="text-[10px] text-[#333] font-mono">v1.0.4 (build 2024.10.24)</p>
                </div>

            </div>
        </div>
    );
};

export default Profile;
