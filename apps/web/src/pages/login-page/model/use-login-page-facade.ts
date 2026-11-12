import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { authStore, authStoreSelectors, loginFormSchema, type LoginFormValues, type LoginInput } from '@/core/auth';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';

const DEFAULT_VALUES: LoginFormValues = { email: '', password: '' };

export const useLoginPageFacade = () => {
  const { signIn } = authStore.use(authStoreSelectors.actions);
  const { mutate, error, isPending } = useMutation({ mutationFn: signIn });

  const form = useForm<LoginFormValues, unknown, LoginInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(loginFormSchema),
    errors: useFormServerErrors(error, DEFAULT_VALUES, 'Не удалось войти. Попробуйте ещё раз'),
  });

  // После входа GuestRoute сам уведёт на доски
  const handleLogin = (values: LoginInput) => mutate(values);

  return { form, isPending, handleLogin };
};
