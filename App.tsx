import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { DocContent, GitHubUser, HistoryEntry } from './types';
import { fetchRepoDocs, getUser } from './services/githubService';
import { initDB, addHistory, getAllHistory, deleteHistory } from './services/dbService';
import DocumentViewerModal from './components/AccordionItem';
import ExportControls from './components/ExportControls';

declare var JSZip: any;

// --- NEW TYPES ---
interface StoredToken {
  token: string;
  user: GitHubUser;
}

type ThemePreference = 'light' | 'dark' | 'system';

// --- NEW ICONS ---
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .23 1.482l.149-.046A12.705 12.705 0 0 1 4.25 6.75v8.5A2.75 2.75 0 0 0 7 18h6a2.75 2.75 0 0 0 2.75-2.75v-8.5a12.705 12.705 0 0 1 .237-1.654l.15-.046a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
  </svg>
);


const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.21 1.87.86 2.33.66.07-.51.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8a8 8 0 0 0-8-8Z"></path>
  </svg>
);

const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" className={className}><path fill="currentColor" d="M4 4c0-1.11.89-2 2-2h8l6 6v12c0 .53-.21 1.04-.59 1.41c-.37.38-.88.59-1.41.59H6c-.53 0-1.04-.21-1.41-.59C4.21 21.04 4 20.53 4 20zm9-.5V9h5.5zM12 11l-1.26 2.75L8 15l2.74 1.26L12 19l1.25-2.74L16 15l-2.75-1.25z" /></svg>
);


const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v2a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
  </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="m3.55 19.09l1.41 1.41l1.8-1.79l-1.42-1.42M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6c0-3.32-2.69-6-6-6m8 7h3v-2h-3m-2.76 7.71l1.8 1.79l1.41-1.41l-1.79-1.8M20.45 5l-1.41-1.4l-1.8 1.79l1.42 1.42M13 1h-2v3h2M6.76 5.39L4.96 3.6L3.55 5l1.79 1.81zM1 13h3v-2H1m12 9h-2v3h2" /></svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 12 22.5a10.5 10.5 0 0 1-10.5-10.5c0-4.307 2.56-8.02 6.31-9.782a.75.75 0 0 1 .819.162Z" clipRule="evenodd" />
  </svg>
);

const DesktopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21 16H3V4h18m0-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z"/>
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
  </svg>
);

const FolderOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M15 8c-2.21 0-4 1.79-4 4v8H4a2 2 0 0 1-2-2V6c0-1.11.89-2 2-2h6l2 2h8a2 2 0 0 1 2 2v2.17l-1.59-1.58l-.58-.59zm8 6v7c0 1.11-.89 2-2 2h-6a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h4zm-2 .83L18.17 12H18v3h3z" /></svg>
);


