import React, { useState } from 'react';
import { Group, AppState } from './types';
import GroupList from './components/GroupList';
import History from './components/History';
import Profile from './components/Profile';
import LiveStream from './components/LiveStream';
import { AuthProvider } from './contexts/AuthContext';
import { Home, History as HistoryIcon, User } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('CHOOSING_GROUP');
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY' | 'PROFILE'>('HOME');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setAppState('STREAMING');
  };

  const handleExitStream = () => {
    setAppState('CHOOSING_GROUP');
    setSelectedGroup(null);
  };

  const renderContent = () => {
    if (appState === 'STREAMING' && selectedGroup) {
      return <LiveStream group={selectedGroup} onExit={handleExitStream} />;
    }

    switch (activeTab) {
      case 'HOME':
        return <GroupList onSelect={handleGroupSelect} />;
      case 'HISTORY':
        return <History />;
      case 'PROFILE':
        return <Profile onBack={() => setActiveTab('HOME')} />;
      default:
        return <GroupList onSelect={handleGroupSelect} />;
    }
  };

  return (
    <AuthProvider>
      <div className="flex-1 w-full max-w-md mx-auto relative overflow-hidden bg-black shadow-2xl h-screen flex flex-col">
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Global Bottom Navigation - Only show when NOT streaming */}
        {appState === 'CHOOSING_GROUP' && (
          <div className="h-20 bg-[#0B0B0B]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50 shrink-0">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'HOME' ? 'text-violet-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Home className={`w-6 h-6 ${activeTab === 'HOME' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'HISTORY' ? 'text-violet-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <HistoryIcon className="w-6 h-6" />
              <span className="text-[10px] font-medium">History</span>
            </button>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex flex-col items-center gap-1.5 p-2 transition-colors ${activeTab === 'PROFILE' ? 'text-violet-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <User className={`w-6 h-6 ${activeTab === 'PROFILE' ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </div>
        )}

        {/* Global Bottom Safe Area for Mobile */}
        <div className="h-safe-bottom bg-[#0B0B0B] shrink-0" />
      </div>
    </AuthProvider>
  );
};

export default App;
