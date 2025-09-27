import React, { useState, useCallback, useEffect } from 'react';
import { DocContent, GitHubUser } from './types';
import { fetchRepoDocs, getUser } from './services/githubService';
import AccordionItem from './components/AccordionItem';
import ExportControls from './components/ExportControls';

const GithubIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
        <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.16-.89-1.16-.73-.5.06-.49.06-.49.8.06 1.23.82 1.23.82.71 1.21 1.87.86 2.33.66.07-.51.28-.86.51-1.06-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8a8 8 0 0 0-8-8Z"></path>
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ErrorIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 112 0v2a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
);

const App: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs');
  const [documents, setDocuments] = useState<DocContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);

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
    setOpenAccordion(null);

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
    setOpenAccordion(null);
  };

  const toggleAccordion = (docName: string) => {
    setOpenAccordion(prev => (prev === docName ? null : docName));
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700 transform transition-all">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white" id="modal-title">Connect to GitHub</h3>
                <button onClick={() => setIsAuthModalOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-400 mb-4">
                Provide a GitHub Personal Access Token to increase API rate limits and access private repositories.
            </p>
            <a href="https://github.com/settings/tokens/new?scopes=repo&description=GitHub%20Doc%20Exporter" target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:text-cyan-300 underline mb-4 inline-block">
                Create a new token here.
            </a>
            <p className="text-xs text-gray-500 mb-4">
                We recommend granting the <code className="text-xs">repo</code> scope to access both public and private documentation. The token is stored only in your browser's local storage.
            </p>
            <div>
                <label htmlFor="token-input" className="sr-only">GitHub Token</label>
                <input
                    id="token-input"
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-4 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
            </div>
            {tokenError && <p className="text-red-400 text-sm mt-2">{tokenError}</p>}
            <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900"
                >
                    Cancel
                </button>
                <button
                    onClick={() => handleVerifyToken(tokenInput)}
                    disabled={isVerifyingToken}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-cyan-800 disabled:cursor-not-allowed"
                >
                    {isVerifyingToken ? <><LoadingSpinner /> Verifying...</> : 'Save & Connect'}
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {isAuthModalOpen && <AuthModal />}
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <header className="mb-8">
            <div className="flex justify-between items-start">
                <div className="text-left">
                    <div className="flex items-center gap-4 mb-2">
                        <GithubIcon className="h-10 w-10 text-cyan-400"/>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white">GitHub Doc Exporter</h1>
                    </div>
                    <p className="text-lg text-gray-400">Fetch, view, and export markdown docs from any public GitHub repository folder.</p>
                </div>
                <div className="flex-shrink-0 pt-2">
                    {user ? (
                        <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-full p-1 pl-3">
                            <img src={user.avatar_url} alt={user.login} className="h-8 w-8 rounded-full"/>
                            <a href={user.html_url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hidden sm:inline hover:underline">{user.login}</a>
                            <button onClick={handleLogout} title="Logout" className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 15l3-3m0 0l-3-3m3 3H5" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => {
                              setIsAuthModalOpen(true);
                              setTokenError(null);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900"
                        >
                            <GithubIcon className="h-5 w-5"/> Connect GitHub
                        </button>
                    )}
                </div>
            </div>
        </header>

        <main>
          <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="e.g., https://github.com/owner/repo/tree/main/docs"
                className="flex-grow bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-4 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                    onClick={handleFetchDocs}
                    disabled={isLoading}
                    className="inline-flex flex-1 sm:flex-none justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 disabled:bg-cyan-800 disabled:cursor-not-allowed"
                >
                    {isLoading ? <><LoadingSpinner/> Fetching...</> : 'Fetch Docs'}
                </button>
                {(documents.length > 0 || repoUrl !== 'https://github.com/tailwindlabs/tailwindcss.com/tree/main/src/docs') && (
                    <button
                        onClick={handleClear}
                        className="inline-flex flex-1 sm:flex-none justify-center items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900"
                    >
                        Clear
                    </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                <ErrorIcon/>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          {documents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Found {documents.length} Documents
              </h2>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <AccordionItem 
                    key={doc.name} 
                    doc={doc} 
                    isOpen={openAccordion === doc.name} 
                    onToggle={() => toggleAccordion(doc.name)}
                  />
                ))}
              </div>
              <ExportControls documents={documents} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
