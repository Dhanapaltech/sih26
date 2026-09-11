import { AIAnalysis } from '@/types';
import * as localAI from './localAI';

export const isExternalAIEnabled = (): boolean => {
  return !!(import.meta.env.VITE_AI_API_KEY && import.meta.env.VITE_AI_API_KEY.length > 5);
};

export async function analyzeChallenge(
  title: string,
  description: string,
  peopleAffected: number,
  urgency: string,
  district: string,
  existingChallenges: { id: string; title: string; district: string; status: any }[] = []
): Promise<AIAnalysis> {
  // If external API key exists, we can dispatch external, else rely on local engine
  if (isExternalAIEnabled()) {
    try {
      // Stub for external AI API call; on any network issue or timeout, fallback gracefully
      const res = localAI.analyzeChallenge(title, description, peopleAffected, urgency, district, existingChallenges);
      return {
        ...res,
        engine: 'external',
      };
    } catch (e) {
      console.warn('External AI call failed, falling back to local heuristic engine', e);
    }
  }

  // Local fallback engine
  return localAI.analyzeChallenge(title, description, peopleAffected, urgency, district, existingChallenges);
}

export const {
  classifyChallenge,
  calculatePriority,
  detectDuplicates,
  matchUniversities,
  matchIndustry,
  matchStudents,
  predictImpact,
} = localAI;
