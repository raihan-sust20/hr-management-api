import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.integer('age').notNullable();
    table.string('designation', 255).notNullable();
    table.date('hiring_date').notNullable();
    table.date('date_of_birth').notNullable();
    table.decimal('salary', 10, 2).notNullable();
    table.string('photo_path', 500).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    // Check constraint for age
    table.check('?? >= 18 AND ?? <= 70', ['age', 'age']);

    // Indexes for better search performance
    table.index('name', 'idx_employees_name');
    table.index('hiring_date', 'idx_employees_hiring_date');
  });

  // Create trigger for updated_at timestamp
  await knex.raw(`
    CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TRIGGER IF EXISTS update_employees_updated_at ON employees');
  await knex.schema.dropTableIfExists('employees');
}
