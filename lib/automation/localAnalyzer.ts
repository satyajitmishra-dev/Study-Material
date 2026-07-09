export interface FileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string;
}

export interface LocalAnalysisResult {
  commitTitle: string;
  commitMessage: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
  foldersAffected: string[];
  extensions: string[];
  meaningfulFiles: string[];
  isMeaningful: boolean;
  reason?: string;
}

/**
 * Parses raw commit logs and aggregates additions/deletions/paths locally.
 * Returns true if changes are meaningful and not ignore-listed.
 */
export function analyzeLocalChanges(
  commitMessage: string,
  files: FileChange[],
  ignorePaths: string[] = [],
  ignoreCommits: string[] = []
): LocalAnalysisResult {
  const commitTitle = commitMessage.split('\n')[0].trim();
  const commitBody = commitMessage.substring(commitTitle.length).trim();

  // 1. Check commit prefix ignores
  if (ignoreCommits.length > 0) {
    const titleLower = commitTitle.toLowerCase();
    for (const pattern of ignoreCommits) {
      if (titleLower.startsWith(pattern.toLowerCase())) {
        return {
          commitTitle,
          commitMessage,
          filesChanged: 0,
          insertions: 0,
          deletions: 0,
          foldersAffected: [],
          extensions: [],
          meaningfulFiles: [],
          isMeaningful: false,
          reason: `Ignored by commit pattern: "${pattern}"`
        };
      }
    }
  }

  // Common ignore directories / extensions
  const ignoreFolders = ['node_modules', '.next', 'dist', 'build', 'coverage', '.git', '.gemini'];
  const ignoreExtensions = ['.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.woff', '.woff2'];
  const ignoreDocFiles = ['readme.md', 'license', 'license.md', 'changelog.md'];

  let insertions = 0;
  let deletions = 0;
  const folders = new Set<string>();
  const extensions = new Set<string>();
  const meaningfulFiles: string[] = [];

  for (const file of files) {
    const filename = file.filename;
    const filenameLower = filename.toLowerCase();

    // Check custom ignore paths
    const isCustomIgnored = ignorePaths.some(pattern => {
      const cleanPattern = pattern.trim().replace(/\*/g, '.*');
      const rx = new RegExp(`^${cleanPattern}$|\\/${cleanPattern}$|${cleanPattern}\\/`);
      return rx.test(filename);
    });
    if (isCustomIgnored) continue;

    // Check common folders
    const pathParts = filename.split('/');
    const inIgnoredFolder = pathParts.some(part => ignoreFolders.includes(part));
    if (inIgnoredFolder) continue;

    // Check extensions & lock files
    const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
    if (ignoreExtensions.includes(extension) || ignoreExtensions.includes(pathParts[pathParts.length - 1])) continue;

    // Check doc files
    if (ignoreDocFiles.includes(pathParts[pathParts.length - 1].toLowerCase())) continue;

    // Aggregate details
    insertions += file.additions;
    deletions += file.deletions;
    meaningfulFiles.push(filename);

    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext) extensions.add(ext);

    // Get immediate parent folder
    if (pathParts.length > 1) {
      folders.add(pathParts.slice(0, -1).join('/'));
    } else {
      folders.add('root');
    }
  }

  const isMeaningful = meaningfulFiles.length > 0;
  const reason = isMeaningful ? undefined : 'No code modifications remaining after path/extension filters.';

  return {
    commitTitle,
    commitMessage,
    filesChanged: meaningfulFiles.length,
    insertions,
    deletions,
    foldersAffected: Array.from(folders),
    extensions: Array.from(extensions),
    meaningfulFiles,
    isMeaningful,
    reason,
  };
}
