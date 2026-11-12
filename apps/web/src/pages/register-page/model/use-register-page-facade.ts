import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  authStore,
  authStoreSelectors,
  registerFormSchema,
  type RegisterFormValues,
  type RegisterInput,
} from '@/core/auth';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';

const DEFAULT_VALUES: RegisterFormValues = { name: '', email: '', password: '' };

export const useRegisterPageFacade = () => {
  const { register } = authStore.use(authStoreSelectors.actions);
  const { mutate, error, isPending } = useMutation({ mutationFn: register });

  const form = useForm<RegisterFormValues, unknown, RegisterInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(registerFormSchema),
    errors: useFormServerErrors(error, DEFAULT_VALUES, 'Не удалось создать аккаунт. Попробуйте ещё раз'),
  });

  const handleRegister = (values: RegisterInput) => mutate(values);

  return { form, isPending, handleRegister };
};
