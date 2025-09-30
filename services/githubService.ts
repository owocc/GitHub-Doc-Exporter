import { DocContent, GitHubFile, GitHubUser } from '../types';

const GITHUB_URL_REGEX = /https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/tree\/(?<branch>[^/]+)\/(?<path>.*)/;

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


export async function fetchRepoDocs(
  url: string,
  token: string | null,
  maxDepth: number = 1
): Promise<DocContent[]> {
  const repoInfo = parseGitHubUrl(url);
  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL format. Expected format: https://github.com/owner/repo/tree/branch/path');
  }

  const { owner, repo, branch, path } = repoInfo;
  
  const apiHeaders: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    apiHeaders['Authorization'] = `token ${token}`;
  }

  const allDocs: DocContent[] = [];

  async function getContents(currentPath: string, currentDepth: number): Promise<void> {
    if (currentDepth > maxDepth) {
      return;
    }

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${currentPath}?ref=${branch}`;
    const response = await fetch(apiUrl, { headers: apiHeaders });

    if (!response.ok) {
      if (currentPath === path) { // Only throw for the root fetch, otherwise just warn
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
          throw new Error(`Failed to fetch repository contents for ${currentPath}. Status: ${response.status}`);
      } else {
          console.warn(`Skipping directory ${currentPath}: Failed to fetch contents. Status: ${response.status}`);
          return;
      }
    }

    const items: GitHubFile[] = await response.json();
    const promises: Promise<any>[] = [];

    for (const item of items) {
      if (item.type === 'file' && (item.name.endsWith('.md') || item.name.endsWith('.mdx'))) {
        promises.push(
          (async () => {
            try {
              let content = '';
              if (item.download_url === null) {
                const fileApiResponse = await fetch(item.url, { headers: apiHeaders });
                if (!fileApiResponse.ok) {
                  console.warn(`Failed to fetch content metadata for ${item.name}. Status: ${fileApiResponse.status}`);
                  return;
                }
                const fileApiData = await fileApiResponse.json();
                if (fileApiData.content && fileApiData.encoding === 'base64') {
                  content = atob(fileApiData.content);
                } else {
                   console.warn(`Could not retrieve content for ${item.name} from API.`);
                   return;
                }
              } else {
                const contentResponse = await fetch(item.download_url);
                if (!contentResponse.ok) {
                  console.warn(`Failed to fetch content for ${item.name}. Status: ${contentResponse.status}`);
                  return;
                }
                content = await contentResponse.text();
              }
              
              const relativePath = item.path.substring(path.length).replace(/^\//, '');

              allDocs.push({
                name: item.name,
                path: relativePath,
                content,
                url: item.html_url,
              });
            } catch (error) {
              console.error(`Error fetching content for ${item.name}:`, error);
            }
          })()
        );
      } else if (item.type === 'dir') {
        promises.push(getContents(item.path, currentDepth + 1));
      }
    }
    await Promise.all(promises);
  }

  await getContents(path, 1);
  
  if (allDocs.length === 0) {
      throw new Error('No .md or .mdx files found in the specified directory (or subdirectories if enabled).');
  }

  return allDocs.sort((a, b) => a.path.localeCompare(b.path));
}