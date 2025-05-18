import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const users = ['Benno', 'Aurora', 'Janet', 'Ben', 'Ruby'];

export default function HappyUsers() {
  return (
    <div className="mt-4 md:mt-8 w-full">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 用户头像 */}
        <div className="inline-flex items-center -space-x-3 animate-fade-in">
          {users.map((user, index) => (
            <Avatar
              className="size-12 border-2 border-background shadow-md transition-all hover:-translate-y-1 hover:shadow-lg duration-300"
              key={index}
              style={{ '--animation-delay': `${index * 100}ms` } as React.CSSProperties}
            >
              <AvatarImage src={`/imgs/users/${user}.webp`} alt={`${user} avatar`} />
            </Avatar>
          ))}
        </div>

        {/* 用户信息 */}
        <div className="flex flex-col items-center sm:items-start gap-2 animate-fade-in" style={{ '--animation-delay': '500ms' } as React.CSSProperties}>
          {/* 星级评分 */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-amber-500 text-amber-500" />
            ))}
          </div>

          {/* 用户数量信息 */}
          <p className="text-center sm:text-left font-medium text-muted-foreground">
            Trusted by <span className="text-primary font-semibold">3000+</span> users worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
