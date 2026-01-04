
export interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  perspective: string;
  systemPrompt: string;
}

export interface Comment {
  id: string;
  personaId: string;
  name: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
  personas: AIPersona[];
  tags?: string[];
  status?: 'HOT' | 'LIVE NOW';
}

export type AppState = 'CHOOSING_GROUP' | 'STREAMING';
