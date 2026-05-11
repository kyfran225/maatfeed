import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { audioTranscriptService, AudioTranscript, TranscriptSegment } from '../services/audioTranscriptService';
import { Track } from '../stores/audioStore';

export function useAudioTranscript(track: Track | null) {
  const queryClient = useQueryClient();

  const {
    data: transcript,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['audio-transcript', track?.id],
    queryFn: () => track ? audioTranscriptService.getTranscript(track.id) : null,
    enabled: !!track,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const generateTranscriptMutation = useMutation({
    mutationFn: (track: Track) => audioTranscriptService.mockGenerateTranscript(track),
    onSuccess: (newTranscript) => {
      if (track) {
        queryClient.setQueryData(['audio-transcript', track.id], newTranscript);
      }
    }
  });

  const updateTranscriptMutation = useMutation({
    mutationFn: ({ transcriptId, segments }: { transcriptId: string; segments: TranscriptSegment[] }) =>
      audioTranscriptService.updateTranscript({
        id: transcriptId,
        segments,
        fullText: segments.map(s => s.text).join(' '),
        isEdited: true
      }),
    onSuccess: (updatedTranscript) => {
      queryClient.setQueryData(['audio-transcript', track?.id], updatedTranscript);
    }
  });

  const deleteTranscriptMutation = useMutation({
    mutationFn: (transcriptId: string) => audioTranscriptService.deleteTranscript(transcriptId),
    onSuccess: () => {
      queryClient.setQueryData(['audio-transcript', track?.id], null);
    }
  });

  const generateTranscript = () => {
    if (track) {
      generateTranscriptMutation.mutate(track);
    }
  };

  const updateSegment = (segmentId: string, newText: string) => {
    if (!transcript) return;

    const updatedSegments = transcript.segments.map(segment =>
      segment.id === segmentId ? { ...segment, text: newText } : segment
    );

    updateTranscriptMutation.mutate({
      transcriptId: transcript.id,
      segments: updatedSegments
    });
  };

  const deleteTranscript = () => {
    if (transcript) {
      deleteTranscriptMutation.mutate(transcript.id);
    }
  };

  const searchInTranscript = (query: string): TranscriptSegment[] => {
    if (!transcript || !query.trim()) {
      return transcript?.segments || [];
    }

    return audioTranscriptService.searchTranscript(transcript, query);
  };

  const getSegmentAtTime = (currentTime: number): TranscriptSegment | null => {
    if (!transcript) return null;

    return audioTranscriptService.getSegmentAtTime(transcript, currentTime);
  };

  const exportTranscript = (format: 'srt' | 'text') => {
    if (!transcript) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'srt') {
      content = audioTranscriptService.exportToSRT(transcript);
      filename = `${track?.title || 'transcript'}.srt`;
      mimeType = 'text/plain';
    } else {
      content = audioTranscriptService.exportToText(transcript);
      filename = `${track?.title || 'transcript'}.txt`;
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

  return {
    transcript,
    isLoading,
    error,
    refetch,
    generateTranscript,
    updateSegment,
    deleteTranscript,
    searchInTranscript,
    getSegmentAtTime,
    exportTranscript,
    isGenerating: generateTranscriptMutation.isPending,
    isUpdating: updateTranscriptMutation.isPending,
    isDeleting: deleteTranscriptMutation.isPending
  };
}
