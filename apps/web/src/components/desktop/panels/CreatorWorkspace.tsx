import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Video, 
  Mic, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Settings,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Scissors,
  Image,
  Type,
  Hash,
  Eye,
  Download,
  Trash2,
  Copy,
  Save,
  RefreshCw,
  Zap,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  Activity,
  Target,
  Lightbulb,
  Brain,
  Wand2,
  Palette,
  Music,
  Film,
  Podcast,
  BookOpen
} from 'lucide-react';
import { useDesktopStore } from '../../../stores/desktopStore';
import { cn } from '../../../lib/utils';

interface CreatorWorkspaceProps {
  className?: string;
}

interface UploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  type: 'video' | 'audio' | 'document';
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'audio' | 'series' | 'podcast';
  status: 'draft' | 'processing' | 'published';
  views: string;
  engagement: string;
  revenue: string;
  thumbnail: string;
  duration: string;
  createdAt: string;
}

const mockUploads: UploadProgress[] = [
  { id: '1', filename: 'Histoire_Kemet_Ep3.mp4', progress: 85, status: 'processing', type: 'video' },
  { id: '2', filename: 'Meditation_Ancetres.mp3', progress: 100, status: 'completed', type: 'audio' },
  { id: '3', filename: 'Debat_Education.mp4', progress: 45, status: 'uploading', type: 'video' }
];

const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Les racines de la civilisation Kemet',
    type: 'video',
    status: 'published',
    views: '124K',
    engagement: '8.2K',
    revenue: 'FCFA 45,200',
    thumbnail: '/thumbnails/kemet-1.jpg',
    duration: '24:15',
    createdAt: 'il y a 2 jours'
  },
  {
    id: '2',
    title: 'Série: Royaumes oubliés d\'Afrique',
    type: 'series',
    status: 'processing',
    views: '-',
    engagement: '-',
    revenue: '-',
    thumbnail: '/thumbnails/royaumes.jpg',
    duration: '3 épisodes',
    createdAt: 'il y a 1 jour'
  }
];

