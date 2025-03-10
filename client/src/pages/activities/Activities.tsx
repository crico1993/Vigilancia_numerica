import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import ActivityForm from '@/components/forms/ActivityForm';
import ActivityDetailModal from '@/components/modals/ActivityDetailModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, PlusCircle, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getActivityTypeLabel, getActivityTypeColor, getActivityTypeOptions } from '@/lib/activityTypes';
import { formatDate } from '@/lib/utils';
import { Activity } from '@shared/schema';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Activities() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityType, setActivityType] = useState('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const activitiesPerPage = 10;

  // Fetch activities
  const { data: activitiesData, isLoading, refetch } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Filter activities based on current filters
  const filterActivities = (activities: Activity[] = []) => {
    if (!activities.length) return [];

    return activities.filter((activity) => {
      // Filter by tab (My Activities or All)
      if (currentTab === 'mine' && activity.userId !== user?.id) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !activity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by activity type
      if (activityType !== 'all' && activity.type !== activityType) {
        return false;
      }

      // Filter by date range
      if (fromDate) {
        const activityDate = new Date(activity.date);
        if (activityDate < fromDate) {
          return false;
        }
      }

      if (toDate) {
        const activityDate = new Date(activity.date);
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (activityDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  };

  const filteredActivities = filterActivities(activitiesData);
  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage);
  const currentActivities = filteredActivities.slice(
    (page - 1) * activitiesPerPage,
    page * activitiesPerPage
  );

  // Handle opening the activity form
  const handleOpenForm = (activity?: Activity) => {
    if (activity) {
      setSelectedActivity(activity);
    } else {
      setSelectedActivity(null);
    }
    setIsFormOpen(true);
  };

  // Handle opening the activity detail modal
  const handleViewActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailOpen(true);
  };

  // Handle form close
  const handleCloseForm = (saved: boolean) => {
    setIsFormOpen(false);
    if (saved) {
      refetch();
      toast({
        title: 'Sucesso',
        description: selectedActivity
          ? 'Atividade atualizada com sucesso.'
          : 'Atividade cadastrada com sucesso.',
      });
    }
  };

  // Handle activity deletion
  const handleDeleteActivity = async (activity: Activity) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await apiRequest('DELETE', `/api/activities/${activity.id}`, {});
        refetch();
        toast({
          title: 'Sucesso',
          description: 'Atividade excluída com sucesso.',
        });
      } catch (error) {
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a atividade.',
          variant: 'destructive',
        });
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setActivityType('all');
    setFromDate(undefined);
    setToDate(undefined);
    setPage(1);
  };

  // Generate page numbers
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
    <MainLayout title="Atividades">
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-2 md:space-y-0">
          <CardTitle>Gerenciamento de Atividades</CardTitle>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas as Atividades</TabsTrigger>
              <TabsTrigger value="mine">Minhas Atividades</TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar atividades..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select value={activityType} onValueChange={setActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de atividade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {getActivityTypeOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, 'PPP', { locale: ptBR }) : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, 'PPP', { locale: ptBR }) : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reset Filters Button */}
            {(searchTerm || activityType !== 'all' || fromDate || toDate) && (
              <div className="flex justify-end mb-4">
                <Button variant="outline" onClick={resetFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}

            <TabsContent value="all" className="mt-0">
              <div className="border rounded-md">
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
                    ) : currentActivities.length > 0 ? (
                      currentActivities.map((activity) => (
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
                                onClick={() => handleViewActivity(activity)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {(activity.userId === user?.id || user?.role === 'admin') && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleOpenForm(activity)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteActivity(activity)}
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
                      Mostrando <strong>{(page - 1) * activitiesPerPage + 1}</strong> a <strong>{Math.min(page * activitiesPerPage, filteredActivities.length)}</strong> de{' '}
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
            </TabsContent>

            <TabsContent value="mine" className="mt-0">
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[120px]">Data</TableHead>
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
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        </TableRow>
                      ))
                    ) : currentActivities.length > 0 ? (
                      currentActivities.map((activity) => (
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
                          <TableCell>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewActivity(activity)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleOpenForm(activity)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteActivity(activity)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      Mostrando <strong>{(page - 1) * activitiesPerPage + 1}</strong> a <strong>{Math.min(page * activitiesPerPage, filteredActivities.length)}</strong> de{' '}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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
    </MainLayout>
  );
}
