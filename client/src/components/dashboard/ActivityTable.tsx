import { useState } from "react";
import { Eye, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import ActivityForm from "@/components/forms/ActivityForm";
import ActivityDetailModal from "@/components/modals/ActivityDetailModal";
import { useToast } from "@/hooks/use-toast";
import { getActivityTypeLabel } from "@/lib/activityTypes";
import { Activity } from "@shared/schema";

interface ActivityTableProps {
  isLoading: boolean;
  data?: Activity[];
  isManager: boolean;
}

export default function ActivityTable({ 
  isLoading, 
  data = [], 
  isManager 
}: ActivityTableProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [page, setPage] = useState(1);
  const activitiesPerPage = 5;

  const handleOpenForm = (activity?: Activity) => {
    if (activity) {
      setSelectedActivity(activity);
    } else {
      setSelectedActivity(null);
    }
    setIsFormOpen(true);
  };

  const handleOpenDetail = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailOpen(true);
  };

  const handleCloseForm = (saved: boolean) => {
    setIsFormOpen(false);
    if (saved) {
      toast({
        title: "Sucesso",
        description: selectedActivity 
          ? "Atividade atualizada com sucesso." 
          : "Atividade cadastrada com sucesso.",
      });
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculate pagination
  const totalPages = Math.ceil(data.length / activitiesPerPage);
  const paginatedActivities = data.slice(
    (page - 1) * activitiesPerPage,
    page * activitiesPerPage
  );

  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are less than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Add middle pages
      const leftBound = Math.max(2, page - 1);
      const rightBound = Math.min(totalPages - 1, page + 1);
      
      if (leftBound > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = leftBound; i <= rightBound; i++) {
        pageNumbers.push(i);
      }
      
      if (rightBound < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Atividades Recentes</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Últimas atividades registradas pelos servidores.
            </p>
          </div>
          <Button
            onClick={() => handleOpenForm()}
            className="mt-3 sm:mt-0 inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
        
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[120px]">Data</TableHead>
                  <TableHead className="w-[150px]">Servidor</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedActivities.length > 0 ? (
                  // Activity data
                  paginatedActivities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getActivityTypeLabel(activity.type)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <div className="text-sm text-gray-900 truncate">
                          {activity.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {activity.userName || "Usuário"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <button 
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => handleOpenDetail(activity)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {/* Only show edit button for own activities or admin */}
                          {(!isManager || activity.isOwner) && (
                            <button 
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => handleOpenForm(activity)}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  // No data
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      Nenhuma atividade encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(page - 1) * activitiesPerPage + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(page * activitiesPerPage, data.length)}
                    </span>{' '}
                    de <span className="font-medium">{data.length}</span> resultados
                  </p>
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {generatePageNumbers().map((pageNum, index) => (
                      <PaginationItem key={index}>
                        {pageNum === '...' ? (
                          <span className="px-4 py-2">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => setPage(Number(pageNum))}
                            isActive={page === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              
              {/* Mobile pagination */}
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Activity form modal */}
      <ActivityForm 
        isOpen={isFormOpen}
        activity={selectedActivity}
        onClose={handleCloseForm}
      />
      
      {/* Activity detail modal */}
      <ActivityDetailModal 
        isOpen={isDetailOpen}
        activity={selectedActivity}
        onClose={() => setIsDetailOpen(false)}
        onEdit={() => {
          setIsDetailOpen(false);
          handleOpenForm(selectedActivity!);
        }}
      />
    </>
  );
}
