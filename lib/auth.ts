import { authConfig } from '@/config/auth';

export const authOptions: any = {
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    session: async ({ session, token }: { session: any; token: any }) => {
      if (session?.user) {
        session.user.uuid = token.sub;
        session.user.nickname = token.nickname as string;
        session.user.avatar_url = token.avatar_url as string;
        session.user.created_at = token.created_at as string;
      }
      return session;
    },
    jwt: async ({ token, user }: { token: any; user: any }) => {
      if (user) {
        token.uuid = user.uuid;
        token.nickname = user.nickname;
        token.avatar_url = user.avatar_url;
        token.created_at = user.created_at;
      }
      return token;
    },
  },
};
