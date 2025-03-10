import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivityTypeLabel } from "@/lib/activityTypes";
import { formatDateTime } from "@/lib/utils";
import { FileIcon, ImageIcon, FileTextIcon, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";

interface ActivityDetailModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onEdit: () => void;
}

export default function ActivityDetailModal({ 
  isOpen, 
  activity, 
  onClose,
  onEdit 
}: ActivityDetailModalProps) {
  // Fetch user data (for displaying name)
  const { data: userData } = useQuery({
    queryKey: activity?.userId ? [`/api/users/${activity.userId}`] : null,
    enabled: !!activity?.userId
  });

  if (!activity) return null;

  // Get icon for file type
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileIcon className="h-4 w-4 mr-2 text-red-500" />;
    if (type.includes('image')) return <ImageIcon className="h-4 w-4 mr-2 text-blue-500" />;
    return <FileTextIcon className="h-4 w-4 mr-2 text-gray-500" />;
  };

  // Get activity type color
  const getTypeColor = (type: string) => {
    const typeColorMap: Record<string, string> = {
      'training': 'bg-blue-100 text-blue-800',
      'support': 'bg-green-100 text-green-800',
      'publication': 'bg-amber-100 text-amber-800',
      'event': 'bg-purple-100 text-purple-800',
      'travel': 'bg-indigo-100 text-indigo-800',
      'course': 'bg-cyan-100 text-cyan-800',
      'interview': 'bg-pink-100 text-pink-800',
      'ombudsman': 'bg-rose-100 text-rose-800',
      'communication': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return typeColorMap[type] || 'bg-gray-100 text-gray-800';
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes da Atividade
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-start">
            <Badge className={getTypeColor(activity.type)}>
              {getActivityTypeLabel(activity.type)}
            </Badge>
            <span className="text-sm text-gray-500">
              {formatDateTime(activity.date)}
            </span>
          </div>
          
          <h4 className="text-base font-medium text-gray-900 mt-2">
            {activity.description}
          </h4>
          
          {activity.municipalities && activity.municipalities.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700">Municípios envolvidos:</h5>
              <div className="flex flex-wrap gap-1 mt-1">
                {activity.municipalities.map((municipality, index) => (
                  <Badge key={index} variant="outline" className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                    {municipality}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {activity.files && activity.files.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700">Anexos:</h5>
              <ul className="mt-1 space-y-1">
                {activity.files.map((file, index) => (
                  <li key={index} className="flex items-center text-sm text-primary-600 hover:text-primary-800">
                    {getFileIcon(file.type)}
                    <a href="#" className="truncate">{file.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activity.observations && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700">Observações:</h5>
              <p className="text-sm text-gray-600 mt-1">
                {activity.observations}
              </p>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-xs">
                    {userData?.name ? getUserInitials(userData.name) : 'UN'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {userData?.name || "Usuário"}
                </p>
                <p className="text-xs text-gray-500">
                  Registrado em {formatDateTime(activity.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onEdit}
            className="mr-2"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
