import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from '@chakra-ui/react';
import { FormControl, FormLabel, Input, Select, Button, Switch, Table, Thead, Tbody, Tr, Th, Td, Badge } from '@chakra-ui/react';
import { useToast } from '@/hooks/use-toast';
import { getUsers, updateUser } from '@/lib/api';
import { User } from '@/types';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

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
            <FormControl>
              <FormLabel htmlFor='active'>Status da Conta</FormLabel>
              <Switch id='active' {...form.register('active')} />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='approved'>Aprovação</FormLabel>
              <Switch id='approved' {...form.register('approved')} />
            </FormControl>
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setSelectedUser(null);
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <Table variant='striped' size='sm'>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Aprovação</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            <Tr>
              <Td colSpan={6}>Carregando...</Td>
            </Tr>
          ) : (
            users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'outline'}>
                    {user.role}
                  </Badge>
                </Td>
                <Td>
                  <Badge variant={user.active ? 'success' : 'destructive'}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Td>
                <Td>
                  <Badge variant={user.approved ? 'success' : 'warning'}>
                    {user.approved ? 'Aprovado' : 'Pendente'}
                  </Badge>
                </Td>
                <Td>
                  <Button size='sm' onClick={() => handleEdit(user)}>Editar</Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          user={selectedUser}
        />
      )}
    </>
  );
};

export default UserTable;
