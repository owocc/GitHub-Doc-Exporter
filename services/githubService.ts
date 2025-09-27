import { DocContent, GitHubFile, GitHubUser } from '../types';

const GITHUB_URL_REGEX = /https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/tree\/(?<branch>[^/]+)\/(?<path>.+)/;

interface GitHubRepoInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

function parseGitHubUrl(url: string): GitHubRepoInfo | null {
  const match = url.match(GITHUB_URL_REGEX);
  if (!match || !match.groups) {
    return null;
  }
  return {
    owner: match.groups.owner,
    repo: match.groups.repo,
    branch: match.groups.branch,
    path: match.groups.path,
  };
}

export async function getUser(token: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
       throw new Error('Authentication failed. The token is invalid or has been revoked.');
    }
    throw new Error(`Failed to fetch user data. Status: ${response.status}`);
  }
  return await response.json();
}


export async function fetchRepoDocs(url: string, token: string | null): Promise<DocContent[]> {
  const repoInfo = parseGitHubUrl(url);
  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo/tree/branch/path');
  }

  const { owner, repo, branch, path } = repoInfo;
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

  const apiHeaders: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    apiHeaders['Authorization'] = `token ${token}`;
  }


  const response = await fetch(apiUrl, { headers: apiHeaders });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository or path not found. Please check the URL.');
    }
    if (response.status === 403) {
      const rateLimitData = await response.json();
      const message = token
        ? "Your GitHub token may not have the required permissions (e.g., 'repo' scope for private repos), or you've exceeded your rate limit."
        : `GitHub API rate limit exceeded. Please connect with a GitHub token to increase your limit. Message: ${rateLimitData.message}`;
      throw new Error(message);
    }
    throw new Error(`Failed to fetch repository contents. Status: ${response.status}`);
  }

  const files: GitHubFile[] = await response.json();

  const mdFiles = files.filter(
    (file) => file.type === 'file' && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))
  );

  if (mdFiles.length === 0) {
    throw new Error('No .md or .mdx files found in the specified directory.');
  }

  const docContents = await Promise.all(
    mdFiles.map(async (file) => {
      try {
        let content = '';

        // For private repos, download_url can be null. In that case, we fetch from the API.
        if (file.download_url === null) {
            const fileApiResponse = await fetch(file.url, { headers: apiHeaders });
             if (!fileApiResponse.ok) {
                console.warn(`Failed to fetch content metadata for ${file.name}. Status: ${fileApiResponse.status}`);
                return null;
            }
            const fileApiData = await fileApiResponse.json();
            if (fileApiData.content && fileApiData.encoding === 'base64') {
                content = atob(fileApiData.content);
            } else {
                console.warn(`Could not retrieve content for ${file.name} from API.`);
                return null;
            }
        } else {
            // For public repos, use the download_url.
            // DO NOT send an Authorization header to raw.githubusercontent.com, as it can cause network errors.
            const contentResponse = await fetch(file.download_url);
            if (!contentResponse.ok) {
              console.warn(`Failed to fetch content for ${file.name}. Status: ${contentResponse.status}`);
              return null;
            }
            content = await contentResponse.text();
        }

        return {
          name: file.name,
          content,
          url: file.html_url,
        };
      } catch (error) {
        console.error(`Error fetching content for ${file.name}:`, error);
        return null;
      }
    })
  );

  return docContents.filter((doc): doc is DocContent => doc !== null);
}