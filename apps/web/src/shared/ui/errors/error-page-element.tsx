import { Show } from '@/shared/ui/control-flow/show';
import { Button } from '@/shared/ui/primitives/button/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/primitives/card';

type ErrorPageElementProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  goHomeLabel?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
};

export const ErrorPageElement = ({
  title = 'Что-то пошло не так',
  description = 'Попробуйте обновить страницу.',
  retryLabel = 'Повторить',
  goHomeLabel = 'На главную',
  onRetry,
  onGoHome,
}: ErrorPageElementProps) => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <span className="text-xl" aria-hidden>
              !
            </span>
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>

        <CardContent className="text-center text-sm text-muted-foreground">{description}</CardContent>

        <Show when={!!onRetry || !!onGoHome}>
          <CardFooter className="flex justify-center gap-2">
            <Show when={!!onRetry}>
              <Button onClick={onRetry}>{retryLabel}</Button>
            </Show>
            <Show when={!!onGoHome}>
              <Button variant="outline" onClick={onGoHome}>
                {goHomeLabel}
              </Button>
            </Show>
          </CardFooter>
        </Show>
      </Card>
    </div>
  );
};