const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs');
  const [documents, setDocuments] = useState<DocContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null);

  const [savedTokens, setSavedTokens] = useState<StoredToken[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const [isTokenManagerOpen, setIsTokenManagerOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState<boolean>(false);

  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

  const [themePreference, setThemePreference] = useState<ThemePreference>(
    () => (localStorage.getItem('theme') as ThemePreference) || 'system'
  );

  // State for fetch/export settings with localStorage persistence
  const [fetchSubdirectories, setFetchSubdirectories] = useState<boolean>(() => {
    const saved = localStorage.getItem('fetchSubdirectories');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [maxDepth, setMaxDepth] = useState<number>(() => {
    const saved = localStorage.getItem('maxDepth');
    return saved !== null ? JSON.parse(saved) : 2;
  });
  const [exportType, setExportType] = useState<'all' | 'zip'>(() => {
    const saved = localStorage.getItem('exportType');
    return saved === 'all' || saved === 'zip' ? saved : 'zip';
  });
  const [mergeInZip, setMergeInZip] = useState<boolean>(() => {
    const saved = localStorage.getItem('mergeInZip');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [filesPerMergedFile, setFilesPerMergedFile] = useState<number>(() => {
    const saved = localStorage.getItem('filesPerMergedFile');
    return saved !== null ? JSON.parse(saved) : 10;
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [selectedDocPaths, setSelectedDocPaths] = useState<Set<string>>(new Set());

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);

  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  const activeUser = useMemo(() => {
    if (!activeToken) return null;
    return savedTokens.find(st => st.token === activeToken)?.user || null;
  }, [activeToken, savedTokens]);

  const repoName = useMemo(() => {
    const match = repoUrl.match(/github\.com\/[^/]+\/([^/]+)/);
    return match ? match[1] : 'repository';
  }, [repoUrl]);

  const selectedDocuments = useMemo(() => {
    return documents.filter(doc => selectedDocPaths.has(doc.path));
  }, [documents, selectedDocPaths]);

  // Effect to apply theme and listen for system changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
        const preference = localStorage.getItem('theme') as ThemePreference || 'system';
        if (preference === 'dark' || (preference === 'system' && mediaQuery.matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    updateTheme(); // Apply theme on initial load and preference change
    mediaQuery.addEventListener('change', updateTheme); // Listen for system changes

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themePreference]);


  const handleThemeChange = (preference: ThemePreference) => {
    setThemePreference(preference);
    localStorage.setItem('theme', preference);
  };


  // Load tokens and history from storage on initial render
  useEffect(() => {
    // Load tokens
    try {
      const storedTokensRaw = localStorage.getItem('github_tokens');
      const activeTokenRaw = localStorage.getItem('active_github_token');
      if (storedTokensRaw) {
        setSavedTokens(JSON.parse(storedTokensRaw));
      }
      if (activeTokenRaw) {
        setActiveToken(activeTokenRaw);
      }
    } catch (e) {
      console.error("Failed to parse tokens from localStorage", e);
      localStorage.removeItem('github_tokens');
      localStorage.removeItem('active_github_token');
    }

    // Load history
    const loadHistory = async () => {
      try {
        await initDB();
        const entries = await getAllHistory();
        setHistoryEntries(entries);
      } catch (error) {
        console.error("Failed to load history from IndexedDB", error);
        setError("Could not load fetch history from your browser's database.");
      }
    };
    loadHistory();
  }, []);


  // Persist export settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fetchSubdirectories', JSON.stringify(fetchSubdirectories));
      localStorage.setItem('maxDepth', JSON.stringify(maxDepth));
      localStorage.setItem('exportType', exportType);
      localStorage.setItem('mergeInZip', JSON.stringify(mergeInZip));
      localStorage.setItem('filesPerMergedFile', JSON.stringify(filesPerMergedFile));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [fetchSubdirectories, maxDepth, exportType, mergeInZip, filesPerMergedFile]);


  const handleAddToken = async () => {
    if (!tokenInput) {
      setTokenError("Token cannot be empty.");
      return;
    }
    if (savedTokens.some(st => st.token === tokenInput)) {
      setTokenError("This token has already been added.");
      return;
    }

    setTokenError(null);
    setIsVerifyingToken(true);
    try {
      const userData = await getUser(tokenInput);
      const newToken: StoredToken = { token: tokenInput, user: userData };
      const newSavedTokens = [...savedTokens, newToken];
      setSavedTokens(newSavedTokens);
      setActiveToken(tokenInput);

      localStorage.setItem('github_tokens', JSON.stringify(newSavedTokens));
      localStorage.setItem('active_github_token', tokenInput);

      setTokenInput('');
    } catch (e: any) {
      setTokenError(e.message || "An unknown error occurred.");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleSetActiveToken = (token: string) => {
    setActiveToken(token);
    localStorage.setItem('active_github_token', token);
  };

  const handleDeleteToken = (tokenToDelete: string) => {
    if (!window.confirm(`Are you sure you want to delete the token for user "${savedTokens.find(st => st.token === tokenToDelete)?.user.login}"?`)) {
      return;
    }

    const newSavedTokens = savedTokens.filter(st => st.token !== tokenToDelete);
    setSavedTokens(newSavedTokens);
    localStorage.setItem('github_tokens', JSON.stringify(newSavedTokens));

    if (activeToken === tokenToDelete) {
      setActiveToken(null);
      localStorage.removeItem('active_github_token');
    }
  };


  const handleLogout = () => {
    setActiveToken(null);
    localStorage.removeItem('active_github_token');
    setIsSettingsPanelOpen(false);
  };

  const handleFetchDocs = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDocuments([]);
    setSelectedDocPaths(new Set());

    try {
      const depthToFetch = fetchSubdirectories ? maxDepth : 1;
      const docs = await fetchRepoDocs(repoUrl, activeToken, depthToFetch);
      setDocuments(docs);

      const newEntry: HistoryEntry = {
        repoUrl,
        repoName: repoName,
        documents: docs,
        timestamp: Date.now(),
      };
      const newId = await addHistory(newEntry);
      setHistoryEntries(prev => [{ ...newEntry, id: newId }, ...prev]);

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, activeToken, fetchSubdirectories, maxDepth, repoName]);

  const handleDownload = useCallback(async () => {
    const docsToExport = selectedDocPaths.size > 0 ? selectedDocuments : documents;
    if (docsToExport.length === 0) {
      alert("No documents to export.");
      return;
    }

    setIsExporting(true);

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
        .map(doc => `## ${doc.name}\n[Source: ${doc.url}]\n\n${doc.content}`)
        .join('\n\n---\n\n');
    };

    try {
      if (exportType === 'all') {
        const mergedContent = createMergedContent(docsToExport);
        downloadFile(`${repoName}-docs.md`, mergedContent, 'text/markdown;charset=utf-8');
      } else { // 'zip'
        if (typeof JSZip === 'undefined') {
          alert('JSZip library is not loaded. Cannot create zip file.');
          setIsExporting(false);
          return;
        }
        const zip = new JSZip();
        const rootFolder = zip.folder(repoName);
        if (!rootFolder) {
          throw new Error("Could not create root folder in zip.");
        }

        if (mergeInZip && filesPerMergedFile > 0) {
          const docsByDir = docsToExport.reduce((acc, doc) => {
            const lastSlash = doc.path.lastIndexOf('/');
            const dir = lastSlash === -1 ? '' : doc.path.substring(0, lastSlash);
            if (!acc[dir]) {
              acc[dir] = [];
            }
            acc[dir].push(doc);
            return acc;
          }, {} as Record<string, DocContent[]>);

          for (const dir in docsByDir) {
            const docsInDir = docsByDir[dir];
            const chunks: DocContent[][] = [];
            for (let i = 0; i < docsInDir.length; i += filesPerMergedFile) {
              chunks.push(docsInDir.slice(i, i + filesPerMergedFile));
            }

            chunks.forEach((chunk, index) => {
              const mergedContent = chunk
                .map(doc => `## ${doc.name}\n\n${doc.content}`)
                .join('\n\n---\n\n');

              const partFileName = `part_${index + 1}.md`;
              const filePath = dir ? `${dir}/${partFileName}` : partFileName;
              rootFolder.file(filePath, mergedContent);
            });
          }
        } else {
          for (const doc of docsToExport) {
            const fileContent = `## ${doc.name}\n[Source: ${doc.url}]\n\n${doc.content}`;
            rootFolder.file(doc.path, fileContent);
          }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(`${repoName}-docs.zip`, zipBlob, 'application/zip');
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("An error occurred during export. Please check the console for details.");
    } finally {
      setIsExporting(false);
    }
  }, [selectedDocPaths, selectedDocuments, documents, exportType, repoName, mergeInZip, filesPerMergedFile]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allPaths = new Set(documents.map(d => d.path));
      setSelectedDocPaths(allPaths);
    } else {
      setSelectedDocPaths(new Set());
    }
  };

  const handleSelectDoc = (path: string, isSelected: boolean) => {
    setSelectedDocPaths(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  };

  const handleClear = () => {
    setRepoUrl('');
    setDocuments([]);
    setError(null);
    setSelectedDocPaths(new Set());
  };

  const handleLoadFromHistory = (entry: HistoryEntry) => {
    setRepoUrl(entry.repoUrl);
    setDocuments(entry.documents);
    setSelectedDocPaths(new Set());
    setError(null);
    setIsHistoryModalOpen(false);
  };

  const handleDeleteHistory = async (id: number | undefined) => {
    if (id === undefined) return;
    if (!window.confirm("Are you sure you want to delete this history entry? This cannot be undone.")) {
      return;
    }
    try {
      await deleteHistory(id);
      setHistoryEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Failed to delete history item:", error);
      setError("Could not delete the history entry.");
    }
  };

  const TokenManagerModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" aria-labelledby="token-manager-title" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-lg border border-outline/50 flex flex-col max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-outline/50 flex-shrink-0">
          <h3 className="text-xl font-bold text-on-surface" id="token-manager-title">Manage GitHub Tokens</h3>
          <button onClick={() => setIsTokenManagerOpen(false)} className="text-on-surface-variant hover:text-on-surface text-3xl leading-none">&times;</button>
        </header>

        <div className="p-6 overflow-y-auto space-y-6">
          {savedTokens.length === 0 ? (
            <div className="text-center p-4 rounded-xl bg-surface-variant">
              <p className="text-on-surface-variant text-sm mb-4">You don't have any GitHub tokens saved. Add one to increase API rate limits and access private repositories.</p>
              <a href="https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Doc%20Exporter" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-semibold">
                Click here to create a new token on GitHub.
              </a>
            </div>
          ) : (
            <div>
              <h4 className="font-bold text-on-surface mb-3">Saved Tokens</h4>
              <p className="text-sm text-on-surface-variant mb-4">Select a token to make it active for the current session.</p>
              <div className="space-y-3">
                {savedTokens.map((st) => (
                  <div key={st.token} className="flex items-center gap-3 p-3 rounded-2xl border border-outline/50 bg-surface-variant/50">
                    <input
                      type="radio"
                      name="active-token"
                      id={`token-${st.user.login}`}
                      checked={activeToken === st.token}
                      onChange={() => handleSetActiveToken(st.token)}
                      className="h-5 w-5 accent-primary focus:ring-primary focus:ring-offset-surface-variant"
                    />
                    <label htmlFor={`token-${st.user.login}`} className="flex-grow flex items-center gap-3 cursor-pointer">
                      <img src={st.user.avatar_url} alt={st.user.login} className="h-10 w-10 rounded-full" />
                      <div className="flex-grow">
                        <p className="font-semibold text-on-surface">{st.user.login}</p>
                        <p className="text-xs text-on-surface-variant font-mono">ghp_...{st.token.slice(-4)}</p>
                      </div>
                    </label>
                    <button onClick={() => handleDeleteToken(st.token)} className="p-2 rounded-full text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors" aria-label={`Delete token for ${st.user.login}`}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold text-on-surface mb-3 pt-4 border-t border-outline/30">Add New Token</h4>
            <div className="flex items-start gap-2">
              <div className="flex-grow">
                <label htmlFor="token-input" className="sr-only">New GitHub Token</label>
                <input
                  id="token-input"
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste new token (ghp_...)"
                  className="w-full bg-surface-variant border border-outline text-on-surface-variant placeholder:text-on-surface-variant rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                />
                {tokenError && <p className="text-error text-sm mt-2 ml-2">{tokenError}</p>}
              </div>
              <button
                onClick={handleAddToken}
                disabled={isVerifyingToken}
                className="inline-flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-semibold rounded-full shadow-sm text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifyingToken ? <LoadingSpinner className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="p-4 bg-surface-variant/50 border-t border-outline/50 flex justify-end flex-shrink-0">
          <button
            onClick={() => setIsTokenManagerOpen(false)}
            className="px-6 py-2 text-sm font-semibold rounded-full text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );

  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" aria-labelledby="history-modal-title" role="dialog" aria-modal="true">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-2xl border border-outline/50 flex flex-col max-h-[90vh]">
        <header className="flex justify-between items-center p-4 border-b border-outline/50 flex-shrink-0">
          <h3 className="text-xl font-bold text-on-surface" id="history-modal-title">Fetch History</h3>
          <button onClick={() => setIsHistoryModalOpen(false)} className="text-on-surface-variant hover:text-on-surface text-3xl leading-none">&times;</button>
        </header>
        <div className="p-6 overflow-y-auto">
          {historyEntries.length === 0 ? (
            <div className="text-center p-6 rounded-xl">
              <HistoryIcon className="h-12 w-12 text-on-surface-variant mx-auto mb-4" />
              <h4 className="font-bold text-on-surface">No History Found</h4>
              <p className="text-on-surface-variant text-sm mt-1">Your fetch history will appear here after you successfully load docs from a repository.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {historyEntries.map(entry => (
                <li key={entry.id} className="flex items-center gap-3 p-3 rounded-2xl border border-outline/50 bg-surface-variant/50 transition-shadow hover:shadow-md">
                  <div className="flex-grow overflow-hidden">
                    <p className="font-bold text-on-surface truncate">{entry.repoName}</p>
                    <p className="text-xs text-on-surface-variant truncate font-mono">{entry.repoUrl}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleLoadFromHistory(entry)}
                      className="inline-flex items-center justify-center gap-2 p-2 rounded-full text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                      aria-label={`Load docs from ${entry.repoName}`}
                    >
                      <FolderOpenIcon className="h-5 w-5" />
                      <span>Load</span>
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(entry.id)}
                      className="p-2 rounded-full text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors"
                      aria-label={`Delete history entry for ${entry.repoName}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <footer className="p-4 bg-surface-variant/50 border-t border-outline/50 flex justify-end flex-shrink-0">
          <button
            onClick={() => setIsHistoryModalOpen(false)}
            className="px-6 py-2 text-sm font-semibold rounded-full text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );

  const exportButtonText = useMemo(() => {
    if (selectedDocPaths.size > 0) {
      return `Export ${selectedDocPaths.size} Selected`;
    }
    if (documents.length > 0) {
      return `Export All (${documents.length})`;
    }
    return 'Export';
  }, [selectedDocPaths.size, documents.length]);

  return (
    <>
      {isTokenManagerOpen && <TokenManagerModal />}
      {isHistoryModalOpen && <HistoryModal />}
      <DocumentViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <header className="mb-8 flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <a
                href="https://github.com/owocc/GitHub-Doc-Exporter"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View project source on GitHub"
                className="block bg-surface p-2 rounded-2xl border border-outline/30 hover:bg-surface-variant transition-colors"
              >
                <GithubIcon className="h-8 w-8 text-on-surface" />
              </a>
              <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">GitHub Doc Exporter</h1>
            </div>
            <p className="text-md text-on-surface-variant">Fetch, view, and export markdown docs from any GitHub repository folder.</p>
          </div>
          <div className="flex-shrink-0 pt-1 flex items-center gap-4">
            <div className="relative">
              <button
                ref={settingsButtonRef}
                onClick={() => setIsSettingsPanelOpen(prev => !prev)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
              >
                {activeUser ? (
                  <img src={activeUser.avatar_url} alt={activeUser.login} className="h-10 w-10 rounded-full border-2 border-outline/50" />
                ) : (
                  <div className="h-10 w-10 rounded-full border-2 border-outline/50 bg-surface-variant flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6 text-on-surface-variant" />
                  </div>
                )}
              </button>
              {isSettingsPanelOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20 bg-black/60 md:bg-transparent"
                    onClick={() => setIsSettingsPanelOpen(false)}
                    aria-hidden="true"
                  ></div>

                  <div
                    ref={settingsPanelRef}
                    className="
                                    bg-surface shadow-xl z-30
                                    fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-outline/30 animate-slide-in-up
                                    md:absolute md:top-full md:right-0 md:bottom-auto md:left-auto md:mt-2 md:w-80 md:rounded-3xl md:border md:origin-top-right
                                "
                  >
                    <div className="w-10 h-1.5 bg-outline rounded-full mx-auto my-3 md:hidden" aria-hidden="true"></div>

                    <div className="p-4">
                      {activeUser && activeToken ? (
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <img src={activeUser.avatar_url} alt={activeUser.login} className="h-10 w-10 rounded-full" />
                            <div>
                              <a href={activeUser.html_url} target="_blank" rel="noopener noreferrer" className="text-on-surface font-semibold hover:underline">{activeUser.login}</a>
                              <p className="text-xs text-on-surface-variant truncate">
                                Active Token: <code className="font-mono bg-outline/20 px-1 py-0.5 rounded">{`ghp_...${activeToken.slice(-4)}`}</code>
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end items-center gap-4">
                            <button
                              onClick={() => {
                                setIsTokenManagerOpen(true);
                                setIsSettingsPanelOpen(false);
                              }}
                              className="text-sm font-semibold text-primary hover:underline focus:outline-none"
                            >
                              Manage Tokens
                            </button>
                            <button onClick={handleLogout} className="text-sm font-semibold text-primary hover:underline focus:outline-none">
                              Logout
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setIsTokenManagerOpen(true); setIsSettingsPanelOpen(false); }}
                          className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-outline text-sm font-bold rounded-full text-on-surface bg-surface hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
                        >
                          <GithubIcon className="h-5 w-5" /> Connect GitHub
                        </button>
                      )}
                    </div>
                    <hr className="border-outline/30" />
                    <div className="p-4">
                      <button
                        onClick={() => { setIsHistoryModalOpen(true); setIsSettingsPanelOpen(false); }}
                        className="w-full inline-flex items-center justify-center gap-3 px-5 py-2.5 border border-outline text-sm font-bold rounded-full text-on-surface bg-surface hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
                      >
                        <HistoryIcon className="h-5 w-5" /> View Fetch History
                      </button>
                    </div>
                    <hr className="border-outline/30" />
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-on-surface-variant mb-2 px-1">Theme</h4>
                      <div className="grid grid-cols-3 gap-2 rounded-full bg-surface-variant p-1">
                          {(['light', 'dark', 'system'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => handleThemeChange(mode)}
                              className={`flex items-center justify-center gap-2 py-2 px-2 rounded-full text-sm font-semibold transition-colors ${
                                themePreference === mode
                                  ? 'bg-primary text-on-primary shadow'
                                  : 'text-on-surface-variant hover:bg-on-surface/10'
                              }`}
                              aria-pressed={themePreference === mode}
                            >
                              {mode === 'light' && <SunIcon className="h-5 w-5" />}
                              {mode === 'dark' && <MoonIcon className="h-5 w-5" />}
                              {mode === 'system' && <DesktopIcon className="h-5 w-5" />}
                              <span className="capitalize">{mode}</span>
                            </button>
                          ))}
                      </div>
                    </div>
                    <hr className="border-outline/30" />
                    <div className="p-4">
                      <ExportControls
                        exportType={exportType}
                        setExportType={setExportType}
                        fetchSubdirectories={fetchSubdirectories}
                        setFetchSubdirectories={setFetchSubdirectories}
                        maxDepth={maxDepth}
                        setMaxDepth={setMaxDepth}
                        mergeInZip={mergeInZip}
                        setMergeInZip={setMergeInZip}
                        filesPerMergedFile={filesPerMergedFile}
                        setFilesPerMergedFile={setFilesPerMergedFile}
                      />
                    </div>
                  </div>
                  <style>{`
                                @keyframes slide-in-up {
                                    from { transform: translateY(100%); }
                                    to { transform: translateY(0); }
                                }
                                .animate-slide-in-up {
                                    animation: slide-in-up 0.3s ease-out;
                                }
                                @media (min-width: 768px) {
                                    .animate-slide-in-up {
                                        animation: fade-in-popover 0.15s ease-out;
                                    }
                                    @keyframes fade-in-popover {
                                        from { opacity: 0; transform: scale(0.95); }
                                        to { opacity: 1; transform: scale(1); }
                                    }
                                }
                            `}</style>
                </>
              )}
            </div>
          </div>
        </header>

        <main>
          <div className="bg-surface p-6 rounded-3xl border border-outline/30">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="e.g., https://github.com/owner/repo/tree/main/docs"
                className="flex-grow w-full bg-surface-variant border border-outline text-on-surface-variant placeholder:text-on-surface-variant rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors"
                disabled={isLoading}
              />
              <div className="flex flex-shrink-0 gap-2 w-full sm:w-auto">
                <button
                  onClick={handleFetchDocs}
                  disabled={isLoading}
                  className="inline-flex flex-1 sm:flex-none justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <><LoadingSpinner className="h-5 w-5 mr-2" /> Fetching...</> : 'Fetch Docs'}
                </button>
                {(documents.length > 0 || repoUrl !== 'https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs') && (
                  <button
                    onClick={handleClear}
                    className="inline-flex flex-1 sm:flex-none justify-center items-center px-6 py-3 text-sm font-bold rounded-full text-on-surface-variant bg-surface-variant hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-outline transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-error/10 border border-error/30 text-error px-4 py-3 rounded-xl flex items-start" role="alert">
              <ErrorIcon />
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-8 bg-surface rounded-3xl border border-outline/30 overflow-hidden">
              <div className="p-4 sm:py-6 border-b border-outline/30 flex flex-wrap items-center justify-between gap-4">
                <div className="group flex items-center gap-3 flex-shrink-0" onMouseOverCapture={() => { }} onFocusCapture={() => { }}>
                  <input
                    type="checkbox"
                    id="select-all-checkbox"
                    aria-label="Select all documents"
                    checked={documents.length > 0 && selectedDocPaths.size === documents.length}
                    onChange={handleSelectAll}
                    className="h-5 w-5 rounded border-outline text-primary focus:ring-primary accent-primary bg-surface-variant transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 checked:opacity-100"
                  />
                  <label htmlFor="select-all-checkbox" className="text-lg sm:text-xl font-bold text-on-surface cursor-pointer whitespace-nowrap">
                    {selectedDocPaths.size > 0 ? `${selectedDocPaths.size} of ${documents.length} selected` : `Found ${documents.length} documents`}
                  </label>
                </div>
                <div className="flex-grow flex justify-start sm:justify-end">
                  <button
                    onClick={handleDownload}
                    disabled={isExporting || documents.length === 0}
                    className="inline-flex justify-center items-center gap-2 px-5 py-2.5 border border-transparent text-sm font-bold rounded-full text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExporting ? <LoadingSpinner className="h-5 w-5" /> : <DownloadIcon className="h-5 w-5" />}
                    <span>{exportButtonText}</span>
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-outline/30">
                {documents.map((doc) => (
                  <li key={doc.path} className="flex items-center gap-4 p-4 hover:bg-surface-variant transition-colors">
                    <input
                      type="checkbox"
                      id={`doc-checkbox-${doc.path}`}
                      aria-labelledby={`doc-label-${doc.path}`}
                      checked={selectedDocPaths.has(doc.path)}
                      onChange={(e) => handleSelectDoc(doc.path, e.target.checked)}
                      className="h-5 w-5 rounded border-outline text-primary focus:ring-primary accent-primary bg-surface-variant flex-shrink-0"
                    />
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full flex items-center gap-4 text-left focus:outline-none group"
                    >
                      <DocumentIcon className="h-6 w-6 text-primary flex-shrink-0" />
                      <div className="flex-grow">
                        <span id={`doc-label-${doc.path}`} className="text-md font-medium text-on-surface group-hover:text-primary transition-colors">{doc.name}</span>
                        {doc.path !== doc.name && <p className="text-xs text-on-surface-variant">{doc.path}</p>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default App;