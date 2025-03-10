import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getActivityTypeOptions } from '@/lib/activityTypes';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define the schema for form validation
const activityFormSchema = z.object({
  type: z.string().nonempty({ message: 'Tipo de atividade é obrigatório' }),
  description: z.string().min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' }),
  date: z.string().nonempty({ message: 'Data é obrigatória' }),
  time: z.string().nonempty({ message: 'Horário é obrigatório' }),
});

interface ActivityFormProps {
  id: string;
  isOpen?: boolean;
  activity?: any;
  onClose?: (value: boolean) => void;
}

export default function ActivityForm({ id, isOpen = true, activity = null, onClose }: ActivityFormProps) {
  const form = useForm({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: activity?.type || '',
      description: activity?.description || '',
      date: activity?.date || '',
      time: activity?.time || '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      // Handle form submission
      console.log('Form submitted:', values);
    } catch (error) {
      console.error('Error submitting form:', error);
      form.setError('form', { type: 'manual', message: 'Ocorreu um erro ao enviar o formulário.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose && onClose(false)}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{activity ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Atividade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de atividade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getActivityTypeOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva a atividade detalhadamente" className="resize-none" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {form.formState.errors.form && (
              <Alert variant="destructive">
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{form.formState.errors.form.message}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onClose && onClose(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {activity ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
