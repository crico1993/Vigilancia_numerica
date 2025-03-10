import React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Button } from '@/components/ui/button';

import { CheckCircle } from 'icons/CheckCircle';
import { apiRequest } from 'utils/api';
import { toast } from 'components/Toast';


const PendingUsers = ({ users }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('PATCH', `/api/users/${userId}`, { approved: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: 'Usuário aprovado',
        description: 'O cadastro do usuário foi aprovado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o usuário.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id} className="user-item">
          <span>{user.name}</span>
          <span>{user.approved ? 'Aprovado' : 'Pendente'}</span>
          <Button 
            onClick={() => approveUserMutation.mutate(user.id)}
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Aprovar
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PendingUsers;
