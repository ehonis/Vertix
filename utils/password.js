import bcrypt from 'bcrypt';

// Function to hash a password with bcrypt
export async function hashPassword(password) {
  const saltRounds = 10; // Define the salt rounds (10 is a good standard)
  const hash = await bcrypt.hash(password, saltRounds); // Hash the password with bcrypt
  return hash;
}
