import React, { useState, useEffect } from 'react';
import { DocContent } from '../types';

declare var marked: any;
declare var DOMPurify: any;

interface DocumentViewerModalProps {
  doc: DocContent | null;
  onClose: () => void;
}

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
    </svg>
);

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (doc) {
      setIsLoading(true);
      setHtmlContent(''); // Clear previous content
      if (typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
        try {
          // Use a small timeout to allow the UI to update to the loading state
          setTimeout(() => {
            const dirty = marked.parse(doc.content);
            const clean = DOMPurify.sanitize(dirty);
            setHtmlContent(clean);
            setIsLoading(false);
          }, 50);
        } catch (e) {
          console.error("Error parsing markdown:", e);
          setHtmlContent("<p>Error rendering document content.</p>");
          setIsLoading(false);
        }
      }
    }
  }, [doc]);

  if (!doc) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300" 
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-surface text-on-surface rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale border border-outline/50"
        onClick={e => e.stopPropagation()}
        style={{ animationFillMode: 'forwards' }}
      >
        <header className="flex items-center justify-between p-4 border-b border-outline/50 flex-shrink-0">
          <h3 className="text-lg font-bold truncate" id="modal-title">{doc.name}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Close document view">
             <CloseIcon className="w-8 h-8"/>
          </button>
        </header>
        <div className="p-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="text-center text-on-surface-variant">Loading content...</div>
          ) : (
            <article 
              className="prose dark:prose-invert max-w-none prose-p:text-on-surface prose-headings:text-on-surface prose-strong:text-on-surface prose-a:text-primary prose-code:text-on-primary-container prose-code:bg-primary-container/50 prose-pre:bg-surface-variant prose-pre:text-on-surface-variant prose-blockquote:border-outline prose-blockquote:text-on-surface-variant"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation-name: fade-in-scale;
          animation-duration: 0.2s;
          animation-timing-function: ease-out;
        }
        /* Custom typography styles not covered by prose config */
        .prose code {
            border-radius: 6px;
            padding: 0.2em 0.4em;
        }
        .prose pre {
            border-radius: 12px;
        }
      `}</style>
    </div>
  );
};

export default DocumentViewerModal;