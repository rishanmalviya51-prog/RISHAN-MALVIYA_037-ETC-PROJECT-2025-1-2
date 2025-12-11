
import React, { useRef, useState } from 'react';
import { Attachment } from '../types';
import { FileText, Image as ImageIcon, Film, Trash2, Download, Eye, Sparkles, X, BrainCircuit, Loader2 } from 'lucide-react';
import { analyzeStudyMaterial } from '../lib/gemini';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onSaveAnalysis?: (attachmentId: string, result: string) => void;
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ attachments, onUpload, onDelete, onSaveAnalysis }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [viewAnalysis, setViewAnalysis] = useState<{ id: string, text: string, title: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      e.target.value = ''; // reset
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={18} className="text-secondary" />;
    if (mime.startsWith('video/')) return <Film size={18} className="text-accent" />;
    return <FileText size={18} className="text-primary" />;
  };

  const handleAnalyze = async (att: Attachment) => {
    if (!onSaveAnalysis) return;
    
    // If we already have analysis, show it
    if (att.analysis) {
      setViewAnalysis({ id: att.id, text: att.analysis, title: att.fileName });
      return;
    }

    // Only allow images or PDFs (approx check)
    if (!att.mimeType.startsWith('image/') && att.mimeType !== 'application/pdf') {
        alert("AI Analysis is currently supported for Images and PDFs.");
        return;
    }

    try {
      setAnalyzingId(att.id);
      
      // We need to fetch the blob again since we only stored the ObjectURL
      const response = await fetch(att.objectUrl);
      const blob = await response.blob();
      const file = new File([blob], att.fileName, { type: att.mimeType });

      const result = await analyzeStudyMaterial(file);
      onSaveAnalysis(att.id, result);
      setViewAnalysis({ id: att.id, text: result, title: att.fileName });
    } catch (error) {
      console.error(error);
      alert("Failed to analyze file.");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="mt-6 space-y-4 relative">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Resources & Notes</h4>
        <button 
          onClick={() => inputRef.current?.click()}
          className="text-xs px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary-200 border border-primary/20 rounded-md transition-colors flex items-center gap-2"
        >
          <span>+ Upload File</span>
        </button>
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {attachments.length === 0 && (
        <div className="text-xs text-slate-500 italic text-center py-2 border border-dashed border-slate-700 rounded-lg">
          No files attached. Upload diagrams, notes, or videos.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {attachments.map(att => (
          <div key={att.id} className="group relative bg-surfaceLight border border-slate-700/50 rounded-lg p-3 flex items-start gap-3 hover:border-slate-600 transition-colors">
            <div className="mt-1 p-2 bg-background rounded-md">
              {getIcon(att.mimeType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate" title={att.fileName}>{att.fileName}</p>
              <p className="text-xs text-slate-500">{formatSize(att.fileSize)} • Session File</p>
              
              <div className="flex gap-2 mt-2">
                <a 
                  href={att.objectUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-secondary transition-colors"
                >
                  <Eye size={12} /> View
                </a>
                
                {onSaveAnalysis && (att.mimeType.startsWith('image/') || att.mimeType === 'application/pdf') && (
                  <button 
                    onClick={() => handleAnalyze(att)}
                    disabled={analyzingId === att.id}
                    className={`text-[10px] flex items-center gap-1 transition-colors ${att.analysis ? 'text-accent hover:text-white' : 'text-slate-400 hover:text-accent'}`}
                  >
                    {analyzingId === att.id ? (
                        <Loader2 size={12} className="animate-spin" />
                    ) : (
                        <Sparkles size={12} />
                    )}
                    {att.analysis ? 'View Analysis' : 'Analyze'}
                  </button>
                )}
              </div>
            </div>
            <button 
              onClick={() => onDelete(att.id)}
              className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Analysis Modal */}
      {viewAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-2xl">
                    <div className="flex items-center gap-2 text-accent">
                        <BrainCircuit size={20} />
                        <h3 className="font-display font-bold text-white">AI Note Analysis</h3>
                    </div>
                    <button 
                        onClick={() => setViewAnalysis(null)} 
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <h4 className="text-sm font-mono text-slate-500 uppercase mb-4">Source: {viewAnalysis.title}</h4>
                    <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {viewAnalysis.text}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900/30 rounded-b-2xl flex justify-end">
                    <button 
                        onClick={() => setViewAnalysis(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
