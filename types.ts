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
  content: string;
  url: string;
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}