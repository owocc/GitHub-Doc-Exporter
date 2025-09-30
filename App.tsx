import React, { useState, useCallback, useEffect } from 'react';
import { DocContent, GitHubUser } from './types';
import { fetchRepoDocs, getUser } from './services/githubService';
import DocumentViewerModal from './components/AccordionItem';
import ExportControls from './components/ExportControls';

const GithubIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.21 1.87.86 2.33.66.07-.51.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8a8 8 0 0 0-8-8Z"></path>
    </svg>
);

const DocumentIcon: React.FC<{className?: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.707a2 2 0 0 0-.586-1.414l-4.293-4.293A2 2 0 0 0 11.293 2H4Zm6 2.5a.5.5 0 0 1 .5.5v1.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L9.5 6.793V5a.5.5 0 0 1 .5-.5Z" clipRule="evenodd" />
  </svg>
);


const LoadingSpinner: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => (
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.697 6.303a.75.75 0 0 1 0 1.06-7.5 7.5 0 0 1-10.607 10.607.75.75 0 0 1-1.06-1.06 9 9 0 0 0 12.727-12.727.75.75 0 0 1 1.06 0ZM12 19.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Z" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 12 22.5a10.5 10.5 0 0 1-10.5-10.5c0-4.307 2.56-8.02 6.31-9.782a.75.75 0 0 1 .819.162Z" clipRule="evenodd" />
  </svg>
);


const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs');
  const [documents, setDocuments] = useState<DocContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocContent | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') as 'light' | 'dark' || 'light');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleVerifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) {
        setTokenError("Token cannot be empty.");
        return;
    }
    setTokenError(null);
    setIsVerifyingToken(true);
    try {
        const userData = await getUser(tokenToVerify);
        setUser(userData);
        setToken(tokenToVerify);
        localStorage.setItem('github_token', tokenToVerify);
        setIsAuthModalOpen(false);
        setTokenInput('');
    } catch (e: any) {
        setTokenError(e.message || "An unknown error occurred.");
        setUser(null);
        setToken(null);
        localStorage.removeItem('github_token');
    } finally {
        setIsVerifyingToken(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
        getUser(storedToken).then(userData => {
            setUser(userData);
            setToken(storedToken);
        }).catch(() => {
            localStorage.removeItem('github_token');
        });
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('github_token');
  };

  const handleFetchDocs = useCallback(async () => {
    if (!repoUrl) {
      setError('Please enter a GitHub repository URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDocuments([]);

    try {
      const docs = await fetchRepoDocs(repoUrl, token);
      setDocuments(docs);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, token]);
  
  const handleClear = () => {
    setRepoUrl('');
    setDocuments([]);
    setError(null);
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="bg-surface rounded-3xl shadow-xl p-6 w-full max-w-md border border-outline/50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-on-surface" id="modal-title">Connect to GitHub</h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-on-surface-variant hover:text-on-surface text-3xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
                Provide a Personal Access Token to increase API rate limits and access private repositories.
            </p>
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Doc%20Exporter" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mb-4 inline-block font-semibold">
                Create a new token here.
            </a>
             <div className="text-xs text-on-surface-variant bg-surface-variant p-3 rounded-lg mb-4">
                We recommend the <code className="text-xs bg-outline/20 px-1 py-0.5 rounded">repo</code> scope for private docs. Your token is only stored in your browser.
            </div>
            <div>
                <label htmlFor="token-input" className="sr-only">GitHub Token</label>
                <input
                    id="token-input"
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-surface-variant border border-outline text-on-surface-variant placeholder:text-on-surface-variant rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
                />
            </div>
            {tokenError && <p className="text-error text-sm mt-2">{tokenError}</p>}
            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-6 py-2 text-sm font-semibold rounded-full text-on-surface-variant bg-surface-variant hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-outline"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleVerifyToken(tokenInput)}
                    disabled={isVerifyingToken}
                    className="inline-flex justify-center items-center px-6 py-2 border border-transparent text-sm font-semibold rounded-full shadow-sm text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isVerifyingToken ? <><LoadingSpinner className="h-4 w-4 mr-2"/> Verifying...</> : 'Save & Connect'}
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <>
      {isAuthModalOpen && <AuthModal />}
      <DocumentViewerModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <header className="mb-8 flex justify-between items-start gap-4">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-surface p-2 rounded-2xl border border-outline/30">
                        <GithubIcon className="h-8 w-8 text-primary"/>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight">GitHub Doc Exporter</h1>
                </div>
                <p className="text-md text-on-surface-variant">Fetch, view, and export markdown docs from any GitHub repository folder.</p>
            </div>
            <div className="flex-shrink-0 pt-1 flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-primary">
                    {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
                </button>
                {user ? (
                    <div className="flex items-center gap-3">
                        <img src={user.avatar_url} alt={user.login} className="h-10 w-10 rounded-full border-2 border-outline/50"/>
                        <div className="hidden sm:block">
                            <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="text-on-surface font-semibold hover:underline">{user.login}</a>
                            <button onClick={handleLogout} className="text-xs text-on-surface-variant hover:text-primary block text-left">Logout</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => { setIsAuthModalOpen(true); setTokenError(null); }}
                        className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-outline text-sm font-bold rounded-full text-on-surface bg-surface hover:bg-surface-variant focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
                    >
                        <GithubIcon className="h-5 w-5"/> Connect GitHub
                    </button>
                )}
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
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                    onClick={handleFetchDocs}
                    disabled={isLoading}
                    className="inline-flex flex-1 sm:flex-none justify-center items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-on-primary bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? <><LoadingSpinner className="h-5 w-5 mr-2"/> Fetching...</> : 'Fetch Docs'}
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
                <ErrorIcon/>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-8 bg-surface rounded-3xl border border-outline/30 overflow-hidden">
              <div className="p-6 border-b border-outline/30">
                  <h2 className="text-xl font-bold text-on-surface">
                    Found {documents.length} Documents
                  </h2>
              </div>
              <ul className="divide-y divide-outline/30">
                {documents.map((doc) => (
                  <li key={doc.name}>
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-variant transition-colors focus:outline-none focus:bg-primary-container/50"
                    >
                      <DocumentIcon className="h-6 w-6 text-primary flex-shrink-0"/>
                      <span className="text-md font-medium text-on-surface">{doc.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {documents.length > 0 && (
              <ExportControls documents={documents} />
          )}
        </main>
      </div>
    </>
  );
};

export default App;