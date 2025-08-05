import { type AuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    picture?: string | null;
  }
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Authorization attempt:', { 
          email: credentials?.email,
          hasPassword: !!credentials?.password 
        });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error('Please enter email and password');
        }

        try {
          console.log('🔍 Looking for user with email:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          console.log('👤 User found:', !!user);
          if (user) {
            console.log('   - ID:', user.id);
            console.log('   - Email:', user.email);
            console.log('   - Name:', user.name);
            console.log('   - Role:', user.role);
            console.log('   - Has password:', !!user.password);
          }

          if (!user) {
            console.log('❌ User not found in database');
            throw new Error('Invalid email or password');
          }

          console.log('🔑 Comparing passwords...');
          const isPasswordValid = await compare(credentials.password as string, user.password);
          console.log('🔑 Password comparison result:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('❌ Password does not match');
            throw new Error('Invalid email or password');
          }

          console.log('✅ Authentication successful for user:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('🚨 Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            name: token.name || null,
            email: token.email || null,
            image: token.picture || null,
          }
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        return token;
      }

      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};
