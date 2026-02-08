// import { Knex } from 'knex';

// export async function seed(knex: Knex): Promise<void> {
//   // Deletes ALL existing entries
//   await knex('attendance').del();

//   // Get all employee IDs from the seeded employees
//   const employees = await knex('employees').select('id').orderBy('id', 'asc');
//   const employeeIds = employees.map((emp) => emp.id);

//   if (employeeIds.length === 0) {
//     console.warn('No employees found. Please run employee seeds first.');
//     return;
//   }

//   // Generate 25 attendance records for the last 30 days
//   const attendanceRecords = [];
//   const today = new Date();
//   const usedCombinations = new Set<string>(); // Track used (employee_id, date) combinations

//   let recordsCreated = 0;
//   let attempts = 0;
//   const maxAttempts = 100; // Prevent infinite loop

//   while (recordsCreated < 25 && attempts < maxAttempts) {
//     attempts++;

//     // Random employee
//     const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];

//     // Random date in last 30 days
//     const daysAgo = Math.floor(Math.random() * 30);
//     const attendanceDate = new Date(today);
//     attendanceDate.setDate(today.getDate() - daysAgo);
//     const dateStr = attendanceDate.toISOString().split('T')[0];

//     // Check if this combination already exists
//     const combinationKey = `${employeeId}-${dateStr}`;
//     if (usedCombinations.has(combinationKey)) {
//       continue; // Skip duplicate
//     }

//     // Random check-in time between 08:00 and 10:00
//     const hour = 8 + Math.floor(Math.random() * 2); // 8 or 9
//     const minute = Math.floor(Math.random() * 60);
//     const second = Math.floor(Math.random() * 60);

//     const checkInTime = new Date(attendanceDate);
//     checkInTime.setHours(hour, minute, second, 0);

//     attendanceRecords.push({
//       employee_id: employeeId,
//       date: dateStr,
//       check_in_time: checkInTime.toISOString(),
//     });

//     usedCombinations.add(combinationKey);
//     recordsCreated++;
//   }

//   // Insert attendance records
//   if (attendanceRecords.length > 0) {
//     await knex('attendance').insert(attendanceRecords);
//   }
// }

import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing attendance
  await knex('attendance').del();

  // Fetch all employees
  const employees = await knex('employees').select('id').orderBy('id', 'asc');

  if (employees.length === 0) {
    console.warn('No employees found. Please run employee seeds first.');
    return;
  }

  const attendanceRecords: any[] = [];

  // Date range: Nov 2025 → Jan 2026
  const startDate = new Date('2025-11-01');
  const endDate = new Date('2026-01-31');

  for (
    let date = new Date(startDate);
    date <= endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const dayOfWeek = date.getDay();

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }

    for (const employee of employees) {
      // Random check-in between 08:30 and 10:15
      const isLate = Math.random() < 0.25; // 25% chance late

      const hour = isLate ? 9 : 8;
      const minute = isLate
        ? 45 + Math.floor(Math.random() * 30) // 09:45–10:15
        : 30 + Math.floor(Math.random() * 30); // 08:30–09:00

      const checkInTime = new Date(date);
      checkInTime.setHours(hour, minute, Math.floor(Math.random() * 60), 0);

      attendanceRecords.push({
        employee_id: employee.id,
        date: date.toISOString().split('T')[0],
        check_in_time: checkInTime.toISOString(),
      });
    }
  }

  // Bulk insert
  if (attendanceRecords.length > 0) {
    await knex('attendance').insert(attendanceRecords);
  }

  console.log(
    `Inserted ${attendanceRecords.length} attendance records for ${employees.length} employees`
  );
}
