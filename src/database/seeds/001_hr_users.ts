import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('hr_users').del();

  // Hash passwords
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Inserts seed entries
  await knex('hr_users').insert([
    {
      email: 'admin@hrmanagement.com',
      password_hash: hashedPassword,
      name: 'System Administrator',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      email: 'john.doe@hrmanagement.com',
      password_hash: hashedPassword,
      name: 'John Doe',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
    {
      email: 'jane.smith@hrmanagement.com',
      password_hash: hashedPassword,
      name: 'Jane Smith',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    },
  ]);
}
