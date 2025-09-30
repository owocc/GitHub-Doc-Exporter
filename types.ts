export interface GitHubFile {
  name: string;
  path: string;
  download_url: string | null;
  type: 'file' | 'dir';
  html_url: string;
  url: string;
}

export interface DocContent {
  name: string;
  path: string;
  content: string;
  url: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface HistoryEntry {
  id?: number;
  repoUrl: string;
  repoName: string;
  documents: DocContent[];
  timestamp: number;
}
