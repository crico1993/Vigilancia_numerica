import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserRole } from '@shared/schema';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

// User form schema
const userFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }).optional(),
  role: z.string(),
  active: z.boolean().default(true),
  approved: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  id?: number;
}

export default function UserForm({ id }: UserFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const isEditMode = Boolean(id);
  
  // Form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: UserRole.SERVER,
      active: true,
      approved: false,
    },
  });

  interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    active: boolean;
    approved: boolean;
  }
  
  // Fetch user data if in edit mode
  const { data: userData, isLoading: isLoadingUser } = useQuery<UserData>({
    queryKey: ['/api/users', id],
    enabled: isEditMode,
  });

  // Populate form with user data when in edit mode
  useEffect(() => {
    if (isEditMode && userData) {
      const { name = '', email = '', role = UserRole.SERVER, active = true, approved = false } = userData;
      form.reset({
        name,
        email,
        password: '', // Don't set password when editing
        role,
        active,
        approved,
      });
    }
  }, [userData, isEditMode, form]);

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (values: UserFormValues) => {
      return apiRequest('POST', '/api/users', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.',
      });
      setLocation('/users');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Falha ao criar usuário: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const { password, ...data } = values;
      // Only include password if it's been set
      const payload = password ? values : data;
      return apiRequest('PATCH', `/api/users/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Usuário atualizado',
        description: 'O usuário foi atualizado com sucesso.',
      });
      setLocation('/users');
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar usuário: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Form submission
  const onSubmit = (values: UserFormValues) => {
    if (isEditMode) {
      updateUser.mutate(values);
    } else {
      createUser.mutate(values);
    }
  };

  // Loading state
  if (isEditMode && isLoadingUser) {
    return (
      <MainLayout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={isEditMode ? "Editar Usuário" : "Novo Usuário"}
      action={
        <Button variant="outline" onClick={() => setLocation('/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Editar Usuário" : "Criar Novo Usuário"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Atualize as informações do usuário."
              : "Preencha os dados abaixo para criar um novo usuário no sistema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditMode ? "Nova Senha (opcional)" : "Senha"}</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={isEditMode ? "Deixe em branco para manter a senha atual" : "Senha"} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                control={form.control}
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

              <FormField
                control={form.control}
                name="approved"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Usuário Aprovado</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Determina se o usuário foi aprovado pelo administrador
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/users')}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createUser.isPending || updateUser.isPending}
                >
                  {(createUser.isPending || updateUser.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
