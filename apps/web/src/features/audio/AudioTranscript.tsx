import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Edit3, 
  Search, 
  Clock, 
  Volume2,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { audioTranscriptService, AudioTranscript, TranscriptSegment } from '../../services/audioTranscriptService';
import { Track } from '../../stores/audioStore';

interface AudioTranscriptProps {
  track: Track;
  currentTime: number;
  onSeekToTime: (time: number) => void;
  className?: string;
}

export function AudioTranscript({ 
  track, 
  currentTime, 
  onSeekToTime, 
  className = '' 
}: AudioTranscriptProps) {
  const [transcript, setTranscript] = useState<AudioTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSegments, setFilteredSegments] = useState<TranscriptSegment[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [exportFormat, setExportFormat] = useState<'srt' | 'text'>('text');

  // Load transcript on mount
  useEffect(() => {
    loadTranscript();
  }, [track.id]);

  // Filter segments based on search
  useEffect(() => {
    if (!transcript) return;
    
    if (!searchQuery.trim()) {
      setFilteredSegments(transcript.segments);
    } else {
      const filtered = audioTranscriptService.searchTranscript(transcript, searchQuery);
      setFilteredSegments(filtered);
    }
  }, [transcript, searchQuery]);

  const loadTranscript = async () => {
    try {
      setIsLoading(true);
      const existingTranscript = await audioTranscriptService.getTranscript(track.id);
      
      if (existingTranscript) {
        setTranscript(existingTranscript);
      }
    } catch (error) {
      console.error('Error loading transcript:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTranscript = async () => {
    try {
      setIsGenerating(true);
      
      // Use mock generation for now
      const newTranscript = await audioTranscriptService.mockGenerateTranscript(track);
      setTranscript(newTranscript);
    } catch (error) {
      console.error('Error generating transcript:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSegmentClick = (segment: TranscriptSegment) => {
    onSeekToTime(segment.startTime);
  };

  const startEditingSegment = (segment: TranscriptSegment) => {
    setEditingSegmentId(segment.id);
    setEditedText(segment.text);
  };

  const saveSegmentEdit = async () => {
    if (!transcript || !editingSegmentId) return;

    try {
      const updatedSegments = transcript.segments.map(segment =>
        segment.id === editingSegmentId
          ? { ...segment, text: editedText }
          : segment
      );

      const updatedTranscript = await audioTranscriptService.updateTranscript({
        id: transcript.id,
        segments: updatedSegments,
        fullText: updatedSegments.map(s => s.text).join(' '),
        isEdited: true
      });

      setTranscript(updatedTranscript);
      setEditingSegmentId(null);
      setEditedText('');
    } catch (error) {
      console.error('Error saving segment:', error);
    }
  };

  const cancelEditing = () => {
    setEditingSegmentId(null);
    setEditedText('');
  };

  const exportTranscript = () => {
    if (!transcript) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (exportFormat === 'srt') {
      content = audioTranscriptService.exportToSRT(transcript);
      filename = `${track.title}_transcript.srt`;
      mimeType = 'text/plain';
    } else {
      content = audioTranscriptService.exportToText(transcript);
      filename = `${track.title}_transcript.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isCurrentSegment = (segment: TranscriptSegment) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

  const highlightSearchText = (text: string) => {
    if (!searchQuery.trim()) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.replace(regex, '<mark class="bg-orange-500/30 text-orange-300 px-1 rounded">$1</mark>');
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-white/10 p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-3" />
          <span className="text-gray-400">Chargement de la transcription...</span>
        </div>
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-white/10 p-6 ${className}`}>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Aucune transcription disponible
          </h3>
          <p className="text-gray-400 mb-6">
            Générez une transcription automatique pour ce contenu audio
          </p>
          <button
            onClick={generateTranscript}
            disabled={isGenerating}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Génération...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Générer la transcription
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-white/10 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-white">
              Transcription
            </h3>
            {transcript.isAutoGenerated && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                Auto-générée
              </span>
            )}
            {transcript.isEdited && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                Modifiée
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 w-48"
              />
            </div>
            
            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowFullTranscript(!showFullTranscript)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800 border border-white/20 rounded-lg text-white hover:border-orange-500 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Exporter</span>
                {showFullTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <AnimatePresence>
                {showFullTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 bg-gray-800 border border-white/20 rounded-lg p-2 min-w-40 z-10"
                  >
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setExportFormat('text');
                          exportTranscript();
                          setShowFullTranscript(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm"
                      >
                        Exporter en .txt
                      </button>
                      <button
                        onClick={() => {
                          setExportFormat('srt');
                          exportTranscript();
                          setShowFullTranscript(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 rounded transition-colors text-sm"
                      >
                        Exporter en .srt
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Content */}
      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredSegments.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">
                Aucun résultat pour "{searchQuery}"
              </p>
            </div>
          ) : (
            filteredSegments.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                  isCurrentSegment(segment)
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-gray-800/50 border-white/10 hover:border-orange-500/30'
                }`}
                onClick={() => handleSegmentClick(segment)}
              >
                {/* Timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {audioTranscriptService.formatTime(segment.startTime)}
                    </span>
                    {segment.confidence && (
                      <div className="flex items-center space-x-1">
                        <Volume2 className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {Math.round(segment.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditingSegment(segment);
                      }}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Text Content */}
                <AnimatePresence mode="wait">
                  {editingSegmentId === segment.id ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-orange-500 rounded text-white focus:outline-none resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-gray-400 hover:text-white transition-colors flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span className="text-sm">Annuler</span>
                        </button>
                        <button
                          onClick={saveSegmentEdit}
                          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span className="text-sm">Sauver</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchText(segment.text)
                      }}
                      className="text-white text-sm leading-relaxed"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredSegments.length} segment{filteredSegments.length > 1 ? 's' : ''} 
            {searchQuery && ` trouvé${filteredSegments.length > 1 ? 's' : ''}`}
          </span>
          <span>
            Langue: {transcript.language.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
