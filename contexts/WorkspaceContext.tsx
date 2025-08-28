'use client';
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Types
export type TeamContext = {
  type: 'team';
  id: number;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
};
export type PersonalContext = { type: 'personal'; name: string };
export type ActiveContext = TeamContext | PersonalContext;

interface WorkspaceContextProps {
  activeContext: ActiveContext | null;
  availableContexts: TeamContext[];
  switchContext: (context: ActiveContext) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  const [availableContexts, setAvailableContexts] = useState<TeamContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ne fetcher les contextes que si l'utilisateur est authentifié
    if (status === 'authenticated') {
      const fetchMemberships = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/v1/user/memberships'); // L'API que nous avons définie
          if (!response.ok) throw new Error('Failed to fetch memberships');
          const result = await response.json();
          
          if (result.success) {
            setAvailableContexts(result.data.teams);
            // On active l'espace perso par défaut
            setActiveContext(result.data.personal);
          }
        } catch (error) {
          console.error(error);
          // En cas d'erreur, on active quand même le perso
          setActiveContext({ type: 'personal', name: 'Espace Personnel' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchMemberships();
    } else if (status === 'unauthenticated') {
        setIsLoading(false);
    }
  }, [status]);

  const switchContext = (context: ActiveContext) => {
    setActiveContext(context);
  };

  return (
    <WorkspaceContext.Provider value={{ activeContext, availableContexts, switchContext, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};