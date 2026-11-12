import { AuthFormLayout, AuthLink } from '@/core/auth';
import { ROUTES } from '@/shared/routes';

import { useLoginPageFacade } from './model/use-login-page-facade';
import { LoginForm } from './ui/login-form';

export const LoginPage = () => {
  const { form, isPending, handleLogin } = useLoginPageFacade();

  return (
    <AuthFormLayout
      title="С возвращением"
      description="Войдите, чтобы продолжить работу с командой."
      footer={<AuthLink to={ROUTES.AUTH.REGISTER.path} text="Нет аккаунта?" linkText="Зарегистрироваться" />}
    >
      <LoginForm form={form} isPending={isPending} onSubmit={handleLogin} />
    </AuthFormLayout>
  );
};
