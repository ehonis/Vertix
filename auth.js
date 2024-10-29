import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { hashPassword } from '@/utils/password';
import { getUserFromDb } from './utils/db';
import { ZodError } from 'zod';
import { signInSchema } from './lib/zod';
import Github from 'next-auth/providers/github';
import prisma from '@/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Github],
});
