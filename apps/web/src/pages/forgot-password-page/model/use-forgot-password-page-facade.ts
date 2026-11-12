import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import {
  authService,
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
  type ForgotPasswordInput,
} from '@/core/auth';
import { getApiErrorMessage } from '@/shared/api/http-client';
import { useFormServerErrors } from '@/shared/lib/hooks/use-form-server-errors';
import { toastService } from '@/shared/services/toast/service';

import { DEFAULT_VALUES } from './constants';

export const useForgotPasswordPageFacade = () => {
  const resetRequest = useMutation({ mutationFn: authService.requestPasswordReset });

  const resend = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: () => toastService.showSuccess('Письмо отправлено повторно'),
    onError: (error) => toastService.showError(getApiErrorMessage(error) ?? 'Не удалось отправить письмо'),
  });

  const form = useForm<ForgotPasswordFormValues, unknown, ForgotPasswordInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(forgotPasswordFormSchema),
    errors: useFormServerErrors(resetRequest.error, DEFAULT_VALUES, 'Не удалось отправить ссылку. Попробуйте ещё раз'),
  });

  // Экран «Проверьте почту» — пока жива успешная мутация, email берём из её аргументов
  const sentTo = resetRequest.isSuccess ? resetRequest.variables.email : null;

  const handleSubmit = (values: ForgotPasswordInput) => {
    resetRequest.mutate(values);
  };

  const handleResend = () => {
    if (sentTo) resend.mutate({ email: sentTo });
  };

  return {
    form,
    sentTo,
    isPending: resetRequest.isPending,
    isResending: resend.isPending,
    handleSubmit,
    handleResend,
  };
};
