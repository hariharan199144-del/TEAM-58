
export type Screen = 'auth' | 'dashboard' | 'upload' | 'record' | 'options' | 'loading' | 'results' | 'library' | 'profile';

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // stored locally for simulation
  provider: 'email' | 'google' | 'apple';
}

export interface GeneratedContent {
  id: string;
  title: string;
  date: string;
  summary: string[]; // Short Notes
  theses: string[]; // Core Arguments/Claims
  examples: string[];
  runningNotes: string;
  quiz: QuizItem[];
  audioDataUrl?: string; // Base64 Data URL for playback
  confidenceScore: number; // 0-100 Evaluation metric
  accuracyNote: string; // Guardrail explanation
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation: string;
}

export interface AppState {
  currentScreen: Screen;
  audioBlob: Blob | null;
  audioFileName: string | null;
  selectedOptions: ProcessingOptions;
  generatedContent: GeneratedContent | null;
  savedLibrary: GeneratedContent[];
}

export interface ProcessingOptions {
  shortNotes: boolean;
  theses: boolean;
  examples: boolean;
  quiz: boolean;
  runningNotes: boolean;
}

export const MOCK_LIBRARY: GeneratedContent[] = [
  {
    id: 'mock-1',
    title: 'Introduction to Quantum Physics',
    date: 'Oct 24, 2023',
    summary: ['Quantum entanglement explained', 'Schrodinger\'s cat thought experiment'],
    theses: [
        'Observation fundamentally alters the state of a quantum system.',
        'Particles can exist in multiple states simultaneously (superposition) until measured.',
        'Entanglement suggests non-local interaction between particles.'
    ],
    examples: ['MRI machines using spin', 'Transistors in computers'],
    runningNotes: 'Full lecture notes regarding the basics of quantum mechanics...',
    quiz: [],
    confidenceScore: 98,
    accuracyNote: 'Audio was clear and terminology was standard.'
  },
  {
    id: 'mock-2',
    title: 'Marketing Strategy 101',
    date: 'Nov 02, 2023',
    summary: ['The 4 Ps of Marketing', 'Target audience segmentation'],
    theses: [
        'Product differentiation is the primary driver of competitive advantage.',
        'Customer retention is cost-effective compared to new acquisition.',
        'Brand equity is built through consistent emotional messaging.'
    ],
    examples: ['Nike brand strategy', 'Apple ecosystem lock-in'],
    runningNotes: 'Detailed breakdown of marketing fundamentals...',
    quiz: [],
    confidenceScore: 95,
    accuracyNote: 'High confidence extraction.'
  }
];
