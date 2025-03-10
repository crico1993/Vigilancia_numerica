import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getRoleLabel } from '@/lib/utils';
import { UserRole } from '@shared/schema';
import { UserPlus, Edit, Lock, UserCog, Loader2 } from 'lucide-react';

// User form schema
const userFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }).optional(),
  role: z.string(),
  active: z.boolean().default(true),
});

// Password reset schema
const passwordResetSchema = z.object({
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userFormSchema>;
type PasswordResetValues = z.infer<typeof passwordResetSchema>;

export default function Users() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Form for new/edit user
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.SERVER,
      active: true,
    },
  });
  
  // Form for password reset
  const passwordResetForm = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      return apiRequest('POST', '/api/users', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsNewUserDialogOpen(false);
      userForm.reset();
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao criar usuário: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const { password, ...data } = values;
      // Only include password if it's been set
      const payload = password ? values : data;
      return apiRequest('PATCH', `/api/users/${selectedUser?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsEditUserDialogOpen(false);
      toast({
        title: 'Usuário atualizado',
        description: 'O usuário foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar usuário: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (values: PasswordResetValues) => {
      return apiRequest('POST', `/api/users/reset-password/${selectedUser?.id}`, {
        password: values.password,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsResetPasswordDialogOpen(false);
      passwordResetForm.reset();
      toast({
        title: 'Senha redefinida',
        description: 'A senha do usuário foi redefinida com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao redefinir senha: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle user active status
  const toggleUserActive = async (user: any) => {
    try {
      await apiRequest('PATCH', `/api/users/${user.id}`, {
        active: !user.active,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: user.active ? 'Usuário desativado' : 'Usuário ativado',
        description: `O usuário ${user.name} foi ${user.active ? 'desativado' : 'ativado'} com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: `Falha ao alterar status do usuário: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  // Handle opening the edit user dialog
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    userForm.reset({
      name: user.name,
      email: user.email,
      password: '', // Don't set password when editing
      role: user.role,
      active: user.active,
    });
    setIsEditUserDialogOpen(true);
  };
  
  // Handle opening the reset password dialog
  const handleResetPassword = (user: any) => {
    setSelectedUser(user);
    passwordResetForm.reset();
    setIsResetPasswordDialogOpen(true);
  };
  
  // Submit handlers
  const onCreateUser = (values: UserFormValues) => {
    createUserMutation.mutate(values);
  };
  
  const onUpdateUser = (values: UserFormValues) => {
    updateUserMutation.mutate(values);
  };
  
  const onResetPassword = (values: PasswordResetValues) => {
    resetPasswordMutation.mutate(values);
  };

  return (
    <MainLayout title="Gerenciamento de Usuários">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Usuários do Sistema</CardTitle>
            <CardDescription>
              Gerencie os usuários que têm acesso à plataforma.
            </CardDescription>
          </div>
          <Button onClick={() => {
            userForm.reset();
            setIsNewUserDialogOpen(true);
          }}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : users?.length > 0 ? (
                  users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            user.role === UserRole.ADMIN 
                              ? 'bg-red-100 text-red-800 hover:bg-red-100' 
                              : user.role === UserRole.MANAGER 
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' 
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                          }
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={user.active} 
                          onCheckedChange={() => toggleUserActive(user)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleResetPassword(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New User Dialog */}
      <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para criar um novo usuário no sistema.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onCreateUser)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Gestor</SelectItem>
                        <SelectItem value={UserRole.SERVER}>Servidor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Ativo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Determina se o usuário pode acessar o sistema
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewUserDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Usuário
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUpdateUser)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@exemplo.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a função" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Gestor</SelectItem>
                        <SelectItem value={UserRole.SERVER}>Servidor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Ativo</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Determina se o usuário pode acessar o sistema
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditUserDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Atualizar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordResetForm}>
            <form onSubmit={passwordResetForm.handleSubmit(onResetPassword)} className="space-y-4">
              <FormField
                control={passwordResetForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={passwordResetForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme a nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPasswordDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Redefinir Senha
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
