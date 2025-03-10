const EditUserDialog = ({ isOpen, onClose, user }: EditUserDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: user?.name || '',
      role: user?.role || 'server',
      active: user?.active || true,
      approved: user?.approved || false,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await updateUser(user.id, data);
      toast({
        title: 'Usuário atualizado com sucesso!',
        status: 'success',
      });
      queryClient.invalidateQueries(['users']);
      onClose();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar usuário!',
        description: 'Por favor, tente novamente mais tarde.',
        status: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar Usuário</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor='name'>Nome</FormLabel>
              <Input id='name' type="text" {...form.register('name')} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='email'>Email</FormLabel>
              <Input id='email' type="email" {...form.register('email')} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='role'>Role</FormLabel>
              <Select id='role' {...form.register('role')}>
                <option value="server">Servidor</option>
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
              </Select>
            </FormControl>
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status da Conta</FormLabel>
                    <FormDescription>
                      Ative ou desative a conta deste usuário
                    </FormDescription>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Aprovação</FormLabel>
                    <FormDescription>
                      Aprovar ou rejeitar o cadastro deste usuário
                    </FormDescription>
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
          </ModalBody>

          <ModalFooter>
            <Button type='submit' isLoading={isSubmitting}>
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const UserTable = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery(['users'], getUsers);

  const handleEdit = (user: User) => {
    // handle edit
  };

  return (
    <Table variant='striped' size='sm'>
      <Thead>
        <Tr>
          <Th>Nome</Th>
          <Th>Email</Th>
          <Th>Role</Th>
          <Th>Status</Th>
          <Th>Aprovação</Th>
        </Tr>
      </Thead>
      <Tbody>
        {isLoading ? (
          <Tr>
            <Td colSpan={5}>Carregando...</Td>
          </Tr>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'outline'}>
                  {getUserRoleLabel(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.active ? 'success' : 'destructive'}>
                  {user.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.approved ? 'success' : 'warning'}>
                  {user.approved ? 'Aprovado' : 'Pendente'}
                </Badge>
              </TableCell>
            </TableRow>
          ))
        )}
      </Tbody>
    </Table>
  );
};

export default UserTable;
