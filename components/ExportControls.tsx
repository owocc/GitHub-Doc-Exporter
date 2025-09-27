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
      .map(doc => `${doc.content}\n\n---\n\nSource: ${doc.url}`)
      .join('\n\n---\n\n');
  };

  const handleDownload = async () => {
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
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mt-8">
      <h3 className="text-xl font-bold mb-4 text-white">Export Options</h3>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="exportAll"
            name="exportType"
            value="all"
            checked={exportType === 'all'}
            onChange={() => setExportType('all')}
            className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
          />
          <label htmlFor="exportAll" className="ml-3 block text-sm font-medium text-gray-300">
            Merge all documents into a single .md file
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="exportRange"
            name="exportType"
            value="range"
            checked={exportType === 'range'}
            onChange={() => setExportType('range')}
            className="h-4 w-4 text-cyan-600 bg-gray-700 border-gray-600 focus:ring-cyan-500"
          />
          <label htmlFor="exportRange" className="ml-3 block text-sm font-medium text-gray-300">
            Group into files of
          </label>
          <input
            type="number"
            value={rangeSize}
            onChange={(e) => setRangeSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
            disabled={exportType !== 'range'}
            className="ml-2 w-20 bg-gray-900 border border-gray-600 rounded-md shadow-sm py-1 px-2 text-white focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm disabled:opacity-50"
          />
          <span className="ml-2 text-sm text-gray-400">docs per .md file (in a .zip)</span>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-cyan-800 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : 'Download'}
        </button>
      </div>
    </div>
  );
};

export default ExportControls;
