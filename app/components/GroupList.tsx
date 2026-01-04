import React, { useState } from 'react';
import { Group } from '../types';
import { GROUPS } from '../constants';
import { Search, Play, Users, Home, History, User, Sparkles, Flame, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface GroupListProps {
  onSelect: (group: Group) => void;
}

const GroupList: React.FC<GroupListProps> = ({ onSelect }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Pitch Deck', 'Stand-up', 'Debate', 'Casual'];
  const trendingGroups = GROUPS.slice(0, 2); // First 2 as trending
  const listGroups = GROUPS; // Show all in list for now

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] text-white overflow-hidden relative">
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[40%] bg-violet-900/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[40%] bg-blue-900/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-[#0B0B0B]/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs font-medium tracking-wide">Welcome back,</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-0.5">{user?.displayName?.split(' ')[0] || 'Guest'}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-[2px]">
            <img
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"}
              alt="User"
              className="w-full h-full rounded-full bg-[#0B0B0B] border-2 border-[#0B0B0B] object-cover"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-white/5 rounded-full leading-5 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50 focus:bg-zinc-900 text-sm transition-all"
              placeholder="Find a vibe..."
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pl-6 mb-8 overflow-x-auto no-scrollbar flex space-x-3 pr-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${activeFilter === filter
                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Trending Section */}
        <div className="pl-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Trending Now</h2>
          </div>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar pr-6 pb-2">
            {trendingGroups.map((group) => (
              <div
                key={group.id}
                className="relative flex-none w-[280px] aspect-video rounded-2xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-all"
                onClick={() => onSelect(group)}
              >
                <img
                  src={group.image}
                  alt={group.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {group.status && (
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${group.status === 'LIVE NOW'
                      ? 'bg-orange-500/90 text-white shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-pulse'
                      : 'bg-violet-600/90 text-white'
                      }`}>
                      {group.status}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-14">
                  <h3 className="text-lg font-bold text-white leading-tight mb-1">{group.name}</h3>
                  <p className="text-xs text-gray-300 line-clamp-1">{group.description}</p>
                </div>

                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories / Your Casts */}
        <div className="px-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white">Your Casts</h2>
          </div>

          <div className="space-y-4">
            {listGroups.map((group) => (
              <div
                key={group.id}
                className="bg-[#161616] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">{group.name}</h3>
                      {group.status === 'HOT' && (
                        <span className="bg-violet-500/20 text-violet-300 text-[10px] font-bold px-1.5 py-0.5 rounded">HOT</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">{group.description}</p>
                  </div>
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2 flex-shrink-0 ml-3 mt-1">
                    {group.personas.slice(0, 3).map((p) => (
                      <img
                        key={p.id}
                        src={p.avatar}
                        className="w-8 h-8 rounded-full border-2 border-[#161616] bg-zinc-800"
                        alt={p.name}
                      />
                    ))}
                    {group.personas.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[#161616] bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        +{group.personas.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {group.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-medium text-gray-400 bg-white/5 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => onSelect(group)}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Start Cast
                  </button>
                  <button className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 text-gray-300 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <Users className="w-3.5 h-3.5" />
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Removed - Handled in App.tsx */}
    </div>
  );
};

export default GroupList;
