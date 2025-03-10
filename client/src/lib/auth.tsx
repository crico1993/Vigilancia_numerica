import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from './queryClient';
import { Select, SelectItem } from '@radix-ui/react-select'; // Importando o Select e SelectItem

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  approved: boolean; // Added approved field
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in on component mount
    const checkAuth = async () => {
      try {
        const user = await apiRequest('GET', '/api/auth/me');
        setUser(user);
      } catch (error: any) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, remember: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Awaiting approval") { //Check for specific approval pending message
          throw new Error("Awaiting approval");
        }
        throw new Error(errorData.message || response.statusText);
      }

      const userData = await response.json();
      setUser(userData);
      console.log('Login realizado com sucesso:', userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.message === "Awaiting approval") {
        toast({ title: "Aprovação Pendente", description: "Seu cadastro está aguardando aprovação.", variant: "warning" });
      } else {
        toast({ title: "Erro no login", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error: any) {
      console.error('Logout failed:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
