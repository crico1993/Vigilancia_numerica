import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { getActivityTypeLabel, getActivityTypeColor } from '@/lib/activityTypes';
import { formatDate } from '@/lib/utils';
import { Activity } from '@shared/schema';
import { useAuth } from '@/lib/auth';

interface ActivityListProps {
  filterType?: string;
  filterUserId?: number;
  filterDateStart?: Date;
  filterDateEnd?: Date;
  onView: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export default function ActivityList({
  filterType,
  filterUserId,
  filterDateStart,
  filterDateEnd,
  onView,
  onEdit,
  onDelete
}: ActivityListProps) {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const activitiesPerPage = 10;
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch activities
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activities'],
    onError: (error: any) => {
      console.error("Error fetching activities:", error);
      setFetchError("Ocorreu um erro ao carregar as atividades.");
    }
  });
  
  // Filter activities
  const filteredActivities = activities ? activities.filter((activity: Activity) => {
    // Filter by type
    if (filterType && filterType !== 'all' && activity.type !== filterType) {
      return false;
    }
    
    // Filter by user ID
    if (filterUserId && activity.userId !== filterUserId) {
      return false;
    }
    
    // Filter by date range
    if (filterDateStart || filterDateEnd) {
      const activityDate = new Date(activity.date);
      
      if (filterDateStart && activityDate < filterDateStart) {
        return false;
      }
      
      if (filterDateEnd) {
        const endOfDay = new Date(filterDateEnd);
        endOfDay.setHours(23, 59, 59, 999);
        if (activityDate > endOfDay) {
          return false;
        }
      }
    }
    
    return true;
  }) : [];
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const currentPageItems = filteredActivities.slice(
    (page - 1) * activitiesPerPage,
    page * activitiesPerPage
  );
  
  // Generate page numbers to display
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
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
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="border rounded-md">
      {fetchError && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {fetchError}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[120px]">Data</TableHead>
            <TableHead className="w-[150px]">Servidor</TableHead>
            <TableHead className="w-[120px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
              </TableRow>
            ))
          ) : currentPageItems.length > 0 ? (
            currentPageItems.map((activity: Activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge className={getActivityTypeColor(activity.type)}>
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-sm">
                  <span className="line-clamp-1">{activity.description}</span>
                </TableCell>
                <TableCell>{formatDate(activity.date)}</TableCell>
                <TableCell>{activity.userName || "Usuário"}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(activity)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(user?.role === 'admin' || activity.userId === user?.id) && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onDelete(activity)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                Nenhuma atividade encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <div className="text-sm text-muted-foreground">
            Mostrando <strong>{Math.min(filteredActivities.length, 1 + (page - 1) * activitiesPerPage)}</strong> a{' '}
            <strong>{Math.min(page * activitiesPerPage, filteredActivities.length)}</strong> de{' '}
            <strong>{filteredActivities.length}</strong> atividades
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
      )}
    </div>
  );
}
