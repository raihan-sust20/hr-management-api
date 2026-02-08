import { injectable } from 'tsyringe';
import { BaseRepository } from '../../common/utils/base.repository';
import { IEmployee, ICreateEmployeeData, IListEmployeesQuery } from './employee.type';
import { log } from 'node:console';
import { parseToInt } from '../../common/utils/general.util';

@injectable()
export class EmployeeRepository extends BaseRepository<IEmployee> {
  protected tableName = 'employees';

  public async createEmployee(employeeData: ICreateEmployeeData): Promise<IEmployee> {
    const employee = await this.create(employeeData as Partial<IEmployee>);
    return employee;
  }

  public async updatePhotoPath(id: number, photoPath: string): Promise<IEmployee | undefined> {
    const updated = await this.update(id, { photo_path: photoPath } as Partial<IEmployee>);
    return updated;
  }

  public async findByIdWithDetails(id: number): Promise<IEmployee | undefined> {
    return await this.findById(id);
  }

  public async updateEmployee(
    id: number,
    updateData: Partial<IEmployee>
  ): Promise<IEmployee | undefined> {
    return await this.update(id, updateData);
  }

  public async findAllWithFilters(
    query: IListEmployeesQuery
  ): Promise<{ data: IEmployee[]; total: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    // Base query (no mutation yet)
    const baseQuery = this.table;

    // Apply filters ONCE
    if (query.name && query.name.trim()) {
      baseQuery.where('name', 'ilike', `%${query.name.trim()}%`);
    }

    // Count query (clone BEFORE pagination)
    const totalResult = await baseQuery.clone().count<{ count: string }>('id as count');
    const total = parseToInt(totalResult[0].count);
    
    // Data query
    const data = await baseQuery
      .clone()
      .select('*')
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset);

    return { data: data as IEmployee[], total };
  }
}
