import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  TrendingUp, 
  Eye,
  Heart,
  Share,
  Bookmark,
  MoreHorizontal,
  Mic,
  Video,
  FileText,
  Image,
  Send,
  Plus,
  Filter,
  Search,
  Zap,
  Brain,
  Target,
  BarChart3,
  Activity,
  Star,
  Award,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useDesktopStore } from '../../../stores/desktopStore';
import { cn } from '../../../lib/utils';

interface DebateWorkspaceProps {
  className?: string;
}

interface Argument {
  id: string;
  author: string;
  avatar: string;
  content: string;
  position: 'pro' | 'con' | 'neutral';
  timestamp: string;
  likes: number;
  replies: number;
  sources: number;
  credibility: number;
  isHighlighted?: boolean;
  isMain?: boolean;
}

interface Debate {
  id: string;
  title: string;
  description: string;
  category: string;
  participants: number;
  arguments: number;
  views: string;
  status: 'active' | 'paused' | 'resolved';
  startTime: string;
  moderator: string;
}

const mockArguments: Argument[] = [
  {
    id: '1',
    author: 'Dr. Awa Ndiaye',
    avatar: '/avatars/awa.jpg',
    content: 'La décolonisation de l\'éducation est essentielle pour restaurer la dignité culturelle africaine. Les systèmes éducatifs actuels perpétuent une vision du monde qui nous marginalise.',
    position: 'pro',
    timestamp: 'il y a 15 min',
    likes: 45,
    replies: 12,
    sources: 3,
    credibility: 0.89,
    isMain: true,
    isHighlighted: true
  },
  {
    id: '2',
    author: 'Prof. Konaté',
    avatar: '/avatars/konate.jpg',
    content: 'Je suis d\'accord avec Dr. Ndiaye. Nous devons intégrer les langues africaines, les méthodes pédagogiques traditionnelles et les savoirs locaux dans nos curriculums.',
    position: 'pro',
    timestamp: 'il y a 12 min',
    likes: 38,
    replies: 8,
    sources: 2,
    credibility: 0.85
  },
  {
    id: '3',
    author: 'Yao K.',
    avatar: '/avatars/yao.jpg',
    content: 'Attention à ne pas rejeter systématiquement les savoirs occidentaux. La science et la technologie sont universelles. Il faut trouver un équilibre.',
    position: 'con',
    timestamp: 'il y a 8 min',
    likes: 22,
    replies: 15,
    sources: 1,
    credibility: 0.76
  },
  {
    id: '4',
    author: 'Dr. Bakary',
    avatar: '/avatars/bakary.jpg',
    content: 'L\'approche pragmatique serait de créer des systèmes hybrides : fondations universelles + contexte culturel africain.',
    position: 'neutral',
    timestamp: 'il y a 5 min',
    likes: 31,
    replies: 6,
    sources: 4,
    credibility: 0.92,
    isHighlighted: true
  }
];

const mockDebates: Debate[] = [
  {
    id: '1',
    title: 'Faut-il décoloniser l\'éducation africaine ?',
    description: 'Exploration des voies pour une éducation authentiquement africaine',
    category: 'Éducation',
    participants: 342,
    arguments: 124,
    views: '89K',
    status: 'active',
    startTime: '14:30',
    moderator: 'Dr. Awa Ndiaye'
  },
  {
    id: '2',
    title: 'Tradition vs Modernité : Le dilemme africain',
    description: 'Comment concilier héritage culturel et développement moderne',
    category: 'Culture',
    participants: 256,
    arguments: 89,
    views: '67K',
    status: 'active',
    startTime: '16:00',
    moderator: 'Prof. Konaté'
  }
];

