/**
 * CivicSphere AI Type Definitions
 */

export type SeverityType = 'Low' | 'Medium' | 'High' | 'Emergency';
export type StatusType = 'Submitted' | 'In Progress' | 'Resolved' | 'Rejected';

export interface LocationInfo {
  address: string;
  lat: number;
  lng: number;
}

export interface Comment {
  id: string;
  author: string;
  role: 'citizen' | 'official' | 'system';
  text: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  updatedBy: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: SeverityType;
  status: StatusType;
  priorityScore: number; // 0-100
  ward: string;
  reporterName: string;
  reporterEmail: string;
  image?: string; // base64 representation or URL
  createdAt: string;
  assignedDepartment: string;
  location: LocationInfo;
  comments: Comment[];
  timeline: TimelineEvent[];
  isDuplicate: boolean;
  duplicateOf: string | null;
  duplicateCount: number;
  citizenReputationScore: number;
  resolutionDetails?: string;
  aiConfidence: number; // 0-100
  hazards: string[];
  citizenAdvisory?: string;
  governmentInsights?: string;
  emergencyEscalation: boolean;
  impactEstimation?: string; // e.g. "50+ households affected"
}

export interface AIAnalyticsSummary {
  communityHealthScore: number; // 0-100
  trendPrediction: string;
  categoryAnalysis: { category: string; count: number; risk: string }[];
  departmentLoad: { department: string; openCount: number; loadFactor: 'Low' | 'Medium' | 'High' }[];
  highRiskAreas: { ward: string; riskScore: number; primaryHazard: string }[];
  recommendations: string[];
  weeklyPredictions: { name: string; expectedIssues: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
