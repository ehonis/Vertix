import NextAuth from 'next-auth';
import Github from 'next-auth/providers/github';
import prisma from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Github, Google],
});
