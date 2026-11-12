import { AuthFormLayout, AuthLink } from '@/core/auth';
import { ROUTES } from '@/shared/routes';

import { useRegisterPageFacade } from './model/use-register-page-facade';
import { RegisterForm } from './ui/register-form';

export const RegisterPage = () => {
  const { form, isPending, handleRegister } = useRegisterPageFacade();

  return (
    <AuthFormLayout
      title="Создайте аккаунт"
      description="Бесплатно. Первая доска — через минуту."
      footer={<AuthLink to={ROUTES.AUTH.LOGIN.path} text="Уже есть аккаунт?" linkText="Войти" />}
    >
      <RegisterForm form={form} isPending={isPending} onSubmit={handleRegister} />
    </AuthFormLayout>
  );
};
