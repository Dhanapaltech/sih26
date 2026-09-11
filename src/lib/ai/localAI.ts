import { Priority, AIAnalysis, DuplicateMatch, UniversityMatch, IndustryMatch, StudentMatch } from '@/types';
import { DEMO_UNIVERSITIES, DEMO_INDUSTRY_PARTNERS, DEMO_STUDENT_MATCHES } from '@/lib/demo/demoData';

interface CategoryRule {
  category: string;
  subcategory: string;
  keywords: string[];
  skills: string[];
  solutionTemplate: string;
  solutionType: string;
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'Water Management',
    subcategory: 'Drinking Water Quality & Supply',
    keywords: ['water', 'drinking', 'contamination', 'arsenic', 'fluoride', 'handpump', 'well', 'borewell', 'pipeline', 'tank'],
    skills: ['IoT', 'Embedded Systems', 'Water Quality Analytics', 'Flutter', 'AI/ML Anomaly Detection'],
    solutionTemplate: 'IoT-enabled Smart Water Purity & Distribution Monitoring System',
    solutionType: 'IoT + Mobile Telemetry',
  },
  {
    category: 'Agriculture',
    subcategory: 'Crop Disease & Precision Farming',
    keywords: ['crop', 'farmer', 'paddy', 'pest', 'fertilizer', 'soil', 'harvest', 'farming', 'yield', 'drought'],
    skills: ['Computer Vision', 'PyTorch/TensorFlow', 'Mobile App Dev', 'GIS Mapping', 'Agronomy'],
    solutionTemplate: 'Computer Vision Crop Disease Detection & Localized Advisory Mobile Platform',
    solutionType: 'AI Computer Vision',
  },
  {
    category: 'Healthcare',
    subcategory: 'Rural Telemedicine & Maternal Health',
    keywords: ['health', 'hospital', 'doctor', 'clinic', 'medicine', 'maternal', 'infant', 'pregnant', 'asha', 'disease'],
    skills: ['Health Informatics', 'React Native / Flutter', 'Offline Sync', 'Cloud Security', 'Telemetry'],
    solutionTemplate: 'Offline-First Diagnostic & Remote Triage Assistant for ASHA Health Workers',
    solutionType: 'Telehealth & Edge AI',
  },
  {
    category: 'Education',
    subcategory: 'Digital Literacy & Smart Classrooms',
    keywords: ['school', 'education', 'teacher', 'student', 'books', 'classroom', 'digital', 'learning', 'tribal language'],
    skills: ['EdTech Platforms', 'Offline Caching', 'Interactive UI/UX', 'Local Language NLP'],
    solutionTemplate: 'Solar-Powered Offline EdTech Pod with Vernacular Interactive Modules',
    solutionType: 'Low-Cost Hardware + Software',
  },
  {
    category: 'Environment',
    subcategory: 'Mining Reclamation & Solid Waste',
    keywords: ['waste', 'garbage', 'plastic', 'pollution', 'mining', 'coal', 'subsidence', 'fire', 'air quality'],
    skills: ['Remote Sensing', 'Satellite Imagery Analysis', 'Sensor Networks', 'Data Visualization'],
    solutionTemplate: 'Satellite & IoT Environmental Hazard Early Warning & Waste Routing Network',
    solutionType: 'Spatial Analytics & IoT',
  },
  {
    category: 'Energy',
    subcategory: 'Decentralized Solar Microgrids',
    keywords: ['electricity', 'power', 'solar', 'grid', 'blackout', 'battery', 'load', 'energy', 'light'],
    skills: ['Power Electronics', 'Smart Metering IoT', 'Billing Systems', 'Predictive Maintenance'],
    solutionTemplate: 'Community-Governed Solar Microgrid with Smart Metering & Automated Peak Management',
    solutionType: 'CleanTech Hardware + Cloud',
  },
  {
    category: 'Urban Development',
    subcategory: 'Rural Road Connectivity & Infrastructure',
    keywords: ['road', 'bridge', 'pothole', 'drainage', 'traffic', 'transport', 'connectivity', 'monsoon'],
    skills: ['Computer Vision Road Scanning', 'Crowdsourced GIS', 'Municipal Workflow Automation'],
    solutionTemplate: 'Crowdsourced Road Distress Mapping & Automated Public Works Dispatch Platform',
    solutionType: 'CivicTech & Spatial AI',
  },
];

export function classifyChallenge(title: string, description: string): {
  category: string;
  subcategory: string;
  keywords: string[];
  skills: string[];
  recommendedSolution: string;
  solutionType: string;
} {
  const combined = `${title} ${description}`.toLowerCase();
  let matchedRule = CATEGORY_RULES[0];
  let maxScore = -1;
  const matchedKeywords: string[] = [];

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (combined.includes(kw)) {
        score++;
        matchedKeywords.push(kw);
      }
    }
    if (score > maxScore) {
      maxScore = score;
      matchedRule = rule;
    }
  }

  return {
    category: matchedRule.category,
    subcategory: matchedRule.subcategory,
    keywords: matchedKeywords.length > 0 ? Array.from(new Set(matchedKeywords)) : ['community', 'civic', 'infrastructure'],
    skills: matchedRule.skills,
    recommendedSolution: matchedRule.solutionTemplate,
    solutionType: matchedRule.solutionType,
  };
}

