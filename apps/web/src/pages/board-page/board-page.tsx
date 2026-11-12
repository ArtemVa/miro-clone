import { useParams } from 'react-router';

/** Заглушка: холст придёт вместе с Ф-01 */
export const BoardPage = () => {
  const { boardId } = useParams<'boardId'>();

  return <div className="p-6 text-sm font-medium">Board {boardId}</div>;
};
