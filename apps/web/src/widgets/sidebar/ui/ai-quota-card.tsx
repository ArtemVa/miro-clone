import { SparklesIcon } from 'lucide-react';

type AiQuotaCardProps = {
  used: number;
  limit: number;
  resetsAt: string;
};

export const AiQuotaCard = ({ used, limit, resetsAt }: AiQuotaCardProps) => (
  <div className="rounded-lg border bg-background p-3">
    <div className="flex items-center gap-2 text-xs">
      <SparklesIcon className="size-4 text-ai" />
      <span className="font-medium">ИИ-запросы</span>
      <span className="ml-auto text-muted-foreground">
        {used} / {limit}
      </span>
    </div>
    <div
      role="progressbar"
      aria-label="Использовано ИИ-запросов"
      aria-valuenow={used}
      aria-valuemin={0}
      aria-valuemax={limit}
      className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
    >
      <div className="h-full rounded-full bg-ai" style={{ width: `${Math.min(used / limit, 1) * 100}%` }} />
    </div>
    <p className="mt-1.5 text-[11px] text-muted-foreground">Обновится {resetsAt}</p>
  </div>
);
