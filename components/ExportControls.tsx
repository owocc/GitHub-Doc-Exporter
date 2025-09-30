import React from 'react';

interface ExportControlsProps {
  exportType: 'all' | 'zip';
  setExportType: (type: 'all' | 'zip') => void;
  fetchSubdirectories: boolean;
  setFetchSubdirectories: (value: boolean) => void;
  maxDepth: number;
  setMaxDepth: (value: number) => void;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  exportType,
  setExportType,
  fetchSubdirectories,
  setFetchSubdirectories,
  maxDepth,
  setMaxDepth,
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
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="exportType"
              value="zip"
              checked={exportType === 'zip'}
              onChange={() => setExportType('zip')}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-outline rounded-full mr-3 flex items-center justify-center peer-checked:border-primary">
              <div className="w-2.5 h-2.5 rounded-full bg-primary scale-0 peer-checked:scale-100 transition-transform"></div>
            </div>
            <span className="text-sm font-medium text-on-surface">
              Zip archive (preserves folders)
            </span>
          </label>
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
              Merge into a single .md file
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;