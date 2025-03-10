import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, User, Lock, Download } from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }).optional(),
});

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Senha atual é obrigatória' }),
  newPassword: z.string().min(6, { message: 'Nova senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string().min(6, { message: 'Confirme a nova senha' }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return apiRequest('PATCH', `/api/users/${user?.id}`, {
        name: values.name,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao atualizar perfil: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      return apiRequest('POST', '/api/users/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Falha ao alterar senha: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submissions
  const onUpdateProfile = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  const onChangePassword = (values: PasswordFormValues) => {
    changePasswordMutation.mutate(values);
  };
  
  // Download user data (example function)
  const handleDownloadData = () => {
    toast({
      title: 'Download iniciado',
      description: 'Seus dados serão baixados em breve.',
    });
  };

  return (
    <MainLayout title="Configurações">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil do Usuário</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input disabled placeholder="Seu e-mail" {...field} />
                        </FormControl>
                        <FormDescription>
                          O e-mail não pode ser alterado diretamente. Contate o administrador se precisar alterá-lo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Dados Pessoais</h3>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar meus dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie sua senha e configure opções de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                  <p className="text-sm text-muted-foreground">
                    Atualize sua senha regularmente para maior segurança
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Sua senha deve ter pelo menos 6 caracteres.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Alterar Senha
                    </Button>
                  </div>
                </form>
              </Form>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Sessões Ativas</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você está atualmente conectado neste dispositivo.
                </p>
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Sessão atual</p>
                      <p className="text-sm text-muted-foreground">Iniciada em {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}

// Badge component for status indication
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}
