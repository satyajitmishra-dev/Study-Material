export interface StorageProvider {
  getItem<T>(key: string, defaultValue: T): Promise<T>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// LocalStorage provider that handles SSR safely
class LocalStorageProvider implements StorageProvider {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading key ${key} from storage:`, e);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing key ${key} to storage:`, e);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing key ${key} from storage:`, e);
    }
  }
}

// Active provider can be swapped here easily in the future (e.g. for PostgreSQL, Firebase, etc.)
const activeProvider: StorageProvider = new LocalStorageProvider();

export interface ProjectData {
  id: string;
  name: string;
  tagline: string;
  category: string;
  githubUrl?: string;
  demoUrl?: string;
  stars?: number;
  forks?: number;
  importedAt?: string;
  description: string;
  architectureNodes?: Array<{ id: string; label: string; type: string; description: string; x: number; y: number }>;
  architectureEdges?: Array<{ from: string; to: string }>;
  installationSteps?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

export interface LearningProgress {
  courseId: string;
  completedSteps: string[];
  activeStepId?: string;
  lastAccessed: string;
}

export interface UserNote {
  id: string;
  courseId: string;
  stepId: string;
  content: string;
  updatedAt: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardShortcuts: boolean;
}

const KEYS = {
  PROJECTS: 'sm_projects',
  PROGRESS: 'sm_progress',
  NOTES: 'sm_notes',
  SETTINGS: 'sm_settings',
};

export const Storage = {
  // Projects
  getProjects: async (defaultProjects: ProjectData[]): Promise<ProjectData[]> => {
    return activeProvider.getItem<ProjectData[]>(KEYS.PROJECTS, defaultProjects);
  },
  saveProjects: async (projects: ProjectData[]): Promise<void> => {
    await activeProvider.setItem(KEYS.PROJECTS, projects);
  },
  addProject: async (project: ProjectData): Promise<void> => {
    const projects = await activeProvider.getItem<ProjectData[]>(KEYS.PROJECTS, []);
    const exists = projects.findIndex(p => p.id === project.id);
    if (exists >= 0) {
      projects[exists] = project;
    } else {
      projects.push(project);
    }
    await activeProvider.setItem(KEYS.PROJECTS, projects);
  },

  // Progress
  getProgress: async (): Promise<Record<string, LearningProgress>> => {
    return activeProvider.getItem<Record<string, LearningProgress>>(KEYS.PROGRESS, {});
  },
  saveProgress: async (progress: Record<string, LearningProgress>): Promise<void> => {
    await activeProvider.setItem(KEYS.PROGRESS, progress);
  },
  updateCourseProgress: async (courseId: string, stepId: string, completed: boolean): Promise<Record<string, LearningProgress>> => {
    const progress = await Storage.getProgress();
    if (!progress[courseId]) {
      progress[courseId] = { courseId, completedSteps: [], lastAccessed: new Date().toISOString() };
    }
    const currentSteps = progress[courseId].completedSteps;
    if (completed) {
      if (!currentSteps.includes(stepId)) currentSteps.push(stepId);
    } else {
      progress[courseId].completedSteps = currentSteps.filter(id => id !== stepId);
    }
    progress[courseId].activeStepId = stepId;
    progress[courseId].lastAccessed = new Date().toISOString();
    await Storage.saveProgress(progress);
    return progress;
  },

  // Notes
  getNotes: async (): Promise<UserNote[]> => {
    return activeProvider.getItem<UserNote[]>(KEYS.NOTES, []);
  },
  saveNotes: async (notes: UserNote[]): Promise<void> => {
    await activeProvider.setItem(KEYS.NOTES, notes);
  },
  saveNote: async (courseId: string, stepId: string, content: string): Promise<UserNote[]> => {
    const notes = await Storage.getNotes();
    const existingIndex = notes.findIndex(n => n.courseId === courseId && n.stepId === stepId);
    if (existingIndex >= 0) {
      notes[existingIndex] = {
        ...notes[existingIndex],
        content,
        updatedAt: new Date().toISOString()
      };
    } else {
      notes.push({
        id: `${courseId}_${stepId}_${Date.now()}`,
        courseId,
        stepId,
        content,
        updatedAt: new Date().toISOString()
      });
    }
    await Storage.saveNotes(notes);
    return notes;
  },

  // Settings
  getSettings: async (): Promise<UserSettings> => {
    return activeProvider.getItem<UserSettings>(KEYS.SETTINGS, {
      theme: 'dark',
      reducedMotion: false,
      highContrast: false,
      keyboardShortcuts: true,
    });
  },
  saveSettings: async (settings: UserSettings): Promise<void> => {
    await activeProvider.setItem(KEYS.SETTINGS, settings);
  }
};
