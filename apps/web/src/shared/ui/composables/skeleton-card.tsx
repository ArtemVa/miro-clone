import { Card, CardContent } from '@/shared/ui/primitives/card';
import { Skeleton } from '@/shared/ui/primitives/skeleton';

export const SkeletonCard = () => (
  <Card className="overflow-hidden relative rounded-2xl shadow-md p-0 w-full">
    <div className="relative w-full h-60">
      <Skeleton className="w-full h-full" />
    </div>

    <CardContent className="p-4">
      <Skeleton className="h-6 w-full mb-1" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);
