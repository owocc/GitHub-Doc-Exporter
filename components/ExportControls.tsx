import React from 'react';

// --- ICONS ---

const ArchiveBoxIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
);

const ArchiveBoxSolidIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
      <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
);

const DocumentDuplicateIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);

const DocumentDuplicateSolidIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7.5 3.375c0-1.036.84-1.875 1.875-1.875h.375a3 3 0 0 1 3 3v1.875h-4.5V3.375Z" />
      <path fillRule="evenodd" d="M8.25 3h9a3 3 0 0 1 3 3v12a3 3 0 0 1-3-3h-9a3 3 0 0 1-3-3v-12a3 3 0 0 1 3-3ZM9.75 17.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      <path d="M16.5 6.375a3 3 0 0 1 3 3v1.875h-4.5V6.375Z" />
    </svg>
);


interface ExportControlsProps {
  exportType: 'all' | 'zip';
  setExportType: (type: 'all' | 'zip') => void;
  fetchSubdirectories: boolean;
  setFetchSubdirectories: (value: boolean) => void;
  maxDepth: number;
  setMaxDepth: (value: number) => void;
  mergeInZip: boolean;
  setMergeInZip: (value: boolean) => void;
  filesPerMergedFile: number;
  setFilesPerMergedFile: (value: number) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  exportType,
  setExportType,
  fetchSubdirectories,
  setFetchSubdirectories,
  maxDepth,
  setMaxDepth,
  mergeInZip,
  setMergeInZip,
  filesPerMergedFile,
  setFilesPerMergedFile,
}) => {
  return (
    <div>
      <div>
        <h3 className="text-md font-bold mb-3 text-on-surface">Fetch Options</h3>
        <label className="flex items-center cursor-pointer justify-between">
          <span className="text-sm font-medium text-on-surface">
            Fetch from subdirectories
          </span>
          <div className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={fetchSubdirectories} onChange={e => setFetchSubdirectories(e.target.checked)} className="sr-only peer" />
            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </div>
        </label>
        <div className="pl-4 mt-2 flex items-center gap-2">
          <label htmlFor="max-depth-input" className="text-sm text-on-surface-variant">Max depth:</label>
          <input
            id="max-depth-input"
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(Math.max(1, parseInt(e.target.value, 10) || 1))}
            disabled={!fetchSubdirectories}
            className="w-20 bg-surface-variant border border-outline text-on-surface-variant rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm disabled:opacity-50"
          />
        </div>
      </div>

      <hr className="border-outline/30 my-4" />

      <div>
        <h3 className="text-md font-bold mb-3 text-on-surface">Export Options</h3>
        <div className="space-y-3">
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="exportType"
              value="zip"
              checked={exportType === 'zip'}
              onChange={() => setExportType('zip')}
              className="peer sr-only"
            />
            <div className="mr-3 text-primary flex-shrink-0 mt-0.5">
              {exportType === 'zip' 
                ? <ArchiveBoxSolidIcon className="w-6 h-6" /> 
                : <ArchiveBoxIcon className="w-6 h-6 text-on-surface-variant" />}
            </div>
            <div className="flex-grow">
              <span className="text-sm font-medium text-on-surface">
                Zip archive (preserves folders)
              </span>
              {exportType === 'zip' && (
                  <div className="pl-1 mt-3 space-y-3">
                     <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={mergeInZip} onChange={e => setMergeInZip(e.target.checked)} className="h-4 w-4 rounded border-outline text-primary focus:ring-primary accent-primary bg-surface-variant mr-2" />
                        <span className="text-sm text-on-surface-variant">Merge files within zip</span>
                      </label>
                      <div className="flex items-center gap-2">
                          <label htmlFor="files-per-merge-input" className="text-sm text-on-surface-variant">Files per merge:</label>
                          <input
                            id="files-per-merge-input"
                            type="number"
                            min="1"
                            value={filesPerMergedFile}
                            onChange={(e) => setFilesPerMergedFile(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            disabled={!mergeInZip}
                            className="w-20 bg-surface-variant border border-outline text-on-surface-variant rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm disabled:opacity-50"
                          />
                      </div>
                  </div>
              )}
            </div>
          </label>
          <label className="flex items-start cursor-pointer">
            <input
              type="radio"
              name="exportType"
              value="all"
              checked={exportType === 'all'}
              onChange={() => setExportType('all')}
              className="peer sr-only"
            />
            <div className="mr-3 text-primary flex-shrink-0 mt-0.5">
              {exportType === 'all' 
                ? <DocumentDuplicateSolidIcon className="w-6 h-6" /> 
                : <DocumentDuplicateIcon className="w-6 h-6 text-on-surface-variant" />}
            </div>
            <span className="text-sm font-medium text-on-surface">
              Merge into a single .md file
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
