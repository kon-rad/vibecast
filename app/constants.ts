
import { AIPersona, Group } from './types';
import { PERSONA_DATA } from './prompts';

// Helper to get personas by array of IDs
const getPersonas = (ids: string[]): AIPersona[] => {
  return ids.map(id => {
    const data = (PERSONA_DATA as any)[id];
    if (!data) return null;
    return {
      id,
      name: data.name,
      role: data.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      bio: `${data.backstory} Goal: ${data.goal}`,
      perspective: data.perspective,
      systemPrompt: data.systemInstruction
    };
  }).filter(p => p !== null) as AIPersona[];
};

export const GROUPS: Group[] = [
  {
    id: 'network-school',
    name: 'Network School',
    description: 'The founders and builders of the new Network State society.',
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['balaji', 'jackson', 'joey']),
    tags: ['Ruthless', 'Business', 'Critical'],
    status: 'HOT'
  },
  {
    id: 'tech-titans',
    name: 'Tech Titans',
    description: 'Legends of Silicon Valley who built the modern world.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['steve_jobs', 'mark_zuckerberg', 'john_carmack', 'jeff_bezos', 'sergei_brin']),
    tags: ['Innovation', 'Tech', 'Visionary'],
    status: 'LIVE NOW'
  },
  {
    id: 'crypto-titans',
    name: 'Crypto Titans',
    description: 'The pioneers of decentralization and web3.',
    image: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['satoshi', 'vitalik', 'david_chaum']),
    tags: ['Web3', 'Decentralized', 'Finance']
  },
  {
    id: 'indie-hackers',
    name: 'Indie Hackers',
    description: 'Solo founders shipping fast and profitable products.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['pieter_levels', 'arvid_kahl']),
    tags: ['SaaS', 'Bootstrapped', 'Fast']
  },
  {
    id: 'fitness-coaches',
    name: 'Fitness Coaches',
    description: 'Mentors for your physical and mental toughness.',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['david_goggins', 'yoga_yara']),
    tags: ['Health', 'Discipline', 'Strength']
  },
  {
    id: 'public-speakers',
    name: 'Public Speakers',
    description: 'Masters of influence, stage presence, and vulnerability.',
    image: 'https://images.unsplash.com/photo-1475721027767-f42a66030cc7?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['tony_robbins', 'brene_brown']),
    tags: ['Influence', 'Storytelling', 'Stage']
  },
  {
    id: 'positive-thinkers',
    name: 'Positive Thinkers',
    description: 'Guides for your spiritual and mental alignment.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
    personas: getPersonas(['deepak_chopra', 'yoga_yara']), // Reusing Yara here too as fit
    tags: ['Mindfulness', 'Spirituality', 'Zen']
  }
];

// Keep PERSONAS export for backward compatibility or general use if needed, 
// containing all defined personas
export const PERSONAS: AIPersona[] = Object.keys(PERSONA_DATA).map(key => {
  const data = (PERSONA_DATA as any)[key];
  return {
    id: key,
    name: data.name,
    role: data.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
    bio: `${data.backstory} Goal: ${data.goal}`,
    perspective: data.perspective,
    systemPrompt: data.systemInstruction
  };
});
