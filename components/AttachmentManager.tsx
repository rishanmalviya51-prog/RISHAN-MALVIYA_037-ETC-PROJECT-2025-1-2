import React, { useRef } from 'react';
import { Attachment } from '../types';
import { FileText, Image as ImageIcon, Film, Trash2, Download, Eye } from 'lucide-react';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}

const AttachmentManager: React.FC<AttachmentManagerProps> = ({ attachments, onUpload, onDelete }) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="mt-6 space-y-4">
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
                <a 
                  href={att.objectUrl} 
                  download={att.fileName}
                  className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-accent transition-colors"
                >
                  <Download size={12} /> Save
                </a>
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
    </div>
  );
};

export default AttachmentManager;
