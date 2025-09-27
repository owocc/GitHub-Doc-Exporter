import React, { useState, useEffect } from 'react';
import { DocContent } from '../types';

declare var marked: any;
declare var DOMPurify: any;

interface AccordionItemProps {
  doc: DocContent;
  isOpen: boolean;
  onToggle: () => void;
}

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);


const AccordionItem: React.FC<AccordionItemProps> = ({ doc, isOpen, onToggle }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    if (isOpen && !htmlContent && typeof marked !== 'undefined' && typeof DOMPurify !== 'undefined') {
      try {
        const dirty = marked.parse(doc.content);
        const clean = DOMPurify.sanitize(dirty);
        setHtmlContent(clean);
      } catch (e) {
        console.error("Error parsing markdown:", e);
        setHtmlContent("<p>Error rendering document content.</p>");
      }
    }
  }, [isOpen, htmlContent, doc.content]);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800/50">
      <h2>
        <button
          type="button"
          className="flex items-center justify-between w-full p-4 font-medium text-left text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <span>{doc.name}</span>
          <ChevronDownIcon className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 border-t border-gray-700">
           {isOpen && (htmlContent ? 
             <article className="prose prose-invert max-w-none prose-pre:bg-gray-900 prose-code:text-cyan-400" dangerouslySetInnerHTML={{ __html: htmlContent }} />
             : <div className="text-center p-4">Loading content...</div>)
           }
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
