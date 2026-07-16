'use server';

interface GitHubRepoMetadata {
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  latestRelease: string | null;
  htmlUrl: string;
}

// Simple in-memory cache for API results to prevent hitting GitHub rate limits
const cache = new Map<string, { data: GitHubRepoMetadata; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchGitHubRepoAction(
  repoUrl: string
): Promise<{ success: boolean; data?: GitHubRepoMetadata; error?: string }> {
  try {
    const cleanedUrl = repoUrl.trim().replace(/\.git$/, '');
    const match = cleanedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return { success: false, error: 'Invalid GitHub URL format.' };
    }

    const [, owner, repo] = match;
    const cacheKey = `${owner}/${repo}`.toLowerCase();

    // Check Cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return { success: true, data: cached.data };
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'study-materials-platform',
    };

    // Use Github token if configured in .env
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch main repo details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      next: { revalidate: 600 } // 10 min Vercel fetch cache
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return { success: false, error: 'Repository not found or private.' };
      }
      return { success: false, error: `GitHub API responded with status ${repoRes.status}` };
    }

    const repoData = await repoRes.json();

    // Fetch latest release tag
    let latestRelease: string | null = null;
    try {
      const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
        headers,
        next: { revalidate: 600 }
      });
      if (releaseRes.ok) {
        const releaseData = await releaseRes.json();
        latestRelease = releaseData.tag_name || null;
      }
    } catch (e) {
      // Silently fall back if no release or rate limited
    }

    const data: GitHubRepoMetadata = {
      owner,
      name: repoData.name,
      description: repoData.description || null,
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      language: repoData.language || null,
      license: repoData.license?.spdx_id || repoData.license?.name || null,
      latestRelease,
      htmlUrl: repoData.html_url,
    };

    // Store in cache
    cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });

    return { success: true, data };
  } catch (err: any) {
    console.error('GitHub API error:', err);
    return { success: false, error: err.message || 'Internal server error.' };
  }
}
