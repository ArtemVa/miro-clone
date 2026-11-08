import { Link } from 'react-router';
import { Button } from '@/shared/ui/button';

export function NotFoundPage() {
  return (
    <main className="flex flex-col items-start gap-4 p-6">
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <Button asChild>
        <Link to="/">На главную</Link>
      </Button>
    </main>
  );
}
