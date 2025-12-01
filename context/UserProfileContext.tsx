import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PersonaId = 'night_owl' | 'sprinter' | 'deep_diver' | 'light_reader';

export interface Persona {
  id: PersonaId;
  name: string;
  description: string;
  theme: string;
}

interface UserProfileContextType {
  persona: Persona;
  setPersona: (id: PersonaId) => void;
}

export const PERSONAS: Record<PersonaId, Persona> = {
  night_owl: { id: 'night_owl', name: 'Night Owl', description: 'Focus in the quiet hours', theme: 'indigo' },
  sprinter: { id: 'sprinter', name: 'Sprinter', description: 'Fast, intense sessions', theme: 'cyan' },
  deep_diver: { id: 'deep_diver', name: 'Deep Diver', description: 'Immersive learning', theme: 'slate' },
  light_reader: { id: 'light_reader', name: 'Light Reader', description: 'Casual, steady progress', theme: 'emerald' },
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentId, setCurrentId] = useState<PersonaId>('deep_diver');

  const setPersona = (id: PersonaId) => {
    setCurrentId(id);
  };

  return (
    <UserProfileContext.Provider value={{ persona: PERSONAS[currentId], setPersona }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};