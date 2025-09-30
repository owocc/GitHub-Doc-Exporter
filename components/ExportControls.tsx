import React from 'react';

// --- ICONS ---

const ArchiveBoxIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
  </svg>
);

const ArchiveBoxSolidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
    <path fillRule="evenodd" d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.163 3.75A.75.75 0 0 1 10 12h4a.75.75 0 0 1 0 1.5h-4a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
  </svg>
);

const DocumentDuplicateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="m23 19l-3-3v2h-4v2h4v2zm-9.2 3H6c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h8l6 6v5.1c-.3-.1-.7-.1-1-.1s-.7 0-1 .1V9h-5V4H6v16h7.1c.1.7.4 1.4.7 2M8 12h8v1.8c-.1.1-.2.1-.3.2H8zm0 4h5v2H8z" /></svg>);

const DocumentDuplicateSolidIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className={className}>
    <path fill="currentColor" d="M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m9 16v-2H6v2zm3-4v-2H6v2z" />
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
            <div className="flex-grow py-1">
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
            <span className="text-sm py-1 font-medium text-on-surface">
              Merge into a single .md file
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
