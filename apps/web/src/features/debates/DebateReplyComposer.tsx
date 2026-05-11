import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  X, 
  AtSign, 
  Smile, 
  Paperclip,
  Mic,
  Camera,
  Image,
  Bold,
  Italic,
  Link
} from 'lucide-react';

interface DebateReplyComposerProps {
  onSubmit: (body: string, mentions: string[]) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  maxLength?: number;
  showCancel?: boolean;
}

export function DebateReplyComposer({
  onSubmit,
  onCancel,
  placeholder = "Écrivez votre réponse...",
  autoFocus = false,
  maxLength = 2000,
  showCancel = true
}: DebateReplyComposerProps) {
  const [body, setBody] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    setCharCount(body.length);
  }, [body]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!body.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(body.trim(), mentions);
      setBody('');
      setMentions([]);
      setCharCount(0);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      setBody(text);
      extractMentions(text);
    }
  };

  const extractMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const foundMentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      foundMentions.push(match[1]);
    }
    
    setMentions(foundMentions);
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);
    const newText = body.substring(0, start) + before + selectedText + after + body.substring(end);
    
    setBody(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleFileUpload = () => {
    // File upload implementation would go here
    console.log('File upload requested');
  };

  const getCharCountColor = () => {
    const percentage = (charCount / maxLength) * 100;
    if (percentage >= 95) return 'text-red-400';
    if (percentage >= 80) return 'text-orange-400';
    return 'text-gray-400';
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback className="bg-orange-600">
              <span className="text-sm font-medium">U</span>
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="text-sm font-medium">Votre réponse</div>
            {mentions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {mentions.map((mention, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-blue-600/20 text-blue-400">
                    <AtSign className="w-3 h-3 mr-1" />
                    {mention}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {showCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Text input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[100px] resize-none bg-gray-800 border-gray-700 focus:border-orange-500 focus:ring-orange-500/20"
            maxLength={maxLength}
          />
          
          {/* Character count */}
          <div className={`absolute bottom-2 right-2 text-xs ${getCharCountColor()}`}>
            {charCount}/{maxLength}
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFormatting(!showFormatting)}
              className="h-8 px-2"
            >
              <Bold className="w-4 h-4" />
            </Button>
            
            {showFormatting && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('**', '**')}
                  className="h-8 px-2"
                  title="Gras"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('*', '*')}
                  className="h-8 px-2"
                  title="Italique"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertFormatting('[', '](url)')}
                  className="h-8 px-2"
                  title="Lien"
                >
                  <Link className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Media buttons */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="h-8 px-2"
              title="Joindre un fichier"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="h-8 px-2"
              title="Ajouter une image"
            >
              <Image className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="h-8 px-2"
              title="Enregistrer un audio"
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleFileUpload}
              className="h-8 px-2"
              title="Prendre une photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              title="Émojis"
            >
              <Smile className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-400">
            <span>Ctrl+Entrée pour envoyer</span>
          </div>
          
          <div className="flex items-center gap-2">
            {showCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!body.trim() || isSubmitting || charCount > maxLength}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
