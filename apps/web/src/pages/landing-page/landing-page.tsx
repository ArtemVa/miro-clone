import { SparklesIcon } from 'lucide-react';
import { Link } from 'react-router';

import { ROUTES } from '@/shared/routes';
import { StickyNote } from '@/shared/ui/composables/sticky-note';
import { Badge } from '@/shared/ui/primitives/badge';
import { Button } from '@/shared/ui/primitives/button/button';

import { PREVIEW_STICKERS } from './model/constants';

export const LandingPage = () => (
  <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
    <div className="animate-fade-up">
      <Badge variant="ai">
        <SparklesIcon />
        ИИ раскладывает стикеры по темам
      </Badge>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
        Доска, на которой команда думает вместе
      </h1>
      <p className="mt-4 max-w-lg text-lg text-muted-foreground">
        Стикеры, схемы и обсуждения в реальном времени. Без лишних кнопок — только холст и ваша команда.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to={ROUTES.AUTH.REGISTER.path}>Начать бесплатно</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to={ROUTES.AUTH.LOGIN.path}>Войти</Link>
        </Button>
      </div>
    </div>

    <div className="canvas-dots grid aspect-[4/3] grid-cols-2 content-center gap-4 rounded-xl border p-8" aria-hidden>
      {PREVIEW_STICKERS.map(({ text, color }) => (
        <StickyNote key={text} color={color} className="aspect-square p-4">
          {text}
        </StickyNote>
      ))}
    </div>
  </section>
);
