import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { usePlayerStore } from '../../stores';
import { ResponseComposer, MultimodalResponse } from '../../components/responses/ResponseComposer';

interface ContentDetailPageProps {
  contentId?: string;
}

interface ContentDetail {
  _id: string;
  title: string;
  description: string;
  mediaType: 'video' | 'audio';
  mediaUrl: string;
  thumbnailUrl?: string;
  duration: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorBio?: string;
  isVerified?: boolean;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  createdAt: string;
  tags: string[];
  category: string;
  hasDebate: boolean;
  debateId?: string;
  debateStatus?: string;
  debateParticipants?: number;
  userReaction?: 'like' | 'dislike' | 'love';
  isSaved: boolean;
}

interface Debate {
  _id: string;
  question: string;
  description: string;
  status: 'active' | 'closed' | 'pending';
  participants: number;
  responses: DebateResponse[];
  createdAt: string;
}

interface DebateResponse {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mediaType?: 'text' | 'audio' | 'video';
  mediaUrl?: string;
  likes: number;
  replies: DebateResponse[];
  createdAt: string;
  userReaction?: 'like' | 'dislike';
}

export const ContentDetailPage: React.FC<ContentDetailPageProps> = ({ contentId: propContentId }) => {
  const { contentId: paramContentId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const contentId = propContentId || paramContentId;
  
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [debate, setDebate] = useState<Debate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showDebateComposer, setShowDebateComposer] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { playTrack, pauseTrack, currentTrack } = usePlayerStore();

  useEffect(() => {
    if (contentId) {
      loadContentDetail(contentId);
    }
  }, [contentId]);

  const loadContentDetail = async (id: string) => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call
      const response = await fetch(`/api/content/${id}`);
      if (!response.ok) {
        throw new Error('Content not found');
      }
      
      const data = await response.json();
      setContent(data.data);
      
      // Load debate if exists
      if (data.data.hasDebate && data.data.debateId) {
        loadDebate(data.data.debateId);
      }
      
      // Set initial states
      setIsLiked(data.data.userReaction === 'like');
      setIsSaved(data.data.isSaved);
      
    } catch (error) {
      console.error('Failed to load content:', error);
      // Load mock data for development
      setContent(getMockContentDetail(id));
    } finally {
      setLoading(false);
    }
  };

  const loadDebate = async (debateId: string) => {
    try {
      const response = await fetch(`/api/debates/${debateId}`);
      if (response.ok) {
        const data = await response.json();
        setDebate(data.data);
      }
    } catch (error) {
      console.error('Failed to load debate:', error);
      // Load mock debate for development
      setDebate(getMockDebate(debateId));
    }
  };

  const handlePlayPause = () => {
    if (content?.mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    } else if (content?.mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = async () => {
    if (!content) return;
    
    try {
      const response = await fetch(`/api/content/${content._id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: isLiked ? 'remove' : 'like'
        })
      });
      
      if (response.ok) {
        setIsLiked(!isLiked);
        if (content) {
          setContent({
            ...content,
            likes: isLiked ? content.likes - 1 : content.likes + 1
          });
        }
      }
    } catch (error) {
      console.error('Failed to like content:', error);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    try {
      const response = await fetch(`/api/content/${content._id}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share && content) {
      navigator.share({
        title: content.title,
        text: content.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleMultimodalResponse = async (response: MultimodalResponse) => {
    try {
      // TODO: Implement API call to submit multimodal response
      console.log('Multimodal response:', response);
      
      // For now, just log the response
      alert('Response submitted successfully!');
      setShowDebateComposer(false);
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    }
  };

  const handleTimeUpdate = () => {
    if (content?.mediaType === 'video' && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    } else if (content?.mediaType === 'audio' && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (content?.mediaType === 'video' && videoRef.current) {
      setDuration(videoRef.current.duration);
    } else if (content?.mediaType === 'audio' && audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    
    if (content?.mediaType === 'video' && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else if (content?.mediaType === 'audio' && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeToggle = () => {
    if (content?.mediaType === 'video' && videoRef.current) {
      videoRef.current.muted = !isMuted;
    } else if (content?.mediaType === 'audio' && audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">Content not found</h2>
          <button
            onClick={() => navigate('/feed')}
            className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-900">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:text-[#FF6B35] transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <h1 className="text-white font-semibold truncate flex-1 mx-4">
            {content.title}
          </h1>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-white hover:text-[#FF6B35] transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Media Player */}
      <div className="relative">
        {content.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={content.mediaUrl}
            poster={content.thumbnailUrl}
            className="w-full aspect-video bg-black"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            {content.thumbnailUrl && (
              <img
                src={content.thumbnailUrl}
                alt={content.title}
                className="absolute inset-0 w-full h-full object-cover opacity-50"
              />
            )}
            <audio
              ref={audioRef}
              src={content.mediaUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Player Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${(currentTime / duration) * 100}%, #4B5563 ${(currentTime / duration) * 100}%, #4B5563 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-white mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-[#FF6B35] hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause size={20} className="text-white" />
                ) : (
                  <Play size={20} className="text-white ml-1" />
                )}
              </button>
              
              <button
                onClick={handleVolumeToggle}
                className="p-2 text-white hover:text-[#FF6B35] transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-white hover:text-[#FF6B35] transition-colors">
                <Settings size={20} />
              </button>
              <button className="p-2 text-white hover:text-[#FF6B35] transition-colors">
                <Maximize2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        {/* Title and Stats */}
        <div className="mb-4">
          <h1 className="text-white text-xl font-bold mb-2">{content.title}</h1>
          <div className="flex items-center justify-between text-gray-400 text-sm">
            <span>{formatViews(content.views)} views</span>
            <span>{new Date(content.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between mb-6 p-3 bg-gray-900 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-orange-600 flex items-center justify-center">
              {content.creatorAvatar ? (
                <img
                  src={content.creatorAvatar}
                  alt={content.creatorName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold">
                  {content.creatorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="text-white font-semibold">{content.creatorName}</h3>
                {content.isVerified && (
                  <div className="w-4 h-4 bg-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              {content.creatorBio && (
                <p className="text-gray-400 text-sm">{content.creatorBio}</p>
              )}
            </div>
          </div>
          
          <button className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
            Follow
          </button>
        </div>

        {/* Description */}
        {content.description && (
          <div className="mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">{content.description}</p>
          </div>
        )}

        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-around mb-8 p-4 bg-gray-900 rounded-lg">
          <button
            onClick={handleLike}
            className={`flex flex-col items-center space-y-1 ${isLiked ? 'text-[#FF6B35]' : 'text-gray-400'} hover:text-[#FF6B35] transition-colors`}
          >
            <Heart size={24} className={isLiked ? 'fill-current' : ''} />
            <span className="text-xs">{content.likes}</span>
          </button>
          
          <button className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#FF6B35] transition-colors">
            <MessageCircle size={24} />
            <span className="text-xs">{content.comments}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex flex-col items-center space-y-1 text-gray-400 hover:text-[#FF6B35] transition-colors"
          >
            <Share2 size={24} />
            <span className="text-xs">{content.shares}</span>
          </button>
          
          <button
            onClick={handleSave}
            className={`flex flex-col items-center space-y-1 ${isSaved ? 'text-[#FF6B35]' : 'text-gray-400'} hover:text-[#FF6B35] transition-colors`}
          >
            <Bookmark size={24} className={isSaved ? 'fill-current' : ''} />
            <span className="text-xs">Save</span>
          </button>
        </div>

        {/* Debate Section */}
        {content.hasDebate && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Debate</h2>
              {debate && (
                <span className="px-2 py-1 bg-[#FF6B35] text-white text-xs rounded-full">
                  {debate.participants} participants
                </span>
              )}
            </div>
            
            {debate ? (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{debate.question}</h3>
                {debate.description && (
                  <p className="text-gray-300 text-sm mb-4">{debate.description}</p>
                )}
                
                <div className="space-y-3">
                  {debate.responses.slice(0, 3).map((response) => (
                    <div key={response._id} className="border-l-2 border-[#FF6B35] pl-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-white text-xs">
                            {response.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white text-sm font-medium">{response.userName}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{response.content}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <button className="text-gray-400 hover:text-[#FF6B35] text-xs">
                          <ThumbsUp size={14} className="inline mr-1" />
                          {response.likes}
                        </button>
                        <button className="text-gray-400 hover:text-[#FF6B35] text-xs">
                          Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={() => setShowDebateComposer(!showDebateComposer)}
                  className="mt-4 w-full py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Join Debate
                </button>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <p className="text-gray-400 mb-3">Start a debate about this content</p>
                <button
                  onClick={() => setShowDebateComposer(true)}
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Start Debate
                </button>
              </div>
            )}
          </div>
        )}

        {/* Debate Composer */}
        {showDebateComposer && (
          <div className="mb-8 bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">
              {debate ? 'Add to Debate' : 'Start a Debate'}
            </h3>
            <ResponseComposer
              onSubmit={handleMultimodalResponse}
              onCancel={() => setShowDebateComposer(false)}
              placeholder="Share your thoughts with text, audio, video, or media..."
              allowText={true}
              allowAudio={true}
              allowVideo={true}
              allowImages={true}
              allowDocuments={true}
              maxFileSize={50 * 1024 * 1024} // 50MB
              maxAudioDuration={300} // 5 minutes
              maxVideoDuration={600} // 10 minutes
              disabled={false}
              loading={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Mock data for development
function getMockContentDetail(id: string): ContentDetail {
  return {
    _id: id,
    title: "L'avenir de la technologie en Afrique: Opportunities et Défis",
    description: "Une analyse complète de la révolution technologique en Afrique, explorant les innovations locales, les défis infrastructurels et les opportunités pour les jeunes entrepreneurs africains.",
    mediaType: 'video',
    mediaUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://picsum.photos/1280/720?random=10',
    duration: 480,
    creatorId: 'creator1',
    creatorName: 'Tech Africa',
    creatorAvatar: 'https://picsum.photos/100/100?random=101',
    creatorBio: 'Exploring digital transformation across the continent',
    isVerified: true,
    views: 15420,
    likes: 892,
    shares: 234,
    comments: 156,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['technology', 'africa', 'innovation', 'entrepreneurship'],
    category: 'technology',
    hasDebate: true,
    debateId: 'debate1',
    debateStatus: 'active',
    debateParticipants: 45,
    userReaction: 'like',
    isSaved: false
  };
}

function getMockDebate(id: string): Debate {
  return {
    _id: id,
    question: "La technologie peut-elle vraiment résoudre les problèmes de développement en Afrique ?",
    description: "Partagez votre perspective sur le rôle de la technologie dans le développement africain.",
    status: 'active',
    participants: 45,
    responses: [
      {
        _id: 'resp1',
        userId: 'user1',
        userName: 'Marie K.',
        content: "Je pense que la technologie est un outil puissant mais pas une solution miracle. Il faut d abord investir dans l éducation de base.",
        likes: 23,
        replies: [],
        createdAt: new Date().toISOString(),
        userReaction: 'like'
      },
      {
        _id: 'resp2',
        userId: 'user2',
        userName: 'Jean-Pierre M.',
        content: "Le mobile banking a déjà transformé des millions de vies. C est la preuve que la technologie fonctionne quand elle est adaptée aux besoins locaux.",
        likes: 18,
        replies: [],
        createdAt: new Date().toISOString(),
        userReaction: undefined
      },
      {
        _id: 'resp3',
        userId: 'user3',
        userName: 'Amina B.',
        content: "Nous devons développer nos propres solutions technologiques au lieu de simplement importer. L innovation locale est clé.",
        likes: 31,
        replies: [],
        createdAt: new Date().toISOString(),
        userReaction: 'like'
      }
    ],
    createdAt: new Date().toISOString()
  };
}
