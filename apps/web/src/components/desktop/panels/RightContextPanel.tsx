import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Quote,
  Link,
  Star,
  Eye,
  BarChart3,
  Activity,
  Zap,
  Sparkles,
  Hash,
  Globe,
  FileText,
  Lightbulb
} from 'lucide-react';
import { useDesktopStore } from '../../../stores/desktopStore';
import { cn } from '../../../lib/utils';

interface RightContextPanelProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
}

interface DebateResponse {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isPro?: boolean;
  isCon?: boolean;
}

interface Reference {
  id: string;
  type: 'book' | 'article' | 'video' | 'quote';
  title: string;
  author: string;
  snippet: string;
  relevance: number;
}

const mockResponses: DebateResponse[] = [
  {
    id: '1',
    author: 'Prof. Mbemba',
    avatar: '/avatars/mbemba.jpg',
    content: 'L\'éducation décolonisée n\'est pas une suppression des savoirs occidentaux, mais une réintégration des perspectives africaines comme égales et valides.',
    timestamp: 'il y a 15 min',
    likes: 45,
    replies: 12,
    isPro: true
  },
  {
    id: '2',
    author: 'Dr. Konaté',
    avatar: '/avatars/konate.jpg',
    content: 'Nous devons reconstruire des systèmes qui valorisent nos langues, nos méthodes pédagogiques traditionnelles et notre vision du monde.',
    timestamp: 'il y a 32 min',
    likes: 38,
    replies: 8,
    isPro: true
  },
  {
    id: '3',
    author: 'Yao K.',
    avatar: '/avatars/yao.jpg',
    content: 'Attention à ne pas tomber dans le piège du relativisme culturel. Certaines méthodes éducatives sont universellement efficaces.',
    timestamp: 'il y a 1h',
    likes: 22,
    replies: 15,
    isCon: true
  }
];

const mockReferences: Reference[] = [
  {
    id: '1',
    type: 'book',
    title: 'Décoloniser l\'esprit',
    author: 'Ngũgĩ wa Thiong\'o',
    snippet: 'La décolonisation commence par la langue et la culture...',
    relevance: 0.95
  },
  {
    id: '2',
    type: 'article',
    title: 'Pédagogie africaine et modernité',
    author: 'Cheikh Anta Diop',
    snippet: 'Les systèmes éducatifs africains précoloniaux étaient basés sur...',
    relevance: 0.88
  },
  {
    id: '3',
    type: 'quote',
    title: 'Citation sagesse bambara',
    author: 'Tradition orale',
    snippet: '"Celui qui enseigne apprend deux fois"',
    relevance: 0.76
  }
];

