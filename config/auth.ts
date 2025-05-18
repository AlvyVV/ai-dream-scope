import { User } from '@/types/user';
import GoogleProvider from 'next-auth/providers/google';

export const authConfig: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === 'google') {
        const userData: Partial<User> = {
          email: user.email || '',
          nickname: user.name || '',
          avatar_url: user.image || '',
          signin_type: 'google',
          signin_provider: account.provider,
          signin_openid: account.providerAccountId,
        };
        // TODO: 保存用户信息到数据库
      }
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};