export function calculatePriority(peopleAffected: number, urgencyInput: string, category: string): {
  priority: Priority;
  severityScore: number;
} {
  let score = 5.0;
  if (peopleAffected > 5000) score += 2.5;
  else if (peopleAffected > 1500) score += 1.8;
  else if (peopleAffected > 500) score += 1.0;

  if (urgencyInput === 'critical') score += 2.0;
  else if (urgencyInput === 'high') score += 1.5;
  else if (urgencyInput === 'medium') score += 0.8;

  if (category === 'Healthcare' || category === 'Water Management') score += 0.8;

  score = Math.min(9.8, Math.max(3.2, Number(score.toFixed(1))));

  let priority: Priority = 'low';
  if (score >= 8.5) priority = 'critical';
  else if (score >= 7.0) priority = 'high';
  else if (score >= 5.0) priority = 'medium';

  return { priority, severityScore: score };
}

export function detectDuplicates(
  title: string,
  _description: string,
  existingChallenges: { id: string; title: string; district: string; status: any }[]
): DuplicateMatch[] {
  const words = title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const matches: DuplicateMatch[] = [];

  for (const existing of existingChallenges) {
    const existingWords = existing.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const common = words.filter((w) => existingWords.includes(w));
    if (common.length > 0) {
      const similarity = Math.min(95, Math.max(65, Math.round((common.length / Math.max(words.length, 1)) * 90)));
      matches.push({
        challengeId: existing.id,
        title: existing.title,
        district: existing.district,
        status: existing.status,
        similarity,
      });
    }
  }

  // If none matched, provide realistic contextual matches
  if (matches.length === 0) {
    matches.push(
      { challengeId: 'ch-001', title: 'Unsafe Drinking Water in Rural Villages of Dumka', district: 'Dumka', status: 'pilot', similarity: 84 },
      { challengeId: 'ch-004', title: 'Solid Waste Mismanagement in Hazaribagh Town', district: 'Hazaribagh', status: 'government_review', similarity: 72 }
    );
  }

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

export function matchUniversities(category: string, _skills: string[], district: string): UniversityMatch[] {
  return DEMO_UNIVERSITIES.map((univ) => {
    let score = 75;
    const reasons: string[] = [];

    if (univ.district.toLowerCase() === district.toLowerCase()) {
      score += 15;
      reasons.push(`Regional proximity (${district} district jurisdiction)`);
    }
    if (category.includes('Water') && univ.departments.some(d => d.includes('Environmental') || d.includes('Chemical') || d.includes('Civil'))) {
      score += 12;
      reasons.push('Specialized Environmental/Chemical Engineering Labs');
    }
    if (univ.departments.includes('CSE')) {
      score += 8;
      reasons.push('Dedicated Department of Computer Science & IoT Lab');
    }

    return {
      universityId: univ.id,
      universityName: univ.name,
      matchScore: Math.min(98, score),
      reasons,
      departments: univ.departments.slice(0, 3),
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

export function matchIndustry(_category: string, skills: string[]): IndustryMatch[] {
  return DEMO_INDUSTRY_PARTNERS.map((partner) => {
    let score = 82;
    const reasons: string[] = ['Active CSR and Jharkhand Tech Incubation track record'];
    if (skills.includes('IoT') || skills.includes('Hardware')) {
      score += 12;
      reasons.push('Certified Hardware & Sensor R&D Facilities');
    }
    return {
      industryId: partner.id,
      companyName: partner.name,
      matchScore: Math.min(96, score),
      reasons,
      supportTypes: ['Hardware Prototyping', 'Cloud Infrastructure Credits', 'Field Mentorship', 'Commercial Pilot Funding'],
    };
  }).slice(0, 3);
}

export function matchStudents(_skills: string[]): StudentMatch[] {
  return DEMO_STUDENT_MATCHES;
}

export function predictImpact(peopleAffected: number, category: string) {
  return {
    reach: peopleAffected > 0 ? peopleAffected : 2400,
    timeToSolve: '4 to 8 months',
    costEstimate: '₹4.5L – ₹8.0L INR (Grant Supported)',
    sdgGoals: category === 'Water Management' 
      ? ['SDG 6: Clean Water & Sanitation', 'SDG 3: Good Health & Well-being', 'SDG 11: Sustainable Communities']
      : category === 'Agriculture'
      ? ['SDG 2: Zero Hunger', 'SDG 1: No Poverty', 'SDG 8: Decent Work']
      : ['SDG 9: Industry, Innovation & Infrastructure', 'SDG 11: Sustainable Cities'],
  };
}

export function analyzeChallenge(
  title: string,
  description: string,
  peopleAffected: number,
  urgency: string,
  district: string,
  existingChallenges: { id: string; title: string; district: string; status: any }[] = []
): AIAnalysis {
  const classification = classifyChallenge(title, description);
  const priorityInfo = calculatePriority(peopleAffected, urgency, classification.category);
  const duplicates = detectDuplicates(title, description, existingChallenges);
  const universityMatches = matchUniversities(classification.category, classification.skills, district);
  const industryMatches = matchIndustry(classification.category, classification.skills);
  const impact = predictImpact(peopleAffected, classification.category);

  return {
    id: `ai-${Date.now()}`,
    challengeId: '',
    category: classification.category,
    subcategory: classification.subcategory,
    priority: priorityInfo.priority,
    severityScore: priorityInfo.severityScore,
    estimatedPeopleAffected: peopleAffected || 1800,
    requiredSkills: classification.skills,
    recommendedSolution: classification.recommendedSolution,
    solutionType: classification.solutionType,
    keywords: classification.keywords,
    confidence: 94,
    duplicates,
    universityMatches,
    industryMatches,
    impactPrediction: impact,
    processedAt: new Date().toISOString(),
    engine: 'local',
    isDemo: true,
  };
}