export const CreatorWorkspace: React.FC<CreatorWorkspaceProps> = ({ className }) => {
  const { creatorWorkspace, setCreatorActiveTool } = useDesktopStore();
  const [activeTab, setActiveTab] = useState(creatorWorkspace.activeTool);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tools = [
    { id: 'upload', label: 'Upload', icon: Upload, color: 'bg-blue-500' },
    { id: 'audio', label: 'Audio Studio', icon: Mic, color: 'bg-green-500' },
    { id: 'series', label: 'Séries', icon: Film, color: 'bg-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'ai', label: 'IA Assistant', icon: Sparkles, color: 'bg-pink-500' }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
  };

  const renderUploadTool = () => (
    <div className="h-full flex flex-col">
      {/* Drag & Drop Zone */}
      <div className="flex-1 p-8">
        <div
          className={cn(
            "h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300",
            dragActive 
              ? "border-orange-500 bg-orange-500/10" 
              : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Glissez-déposez vos fichiers
            </h3>
            <p className="text-white/60 mb-6">
              Vidéo, Audio, Documents jusqu\'à 100MB
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors"
            >
              Parcourir les fichiers
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,audio/*,.pdf,.doc,.docx"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <div className="border-t border-white/10 p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Téléchargements en cours</h4>
        <div className="space-y-3">
          {mockUploads.map((upload) => (
            <div key={upload.id} className="p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    upload.type === 'video' && "bg-blue-500/20 text-blue-400",
                    upload.type === 'audio' && "bg-green-500/20 text-green-400",
                    upload.type === 'document' && "bg-purple-500/20 text-purple-400"
                  )}>
                    {upload.type === 'video' && <Video className="w-4 h-4" />}
                    {upload.type === 'audio' && <Mic className="w-4 h-4" />}
                    {upload.type === 'document' && <FileText className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{upload.filename}</p>
                    <p className="text-xs text-white/60 capitalize">{upload.status}</p>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {upload.status !== 'completed' && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${upload.progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-orange-500 to-purple-500 rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudioStudio = () => (
    <div className="h-full flex flex-col">
      {/* Audio Editor */}
      <div className="flex-1 p-6">
        <div className="h-full bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Studio Audio</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Scissors className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Volume2 className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Waveform Display */}
          <div className="bg-black/60 rounded-xl p-4 mb-6">
            <div className="h-32 flex items-center justify-center">
              <div className="flex items-center gap-1 h-full">
                {Array.from({ length: 100 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: `${Math.random() * 80 + 20}%`
                    }}
                    className="w-1 bg-gradient-to-t from-orange-500 to-purple-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Audio Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <SkipBack className="w-5 h-5 text-white" />
            </button>
            <button className="p-4 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
              <Play className="w-6 h-6 text-white" />
            </button>
            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Audio Tools */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Mic, label: 'Enregistrement' },
              { icon: Scissors, label: 'Couper' },
              { icon: Volume2, label: 'Volume' },
              { icon: RefreshCw, label: 'Effets' }
            ].map((tool, index) => (
              <button
                key={index}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-lg flex flex-col items-center gap-2 transition-colors"
              >
                <tool.icon className="w-5 h-5 text-white" />
                <span className="text-xs text-white/60">{tool.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeriesManager = () => (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Gestion des Séries</h3>
        <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle série
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {mockContent.map((content) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gradient-to-br from-orange-900/20 to-purple-900/20 relative">
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  content.status === 'published' && "bg-green-500/20 text-green-400",
                  content.status === 'processing' && "bg-orange-500/20 text-orange-400",
                  content.status === 'draft' && "bg-gray-500/20 text-gray-400"
                )}>
                  {content.status === 'published' && 'Publié'}
                  {content.status === 'processing' && 'En traitement'}
                  {content.status === 'draft' && 'Brouillon'}
                </span>
              </div>
            </div>

            {/* Content Info */}
            <div className="p-4">
              <h4 className="text-lg font-semibold text-white mb-2">{content.title}</h4>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Type</span>
                  <span className="text-white capitalize">{content.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Durée</span>
                  <span className="text-white">{content.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Créé</span>
                  <span className="text-white">{content.createdAt}</span>
                </div>
              </div>

              {/* Stats */}
              {content.status === 'published' && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/60">Vues</p>
                    <p className="text-sm font-semibold text-white">{content.views}</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/60">Engagement</p>
                    <p className="text-sm font-semibold text-white">{content.engagement}</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/60">Revenus</p>
                    <p className="text-sm font-semibold text-white">{content.revenue}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
                  Éditer
                </button>
                <button className="flex-1 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors">
                  Voir stats
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="h-full overflow-y-auto p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Analytics Créateur</h3>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vues totales', value: '1.2M', change: '+12.5%', icon: Eye, color: 'text-blue-400' },
          { label: 'Abonnés', value: '45.2K', change: '+8.3%', icon: Users, color: 'text-green-400' },
          { label: 'Revenus', value: 'FCFA 892K', change: '+15.7%', icon: DollarSign, color: 'text-orange-400' },
          { label: 'Engagement', value: '4.8%', change: '+2.1%', icon: Activity, color: 'text-purple-400' }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black/40 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-xs text-green-400 font-medium">{stat.change}</span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-xs text-white/60">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">Performance des 30 derniers jours</h4>
        <div className="h-48 flex items-end justify-between gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 80 + 20}%` }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
              className="flex-1 bg-gradient-to-t from-orange-500 to-purple-500 rounded-t"
            />
          ))}
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Contenu le plus performant</h4>
        <div className="space-y-3">
          {mockContent.map((content, index) => (
            <div key={content.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-orange-400">#{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-white">{content.title}</p>
                  <p className="text-xs text-white/60">{content.views} vues</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{content.engagement}</p>
                <p className="text-xs text-white/60">engagement</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIAssistant = () => (
    <div className="h-full overflow-y-auto p-6">
      <h3 className="text-xl font-semibold text-white mb-6">IA Assistant Créateur</h3>

      {/* AI Tools Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Type, label: 'Générer titre', description: 'Titres accrocheurs optimisés SEO' },
          { icon: FileText, label: 'Description', description: 'Descriptions engageantes' },
          { icon: Image, label: 'Thumbnail IA', description: 'Miniatures générées par IA' },
          { icon: Hash, label: 'Tags', description: 'Tags pertinents automatiques' },
          { icon: Brain, label: 'Idées contenu', description: 'Suggestions basées sur trends' },
          { icon: Target, label: 'Optimisation', description: 'Amélioration performance' }
        ].map((tool, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gradient-to-br from-orange-500/10 to-purple-500/10 border border-white/10 rounded-xl hover:border-orange-500/30 transition-all text-left group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-500 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <tool.icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{tool.label}</h4>
            <p className="text-xs text-white/60">{tool.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Active AI Session */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Session IA Active</h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">En ligne</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-orange-500/10 rounded-lg">
            <p className="text-sm text-white mb-2">
              💡 Suggestion IA : Votre prochaine vidéo sur "Les technologies traditionnelles africaines" pourrait performer 45% mieux selon les trends actuels.
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded text-white text-sm transition-colors">
                Appliquer
              </button>
              <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm transition-colors">
                Ignorer
              </button>
            </div>
          </div>

          <div className="p-4 bg-purple-500/10 rounded-lg">
            <p className="text-sm text-white mb-2">
              🎨 Thumbnail IA généré : 3 propositions basées sur votre contenu et les meilleures pratiques.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-video bg-gradient-to-br from-orange-400/20 to-purple-400/20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'upload': return renderUploadTool();
      case 'audio': return renderAudioStudio();
      case 'series': return renderSeriesManager();
      case 'analytics': return renderAnalytics();
      case 'ai': return renderAIAssistant();
      default: return renderUploadTool();
    }
  };

  return (
    <div className={cn("h-full flex flex-col bg-black/40 backdrop-blur-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Studio Créateur</h2>
            <p className="text-white/60">Espace de création professionnel MAATFEED</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
              <Settings className="w-4 h-4 inline mr-2" />
              Paramètres
            </button>
          </div>
        </div>

        {/* Tool Tabs */}
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTab(tool.id as typeof activeTab);
                setCreatorActiveTool(tool.id as any);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                activeTab === tool.id
                  ? "bg-gradient-to-r from-orange-500 to-purple-500 text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <tool.icon className="w-5 h-5" />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
