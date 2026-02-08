import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('attendance', (table) => {
    table.increments('id').primary();
    table
      .integer('employee_id')
      .notNullable()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.date('date').notNullable();
    table.timestamp('check_in_time').notNullable();

    // Unique constraint on employee_id and date
    table.unique(['employee_id', 'date'], {
      indexName: 'uq_attendance_employee_date',
    });

    // Index on date for date range queries
    table.index('date', 'idx_attendance_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attendance');
}
