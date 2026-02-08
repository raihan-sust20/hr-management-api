import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('attendance').del();

  // Get all employee IDs from the seeded employees
  const employees = await knex('employees').select('id').orderBy('id', 'asc');
  const employeeIds = employees.map((emp) => emp.id);

  if (employeeIds.length === 0) {
    console.warn('No employees found. Please run employee seeds first.');
    return;
  }

  // Generate 25 attendance records for the last 30 days
  const attendanceRecords = [];
  const today = new Date();
  const usedCombinations = new Set<string>(); // Track used (employee_id, date) combinations

  let recordsCreated = 0;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop

  while (recordsCreated < 25 && attempts < maxAttempts) {
    attempts++;

    // Random employee
    const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];

    // Random date in last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const attendanceDate = new Date(today);
    attendanceDate.setDate(today.getDate() - daysAgo);
    const dateStr = attendanceDate.toISOString().split('T')[0];

    // Check if this combination already exists
    const combinationKey = `${employeeId}-${dateStr}`;
    if (usedCombinations.has(combinationKey)) {
      continue; // Skip duplicate
    }

    // Random check-in time between 08:00 and 10:00
    const hour = 8 + Math.floor(Math.random() * 2); // 8 or 9
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);

    const checkInTime = new Date(attendanceDate);
    checkInTime.setHours(hour, minute, second, 0);

    attendanceRecords.push({
      employee_id: employeeId,
      date: dateStr,
      check_in_time: checkInTime.toISOString(),
    });

    usedCombinations.add(combinationKey);
    recordsCreated++;
  }

  // Insert attendance records
  if (attendanceRecords.length > 0) {
    await knex('attendance').insert(attendanceRecords);
  }
}
