import { cn } from '@/lib/utils';

interface TagListProps {
  tags?: string[];
  className?: string;
  emptyText?: string;
}

export function TagList({ tags, className, emptyText = '无' }: TagListProps) {
  if (!tags || tags.length === 0) {
    return <span className="text-gray-500 text-sm">{emptyText}</span>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs hover:bg-blue-100 transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
