import { SearchIndex, SearchDocument } from '../search/SearchIndex';

export interface UserPreferences {
  skills: string[];
  githubLanguages: string[];
  bookmarkCategories: string[];
  searchHistoryQueries: string[];
}

class RecommendationEngineClass {
  /**
   * Generates custom score-ranked content recommendations for a user based on their context preferences.
   */
  public recommend(
    preferences: UserPreferences,
    limit: number = 5
  ): { doc: SearchDocument; score: number }[] {
    const allDocs = SearchIndex.getAll();

    // Compute recommendations using scoring metrics
    const scoredList = allDocs.map((doc) => {
      let score = 0;

      // 1. Skill Match Weight (+50 per skill matches)
      preferences.skills.forEach((skill) => {
        if (
          doc.title.toLowerCase().includes(skill.toLowerCase()) ||
          doc.tags.includes(skill.toLowerCase()) ||
          doc.category.toLowerCase() === skill.toLowerCase()
        ) {
          score += 50;
        }
      });

      // 2. GitHub Language Match Weight (+40 per match)
      preferences.githubLanguages.forEach((lang) => {
        if (doc.category.toLowerCase() === lang.toLowerCase()) {
          score += 40;
        }
      });

      // 3. Search History Match Weight (+30 per matching search terms)
      preferences.searchHistoryQueries.forEach((query) => {
        const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        queryTerms.forEach((term) => {
          if (doc.title.toLowerCase().includes(term) || doc.body.toLowerCase().includes(term)) {
            score += 30;
          }
        });
      });

      // 4. Category Bookmarks Match Weight (+20)
      if (preferences.bookmarkCategories.some(cat => cat.toLowerCase() === doc.category.toLowerCase())) {
        score += 20;
      }

      // 5. Baseline Popularity Weight (boost high-quality trending content slightly)
      score += Math.min(15, doc.popularity / 20);

      return { doc, score: Math.round(score) };
    });

    // Sort by descending score
    scoredList.sort((a, b) => b.score - a.score);

    // Return ranked list within limits
    return scoredList.slice(0, limit);
  }
}

// Global Singleton for development reloads
const globalForRecsEngine = globalThis as unknown as {
  recommendationEngineInstance: RecommendationEngineClass | undefined;
};

export const RecommendationEngine = globalForRecsEngine.recommendationEngineInstance ?? new RecommendationEngineClass();

if (process.env.NODE_ENV !== 'production') {
  globalForRecsEngine.recommendationEngineInstance = RecommendationEngine;
}