export const DebateWorkspace: React.FC<DebateWorkspaceProps> = ({ className }) => {
  const { debateWorkspace, setDebateMode } = useDesktopStore();
  const [activeDebate, setActiveDebate] = useState(mockDebates[0]);
  const [viewMode, setViewMode] = useState<'compact' | 'threaded' | 'compare'>('threaded');
  const [selectedArguments, setSelectedArguments] = useState<string[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newResponse, setNewResponse] = useState('');

  const modes = [
    { id: 'compact', label: 'Compact', icon: Minimize2 },
    { id: 'threaded', label: 'Threadé', icon: GitBranch },
    { id: 'compare', label: 'Comparaison', icon: ArrowRight }
  ];

  const handleArgumentSelect = (argumentId: string) => {
    setSelectedArguments(prev => 
      prev.includes(argumentId) 
        ? prev.filter(id => id !== argumentId)
        : [...prev, argumentId]
    );
  };

  const renderArgumentCard = (argument: Argument, index: number) => (
    <motion.div
      key={argument.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={cn(
        "p-6 rounded-2xl border transition-all cursor-pointer",
        argument.isHighlighted && "bg-gradient-to-r from-orange-500/10 to-purple-500/10 border-orange-500/30",
        argument.isMain && "ring-2 ring-orange-500/50",
        !argument.isHighlighted && "bg-black/40 border-white/10 hover:bg-white/5",
        selectedArguments.includes(argument.id) && "ring-2 ring-blue-500"
      )}
      onClick={() => handleArgumentSelect(argument.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {argument.author.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{argument.author}</h4>
            <p className="text-xs text-white/60">{argument.timestamp}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Position Badge */}
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            argument.position === 'pro' && "bg-green-500/20 text-green-400",
            argument.position === 'con' && "bg-red-500/20 text-red-400",
            argument.position === 'neutral' && "bg-blue-500/20 text-blue-400"
          )}>
            {argument.position === 'pro' && 'POUR'}
            {argument.position === 'con' && 'CONTRE'}
            {argument.position === 'neutral' && 'NEUTRE'}
          </span>
          
          {/* Credibility Score */}
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-white/80">
              {Math.round(argument.credibility * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <p className="text-white/80 leading-relaxed mb-4">
        {argument.content}
      </p>

      {/* Sources */}
      {argument.sources > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-orange-400">
            {argument.sources} source{argument.sources > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
            <Heart className="w-4 h-4" />
            <span>{argument.likes}</span>
          </button>
          <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>{argument.replies}</span>
          </button>
          <button className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
            <Share className="w-4 h-4" />
          </button>
        </div>
        
        <button className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
          Répondre
        </button>
      </div>
    </motion.div>
  );

  const renderCompactView = () => (
    <div className="space-y-3">
      {mockArguments.map((argument, index) => (
        <div key={argument.id} className="p-4 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{argument.author}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                argument.position === 'pro' && "bg-green-500/20 text-green-400",
                argument.position === 'con' && "bg-red-500/20 text-red-400",
                argument.position === 'neutral' && "bg-blue-500/20 text-blue-400"
              )}>
                {argument.position === 'pro' && 'POUR'}
                {argument.position === 'con' && 'CONTRE'}
                {argument.position === 'neutral' && 'NEUTRE'}
              </span>
            </div>
            <span className="text-xs text-white/40">{argument.timestamp}</span>
          </div>
          <p className="text-sm text-white/80 line-clamp-2">{argument.content}</p>
        </div>
      ))}
    </div>
  );

  const renderCompareView = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Pro Arguments */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-green-400">Arguments POUR</h4>
        {mockArguments.filter(a => a.position === 'pro').map((argument, index) => (
          <motion.div
            key={argument.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-white">{argument.author}</span>
              <span className="text-xs text-green-400">{argument.likes} likes</span>
            </div>
            <p className="text-sm text-white/80">{argument.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Con Arguments */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-red-400">Arguments CONTRE</h4>
        {mockArguments.filter(a => a.position === 'con').map((argument, index) => (
          <motion.div
            key={argument.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-white">{argument.author}</span>
              <span className="text-xs text-red-400">{argument.likes} likes</span>
            </div>
            <p className="text-sm text-white/80">{argument.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderThreadedView = () => (
    <div className="space-y-4">
      {mockArguments.map((argument, index) => renderArgumentCard(argument, index))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Debate Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Participants', value: activeDebate.participants, icon: Users, color: 'text-blue-400' },
          { label: 'Arguments', value: activeDebate.arguments, icon: MessageSquare, color: 'text-orange-400' },
          { label: 'Vues', value: activeDebate.views, icon: Eye, color: 'text-green-400' },
          { label: 'Engagement', value: '4.8%', icon: Activity, color: 'text-purple-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-black/40 border border-white/10 rounded-xl p-4">
            <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Argument Distribution */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Distribution des positions</h4>
        <div className="space-y-3">
          {[
            { position: 'POUR', count: 67, color: 'bg-green-500' },
            { position: 'CONTRE', count: 23, color: 'bg-red-500' },
            { position: 'NEUTRE', count: 34, color: 'bg-blue-500' }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{item.position}</span>
                <span className="text-sm text-white">{item.count}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.count}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn("h-2 rounded-full", item.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Top contributeurs</h4>
        <div className="space-y-3">
          {mockArguments.slice(0, 3).map((arg, index) => (
            <div key={arg.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-orange-400">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{arg.author}</p>
                  <p className="text-xs text-white/60">{arg.likes} likes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{arg.credibility * 100}%</p>
                <p className="text-xs text-white/60">crédibilité</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("h-full flex flex-col bg-black/40 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Espace Débat</h2>
            <p className="text-white/60">Débats intellectuels structurés et approfondis</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                showAnalytics 
                  ? "bg-orange-500 text-white" 
                  : "bg-white/10 hover:bg-white/20 text-white"
              )}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
              <Settings className="w-4 h-4 inline mr-2" />
              Paramètres
            </button>
          </div>
        </div>

        {/* Debate Info */}
        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{activeDebate.title}</h3>
              <p className="text-sm text-white/60 mb-2">{activeDebate.description}</p>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {activeDebate.participants} participants
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {activeDebate.arguments} arguments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {activeDebate.views} vues
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activeDebate.startTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium animate-pulse">
                {activeDebate.status === 'active' && 'ACTIF'}
              </span>
              <span className="text-xs text-white/60">
                Modéré par {activeDebate.moderator}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setViewMode(mode.id as any);
                setDebateMode(mode.id as any);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                viewMode === mode.id
                  ? "bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <mode.icon className="w-4 h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {showAnalytics ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-6"
            >
              {renderAnalytics()}
            </motion.div>
          ) : (
            <motion.div
              key="debate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto p-6"
            >
              {viewMode === 'compact' && renderCompactView()}
              {viewMode === 'threaded' && renderThreadedView()}
              {viewMode === 'compare' && renderCompareView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Response Input */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Mic className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Video className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Image className="w-4 h-4 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <input
              type="text"
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Participer au débat..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-medium transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
