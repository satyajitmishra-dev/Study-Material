'use server';

import { revalidatePath } from 'next/cache';

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  contributionScore: number;
  creatorScore: number;
  badges: string[];
}

/**
 * Calculates user level based on total XP points.
 * Standard level scaling: Level = floor(sqrt(XP / 50)) + 1
 */
export function calculateLevel(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

/**
 * Award XP to a user profile for completing specific tasks.
 */
export async function awardXpAction(
  userId: string,
  action: 'READ_POST' | 'COMPLETE_STEP' | 'PUBLISH_PROJECT' | 'ANSWER_QA' | 'CAST_VOTE'
) {
  try {
    let xpGain = 0;
    switch (action) {
      case 'READ_POST':
        xpGain = 30;
        break;
      case 'COMPLETE_STEP':
        xpGain = 80;
        break;
      case 'PUBLISH_PROJECT':
        xpGain = 150;
        break;
      case 'ANSWER_QA':
        xpGain = 50;
        break;
      case 'CAST_VOTE':
        xpGain = 15;
        break;
    }

    // In production, update User database records. In sandbox, return success
    return {
      success: true,
      xpGained: xpGain,
      actionAwarded: action
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches dynamic gamification state for a user.
 */
export async function getUserGamificationStateAction(userId: string): Promise<GamificationState> {
  // Sandbox mockup database simulation
  return {
    xp: 1240,
    level: calculateLevel(1240),
    streak: 4,
    contributionScore: 92,
    creatorScore: 78,
    badges: ['open_source_contributor', 'ai_wizard', 'streak_master']
  };
}
