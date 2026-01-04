import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Smile, Clock, ChevronRight, Search, Play } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface HistoryItem {
    id: string;
    title: string;
    description: string;
    timestamp: any; // Firestore timestamp
    duration: string;
    commentCount: number;
    vibe: string;
    status: 'COMPLETED' | 'SAVED' | 'DRAFT';
}

const History: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('All Sessions');
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const tabs = ['All Sessions', 'Favorites', 'Drafts', 'Archived'];

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                setHistoryItems([]); // Clear mock data if no user
                return;
            }

            try {
                const q = query(
                    collection(db, 'streams'),
                    where('userId', '==', user.uid),
                    orderBy('timestamp', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
                setHistoryItems(items);
            } catch (err) {
                console.error("Error fetching history:", err);
                // Fallback to empty if error, or keep mock data if you prefer for demo
                setHistoryItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    const formatDate = (seconds: number) => {
        const date = new Date(seconds * 1000);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' • ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0B0B] text-white overflow-hidden relative">
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-6 pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Past Streams</h1>
                    <button className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-white/10 text-gray-400">
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${activeTab === tab
                                ? 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20'
                                : 'bg-zinc-900 border-zinc-800 text-gray-400 hover:border-zinc-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="space-y-4">
                    {historyItems.map(item => (
                        <div key={item.id} className="bg-[#161616] rounded-2xl p-5 border border-white/5 active:scale-[0.99] transition-transform">

                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                        item.status === 'SAVED' ? 'bg-purple-500/10 text-purple-400' :
                                            'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {item.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {formatDate(item.timestamp.seconds)}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">
                                {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-violet-400">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">{item.commentCount} comments</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-400">
                                        <span className="text-xs">{item.vibe}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium font-mono">{item.duration}</span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default History;
