import { MOCK_COURSES, MOCK_PROJECTS, MOCK_ROADMAP } from '../mockData';

export interface SearchDocument {
  id: string; // unique document ID
  contentId: string; // original resource ID
  contentType: 'blog' | 'project' | 'roadmap' | 'note' | 'resource' | 'question' | 'discussion' | 'poll' | 'event' | 'achievement' | 'certification' | 'user' | 'community' | 'tag' | 'comment';
  title: string;
  description: string;
  body: string;
  tags: string[];
  category: string;
  author: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  popularity: number; // likes/stars count
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory Search Index Store
class SearchIndexClass {
  private indexStore: Map<string, SearchDocument> = new Map();

  constructor() {
    this.seedMockIndex();
  }

  /**
   * Seed the search index with initial mock items to ensure a rich search/explore experience
   */
  private seedMockIndex() {
    const now = new Date();

    // 1. Seed Mock Courses
    MOCK_COURSES.forEach((course) => {
      course.chapters.forEach((chapter) => {
        chapter.steps.forEach((step) => {
          this.indexDocument({
            id: `doc-step-${step.id}`,
            contentId: step.id,
            contentType: 'note',
            title: step.title,
            description: `Lesson step from course: ${course.title} - ${chapter.title}`,
            body: step.content,
            tags: [course.category.toLowerCase(), 'course', 'learning'],
            category: course.category,
            author: 'Sandbox Administrator',
            difficulty: course.difficulty,
            language: 'en',
            popularity: 42,
            isVerified: true,
            createdAt: now,
            updatedAt: now,
          });
        });
      });
    });

    // 2. Seed Mock Projects
    MOCK_PROJECTS.forEach((project) => {
      this.indexDocument({
        id: `doc-proj-${project.id}`,
        contentId: project.id,
        contentType: 'project',
        title: project.name,
        description: project.tagline,
        body: project.description || '',
        tags: [...((project as any).techStack || []).map((t: any) => t.toLowerCase()), 'project', 'open-source'],
        category: project.category || 'TypeScript',
        author: 'satyajitmishra-dev',
        difficulty: 'Intermediate',
        language: 'en',
        popularity: project.stars || 0,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    // 3. Seed Mock Roadmaps
    MOCK_ROADMAP.forEach((node) => {
      this.indexDocument({
        id: `doc-roadmap-${node.id}`,
        contentId: node.id,
        contentType: 'roadmap',
        title: node.title,
        description: node.description,
        body: `Interactive learning roadmap node covering ${node.title} under ${node.category} category. Status: ${node.status}`,
        tags: [node.category.toLowerCase(), 'roadmap', 'learning-path'],
        category: node.category,
        author: 'System Mentor',
        difficulty: node.status === 'locked' ? 'Advanced' : 'Beginner',
        language: 'en',
        popularity: 120,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    // 4. Seed Mock Communities
    const mockComms = ['React', 'Java', 'Next.js', 'DSA', 'AI', 'Open Source'];
    mockComms.forEach(c => {
      this.indexDocument({
        id: `doc-comm-${c.toLowerCase()}`,
        contentId: `comm_${c.toLowerCase()}`,
        contentType: 'community',
        title: `${c} Community Hub`,
        description: `Discussions, roadmaps, and cheat sheets for ${c} engineering.`,
        body: `Official verified community for ${c} developers. Rules: post high quality, no spam.`,
        tags: [c.toLowerCase(), 'community', 'forum'],
        category: c,
        author: 'System',
        difficulty: 'Beginner',
        language: 'en',
        popularity: 450,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      });
    });

    // 5. Seed Mock Users
    const mockUsers = [
      { name: 'Satyajit Mishra', username: 'satyajitmishra-dev', bio: 'Principal software engineer building visual builder tools.' },
      { name: 'Emily Chen', username: 'emilychen', bio: 'AI researcher and web performance developer.' },
      { name: 'Alex Rivera', username: 'arivera', bio: 'Spring Boot, JDK contributor, and Java developer.' }
    ];
    mockUsers.forEach(u => {
      this.indexDocument({
        id: `doc-user-${u.username}`,
        contentId: `user_${u.username}`,
        contentType: 'user',
        title: u.name,
        description: u.bio,
        body: `Developer portfolio for @${u.username}. Skills: Next.js, Java, React.`,
        tags: ['user', 'profile', 'developer'],
        category: 'People',
        author: u.username,
        difficulty: 'Intermediate',
        language: 'en',
        popularity: 180,
        isVerified: true,
        createdAt: now,
        updatedAt: now,
      });
    });
  }

  /**
   * Add or update a document in the search index
   */
  public indexDocument(doc: SearchDocument) {
    this.indexStore.set(doc.id, doc);
  }

  /**
   * Remove a document from the search index
   */
  public removeDocument(id: string) {
    this.indexStore.delete(id);
  }

  /**
   * Search query execution with advanced filters and scoring weights
   */
  public search(
    query: string,
    filters?: {
      contentType?: SearchDocument['contentType'];
      category?: string;
      difficulty?: SearchDocument['difficulty'];
      isVerified?: boolean;
      language?: string;
      tags?: string[];
    },
    sortBy: 'popularity' | 'newest' | 'relevance' = 'relevance'
  ): SearchDocument[] {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const docs = Array.from(this.indexStore.values());

    // 1. Filter documents
    const filteredDocs = docs.filter((doc) => {
      if (filters?.contentType && doc.contentType !== filters.contentType) return false;
      if (filters?.category && doc.category.toLowerCase() !== filters.category.toLowerCase()) return false;
      if (filters?.difficulty && doc.difficulty !== filters.difficulty) return false;
      if (filters?.isVerified !== undefined && doc.isVerified !== filters.isVerified) return false;
      if (filters?.language && doc.language !== filters.language) return false;
      
      if (filters?.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => doc.tags.includes(tag.toLowerCase()));
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // 2. Score relevance
    const scoredDocs = filteredDocs.map((doc) => {
      let score = 0;
      if (searchTerms.length === 0) return { doc, score: doc.popularity };

      const titleLower = doc.title.toLowerCase();
      const descLower = doc.description.toLowerCase();
      const bodyLower = doc.body.toLowerCase();

      searchTerms.forEach((term) => {
        // Boost matches in title, then description, then body
        if (titleLower.includes(term)) score += 100;
        if (descLower.includes(term)) score += 40;
        if (bodyLower.includes(term)) score += 10;
        
        // Exact term match weight boost
        if (titleLower === term) score += 200;
      });

      // Factor in popularity a tiny bit for relevance fallback sorting
      score += Math.min(20, doc.popularity / 50);

      return { doc, score };
    });

    // 3. Filter out zero score matches if query was provided
    const matchDocs = searchTerms.length > 0 
      ? scoredDocs.filter(item => item.score > 0) 
      : scoredDocs;

    // 4. Sort results
    matchDocs.sort((a, b) => {
      if (sortBy === 'popularity') {
        return b.doc.popularity - a.doc.popularity;
      }
      if (sortBy === 'newest') {
        return b.doc.createdAt.getTime() - a.doc.createdAt.getTime();
      }
      // default: relevance
      return b.score - a.score;
    });

    return matchDocs.map(item => item.doc);
  }

  /**
   * Get all active tags and categories present in the index for filtering UI
   */
  public getFacets() {
    const tags = new Set<string>();
    const categories = new Set<string>();
    
    this.indexStore.forEach(doc => {
      doc.tags.forEach(t => tags.add(t));
      categories.add(doc.category);
    });

    return {
      tags: Array.from(tags),
      categories: Array.from(categories)
    };
  }

  /**
   * Retrieve all indexed documents (for Explore feeds)
   */
  public getAll() {
    return Array.from(this.indexStore.values());
  }
}

// Global Singleton for development reloads
const globalForSearchIndex = globalThis as unknown as {
  searchIndexInstance: SearchIndexClass | undefined;
};

export const SearchIndex = globalForSearchIndex.searchIndexInstance ?? new SearchIndexClass();

if (process.env.NODE_ENV !== 'production') {
  globalForSearchIndex.searchIndexInstance = SearchIndex;
}
