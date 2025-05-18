'use client';

import Image from 'next/image';
import { useState } from 'react';

interface UserAvatarProps {
  avatarUrl: string | null;
  nickname: string;
  email: string;
}

export default function UserAvatar({ avatarUrl, nickname, email }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
      {avatarUrl && !hasError ? (
        <Image src={avatarUrl} alt={nickname || email} width={48} height={48} className="object-cover w-full h-full" onError={() => setHasError(true)} />
      ) : (
        <span className="text-lg font-medium">{nickname?.charAt(0) || email.charAt(0)}</span>
      )}
    </div>
  );
}
