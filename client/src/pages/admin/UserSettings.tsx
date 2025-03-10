const updateUserMutation = useMutation({
  mutationFn: async (data: any) => {
    const response = await fetch(`/api/users/${selectedUser?.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao atualizar usuário');
    }

    return response.json();
  },
  onSuccess: (updatedUser) => {
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    toast({
      title: 'Sucesso!',
      description: 'Usuário atualizado com sucesso.',
    });
    setIsEditDialogOpen(false);

    // Atualiza o usuário local se o usuário atual foi atualizado
    if (user && selectedUser?.id === user.id) {
      setUser({
        ...user,
        ...updatedUser
      });
    }
  },
  onError: (error: Error) => {
    toast({
      title: 'Erro',
      description: `Falha ao atualizar usuário: ${error.message}`,
      variant: 'destructive',
    });
  },
});