export const RightContextPanel: React.FC<RightContextPanelProps> = ({ 
  expanded = false, 
  onToggleExpand 
}) => {
  const { panels, setRightActiveSection } = useDesktopStore();
  const [activeTab, setActiveTab] = useState<'debate' | 'context' | 'analytics' | 'references'>('debate');
  const [selectedReference, setSelectedReference] = useState<string | null>(null);

  const tabs = [
    { id: 'debate', label: 'Débat', icon: MessageSquare, count: mockResponses.length },
    { id: 'context', label: 'Contexte', icon: Brain, count: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null },
    { id: 'references', label: 'Références', icon: BookOpen, count: mockReferences.length }
  ];

  const renderDebateSection = () => (
    <div className="h-full flex flex-col">
      {/* Debate Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Débat Actif</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
              3 participants
            </span>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium animate-pulse">
              LIVE
            </span>
          </div>
        </div>
        <p className="text-sm text-white/60">
          Faut-il décoloniser l\'éducation africaine ?
        </p>
      </div>

      {/* Responses */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {mockResponses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Response Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {response.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-white">{response.author}</h4>
                    <span className="text-xs text-white/40">{response.timestamp}</span>
                  </div>
                  
                  {/* Position Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {response.isPro && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                        POUR
                      </span>
                    )}
                    {response.isCon && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                        CONTRE
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="text-sm text-white/80 leading-relaxed mb-3">
                {response.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
                  <Star className="w-3 h-3" />
                  <span>{response.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors">
                  <MessageSquare className="w-3 h-3" />
                  <span>{response.replies}</span>
                </button>
                <button className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Répondre
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Response Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Participer au débat..."
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button className="px-3 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white text-sm font-medium transition-colors">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );

  const renderContextSection = () => (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Résumé IA</h3>
        <div className="p-4 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">Analyse IA</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            Ce débat explore la tension entre la préservation des savoirs éducatifs occidentaux 
            et la nécessité de réintégrer les perspectives africaines. Les arguments principaux 
            portent sur la décolonisation linguistique, les méthodes pédagogiques traditionnelles, 
            et l\'équilibre entre universalisme et relativisme culturel.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Points Clés</h3>
        <div className="space-y-3">
          {[
            'Langue comme vecteur de décolonisation',
            'Méthodes pédagogiques africaines traditionnelles',
            'Équilibre entre savoirs locaux et universels',
            'Réforme des programmes éducatifs'
          ].map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-sm text-white/80">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Historique</h3>
        <div className="space-y-3">
          {[
            { event: '1960 - Indépendances africaines', impact: 'Début de la réflexion sur l\'éducation post-coloniale' },
            { event: '1980 - Mouvement décolonial', impact: 'Théorisation de la décolonisation du savoir' },
            { event: '2020 - Nouvelles réformes', impact: 'Intégration des langues africaines dans les systèmes éducatifs' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-white">{item.event}</span>
              </div>
              <p className="text-xs text-white/60">{item.impact}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Engagement</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-white/60">Vues</span>
            </div>
            <p className="text-lg font-bold text-white">89.2K</p>
            <p className="text-xs text-green-400">+12.5%</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-white/60">Réponses</span>
            </div>
            <p className="text-lg font-bold text-white">1.2K</p>
            <p className="text-xs text-green-400">+8.3%</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-white/60">Participants</span>
            </div>
            <p className="text-lg font-bold text-white">342</p>
            <p className="text-xs text-green-400">+15.7%</p>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/60">Taux engagement</span>
            </div>
            <p className="text-lg font-bold text-white">4.8%</p>
            <p className="text-xs text-red-400">-2.1%</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Évolution</h3>
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60">7 derniers jours</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="h-32 flex items-end justify-between gap-1">
            {[65, 78, 82, 71, 89, 94, 88].map((height, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex-1 bg-gradient-to-t from-orange-500 to-purple-500 rounded-t"
              />
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Démographie</h3>
        <div className="space-y-3">
          {[
            { segment: '18-24 ans', percentage: 35, color: 'bg-blue-500' },
            { segment: '25-34 ans', percentage: 42, color: 'bg-orange-500' },
            { segment: '35-44 ans', percentage: 18, color: 'bg-purple-500' },
            { segment: '45+ ans', percentage: 5, color: 'bg-green-500' }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">{item.segment}</span>
                <span className="text-sm text-white/60">{item.percentage}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn("h-2 rounded-full", item.color)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReferencesSection = () => (
    <div className="h-full overflow-y-auto p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sources & Références</h3>
        <div className="space-y-3">
          {mockReferences.map((reference, index) => (
            <motion.div
              key={reference.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-xl border cursor-pointer transition-all",
                selectedReference === reference.id
                  ? "bg-orange-500/10 border-orange-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
              onClick={() => setSelectedReference(reference.id)}
            >
              {/* Reference Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  reference.type === 'book' && "bg-blue-500/20 text-blue-400",
                  reference.type === 'article' && "bg-orange-500/20 text-orange-400",
                  reference.type === 'video' && "bg-purple-500/20 text-purple-400",
                  reference.type === 'quote' && "bg-green-500/20 text-green-400"
                )}>
                  {reference.type === 'book' && <BookOpen className="w-4 h-4" />}
                  {reference.type === 'article' && <FileText className="w-4 h-4" />}
                  {reference.type === 'video' && <Globe className="w-4 h-4" />}
                  {reference.type === 'quote' && <Quote className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white mb-1">{reference.title}</h4>
                  <p className="text-xs text-white/60 mb-2">{reference.author}</p>
                  
                  {/* Relevance Score */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-orange-400">
                        {Math.round(reference.relevance * 100)}% pertinence
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Snippet */}
              <p className="text-sm text-white/80 italic mb-3">
                "{reference.snippet}"
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  Voir plus
                </button>
                <button className="text-xs text-white/60 hover:text-white transition-colors">
                  <Link className="w-3 h-3 inline mr-1" />
                  Lien
                </button>
                <button className="text-xs text-white/60 hover:text-white transition-colors">
                  <Star className="w-3 h-3 inline mr-1" />
                  Sauvegarder
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Related Topics */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Sujets Connexes</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'Éducation', 'Décolonisation', 'Culture africaine', 'Pédagogie', 
            'Langues africaines', 'Savoir traditionnel', 'Réforme éducative'
          ].map((topic, index) => (
            <motion.button
              key={topic}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-white/80 hover:text-white transition-colors"
            >
              <Hash className="w-3 h-3 inline mr-1" />
              {topic}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Contexte</h2>
          <button
            onClick={onToggleExpand}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {expanded ? (
              <ChevronRight className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white/60" />
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4 bg-white/5 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
                activeTab === tab.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'debate' && (
            <motion.div
              key="debate"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderDebateSection()}
            </motion.div>
          )}
          {activeTab === 'context' && (
            <motion.div
              key="context"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderContextSection()}
            </motion.div>
          )}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderAnalyticsSection()}
            </motion.div>
          )}
          {activeTab === 'references' && (
            <motion.div
              key="references"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderReferencesSection()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
