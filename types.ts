

export type Role = 'user' | 'proponent' | 'opponent' | 'verifier' | 'moderator';

export interface GroundingMetadata {
  searchEntryPoint?: { renderedContent?: string };
  groundingChunks?: Array<{
    web?: { uri?: string; title?: string };
  }>;
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // Base64 string
}

export interface Message {
  id: string;
  role: Role;
  author: string;
  content: string;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
}

export interface ProductContext {
  productName: string;
  productDescription: string;
  files?: Attachment[];
}

export interface ProponentPersona {
  id: string;
  name: string;
  description: string;
  style: string;
  associatedScenarios?: string[]; // If undefined, available in all "business" type scenarios
}

export interface OpponentPersona {
  id: string;
  name: string;
  description: string;
  style: string;
  category: 'internal' | 'external';
  associatedScenarios?: string[]; // If undefined, available in all "business" type scenarios
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'anthropic';
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  aggressionLevel: 'low' | 'medium' | 'high'; // influences prompt tone
  contextPlaceholder: string; // Dynamic placeholder text for the input box
}

export interface DebateConfig {
  rounds: number;
  scenario: Scenario;
  proponent: ProponentPersona;
  opponent: OpponentPersona;
  model: AIModel;
  apiKey?: string;
}

export interface BattleCard {
  strengths: string[];
  weaknesses: string[];
  counterArguments: string[];
  actionPoints: string[]; 
}

export interface AnalysisResult {
  gaps: string[];
  viabilityScore: number;
  viabilityReasoning: string;
  battleCard: BattleCard;
}

export enum AppStage {
  SETUP = 'SETUP',
  DEBATING = 'DEBATING',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE'
}

export interface SavedSession {
  id: string;
  timestamp: number;
  productName: string;
  opponentName: string;
  context: ProductContext;
  config: DebateConfig;
  messages: Message[];
  analysis: AnalysisResult | null;
}

export interface FeedbackData {
  id: string;
  timestamp: number;
  rating: number;
  recommend: number;
  answersNeeded: string;
  testScenario: string;
  accuracy: string;
  scenariosUsed: string[];
  frequency: string;
  likedMost: string;
  improvements: string;
}