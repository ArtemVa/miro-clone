import { UiAlert } from '@/shared/ui/composables/ui-alert';

type ErrorAlertProps = {
  errorMessage?: string;
};

export const ErrorAlert = ({ errorMessage }: ErrorAlertProps) => (
  <UiAlert variant="destructive" title={errorMessage ?? 'Произошла ошибка'} />
);
