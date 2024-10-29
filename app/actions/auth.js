import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignupFormSchema } from '@/lib/definitions';
import { redirect } from 'next/dist/server/api-utils';

async function checkUniqueFields(username, email) {
  // Check for existing username

  const response = await fetch(
    `/api/user?username=${username}&email=${email}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const result = await response.json();
  const existingUser = result.data;

  const errors = {};
  if (existingUser) {
    if (existingUser.username === username)
      errors.username = ['Username is already taken'];
    if (existingUser.email === email) errors.email = ['Email is already taken'];
  }
  return errors;
}

export async function signup(state, formData) {
  // Validate initial Zod schema (synchronous checks)
  const parsedData = SignupFormSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsedData.success) {
    // Return field validation errors early if schema validation fails
    return {
      errors: parsedData.error.flatten().fieldErrors,
    };
  }
  const { username, email, password } = parsedData.data;
  // Check for unique fields asynchronously
  const uniqueErrors = await checkUniqueFields(username, email);
  if (Object.keys(uniqueErrors).length > 0) {
    return { errors: uniqueErrors };
  }

  // Prepare user data for database insertion

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await fetch('/api/user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, hashedPassword }),
  });

  await createSession(newUser.id);

  redirect('/profile');

  return { status: 'success', user: newUser };
}

export async function logout() {
  deleteSession();
  redirect('/login');
}
