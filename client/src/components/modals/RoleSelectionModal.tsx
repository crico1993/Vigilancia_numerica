import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Settings } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onSelectManagerMode: () => void;
  onSelectServerMode: () => void;
}

export default function RoleSelectionModal({
  isOpen,
  onSelectManagerMode,
  onSelectServerMode
}: RoleSelectionModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Selecione seu modo de acesso</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col space-y-3">
          <p className="text-sm text-center text-gray-500">
            Você possui acesso a dois modos. Escolha como deseja acessar o sistema:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Button 
              onClick={onSelectManagerMode}
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <Settings className="h-8 w-8" />
              <span>Modo Gestor</span>
              <span className="text-xs text-center">Acesso à visão consolidada e análise de dados</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={onSelectServerMode}
              className="h-24 flex flex-col items-center justify-center space-y-2"
            >
              <User className="h-8 w-8" />
              <span>Modo Servidor</span>
              <span className="text-xs text-center">Registrar e gerenciar minhas atividades</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
