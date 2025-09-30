import React, { useState } from 'react';
import { DocContent } from '../types';

declare var JSZip: any;

interface ExportControlsProps {
  documents: DocContent[];
}

const ExportControls: React.FC<ExportControlsProps> = ({ documents }) => {
  const [exportType, setExportType] = useState<'all' | 'range'>('all');
  const [rangeSize, setRangeSize] = useState<number>(50);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const downloadFile = (filename: string, content: string | Blob, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createMergedContent = (docs: DocContent[]): string => {
    return docs
      .map(doc => `[Source: ${doc.url}]\n\n${doc.content}`)
      .join('\n\n---\n\n');
  };

  const handleDownload = async () => {
    if (documents.length === 0) return;
    setIsExporting(true);
    try {
        if (exportType === 'all') {
            const mergedContent = createMergedContent(documents);
            downloadFile('docs-all.md', mergedContent, 'text/markdown;charset=utf-8');
        } else {
            if (typeof JSZip === 'undefined') {
                alert('JSZip library is not loaded. Cannot create zip file.');
                return;
            }
            const zip = new JSZip();
            const numChunks = Math.ceil(documents.length / rangeSize);

            for (let i = 0; i < numChunks; i++) {
                const start = i * rangeSize;
                const end = start + rangeSize;
                const chunk = documents.slice(start, end);
                const mergedContent = createMergedContent(chunk);
                const filename = `docs_${start + 1}-${Math.min(end, documents.length)}.md`;
                zip.file(filename, mergedContent);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadFile('docs.zip', zipBlob, 'application/zip');
        }
    } catch(error) {
        console.error("Export failed:", error);
        alert("An error occurred during export. Please check the console for details.");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4 text-on-surface">Export Options</h3>
      <div className="space-y-4">
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="exportType"
              value="all"
              checked={exportType === 'all'}
              onChange={() => setExportType('all')}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-outline rounded-full mr-3 flex items-center justify-center peer-checked:border-primary">
              <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span className="text-sm font-medium text-on-surface">
              Merge all documents into a single .md file
            </span>
          </label>
        </div>
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="exportType"
              value="range"
              checked={exportType === 'range'}
              onChange={() => setExportType('range')}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-outline rounded-full mr-3 flex items-center justify-center peer-checked:border-primary">
                <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span className="text-sm font-medium text-on-surface">
              Group into files of
            </span>
          </label>
           <div className="pl-8 mt-2 flex items-center gap-2">
             <input
                type="number"
                value={rangeSize}
                onChange={(e) => setRangeSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                disabled={exportType !== 'range'}
                className="w-24 bg-surface-variant border border-outline text-on-surface-variant rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm disabled:opacity-50"
             />
             <span className="text-sm text-on-surface-variant">docs per .md file (creates a .zip)</span>
           </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleDownload}
          disabled={isExporting || documents.length === 0}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExporting ? 'Exporting...' : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default ExportControls;